import { findMockUserByLoginId, updateMockUserPassword } from "./db.js";
import {
  PASSWORD_RESET_RESEND_COOLDOWN_MS,
  PASSWORD_RESET_VERIFICATION_TTL_MS,
} from "../utils/passwordResetConfig.js";

const MOCK_VERIFICATION_CODE = "123456";
const RESET_PERMISSION_TTL_MS = 5 * 60 * 1000; // mock 전용 resetToken 유효기간

const verificationSessions = new Map();
const resetPermissions = new Map();

function wait(duration = 300) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function createMemoryId(prefix) {
  const suffix =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${prefix}-${suffix}`;
}

function createMockError(message, code, fieldErrors = {}) {
  const error = new Error(message);
  error.name = "PasswordResetMockError";
  error.code = code;
  error.fieldErrors = fieldErrors;
  return error;
}

function normalizeIdentity(identity) {
  return {
    studentId: identity.studentId.trim(),
    name: identity.name.trim(),
    email: identity.email.trim().toLowerCase(),
  };
}

function toAccountSummary(user) {
  return {
    studentId: user.studentId ?? user.id,
    name: user.name,
    email: user.email,
    college: user.college,
    department: user.department,
  };
}

function invalidateUserSessions(studentId) {
  for (const [verificationId, session] of verificationSessions.entries()) {
    if (session.studentId === studentId) {
      verificationSessions.delete(verificationId);
    }
  }

  for (const [resetToken, permission] of resetPermissions.entries()) {
    if (permission.studentId === studentId) {
      resetPermissions.delete(resetToken);
    }
  }
}

export async function sendMockPasswordResetCode(identity) {
  await wait();

  const normalizedIdentity = normalizeIdentity(identity);
  const user = findMockUserByLoginId(normalizedIdentity.studentId);

  if (!user) {
    throw createMockError(
      "가입 정보를 확인해 주세요.",
      "MOCK_STUDENT_NOT_FOUND",
      { studentId: "가입된 학번 정보가 없습니다." },
    );
  }

  const fieldErrors = {};

  if (user.name !== normalizedIdentity.name) {
    fieldErrors.name = "해당 학번에 등록된 이름과 일치하지 않습니다.";
  }

  if (!user.email) {
    fieldErrors.email = "가입된 이메일 정보가 없습니다.";
  } else if (user.email.toLowerCase() !== normalizedIdentity.email) {
    fieldErrors.email = "등록된 이메일과 일치하지 않습니다.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw createMockError(
      "가입 정보를 확인해 주세요.",
      "MOCK_IDENTITY_MISMATCH",
      fieldErrors,
    );
  }

  const existingSession = Array.from(verificationSessions.values()).find(
    (session) => session.studentId === user.id,
  );

  if (existingSession && Date.now() < existingSession.resendAvailableAt) {
    throw createMockError(
      "재전송 제한시간이 지난 뒤 다시 시도해 주세요.",
      "MOCK_RESEND_TOO_EARLY",
    );
  }

  invalidateUserSessions(user.id);

  const verificationId = createMemoryId("verification");
  const issuedAt = Date.now();
  const expiresAt = issuedAt + PASSWORD_RESET_VERIFICATION_TTL_MS;
  const resendAvailableAt = issuedAt + PASSWORD_RESET_RESEND_COOLDOWN_MS;

  verificationSessions.set(verificationId, {
    verificationId,
    studentId: user.id,
    code: MOCK_VERIFICATION_CODE,
    expiresAt,
    resendAvailableAt,
    verified: false,
  });

  return {
    verificationId,
    expiresAt,
    resendAvailableAt,
  };
}

export async function verifyMockPasswordResetCode({ verificationId, code }) {
  await wait(250);

  const session = verificationSessions.get(verificationId);

  if (!session) {
    throw createMockError(
      "인증번호를 다시 발송해 주세요.",
      "MOCK_VERIFICATION_NOT_FOUND",
      { verificationCode: "인증번호를 다시 발송해 주세요." },
    );
  }

  if (Date.now() >= session.expiresAt) {
    verificationSessions.delete(verificationId);
    throw createMockError(
      "인증번호가 만료되었습니다.",
      "MOCK_VERIFICATION_EXPIRED",
      { verificationCode: "인증번호가 만료되었습니다. 다시 발송해 주세요." },
    );
  }

  if (code.trim() !== session.code) {
    throw createMockError(
      "인증번호가 올바르지 않습니다.",
      "MOCK_VERIFICATION_CODE_MISMATCH",
      { verificationCode: "인증번호가 올바르지 않습니다." },
    );
  }

  if (session.resetToken && resetPermissions.has(session.resetToken)) {
    return { resetToken: session.resetToken };
  }

  session.verified = true;
  const resetToken = createMemoryId("reset");
  session.resetToken = resetToken;

  resetPermissions.set(resetToken, {
    studentId: session.studentId,
    verificationId,
    expiresAt: Date.now() + RESET_PERMISSION_TTL_MS,
  });

  return { resetToken };
}

export async function resetMockPassword({ resetToken, password }) {
  await wait();

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 16
  ) {
    throw createMockError(
      "새 비밀번호를 확인해 주세요.",
      "MOCK_INVALID_PASSWORD",
      { password: "비밀번호는 8~16자리로 입력해 주세요." },
    );
  }

  const permission = resetPermissions.get(resetToken);

  if (!permission) {
    throw createMockError(
      "비밀번호 재설정 인증이 필요합니다.",
      "MOCK_RESET_PERMISSION_NOT_FOUND",
    );
  }

  if (Date.now() >= permission.expiresAt) {
    invalidateUserSessions(permission.studentId);
    throw createMockError(
      "비밀번호 재설정 인증이 만료되었습니다.",
      "MOCK_RESET_PERMISSION_EXPIRED",
    );
  }

  const account = updateMockUserPassword(permission.studentId, password);

  if (!account) {
    throw createMockError(
      "가입 정보를 확인할 수 없습니다.",
      "MOCK_ACCOUNT_NOT_FOUND",
    );
  }

  invalidateUserSessions(permission.studentId);
  return toAccountSummary(account);
}

export function invalidateMockPasswordReset({
  verificationId,
  resetToken,
} = {}) {
  if (verificationId) {
    verificationSessions.delete(verificationId);
  }

  if (resetToken) {
    resetPermissions.delete(resetToken);
  }
}
