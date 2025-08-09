import TaskReport from "./tasksReport";
import styles from "../styles/report.module.css";
import { FaUsers } from "react-icons/fa";

export default function Report() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titlewrapper}>
          <FaUsers size={32} className={styles.icon} />
          <h2 className={styles.title}>Team Reports</h2>
        </div>
        <div className={styles.teamSelectWrapper}>
          <label htmlFor="teams" className={styles.label}>
            Select Team:
          </label>
          <select name="teams" id="teams" className={styles.select}>
            <option value="all" selected>
              All
            </option>
            <option value="team1">Team 1</option>
            <option value="team2">Team 2 </option>
            <option value="team3">Team 3</option>
            <option value="team4">Team 4</option>
          </select>
        </div>
      </div>
      <div className={styles.reportContent}>
        <TaskReport />
      </div>
    </div>
  );
}
