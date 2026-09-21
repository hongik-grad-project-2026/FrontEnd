import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { InputLayout } from "../../components/layout/AuthLayout"
import { useUser } from "../../context/UserContext";
import InputBar from "../../components/common/Input";
import Button from "../../components/common/Button";
import Checkbox from "../../components/common/Checkbox";

import styles from "./LoginPage.module.css";

const SAVED_ID_KEY = "savedId";

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

    const [id, setId] = useState(savedId);
    const [password, setPassword] = useState("");
    const [rememberId, setRememberId] = useState(Boolean(savedId));
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useUser();
    const navigate = useNavigate();

    // 둘 다 입력됐고 제출 중이 아닐 때만 활성화
    const canSubmit = id.trim() !== "" && password !== "" && !isSubmitting;

    async function handleSubmit(event) {
        event.preventDefault();

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const user = await login({ id: id.trim(), password });

            if (rememberId) {
                localStorage.setItem(SAVED_ID_KEY, id.trim());
            } else {
                localStorage.removeItem(SAVED_ID_KEY);
            }

            navigate(user.role === "admin" ? "/admin" : "/student", { replace: true });
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className={styles.loginPage} onSubmit={handleSubmit}>
            <InputTextSection
                title='학번' placeholder='학번을 입력하세요'
                inputName='id' id='id'
                value={id} onChange={(event) => setId(event.target.value)}
            />
            <InputTextSection
                title='비밀번호' placeholder='비밀번호를 입력하세요'
                inputName='password' type='password' id='password'
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
                <span className={styles.findPassword}>비밀번호를 잊으셨나요?</span>
            </div>

            <Button
                className={styles.submitButton}
                color="Primary"
                kind="fill"
                size="Default"
                status="Default"
                type="submit"
                text={isSubmitting ? "로그인 중..." : "로그인"}
                disabled={!canSubmit}
            />
        </form>
    );
}

export default LoginPage;
