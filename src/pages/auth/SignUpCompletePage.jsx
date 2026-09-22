import { useLocation, useNavigate } from "react-router-dom";
import { InputLayout } from "../../components/layout/AuthLayout"
import styles from "./SignUpPage.module.css";
import Button from "../../components/common/Button";

function SignUpCompletePage() {

    const navigate = useNavigate();
    const location = useLocation();
    console.log(location.state);
    // 가입 폼에서 넘겨준 값. 직접 주소로 들어오면 null이므로 ?. 로 접근
    const name = location.state?.name;
    const id = location.state?.id;
    const email = location.state?.email;
    const college = location.state?.college;
    const department = location.state?.department;


    return (
        <div>
            <div className={styles.pageHeader}>
                <img src="/icons/icon60/checkmark--primary.png" alt="" />
                <p>     회원가입 완료</p>
            </div>

            <InputLayout
                title='가입 정보'
                children={
                    <div className={styles.dataTable}>
                        <div className={styles.dataRow}>
                            <span className={styles.dataTitle}>학번</span>
                            <span className={styles.dataValue}>{id}</span>
                        </div>
                        <div className={styles.dataRow}>
                            <span className={styles.dataTitle}>이름</span>
                            <span className={styles.dataValue}>{name}</span>
                        </div>
                        <div className={styles.dataRow}>
                            <span className={styles.dataTitle}>이메일</span>
                            <span className={styles.dataValue}>{email}</span>
                        </div>
                        <div className={styles.dataRow}>
                            <span className={styles.dataTitle}>단과대학</span>
                            <span className={styles.dataValue}>{college}</span>
                        </div>
                        <div className={styles.dataRow}>
                            <span className={styles.dataTitle}>학과(전공)</span>
                            <span className={styles.dataValue}>{department}</span>
                        </div>
                    </div>
                }
            />


            <div className={styles.buttonCon}>

                <Button
                    className={styles.canGoButton}
                    color="Primary"
                    kind="fill"
                    size="Default"
                    status="Default"
                    text="로그인 페이지로"
                    onClick={() => navigate('/')}
                />
            </div>
        </div>
    );
}

export default SignUpCompletePage;