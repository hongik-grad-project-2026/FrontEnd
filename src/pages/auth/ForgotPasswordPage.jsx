import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import InputBar from "../../components/common/Input";
import { InputLayout } from "../../components/layout/AuthLayout";
import {
    invalidatePasswordResetFlow,
    resetPassword,
    sendPasswordResetCode,
    verifyPasswordResetCode,
} from "../../api/passwordResetApi";

import styles from "./ForgotPasswordPage.module.css";

const STUDENT_ID_PATTERN = /^[A-Z][0-9]{6}$/;
const NAME_PATTERN = /^[가-힣A-Za-z][가-힣A-Za-z\s]{0,49}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 16;

function formatRemainingTime(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function PasswordField({
    id,
    title,
    placeholder,
    value,
    helperText,
    visible,
    disabled,
    onChange,
    onToggle,
}) {
    return (
        <InputLayout id={id} title={title}>
            <InputBar
                id={id}
                name={id}
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                placeholder={placeholder}
                helperText={helperText}
                value={value}
                disabled={disabled}
                width="100%"
                onChange={onChange}
                rightElement={(
                    <button
                        className={styles.visibilityButton}
                        type="button"
                        aria-label={visible ? `${title} 숨기기` : `${title} 보기`}
                        disabled={disabled}
                        onClick={onToggle}
                    >
                        <img
                            src={visible ? "/icons/icon24/eye.png" : "/icons/icon24/eye-off.png"}
                            alt=""
                        />
                    </button>
                )}
            />
        </InputLayout>
    );
}

function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState("verification");
    const [identity, setIdentity] = useState({
        studentId: "",
        name: "",
        email: "",
    });
    const [touchedFields, setTouchedFields] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [verificationId, setVerificationId] = useState(null);
    const [hasVerificationRequest, setHasVerificationRequest] = useState(false);
    const [resetToken, setResetToken] = useState(null);
    const [resetTokenExpiresAt, setResetTokenExpiresAt] = useState(0);
    // 인증번호 5분 만료 시각과 재전송 가능 시각을 Unix timestamp로 저장함.
    const [expiresAt, setExpiresAt] = useState(0);
    const [resendAvailableAt, setResendAvailableAt] = useState(0);
    const [now, setNow] = useState(Date.now());
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);
    const [completedAccount, setCompletedAccount] = useState(null);

    const sendGuardRef = useRef(false);
    const verifyGuardRef = useRef(false);
    const resetGuardRef = useRef(false);
    const activeFlowRef = useRef({ verificationId: null, resetToken: null });

    const sendMutation = useMutation({ mutationFn: sendPasswordResetCode });
    const verifyMutation = useMutation({ mutationFn: verifyPasswordResetCode });
    const resetMutation = useMutation({ mutationFn: resetPassword });

    const isStudentIdValid = STUDENT_ID_PATTERN.test(identity.studentId.trim());
    const isNameValid = NAME_PATTERN.test(identity.name.trim());
    const isEmailValid = EMAIL_PATTERN.test(identity.email.trim());
    const areIdentityFieldsValid = isStudentIdValid && isNameValid && isEmailValid;
    const verificationRemaining = Math.max(0, expiresAt - now);
    const resendRemaining = Math.max(0, resendAvailableAt - now);
    // 발송 요청은 성공했지만 만료 시각이 지난 상태인지 계산함.
    const isVerificationExpired = hasVerificationRequest && verificationRemaining <= 0;
    const resetTokenRemaining = Math.max(0, resetTokenExpiresAt - now);
    const isResetTokenExpired = Boolean(resetToken) && resetTokenRemaining <= 0;
    const isVerified = Boolean(resetToken) && !isResetTokenExpired;
    const isPasswordValid =
        password.length >= PASSWORD_MIN_LENGTH &&
        password.length <= PASSWORD_MAX_LENGTH;
    const isPasswordMatched = password !== "" && password === passwordConfirm;

    activeFlowRef.current = { verificationId, resetToken };

    useEffect(() => {
        return () => {
            invalidatePasswordResetFlow(activeFlowRef.current);
        };
    }, []);

    useEffect(() => {
        const shouldTrackVerification =
            hasVerificationRequest && !resetToken && step === "verification";
        const shouldTrackResetToken = Boolean(resetToken);

        if (!shouldTrackVerification && !shouldTrackResetToken) {
            return undefined;
        }

        const updateNow = () => setNow(Date.now());
        updateNow();
        const timerId = window.setInterval(updateNow, 1000);

        return () => window.clearInterval(timerId);
    }, [hasVerificationRequest, resetToken, step]);

    useEffect(() => {
        if (!isVerificationExpired || isVerified) {
            return;
        }

        setFieldErrors((currentErrors) => ({
            ...currentErrors,
            verificationCode:
                currentErrors.verificationCode ||
                "인증번호가 만료되었습니다. 다시 발송해 주세요.",
        }));
    }, [isVerificationExpired, isVerified]);

    useEffect(() => {
        if (!isResetTokenExpired) {
            return;
        }

        setErrorMessage((currentMessage) => (
            currentMessage || "비밀번호 재설정 인증이 만료되었습니다. 로그인 화면으로 돌아가 비밀번호 찾기를 다시 진행해 주세요."
        ));
    }, [isResetTokenExpired]);

    function getLocalFieldErrors() {
        const errors = {};

        if (!isStudentIdValid) {
            errors.studentId = "학번 형식이 올바르지 않습니다. (예: C123456)";
        }

        if (!isNameValid) {
            errors.name = "이름 형식이 올바르지 않습니다.";
        }

        if (!isEmailValid) {
            errors.email = "이메일 형식이 올바르지 않습니다.";
        }

        return errors;
    }

    function getVisibleLocalError(field) {
        if (!touchedFields[field]) {
            return "";
        }

        return getLocalFieldErrors()[field] ?? "";
    }

    function clearVerificationState() {
        invalidatePasswordResetFlow({ verificationId, resetToken });
        setVerificationCode("");
        setVerificationId(null);
        setHasVerificationRequest(false);
        setResetToken(null);
        setResetTokenExpiresAt(0);
        setExpiresAt(0);
        setResendAvailableAt(0);
        setNow(Date.now());
        verifyMutation.reset();
    }

    function handleIdentityChange(field, value) {
        if (hasVerificationRequest || resetToken) {
            clearVerificationState();
        }

        setIdentity((currentIdentity) => ({
            ...currentIdentity,
            [field]: value,
        }));
        setErrorMessage("");
        setFieldErrors((currentErrors) => {
            if (!currentErrors[field] && !currentErrors.verificationCode) {
                return currentErrors;
            }

            const nextErrors = { ...currentErrors };
            delete nextErrors[field];
            delete nextErrors.verificationCode;
            return nextErrors;
        });
    }

    async function handleSendCode() {
        setTouchedFields({ studentId: true, name: true, email: true });

        const localErrors = getLocalFieldErrors();
        if (
            Object.keys(localErrors).length > 0 ||
            sendGuardRef.current ||
            (hasVerificationRequest && resendRemaining > 0) ||
            isVerified
        ) {
            setFieldErrors((currentErrors) => ({ ...currentErrors, ...localErrors }));
            return;
        }

        sendGuardRef.current = true;
        setErrorMessage("");
        setFieldErrors({});

        try {
            const result = await sendMutation.mutateAsync(identity);
            setVerificationId(result.verificationId ?? null);
            setHasVerificationRequest(true);
            setExpiresAt(result.expiresAt);
            setResendAvailableAt(result.resendAvailableAt);
            setVerificationCode("");
            setResetToken(null);
            setNow(Date.now());
        } catch (error) {
            setFieldErrors(error?.fieldErrors ?? {});
            setErrorMessage(error?.message || "인증번호 발송에 실패했습니다.");
        } finally {
            sendGuardRef.current = false;
        }
    }

    // 2단계: 발송 때와 같은 가입 정보 및 인증번호를 확인 API로 보내고, 성공 시 resetToken을 저장함.
    async function handleVerifyCode() {
        if (
            !hasVerificationRequest ||
            verificationCode.trim() === "" ||
            isVerificationExpired ||
            verifyGuardRef.current ||
            isVerified
        ) {
            return;
        }

        verifyGuardRef.current = true;
        setErrorMessage("");
        setFieldErrors((currentErrors) => {
            const nextErrors = { ...currentErrors };
            delete nextErrors.verificationCode;
            return nextErrors;
        });

        try {
            // mock에는 verificationId도 전달하고, 실제 API 어댑터는 identity와 code를 Swagger body로 변환함.
            const result = await verifyMutation.mutateAsync({
                identity,
                verificationId,
                code: verificationCode,
            });
            setResetToken(result.resetToken);
            setResetTokenExpiresAt(result.resetTokenExpiresAt);
            setNow(Date.now());
        } catch (error) {
            setFieldErrors((currentErrors) => ({
                ...currentErrors,
                ...(error?.fieldErrors ?? {}),
            }));
            setErrorMessage(error?.message || "인증번호 확인에 실패했습니다.");
        } finally {
            verifyGuardRef.current = false;
        }
    }

    function handleVerificationSubmit(event) {
        event.preventDefault();

        if (hasVerificationRequest) {
            handleVerifyCode();
            return;
        }

        handleSendCode();
    }

    function handleOpenResetStep() {
        if (
            !resetToken ||
            !resetTokenExpiresAt ||
            Date.now() >= resetTokenExpiresAt
        ) {
            setErrorMessage("비밀번호 재설정 인증이 만료되었습니다. 로그인 화면으로 돌아가 비밀번호 찾기를 다시 진행해 주세요.");
            return;
        }

        setErrorMessage("");
        setFieldErrors({});
        setStep("reset");
    }

    function handleReturnToLogin(options) {
        invalidatePasswordResetFlow({ verificationId, resetToken });
        setVerificationId(null);
        setHasVerificationRequest(false);
        setResetToken(null);
        setResetTokenExpiresAt(0);
        navigate("/login", options);
    }

    // 3단계: 새 비밀번호 형식과 확인값 일치를 검사하고, resetToken과 함께 변경 API를 호출함.
    async function handleResetPassword(event) {
        event.preventDefault();

        const nextErrors = {};
        if (!isPasswordValid) {
            nextErrors.password = `비밀번호는 ${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자리로 입력해 주세요.`;
        }
        if (!isPasswordMatched) {
            nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
        }

        const isExpiredBeforeSubmit =
            !resetTokenExpiresAt || Date.now() >= resetTokenExpiresAt;

        if (isExpiredBeforeSubmit) {
            setErrorMessage("비밀번호 재설정 인증이 만료되었습니다. 로그인 화면으로 돌아가 비밀번호 찾기를 다시 진행해 주세요.");
            return;
        }

        if (
            !resetToken ||
            Object.keys(nextErrors).length > 0 ||
            resetGuardRef.current
        ) {
            setFieldErrors((currentErrors) => ({ ...currentErrors, ...nextErrors }));
            return;
        }

        resetGuardRef.current = true;
        setErrorMessage("");
        setFieldErrors({});

        try {
            // API 어댑터가 화면의 password/passwordConfirm을 Swagger의 newPassword 필드로 매핑함.
            const account = await resetMutation.mutateAsync({
                resetToken,
                password,
                passwordConfirm,
            });
            setCompletedAccount(account);
            setResetToken(null);
            setResetTokenExpiresAt(0);
            setVerificationId(null);
            setHasVerificationRequest(false);
            setVerificationCode("");
            setPassword("");
            setPasswordConfirm("");
            setStep("complete");
        } catch (error) {
            setFieldErrors(error?.fieldErrors ?? {});
            setErrorMessage(error?.message || "비밀번호 재설정에 실패했습니다.");
        } finally {
            resetGuardRef.current = false;
        }
    }

    const sendButtonText = sendMutation.isPending
        ? "발송 중"
        : hasVerificationRequest && resendRemaining > 0
            ? formatRemainingTime(resendRemaining)
            : hasVerificationRequest
                ? "재전송"
                : "인증번호 발송";
    const canSendCode =
        areIdentityFieldsValid &&
        !sendMutation.isPending &&
        !isVerified &&
        (!hasVerificationRequest || resendRemaining <= 0);
    const canVerifyCode =
        hasVerificationRequest &&
        verificationCode.trim() !== "" &&
        !isVerificationExpired &&
        !verifyMutation.isPending &&
        !isVerified;
    const canResetPassword =
        Boolean(resetToken) &&
        !isResetTokenExpired &&
        isPasswordValid &&
        isPasswordMatched &&
        !resetMutation.isPending;

    if (step === "complete") {
        return (
            <div className={styles.completePage}>
                <div className={styles.completeHeader}>
                    <img src="/icons/icon60/checkmark--primary.png" alt="" />
                    <h2>비밀번호 재설정 완료</h2>
                </div>

                <section className={styles.accountSection} aria-labelledby="reset-account-summary-title">
                    <h3 className={styles.accountSectionTitle} id="reset-account-summary-title">
                        계정 정보
                    </h3>
                    <div className={styles.accountTable}>
                        <div className={styles.accountRow}>
                            <span>학번</span>
                            <strong>{completedAccount?.studentId ?? "-"}</strong>
                        </div>
                        <div className={styles.accountRow}>
                            <span>이름</span>
                            <strong>{completedAccount?.name ?? "-"}</strong>
                        </div>
                        <div className={styles.accountRow}>
                            <span>이메일</span>
                            <strong>{completedAccount?.email ?? "-"}</strong>
                        </div>
                        <div className={styles.accountRow}>
                            <span>단과대학</span>
                            <strong>{completedAccount?.college ?? "-"}</strong>
                        </div>
                        <div className={styles.accountRow}>
                            <span>학과(전공)</span>
                            <strong>{completedAccount?.department ?? "-"}</strong>
                        </div>
                    </div>
                </section>

                <Button
                    className={styles.primaryAction}
                    color="Primary"
                    kind="fill"
                    size="Default"
                    status="Default"
                    text="로그인 화면으로"
                    onClick={() => handleReturnToLogin({ replace: true })}
                />
            </div>
        );
    }

    if (step === "reset") {
        return (
            <form className={styles.resetPage} onSubmit={handleResetPassword}>
                <h2 className={styles.pageTitle}>비밀번호 재설정</h2>

                <PasswordField
                    id="new-password"
                    title="새 비밀번호"
                    placeholder="새 비밀번호를 입력하세요. (8~16자리)"
                    value={password}
                    helperText={
                        fieldErrors.password ||
                        (password !== "" && !isPasswordValid
                            ? `비밀번호는 ${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자리로 입력해 주세요.`
                            : "")
                    }
                    visible={passwordVisible}
                    disabled={resetMutation.isPending}
                    onChange={(event) => {
                        setPassword(event.target.value);
                        if (!isResetTokenExpired) {
                            setErrorMessage("");
                        }
                        setFieldErrors((currentErrors) => ({
                            ...currentErrors,
                            password: "",
                        }));
                    }}
                    onToggle={() => setPasswordVisible((current) => !current)}
                />
                <PasswordField
                    id="new-password-confirm"
                    title="새 비밀번호 재입력"
                    placeholder="새 비밀번호를 다시 입력하세요."
                    value={passwordConfirm}
                    helperText={
                        fieldErrors.passwordConfirm ||
                        (passwordConfirm !== "" && !isPasswordMatched
                            ? "비밀번호가 일치하지 않습니다."
                            : "")
                    }
                    visible={passwordConfirmVisible}
                    disabled={resetMutation.isPending}
                    onChange={(event) => {
                        setPasswordConfirm(event.target.value);
                        if (!isResetTokenExpired) {
                            setErrorMessage("");
                        }
                        setFieldErrors((currentErrors) => ({
                            ...currentErrors,
                            passwordConfirm: "",
                        }));
                    }}
                    onToggle={() => setPasswordConfirmVisible((current) => !current)}
                />

                <p className={styles.passwordRule}>
                    비밀번호는 8~16자리로 입력해야 합니다.
                </p>

                {errorMessage ? (
                    <p className={styles.formError} role="alert">{errorMessage}</p>
                ) : null}

                <Button
                    className={styles.primaryAction}
                    color="Primary"
                    kind="fill"
                    size="Default"
                    status="Default"
                    type="submit"
                    text={resetMutation.isPending ? "변경 중" : "비밀번호 재설정"}
                    disabled={!canResetPassword}
                />

                <button
                    className={styles.returnLink}
                    type="button"
                    disabled={resetMutation.isPending}
                    onClick={() => handleReturnToLogin()}
                >
                    로그인 화면으로 돌아가기
                </button>
            </form>
        );
    }

    return (
        <form className={styles.verificationPage} onSubmit={handleVerificationSubmit}>
            <h2 className={styles.pageTitle}>비밀번호 찾기</h2>

            <InputLayout id="password-reset-student-id" title="학번">
                <InputBar
                    id="password-reset-student-id"
                    name="studentId"
                    autoComplete="username"
                    placeholder="학번을 입력하세요. (예: C123456)"
                    helperText={fieldErrors.studentId || getVisibleLocalError("studentId")}
                    value={identity.studentId}
                    width="100%"
                    disabled={sendMutation.isPending || verifyMutation.isPending}
                    onBlur={() => setTouchedFields((current) => ({ ...current, studentId: true }))}
                    onChange={(event) => handleIdentityChange("studentId", event.target.value)}
                />
            </InputLayout>
            <InputLayout id="password-reset-name" title="이름">
                <InputBar
                    id="password-reset-name"
                    name="name"
                    autoComplete="name"
                    placeholder="이름을 입력하세요."
                    helperText={fieldErrors.name || getVisibleLocalError("name")}
                    value={identity.name}
                    width="100%"
                    disabled={sendMutation.isPending || verifyMutation.isPending}
                    onBlur={() => setTouchedFields((current) => ({ ...current, name: true }))}
                    onChange={(event) => handleIdentityChange("name", event.target.value)}
                />
            </InputLayout>
            <InputLayout id="password-reset-email" title="이메일">
                <div className={styles.actionField}>
                    <InputBar
                        id="password-reset-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="이메일을 입력하세요."
                        helperText={fieldErrors.email || getVisibleLocalError("email")}
                        value={identity.email}
                        width="100%"
                        disabled={sendMutation.isPending || verifyMutation.isPending}
                        onBlur={() => setTouchedFields((current) => ({ ...current, email: true }))}
                        onChange={(event) => handleIdentityChange("email", event.target.value)}
                    />
                    <Button
                        className={styles.inlineAction}
                        color="Primary"
                        kind="border"
                        size="Default"
                        status="Default"
                        text={sendButtonText}
                        disabled={!canSendCode}
                        onClick={handleSendCode}
                    />
                </div>
            </InputLayout>
            <InputLayout id="password-reset-code" title="인증번호">
                <div className={styles.actionField}>
                    <InputBar
                        id="password-reset-code"
                        name="verificationCode"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="인증번호를 입력하세요."
                        helperText={fieldErrors.verificationCode}
                        value={verificationCode}
                        width="100%"
                        disabled={
                            !hasVerificationRequest ||
                            isVerificationExpired ||
                            isVerified ||
                            verifyMutation.isPending
                        }
                        onChange={(event) => {
                            setVerificationCode(event.target.value);
                            setErrorMessage("");
                            setFieldErrors((currentErrors) => ({
                                ...currentErrors,
                                verificationCode: "",
                            }));
                        }}
                    />
                    <Button
                        className={styles.inlineAction}
                        color="Primary"
                        kind="border"
                        size="Default"
                        status="Default"
                        text={isVerified ? "인증 완료" : verifyMutation.isPending ? "확인 중" : "인증번호 확인"}
                        disabled={!canVerifyCode}
                        onClick={handleVerifyCode}
                    />
                </div>
            </InputLayout>

            {hasVerificationRequest && !isVerified ? (
                <p className={styles.timerDescription} aria-live="polite">
                    인증번호 유효시간 {formatRemainingTime(verificationRemaining)}
                </p>
            ) : null}

            {errorMessage ? (
                <p className={styles.formError} role="alert">{errorMessage}</p>
            ) : null}

            <Button
                className={styles.primaryAction}
                color="Primary"
                kind="fill"
                size="Default"
                status="Default"
                text="비밀번호 재설정하기"
                disabled={!isVerified}
                onClick={handleOpenResetStep}
            />

            <button
                className={styles.returnLink}
                type="button"
                disabled={sendMutation.isPending || verifyMutation.isPending}
                onClick={() => handleReturnToLogin()}
            >
                로그인 화면으로 돌아가기
            </button>
        </form>
    );
}

export default ForgotPasswordPage;
