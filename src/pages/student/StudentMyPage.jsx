import { useNavigate } from "react-router-dom";

import PageHeader from '../../components/layout/PageHeader';
import DashboardStatusCard from "../../components/card/DashboardStatusCard";
import Button from "../../components/common/Button";
import styles from './StudentMyPage.module.css'


function StudentMyPage() {
    const navigate = useNavigate();
    const localCount = 99; //임시값. 추후 수정 필요.

    return (
        <div className={styles.studentMyPage}>
            <PageHeader />
            <div className={styles.contentSection}>
                <h3>기본 정보</h3>
            </div>
            <div className={styles.contentSection}>
                <h3>대여 현황</h3>
                <div className={styles.contentContainer}>
                    <DashboardStatusCard title='대여 신청' count={localCount} onClick={() => navigate("/student/history")}
                        color='yellow'
                    />
                    <DashboardStatusCard title='대여 중' count={localCount} onClick={() => navigate("/student/history")}
                        color='green'
                    />
                    <DashboardStatusCard title='반납 완료' count={localCount} onClick={() => navigate("/student/history")}
                        color='red'
                    />
                </div>
            </div>
            <div className={styles.contentSection}>
                <h3>이용 안내 및 기타</h3>
                <div className={styles.contentContainer}>
                    <Button color="Primary" kind="border" size="Default" status="Default"
                        text="MULMI 이용방법" className={styles.infoButton}
                    />
                    <Button color="Primary" kind="border" size="Default" status="Default"
                        text="MULMI 이용규칙" className={styles.infoButton}
                    />
                    <Button color="Primary" kind="border" size="Default" status="Default"
                        text="서비스 이용 약관" className={styles.infoButton}
                    />
                    <Button color="Primary" kind="border" size="Default" status="Default"
                        text="개인정보 처리방침" className={styles.infoButton}
                    />
                    <Button color="Primary" kind="border" size="Default" status="Default"
                        text="서약서 내용 확인" className={styles.infoButton}
                    />
                    <Button color="Primary" kind="border" size="Default" status="Default"
                        text="회원 탈퇴" className={styles.infoButton}
                    />
                </div>

            </div>
        </div>
    );
}

export default StudentMyPage;