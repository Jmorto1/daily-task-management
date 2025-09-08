import styles from "../styles/editInfo.module.css";
import amEditInfo from "../locates/amharic/editInfo.json";
import enEditInfo from "../locates/english/editInfo.json";
import { FaUserEdit } from "react-icons/fa";
import { useLang } from "../hooks/useLang";
import type React from "react";
import { useState } from "react";
import { useAppData } from "../hooks/useAppData";
interface propsType {
  prevView: string;
  setActiveView: React.Dispatch<React.SetStateAction<string>>;
}
type FormData = {
  name: {
    am: string;
    en: string;
  };
  profession: {
    am: string;
    en: string;
  };
  office: {
    am: string;
    en: string;
  };
  phone_number: string;
};
type FormError = FormData;
const emptyError: FormError = {
  name: {
    am: "",
    en: "",
  },
  profession: {
    am: "",
    en: "",
  },
  office: {
    am: "",
    en: "",
  },
  phone_number: "",
};
export default function EditInfo({ prevView, setActiveView }: propsType) {
  const { lang } = useLang();
  const { user, setUser, serverAddress } = useAppData();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showFailMessage, setShowFailMessage] = useState<boolean>(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const translate = { am: amEditInfo, en: enEditInfo };
  const text = translate[lang];

  const [formData, setFormData] = useState<FormData>({
    name: { am: user.name.am, en: user.name.en },
    profession: {
      am: user.profession.am,
      en: user.profession.en,
    },
    office: { am: user.office.am, en: user.office.en },
    phone_number: user.phone_number,
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
    //proffession
    if (!formData.profession.am.trim()) {
      newErrors.profession.am = "እባክዎ የሙያዎን ስም በአማርኛ ያስገቡ";
      isValid = false;
    }
    if (!formData.profession.en.trim()) {
      newErrors.profession.en = "Please enter the profession in English";
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
    const phoneTrimmed = formData.phone_number.trim();
    if (!phoneTrimmed) {
      newErrors.phone_number = text.phoneError;
      isValid = false;
    } else if (!/^\d{10}$/.test(phoneTrimmed)) {
      newErrors.phone_number = text.invalidPhone;
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      try {
        const data = { ...formData, id: user.id };
        const response = await fetch(`${serverAddress}/users/`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          const updatedUser = await response.json();
          setUser(updatedUser);
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
          }, 3000);
        } else {
          const data = await response.json();
          if (data.field === "phone_number") {
            setPhoneExists(true);
          }
          setShowFailMessage(true);
          setTimeout(() => {
            setPhoneExists(false);
            setShowFailMessage(false);
          }, 3000);
        }
      } catch (error) {
        console.error("error :", error);
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      }
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2000);
    }
  }

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
        {/* profession */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{text.profession}</label>
          <div className={styles.inputs}>
            <div>
              <label className={styles.subLabel}>በአማርኛ</label>
              <input
                value={formData.profession.am}
                onChange={(e) => handleChange("profession.am", e.target.value)}
                className={styles.input}
                type="text"
              />
              {formErrors.profession.am && (
                <div className={styles.error}>{formErrors.profession.am}</div>
              )}
            </div>
            <div>
              <label className={styles.subLabel}>In English</label>
              <input
                value={formData.profession.en}
                onChange={(e) => handleChange("profession.en", e.target.value)}
                className={styles.input}
                type="text"
              />
              {formErrors.profession.en && (
                <div className={styles.error}>{formErrors.profession.en}</div>
              )}
            </div>
          </div>
        </div>
        {/* office */}
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
            value={formData.phone_number}
            onChange={(e) => handleChange("phone_number", e.target.value)}
            className={`${styles.input} ${styles.phoneNo}`}
            type="text"
          />
          {formErrors.phone_number && (
            <div className={styles.error}>{formErrors.phone_number}</div>
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
      {showFailMessage && (
        <div className="failMessageWrapper">
          <div className="failMessage">
            {phoneExists
              ? lang === "en"
                ? "User with this phone number already exists.Please change the Phone number"
                : "በዚህ ስልክ ቁጥር የተከፈተ አካውንት አለ።እባክዎ ስልኩን ይቀይሩ።"
              : lang === "en"
              ? "Request failed.Please try again later."
              : "ጥያቄዎን ማስተናገድ አልተቻለም። እባክዎን እንደገና ይሞክሩ።"}
          </div>
        </div>
      )}
    </div>
  );
}
