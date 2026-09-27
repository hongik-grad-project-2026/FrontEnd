import { Outlet } from "react-router-dom";
import styles from './PageLayout.module.css'
import Sidebar from "./Sidebar";
import Breadcrumbs from "./Breadcrumbs";

function PageLayout() {

    return (
        <main className={styles.main}>
            <div className={styles.mainWrap}>

                <Sidebar />
                <div className={styles.scrollContainer}>
                    <div className={styles.contentWrap}>
                        <Breadcrumbs />
                        <Outlet />
                    </div>
                </div>
            </div>
        </main>
    )
}

export default PageLayout;