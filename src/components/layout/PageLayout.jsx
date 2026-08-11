import { Outlet } from "react-router-dom";
import styles from './PageLayout.module.css'
import Sidebar from "./Sidebar";
import Breadcrumbs from "./Breadcrumbs";

function PageLayout() {
    console.log("----PageLayout 랜더링");

    return (
        <main className={styles.main}>
            <div className={styles.mainWrap}>

                {/* PageLayout */}
                <Sidebar />
                <div className={styles.contentWrap}>
                    <Breadcrumbs />
                    <Outlet />
                </div>
            </div>
        </main>
    )
}

export default PageLayout;