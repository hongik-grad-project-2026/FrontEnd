import styles from './AuthLayout.module.css';
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
    return (
        <main className={styles.authLayout}>
            <section className={styles.contentSection}>
                <h1 className={styles.logoArea}>
                    <img src="/images/h1.png" alt="홍익대학교" />
                    멀티미디어실
                </h1>
                <Outlet />
            </section>

        </main>
    );
}

export default AuthLayout;
export { InputLayout };