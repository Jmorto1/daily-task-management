import styles from "../../styles/services.module.css";
import React, { useState, useEffect, useRef } from "react";
import submitReportAm from "../../locates/amharic/submitReport.json";
import submitReportEn from "../../locates/english/submitReport.json";
import { useLang } from "../../hooks/useLang";
import type { Activity } from "../services";
import PasswordAuth from "./passwordAuth";
interface submitReportProps {
  setSubmitReport: (value: boolean) => void;
  activity: Activity | null;
}
interface formErrors {
  frequency?: string;
  startingTime?: string;
  endingTime?: string;
  date?: string;
}
interface form {
  frequency: string;
  startingTime: string;
  endingTime: string;
  TotalHour: string;
  date: string;
}
export default function SubmitReport({
  setSubmitReport,
  activity,
}: submitReportProps) {
  const { lang, setLang } = useLang();
  const translate = {
    en: submitReportEn,
    am: submitReportAm,
  };
  const text = translate[lang];
  const [passwordAuth, setPasswordAuth] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [form, setForm] = useState<form>({
    frequency: "",
    startingTime: "",
    endingTime: "",
    TotalHour: "",
    date: "",
  });
  const [errors, setErrors] = useState<formErrors>({
    frequency: "",
    startingTime: "",
    endingTime: "",
    date: "",
  });
  const validate = () => {
    const newErrors: formErrors = {};
    if (!form.frequency.trim()) newErrors.frequency = text.freqError;
    if (!form.startingTime.trim())
      newErrors.startingTime = text.startingTimeError;
    if (!form.endingTime.trim()) newErrors.endingTime = text.endingTimeError;
    if (!form.date.trim()) newErrors.date = text.dateError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
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
  const handleSubmit = (e: React.FormEvent) => {
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
    const handleResize = () => {
      if (refTextInput.current) {
        setWidth(refTextInput.current.getBoundingClientRect().width);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className={styles.overlay}>
      <div className={styles.submitReport}>
        <button
          onClick={() => {
            setSubmitReport(false);
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
        <div className={styles.reportTitle}>{text.title}</div>
        <div className={styles.headerTitile}>
          {text.activity}: {activity?.name[lang]}
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
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
              ref={refTextInput}
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
              onChange={handleChange}
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
              onClick={() => setSubmitReport(false)}
            >
              {text.cancel}
            </button>
            <button type="submit" className={styles.saveButton}>
              {text.submit}
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
