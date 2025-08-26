import styles from "../styles/editInfo.module.css";
import amEditInfo from "../locates/amharic/editInfo.json";
import enEditInfo from "../locates/english/editInfo.json";
import { FaUserEdit } from "react-icons/fa";
import { useLang } from "../hooks/useLang";
import type React from "react";
import { useState } from "react";
interface propsType {
  prevView: string;
  setActiveView: React.Dispatch<React.SetStateAction<string>>;
}
type FormData = {
  name: {
    am: string;
    en: string;
  };
  office: {
    am: string;
    en: string;
  };
  phone: string;
};
type FormError = FormData;
const emptyError: FormError = {
  name: {
    am: "",
    en: "",
  },
  office: {
    am: "",
    en: "",
  },
  phone: "",
};
export default function EditInfo({ prevView, setActiveView }: propsType) {
  const { lang } = useLang();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const translate = { am: amEditInfo, en: enEditInfo };
  const text = translate[lang];

  const [formData, setFormData] = useState<FormData>({
    name: { am: "", en: "" },
    office: { am: "", en: "" },
    phone: "",
  });

  const [formErrors, setFormErrors] = useState<FormError>(emptyError);
  const handleChange = (fieldPath: string, value: string) => {
    const keys = fieldPath.split(".");
    setFormData((prev) => {
      const updated: any = { ...prev };
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
    setFormErrors((prev) => {
      const updated: any = { ...prev };
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = "";
      return updated;
    });
  };

  const validate = (): boolean => {
    let isValid = true;
    const newErrors: FormError = JSON.parse(JSON.stringify(emptyError)); // deep copy

    // Check name
    if (!formData.name.am.trim()) {
      newErrors.name.am = "እባክዎ ስም በአማርኛ ያስገቡ";
      isValid = false;
    }
    if (!formData.name.en.trim()) {
      newErrors.name.en = "Please enter the name in English";
      isValid = false;
    }
    // Office
    if (!formData.office.am.trim()) {
      newErrors.office.am = "እባክዎ ቢሮ ስም በአማርኛ ያስገቡ";
      isValid = false;
    }
    if (!formData.office.en.trim()) {
      newErrors.office.en = "Please enter the office in English";
      isValid = false;
    }

    // Phone
    const phoneTrimmed = formData.phone.trim();
    if (!phoneTrimmed) {
      newErrors.phone = text.phoneError;
      isValid = false;
    } else if (!/^\d{10}$/.test(phoneTrimmed)) {
      newErrors.phone = text.invalidPhone;
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2000);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <FaUserEdit className={styles.icon} />
        {text.editInfo}
      </h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{text.name}</label>
          <div className={styles.inputs}>
            <div>
              <label className={styles.subLabel}>በአማርኛ</label>
              <input
                value={formData.name.am}
                onChange={(e) => handleChange("name.am", e.target.value)}
                className={styles.input}
                type="text"
              />
              {formErrors.name.am && (
                <div className={styles.error}>{formErrors.name.am}</div>
              )}
            </div>
            <div>
              <label className={styles.subLabel}>In English</label>
              <input
                value={formData.name.en}
                onChange={(e) => handleChange("name.en", e.target.value)}
                className={styles.input}
                type="text"
              />
              {formErrors.name.en && (
                <div className={styles.error}>{formErrors.name.en}</div>
              )}
            </div>
          </div>
        </div>
        {/* Office */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{text.office}</label>
          <div className={styles.inputs}>
            <div>
              <label className={styles.subLabel}>በአማርኛ</label>
              <input
                value={formData.office.am}
                onChange={(e) => handleChange("office.am", e.target.value)}
                className={styles.input}
                type="text"
              />
              {formErrors.office.am && (
                <div className={styles.error}>{formErrors.office.am}</div>
              )}
            </div>
            <div>
              <label className={styles.subLabel}>In English</label>
              <input
                value={formData.office.en}
                onChange={(e) => handleChange("office.en", e.target.value)}
                className={styles.input}
                type="text"
              />
              {formErrors.office.en && (
                <div className={styles.error}>{formErrors.office.en}</div>
              )}
            </div>
          </div>
        </div>

        {/* Phone */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{text.phoneNo}</label>
          <input
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={`${styles.input} ${styles.phoneNo}`}
            type="text"
          />
          {formErrors.phone && (
            <div className={styles.error}>{formErrors.phone}</div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelbtn}
            onClick={() => setActiveView(prevView)}
          >
            {text.cancel}
          </button>
          <button type="submit" className={styles.savebtn}>
            {text.save}
          </button>
        </div>
      </form>
      {showSuccessMessage && (
        <>
          <div className="successMessageWrapper">
            <div className="successMessage">{text.message}</div>
          </div>
          <div className="overlay" style={{ zIndex: "1001" }}></div>
        </>
      )}
    </div>
  );
}
