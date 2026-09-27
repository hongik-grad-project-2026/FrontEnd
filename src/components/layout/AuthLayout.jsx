import styles from './AuthLayout.module.css';
import { useMatches } from 'react-router-dom'
import { Outlet } from "react-router-dom";

function InputLayout({ title, children, id }) {
    return (
        <div className={styles.inputSection}>
            <label className={styles.sectionTitle} htmlFor={id}>{title}</label>
            {children}
        </div>
    )
}


function AuthLayout() {
    const matches = useMatches().at(-1);
    const titleConfig = matches?.handle?.title;

    return (
        <main className={styles.authLayout}>
            {titleConfig === '회원가입' ? (
                <div className={styles.bgLogo}>
                    <img src="/images/h1.png" alt="logo" />
                    <span>멀티미디어실</span>
                </div>
            ) : ''}
            <section className={`${styles.contentSection} ${titleConfig === '회원가입' ? styles.signupSection : ''}`}>
                {titleConfig === '로그인' ? (
                    <h1 className={styles.logoArea}>
                        <img src="/images/h1.png" alt="홍익대학교" />
                        멀티미디어실
                    </h1>
                ) : (
                    titleConfig === '회원가입 완료' ? '' : (
                        <h2 className={styles.header}>{titleConfig}</h2>
                    )
                )}
                <Outlet />
            </section>

        </main>
    );
}

export default AuthLayout;
export { InputLayout };