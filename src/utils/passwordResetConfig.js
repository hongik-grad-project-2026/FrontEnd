// mock과 실제 API 모드에서 동일하게 적용하는 인증번호 재전송 대기시간임.
export const PASSWORD_RESET_RESEND_COOLDOWN_MS = 3 * 60 * 1000;

// mock과 실제 API 화면에서 동일하게 적용하는 인증번호 유효시간임.
export const PASSWORD_RESET_VERIFICATION_TTL_MS = 5 * 60 * 1000;