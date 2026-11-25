import { api, isMockMode } from "./client.js";
import {
    PASSWORD_RESET_RESEND_COOLDOWN_MS,
    PASSWORD_RESET_VERIFICATION_TTL_MS,
} from "../utils/passwordResetConfig.js";

const FIELD_NAME_MAP = Object.freeze({
    studentId: "studentId",
    name: "name",
    email: "email",
    verificationCode: "verificationCode",
    password: "password",
    passwordConfirm: "passwordConfirm",
    newPassword: "password",
    newPasswordConfirm: "passwordConfirm",
});

export class PasswordResetError extends Error {
    constructor(
        message,
        {
            status = null,
            code = null,
            errorType = null,
            fieldErrors = {},
            errors = null,
            isNetworkError = false,
            cause,
        } = {},
    ) {
        super(message, cause ? { cause } : undefined);
        this.name = "PasswordResetError";
        this.status = status;
        this.code = code;
        this.errorType = errorType;
        this.fieldErrors = fieldErrors;
        this.errors = errors;
        this.isNetworkError = isNetworkError || errorType === "NETWORK_ERROR";
        this.isContractError = errorType === "CONTRACT_ERROR";
    }
}

async function loadMockPasswordResetApi() {
    if (!import.meta.env.DEV || !isMockMode) {
        throw new PasswordResetError("mock 모드에서만 사용할 수 있습니다.");
    }

    return import("../mocks/passwordResetData.js");
}

function normalizeFieldErrorValue(value) {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.filter((item) => typeof item === "string").join(" ");
    }

    return "";
}

function normalizeFieldErrors(errors) {
    if (!errors || typeof errors !== "object" || Array.isArray(errors)) {
        return {};
    }

    return Object.entries(errors).reduce((normalizedErrors, [field, value]) => {
        const screenField = FIELD_NAME_MAP[field];
        const message = normalizeFieldErrorValue(value);

        if (screenField && message) {
            normalizedErrors[screenField] = message;
        }

        return normalizedErrors;
    }, {});
}

function normalizeError(error) {
    if (error instanceof PasswordResetError) {
        return error;
    }

    const sourceErrors = error?.fieldErrors ?? error?.errors ?? null;

    return new PasswordResetError(
        error?.message || "비밀번호 재설정 요청에 실패했습니다.",
        {
            status: error?.status ?? null,
            code: error?.code ?? null,
            errorType: error?.errorType ?? null,
            fieldErrors: normalizeFieldErrors(sourceErrors),
            errors: error?.errors ?? sourceErrors,
            isNetworkError: Boolean(error?.isNetworkError),
            cause: error,
        },
    );
}

function createContractError(message) {
    return new PasswordResetError(message, {
        errorType: "CONTRACT_ERROR",
    });
}

function normalizeVerificationResult(result) {
    if (!result || typeof result !== "object" || Array.isArray(result)) {
        throw createContractError("인증 확인 응답을 확인할 수 없습니다. 다시 시도해 주세요.");
    }

    const resetToken = typeof result.resetToken === "string"
        ? result.resetToken.trim()
        : "";
    const { expiresInSeconds } = result;

    if (!resetToken) {
        throw createContractError("비밀번호 재설정 권한을 확인할 수 없습니다. 다시 인증해 주세요.");
    }

    if (!Number.isSafeInteger(expiresInSeconds) || expiresInSeconds <= 0) {
        throw createContractError("비밀번호 재설정 권한의 만료시간을 확인할 수 없습니다.");
    }

    return {
        resetToken,
        expiresInSeconds,
        resetTokenExpiresAt: Date.now() + expiresInSeconds * 1000,
    };
}

function normalizeResetResult(result) {
    const account = result && typeof result === "object" && !Array.isArray(result)
        ? result
        : {};

    return {
        studentId: account.studentId ?? null,
        name: account.name ?? null,
        email: account.email ?? null,
        college: account.college ?? null,
        department: account.department ?? null,
    };
}

export async function sendPasswordResetCode(identity) {
    try {
        if (isMockMode) {
            const { sendMockPasswordResetCode } = await loadMockPasswordResetApi();
            return await sendMockPasswordResetCode(identity);
        }

        await api.post(
            "/password-reset/verifications",
            {
                studentId: identity.studentId.trim(),
                name: identity.name.trim(),
                email: identity.email.trim(),
            },
            { auth: false },
        );

        const issuedAt = Date.now();
        return {
            expiresAt: issuedAt + PASSWORD_RESET_VERIFICATION_TTL_MS,
            resendAvailableAt: issuedAt + PASSWORD_RESET_RESEND_COOLDOWN_MS,
        };
    } catch (error) {
        throw normalizeError(error);
    }
}

export async function verifyPasswordResetCode(payload) {
    try {
        let result;

        if (isMockMode) {
            const { verifyMockPasswordResetCode } = await loadMockPasswordResetApi();
            result = await verifyMockPasswordResetCode(payload);
        } else {
            const { identity, code } = payload;
            result = await api.post(
                "/password-reset/verifications/confirm",
                {
                    studentId: identity.studentId.trim(),
                    name: identity.name.trim(),
                    email: identity.email.trim(),
                    verificationCode: code.trim(),
                },
                { auth: false },
            );
        }

        return normalizeVerificationResult(result);
    } catch (error) {
        throw normalizeError(error);
    }
}

export async function resetPassword(payload) {
    try {
        let result;

        if (isMockMode) {
            const { resetMockPassword } = await loadMockPasswordResetApi();
            result = await resetMockPassword({
                resetToken: payload.resetToken,
                password: payload.password,
            });
        } else {
            result = await api.post(
                "/password-reset",
                {
                    resetToken: payload.resetToken,
                    newPassword: payload.password,
                    newPasswordConfirm: payload.passwordConfirm,
                },
                { auth: false },
            );
        }

        return normalizeResetResult(result);
    } catch (error) {
        throw normalizeError(error);
    }
}

export async function invalidatePasswordResetFlow(payload) {
    if (!isMockMode) {
        return;
    }

    const { invalidateMockPasswordReset } = await loadMockPasswordResetApi();
    invalidateMockPasswordReset(payload);
}
