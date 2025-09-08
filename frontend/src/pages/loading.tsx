import styles from "../styles/loadingPage.module.css";
export default function LoadingPage() {
  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading, please wait...</p>
      </div>
    </div>
  );
}
