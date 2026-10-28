import { api, isMockMode } from "./client.js";
import {
    PASSWORD_RESET_RESEND_COOLDOWN_MS,
    PASSWORD_RESET_VERIFICATION_TTL_MS,
} from "../utils/passwordResetConfig.js";

const UNSUPPORTED_MESSAGE = "비밀번호 재설정 API가 아직 제공되지 않았습니다.";

// 화면이 재설정 절차를 활성화할지 결정함. 현재는 mock과 실제 API 양쪽을 사용할 수 있어 활성화 상태임.
// export const passwordResetAvailability = Object.freeze({
//     // isSupported: isMockMode,
//     // message: isMockMode ? "" : UNSUPPORTED_MESSAGE,
//     isSupported: true,
//     message: "",
// });

export class PasswordResetError extends Error {
    constructor(message, { code = null, fieldErrors = {}, cause } = {}) {
        super(message, cause ? { cause } : undefined);
        this.name = "PasswordResetError";
        this.code = code;
        this.fieldErrors = fieldErrors;
    }
}

// function assertPasswordResetSupported() {
//     if (!passwordResetAvailability.isSupported) {
//         throw new PasswordResetError(UNSUPPORTED_MESSAGE, {
//             code: "PASSWORD_RESET_API_UNSUPPORTED",
//         });
//     }
// }

async function loadMockPasswordResetApi() {
    if (!import.meta.env.DEV || !isMockMode) {
        throw new PasswordResetError(UNSUPPORTED_MESSAGE, {
            code: "PASSWORD_RESET_API_UNSUPPORTED",
        });
    }

    // assertPasswordResetSupported();
    return import("../mocks/passwordResetData.js");
}

function normalizeError(error) {
    if (error instanceof PasswordResetError) {
        return error;
    }

    // ApiError와 mock 오류의 필드명 차이를 정규화해 화면에서 같은 방식으로 처리하게 함.
    return new PasswordResetError(
        error?.message || "비밀번호 재설정 요청에 실패했습니다.",
        {
            code: error?.code ?? null,
            fieldErrors: error?.fieldErrors ?? error?.errors ?? {},
            cause: error,
        },
    );
}

export async function sendPasswordResetCode(identity) {
    try {
        // 1단계: 학번·이름·이메일을 서버에 보내 가입 정보가 맞는지 확인하고,
        // 해당 계정의 이메일로 인증번호 발송을 요청함. 비밀번호를 잊은 사용자는 로그인 전이므로 auth를 끔.
        if (isMockMode) {
            const { sendMockPasswordResetCode } = await loadMockPasswordResetApi();
            return await sendMockPasswordResetCode(identity);
        }

        const result = await api.post(
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
            message: result,
            verificationId: null,//실제 API에서는 사용 X. mock에서만 사용.
            expiresAt: issuedAt + PASSWORD_RESET_VERIFICATION_TTL_MS,
            resendAvailableAt: issuedAt + PASSWORD_RESET_RESEND_COOLDOWN_MS,
        };
    } catch (error) {
        throw normalizeError(error);
    }
}

export async function verifyPasswordResetCode(payload) {
    try {
        // 2단계: 1단계에서 사용한 학번·이름·이메일과 사용자가 받은 인증번호를 서버에 다시 보냄.
        // 서버는 코드를 검증하고, 성공하면 비밀번호 변경 권한인 resetToken과 만료시간을 반환함.
        if (isMockMode) {
            const { verifyMockPasswordResetCode } = await loadMockPasswordResetApi();
            return await verifyMockPasswordResetCode(payload);
        }

        const { identity, code } = payload;
        // mock은 verificationId를 쓰지만 Swagger 실제 API는 이 네 필드로 인증 세션을 찾으므로 요청 형식을 분기함.
        return await api.post(
            "/password-reset/verifications/confirm",
            {
                studentId: identity.studentId.trim(),
                name: identity.name.trim(),
                email: identity.email.trim(),
                verificationCode: code.trim(),
            },
            { auth: false },
        );
    } catch (error) {
        throw normalizeError(error);
    }
}

export async function resetPassword(payload) {
    try {
        // 3단계: 인증 성공 응답의 resetToken과 새 비밀번호를 보내 실제 계정 비밀번호 변경을 요청함.
        // 서버는 resetToken 유효기간(10분)과 1회 사용 여부를 검증해야 함.
        if (isMockMode) {
            const { resetMockPassword } = await loadMockPasswordResetApi();
            return await resetMockPassword({
                resetToken: payload.resetToken,
                password: payload.password,
            });
        }

        return await api.post(
            "/password-reset",
            {
                resetToken: payload.resetToken,
                newPassword: payload.password,
                newPasswordConfirm: payload.passwordConfirm,
            },
            { auth: false },
        );
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
