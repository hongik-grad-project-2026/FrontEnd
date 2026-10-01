import { api } from "./client";

// 서버 role은 URL에 직접 쓰지 말고 기존 화면 모드로만 바꿔.
const SERVER_ROLE_TO_APP_ROLE = {
  STUDENT: "student",
  WORKER: "admin",
  ASSISTANT: "admin",
};

const MOCK_ROLE_TO_APP_ROLE = {
  student: "student",
  admin: "admin",
};

const SERVER_STATUSES = new Set(["ACTIVE", "SUSPENDED", "WITHDRAWN"]);

export class AuthContractError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "AuthContractError";
    this.code = code;
  }
}

function normalizeRole(role) {
  return SERVER_ROLE_TO_APP_ROLE[role] ?? MOCK_ROLE_TO_APP_ROLE[role] ?? null;
}

function normalizeUser(userData) {
  if (!userData) {
    throw new AuthContractError(
      "사용자 권한 정보를 확인할 수 없습니다.",
      "INVALID_AUTH_ROLE",
    );
  }

  const userFields = { ...userData };
  delete userFields.accessToken;
  delete userFields.token;

  const role = normalizeRole(userFields.role);

  if (!role) {
    throw new AuthContractError(
      "사용자 권한 정보를 확인할 수 없습니다.",
      "INVALID_AUTH_ROLE",
    );
  }

  const status = userFields.status ?? null;

  if (status !== null && !SERVER_STATUSES.has(status)) {
    throw new AuthContractError(
      "사용자 상태 정보를 확인할 수 없습니다.",
      "INVALID_AUTH_STATUS",
    );
  }

  return {
    ...userFields,
    id: userFields.userId ?? userFields.id ?? null,
    loginId: userFields.loginId ?? userFields.id ?? "",
    role,
    // 서버 권한 원본은 나중에 endpoint별 접근 범위를 나눌 수 있게 남겨 둬.
    serverRole: SERVER_ROLE_TO_APP_ROLE[userFields.role] ? userFields.role : null,
    status,
    profileImageUrl:
      userFields.profileImageUrl ?? userFields.profile_image_url ?? null,
  };
}

export async function login(loginId, password) {
  const result = await api.post(
    "/login",
    { loginId, password },
    { auth: false },
  );

  const accessToken = result?.accessToken ?? result?.token;
  const userData = result?.user ?? result;

  if (!accessToken) {
    throw new AuthContractError(
      "로그인 응답에 accessToken이 없습니다.",
      "MISSING_ACCESS_TOKEN",
    );
  }

  return {
    accessToken,
    user: normalizeUser(userData),
  };
}

export async function getCurrentUser(options) {
  const result = await api.get("/users/me", options);
  return normalizeUser(result);
}

export async function signup({
  name,
  id,
  password,
  email,
  tel,
  college,
  department,
}) {
  return api.post(
    "/users",
    {
      name,
      studentId: id,
      password,
      email,
      phoneNumber: tel,
      college,
      department,
    },
    { auth: false },
  );
}

export async function updateMyInfo({ email, phoneNumber }, options) {
  const result = await api.patch(
    "/users/me",
    { email, phoneNumber },
    options,
  );

  return normalizeUser(result);
}

export async function updateMyProfileImage(image, options) {
  const formData = new FormData();
  formData.append("image", image);

  const result = await api.patch(
    "/users/me/profile-image",
    formData,
    options,
  );

  return normalizeUser(result);
}

export function withdrawCurrentUser(options) {
  return api.del("/users/me", options);
}

export function logout() {
  return api.post("/logout");
}
