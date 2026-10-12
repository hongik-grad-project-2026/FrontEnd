import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { InputLayout } from "../../components/layout/AuthLayout"
import { useUser } from "../../context/UserContext";
import InputBar from "../../components/common/Input";
import Button from "../../components/common/Button";
import Checkbox from "../../components/common/Checkbox";

import styles from "./LoginPage.module.css";

const isMockMode =
    import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === "true";
const SAVED_ID_KEY = isMockMode
    ? "mulmi.mock.savedLoginId"
    : "mulmi.api.savedLoginId";

function InputTextSection({ title, placeholder, helperText, inputName, type = 'text', id, value, onChange }) {
    return (
        <InputLayout
            id={id}
            title={title}
            children={
                <InputBar placeholder={placeholder} helperText={helperText} width={'100%'}
                    name={inputName} type={type} id={id} value={value} onChange={onChange} />
            }
        />
    )
}

function LoginPage() {
    const savedId = localStorage.getItem(SAVED_ID_KEY) ?? "";

    const [loginId, setLoginId] = useState(savedId);
    const [password, setPassword] = useState("");
    const [rememberId, setRememberId] = useState(Boolean(savedId));
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, authError } = useUser();
    const navigate = useNavigate();

    // 두 값이 모두 입력되고 제출 중이 아닐 때만 활성화함.
    const canSubmit = loginId.trim() !== "" && password !== "" && !isSubmitting;
    const displayedErrorMessage = errorMessage || authError?.message || "";


    async function handleSubmit(event) {
        event.preventDefault();

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const user = await login({ loginId: loginId.trim(), password });

            if (rememberId) {
                localStorage.setItem(SAVED_ID_KEY, loginId.trim());
            } else {
                localStorage.removeItem(SAVED_ID_KEY);
            }

            navigate(user.role === "admin" ? "/admin" : "/student", { replace: true });
        } catch (error) {
            setErrorMessage(error.message || "로그인에 실패했습니다. 입력 정보를 확인해 주세요.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (

        <form className={styles.loginPage} onSubmit={handleSubmit}>
            <InputTextSection
                title='학번' placeholder='학번을 입력하세요'
                inputName='loginId' id='loginId'
                value={loginId} onChange={(event) => setLoginId(event.target.value)}
            />
            <InputTextSection
                title='비밀번호' placeholder='비밀번호를 입력하세요'
                inputName='password' type='password' id='password'
                helperText={displayedErrorMessage}
                value={password} onChange={(event) => setPassword(event.target.value)}
            />

            <div className={styles.loginOptions}>
                <label className={styles.checkBoxLabel}>
                    <Checkbox
                        className={styles.checkBox}
                        ariaLabel="학번 기억하기"
                        checked={rememberId}
                        onChange={(event) => setRememberId(event.target.checked)}
                    />
                    <span className={styles.labelText}> 학번 기억하기</span>
                </label>
                <div >
                    <span className={styles.gotoText}>비밀번호 찾기</span>
                    <span className={styles.gotoText} onClick={() => navigate('/signup')}>회원가입</span>
                </div>
            </div>
            <Button
                className={styles.submitButton}
                color="Primary"
                kind="fill"
                size="Default"
                status="Default"
                type="submit"
                text="로그인"
                disabled={!canSubmit}
            />
        </form>
    );
}

export default LoginPage;
