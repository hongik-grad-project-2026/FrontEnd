import { Outlet } from "react-router-dom";
import styles from './PageLayout.module.css'
import Sidebar from "./Sidebar";
import Breadcrumbs from "./Breadcrumbs";
import PageHeader from "./PageHeader";

function PageLayout() {
    console.log("----PageLayout 랜더링");

    return (
        <main className={styles.main}>
            <div className={styles.mainWrap}>

                {/* PageLayout */}
                <Sidebar />
                <div className={styles.contentWrap}>
                    <Breadcrumbs />
                    {/* 페이지마다 header 위치가 달라서 여기 고정해두면 안될 듯함. */}
                    {/* <PageHeader /> */}
                    <Outlet />
                </div>
            </div>
        </main>
    )
}

export default PageLayout;