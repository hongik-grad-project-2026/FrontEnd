import styles from "./DashboardStatusCard.module.css";


function DashboardStatusCard({ title, count, color, ...props }) {
    return (
        <div className={styles.curruntStateBox} data-color={color}  {...props}>
            <p>{title}</p>
            <p>
                <span>{count}</span>건
            </p>
        </div>
    );
}

export default DashboardStatusCard;