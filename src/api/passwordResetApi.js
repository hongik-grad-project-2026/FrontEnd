import { isMockMode } from "./client.js";

const UNSUPPORTED_MESSAGE = "비밀번호 재설정 API가 아직 제공되지 않았습니다.";

export const passwordResetAvailability = Object.freeze({
    isSupported: isMockMode,
    message: isMockMode ? "" : UNSUPPORTED_MESSAGE,
});

export class PasswordResetError extends Error {
    constructor(message, { code = null, fieldErrors = {}, cause } = {}) {
        super(message, cause ? { cause } : undefined);
        this.name = "PasswordResetError";
        this.code = code;
        this.fieldErrors = fieldErrors;
    }
}

function assertPasswordResetSupported() {
    if (!passwordResetAvailability.isSupported) {
        throw new PasswordResetError(UNSUPPORTED_MESSAGE, {
            code: "PASSWORD_RESET_API_UNSUPPORTED",
        });
    }
}

async function loadMockPasswordResetApi() {
    if (!import.meta.env.DEV) {
        throw new PasswordResetError(UNSUPPORTED_MESSAGE, {
            code: "PASSWORD_RESET_API_UNSUPPORTED",
        });
    }

    assertPasswordResetSupported();
    return import("../mocks/passwordResetData.js");
}

function normalizeError(error) {
    if (error instanceof PasswordResetError) {
        return error;
    }

    return new PasswordResetError(
        error?.message || "비밀번호 재설정 요청에 실패했습니다.",
        {
            code: error?.code ?? null,
            fieldErrors: error?.fieldErrors ?? {},
            cause: error,
        },
    );
}

export async function sendPasswordResetCode(identity) {
    try {
        const { sendMockPasswordResetCode } = await loadMockPasswordResetApi();
        return await sendMockPasswordResetCode(identity);
    } catch (error) {
        throw normalizeError(error);
    }
}

export async function verifyPasswordResetCode(payload) {
    try {
        const { verifyMockPasswordResetCode } = await loadMockPasswordResetApi();
        return await verifyMockPasswordResetCode(payload);
    } catch (error) {
        throw normalizeError(error);
    }
}

export async function resetPassword(payload) {
    try {
        const { resetMockPassword } = await loadMockPasswordResetApi();
        return await resetMockPassword(payload);
    } catch (error) {
        throw normalizeError(error);
    }
}

export async function invalidatePasswordResetFlow(payload) {
    if (!passwordResetAvailability.isSupported) {
        return;
    }

    const { invalidateMockPasswordReset } = await loadMockPasswordResetApi();
    invalidateMockPasswordReset(payload);
}
