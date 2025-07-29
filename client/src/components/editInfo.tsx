import styles from "../styles/editInfo.module.css";
import amEditInfo from "../locates/amharic/editInfo.json";
import enEditInfo from "../locates/english/editInfo.json";
import { FaUserEdit } from "react-icons/fa";
import { useLang } from "../hooks/useLang";
import type React from "react";
interface propsType {
  prevView: string;
  setActiveView: React.Dispatch<React.SetStateAction<string>>;
}
export default function EditInfo({ prevView, setActiveView }: propsType) {
  const { lang, setLang } = useLang();
  const translate = {
    am: amEditInfo,
    en: enEditInfo,
  };
  const text = translate[lang];
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <FaUserEdit className={styles.icon} />
        {text.editInfo}
      </h2>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{text.name}</label>
          <div className={styles.inputs}>
            <div>
              <label className={styles.subLabel}>በአማርኛ</label>
              <input className={styles.input} type="text" required />
            </div>
            <div>
              <label className={styles.subLabel}>In English</label>
              <input className={styles.input} type="text" required />
            </div>
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{text.fatherName}</label>
          <div className={styles.inputs}>
            <div>
              <label className={styles.subLabel}>በአማርኛ</label>
              <input className={styles.input} type="text" required />
            </div>
            <div>
              <label className={styles.subLabel}>In English</label>
              <input className={styles.input} type="text" required />
            </div>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>{text.phoneNo}</label>
          <input
            className={`${styles.input} ${styles.phoneNo}`}
            type="text"
            required
          />
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.savebtn}>
            {text.save}
          </button>
          <button
            type="button"
            className={styles.cancelbtn}
            onClick={() => {
              setActiveView(prevView);
            }}
          >
            {text.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
