import amAbout from "../locates/amharic/about.json";
import enAbout from "../locates/english/about.json";
import { useLang } from "../hooks/useLang";
import { FaUser, FaBriefcase, FaPhone, FaBuilding } from "react-icons/fa";
import styles from "../styles/about.module.css";
import { useAppData } from "../hooks/useAppData";
export default function About() {
  const { user, profileImage } = useAppData();
  const { lang } = useLang();
  const translate = {
    am: amAbout,
    en: enAbout,
  };
  const text = translate[lang];
  return (
    <div className={styles.card}>
      <div className={styles.profileHeader}>
        {profileImage ? (
          <div
            className={styles.profileImage}
            style={{
              backgroundImage: profileImage
                ? `url(${profileImage})`
                : undefined,
            }}
          ></div>
        ) : (
          <FaUser className={styles.icon} />
        )}

        <h2 className={styles.fullName}>{user.name[lang]}</h2>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoBox}>
          <div className={styles.infoHeader}>
            <FaBriefcase className={styles.infoIcon} />
            <h4 className={styles.label}>{text.profession}</h4>
          </div>
          <p className={styles.value}>{user.profession[lang]}</p>
        </div>

        <div className={styles.infoBox}>
          <div className={styles.infoHeader}>
            <FaPhone className={styles.infoIcon} />
            <h4 className={styles.label}>{text.phoneNo}</h4>
          </div>
          <p className={styles.value}>{user.phone_number}</p>
        </div>

        <div className={styles.infoBox}>
          <div className={styles.infoHeader}>
            <FaBuilding className={styles.infoIcon} />
            <h4 className={styles.label}>{text.office}</h4>
          </div>
          <p className={styles.value}>{user.office[lang]}</p>
        </div>
      </div>
    </div>
  );
}
