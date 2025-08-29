import amAbout from "../locates/amharic/about.json";
import enAbout from "../locates/english/about.json";
import { useLang } from "../hooks/useLang";
import { FaUser, FaBriefcase, FaPhone, FaBuilding } from "react-icons/fa";
import styles from "../styles/about.module.css";
export default function About({ preview }: { preview: string | null }) {
  const { lang, setLang } = useLang();
  const translate = {
    am: amAbout,
    en: enAbout,
  };
  const text = translate[lang];
  return (
    <div className={styles.card}>
      <div className={styles.profileHeader}>
        {preview ? (
          <div
            className={styles.profileImage}
            style={{ backgroundImage: preview ? `url(${preview})` : undefined }}
          ></div>
        ) : (
          <FaUser className={styles.icon} />
        )}

        <h2 className={styles.fullName}>Yealem Birhanu</h2>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoBox}>
          <div className={styles.infoHeader}>
            <FaBriefcase className={styles.infoIcon} />
            <h4 className={styles.label}>{text.role}</h4>
          </div>
          <p className={styles.value}>Admin</p>
        </div>

        <div className={styles.infoBox}>
          <div className={styles.infoHeader}>
            <FaPhone className={styles.infoIcon} />
            <h4 className={styles.label}>{text.phoneNo}</h4>
          </div>
          <p className={styles.value}>0912345678</p>
        </div>

        <div className={styles.infoBox}>
          <div className={styles.infoHeader}>
            <FaBuilding className={styles.infoIcon} />
            <h4 className={styles.label}>{text.office}</h4>
          </div>
          <p className={styles.value}>Innovation And Technology</p>
        </div>
      </div>
    </div>
  );
}
