import { useState, type FormEvent, useRef, useEffect } from "react";
import PasswordAuth from "./passwordAuth";
import moreServiceAm from "../../locates/amharic/moreService.json";
import moreServiceEn from "../../locates/english/moreService.json";
import { useLang } from "../../hooks/useLang";
import styles from "../../styles/services.module.css";

interface moreServiceProps {
  setMore: (value: boolean) => void;
}

interface FormErrors {
  serviceNameAm?: string;
  serviceNameEn?: string;
  frequency?: string;
  startingTime?: string;
  endingTime?: string;
  date?: string;
}

export default function MoreService({ setMore }: moreServiceProps) {
  const [form, setForm] = useState({
    serviceNameAm: "",
    serviceNameEn: "",
    frequency: "",
    startingTime: "",
    endingTime: "",
    TotalHour: "",
    date: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordAuth, setPasswordAuth] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const { lang, setLang } = useLang();
  const translate = {
    en: moreServiceEn,
    am: moreServiceAm,
  };
  const text = translate[lang];

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!form.serviceNameAm.trim()) newErrors.serviceNameAm = text.nameAmError;
    if (!form.serviceNameEn.trim()) newErrors.serviceNameEn = text.nameEnError;
    if (!form.frequency || Number(form.frequency) < 1)
      newErrors.frequency = text.freqError;
    if (!form.startingTime) newErrors.startingTime = text.startingTimeError;
    if (!form.endingTime) newErrors.endingTime = text.endingTimeError;
    if (!form.date) newErrors.date = text.dateError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };
    if (name === "startingTime" || name === "endingTime") {
      if (updatedForm.startingTime && updatedForm.endingTime) {
        const [sh, sm] = updatedForm.startingTime.split(":").map(Number);
        const [eh, em] = updatedForm.endingTime.split(":").map(Number);
        let diff = eh * 60 + em - (sh * 60 + sm);
        if (diff < 0) diff += 24 * 60;

        const hours = String(Math.floor(diff / 60)).padStart(2, "0");
        const minutes = String(diff % 60).padStart(2, "0");
        updatedForm.TotalHour = `${hours}:${minutes}`;
      } else {
        updatedForm.TotalHour = "";
      }
    }

    setForm(updatedForm);
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setPasswordAuth(true);
  };
  const handleAuthResult = (success: boolean) => {
    if (success) {
      setPasswordAuth(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } else {
      return;
    }
  };
  const refTextInput = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    if (refTextInput.current) {
      setWidth(refTextInput.current.getBoundingClientRect().width);
    }
  }, []);
  return (
    <div className={styles.overlay}>
      <div className={styles.more}>
        <button
          onClick={() => setMore(false)}
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

        <div className={styles.headerTitile}>{text.title}</div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="serviceNameAm" className={styles.label}>
              ስም
            </label>
            <input
              type="text"
              id="serviceNameAm"
              name="serviceNameAm"
              placeholder="የአገልግሎት ስም"
              value={form.serviceNameAm}
              onChange={handleChange}
              className={styles.input}
              ref={refTextInput}
            />
          </div>
          {errors.serviceNameAm && (
            <div className={styles.error}>{errors.serviceNameAm}</div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="serviceNameEn" className={styles.label}>
              Name
            </label>
            <input
              type="text"
              id="serviceNameEn"
              name="serviceNameEn"
              placeholder="Service Name"
              value={form.serviceNameEn}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          {errors.serviceNameEn && (
            <div className={styles.error}>{errors.serviceNameEn}</div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="frequency" className={styles.label}>
              {text.freq}
            </label>
            <input
              type="number"
              id="frequency"
              name="frequency"
              min="1"
              placeholder="e.g. 3"
              value={form.frequency}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          {errors.frequency && (
            <div className={styles.error}>{errors.frequency}</div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="startingTime" className={styles.label}>
              {text.startingTime}
            </label>
            <input
              type="time"
              id="startingTime"
              name="startingTime"
              value={form.startingTime}
              onChange={handleChange}
              className={styles.input}
              style={{ width: `${width}px` }}
            />
          </div>
          {errors.startingTime && (
            <div className={styles.error}>{errors.startingTime}</div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="endingTime" className={styles.label}>
              {text.endingTime}
            </label>
            <input
              type="time"
              id="endingTime"
              name="endingTime"
              value={form.endingTime}
              onChange={handleChange}
              className={styles.input}
              style={{ width: `${width}px` }}
            />
          </div>
          {errors.endingTime && (
            <div className={styles.error}>{errors.endingTime}</div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="TotalHour" className={styles.label}>
              {text.hour}
            </label>
            <input
              type="text"
              id="TotalHour"
              name="TotalHour"
              value={form.TotalHour}
              className={styles.input}
              disabled
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>
              {text.date}
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={styles.input}
              style={{ width: `${width}px` }}
            />
          </div>
          {errors.date && <div className={styles.error}>{errors.date}</div>}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setMore(false)}
            >
              {text.cancel}
            </button>
            <button type="submit" className={styles.saveButton}>
              {text.save}
            </button>
          </div>
        </form>
        {showSuccessMessage && (
          <>
            <div className="successMessageWrapper">
              <div className="successMessage">{text.message}</div>
            </div>
            <div className={styles.overlay} style={{ zIndex: "1001" }}></div>
          </>
        )}
      </div>

      {passwordAuth && (
        <PasswordAuth
          handleAuthResult={handleAuthResult}
          setPasswordAuth={setPasswordAuth}
        />
      )}
    </div>
  );
}
