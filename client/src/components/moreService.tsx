import styles from "../styles/services.module.css";
interface moreServiceProps {
  setMore: (value: boolean) => void;
}
export default function MoreService({ setMore }: moreServiceProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.more}>
        <button
          onClick={() => {
            setMore(false);
          }}
          className={styles.closeIconButton}
          aria-label="Close panel"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className={styles.headerTitile}>Add Additional Service</div>
        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="serviceNameAm" className={styles.label}>
              ስም
            </label>
            <input
              type="text"
              id="serviceNameAm"
              name="serviceNameAm"
              placeholder="የአገልግሎት ስም"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="serviceNameEn" className={styles.label}>
              Name
            </label>
            <input
              type="text"
              id="serviceNameEn"
              name="serviceNameEn"
              placeholder="Service Name"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="frequency" className={styles.label}>
              Frequency
            </label>
            <input
              type="number"
              id="frequency"
              name="frequency"
              min="1"
              placeholder="e.g. 3"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="startTime" className={styles.label}>
              Starting Time
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endTime" className={styles.label}>
              Ending Time
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setMore(false)}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
