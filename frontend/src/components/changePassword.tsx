import React, { useState } from "react";
import styles from "../styles/changePassword.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import amChangePassword from "../locates/amharic/changePassword.json";
import enChangePassword from "../locates/english/changePassword.json";
import { useLang } from "../hooks/useLang";
interface ChangePasswordProps {
  onClose: () => void;
}
export default function ChangePassword({ onClose }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const emptyErrors = {
    current: "",
    new: "",
    confirm: "",
    notMatch: "",
    noSixChar: "",
  };
  const [errors, setErrors] = useState<{
    current: string;
    new: string;
    confirm: string;
    notMatch: string;
    noSixChar: string;
  }>(emptyErrors);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { lang, setLang } = useLang();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const translate = {
    en: enChangePassword,
    am: amChangePassword,
  };
  const text = translate[lang];
  const validate = () => {
    let isValid = true;
    const newErrors = emptyErrors;
    if (!currentPassword.trim()) {
      newErrors.current = text.newError;
      isValid = false;
    }
    if (!newPassword.trim()) {
      newErrors.new = text.curError;
      isValid = false;
    }
    if (!confirmPassword.trim()) {
      newErrors.confirm = text.cnfError;
      isValid = false;
    }
    if (
      currentPassword.trim() &&
      newPassword.trim() &&
      confirmPassword.trim()
    ) {
      if (newPassword.trim() !== confirmPassword.trim()) {
        newErrors.notMatch = text.notMatch;
        isValid = false;
      } else if (newPassword.trim().length < 6) {
        newErrors.noSixChar = text.noSixCharError;
        isValid = false;
      } else if (currentPassword.trim() !== "password") {
        newErrors.current = text.wrongPswd;
        isValid = false;
      }
    }
    setErrors(newErrors);
    return isValid;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{text.header}</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{text.curPswd}</label>
          <div className={styles.inputWrapper}>
            <input
              type={showCurrent ? "text" : "password"}
              className={styles.input}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setErrors((prev) => ({ ...prev, current: "" }));
              }}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowCurrent(!showCurrent)}
              aria-label={
                showCurrent ? "Hide current password" : "Show current password"
              }
            >
              {showCurrent ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        {errors.current && <div className={styles.error}>{errors.current}</div>}
        <div className={styles.formGroup}>
          <label className={styles.label}>{text.newPswd}</label>
          <div className={styles.inputWrapper}>
            <input
              type={showNew ? "text" : "password"}
              className={styles.input}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors((prev) => ({ ...prev, new: "", notMatch: "" }));
                if (
                  e.target.value.trim().length > 5 &&
                  confirmPassword.trim().length > 5
                ) {
                  setErrors((prev) => ({ ...prev, noSixChar: "" }));
                }
              }}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowNew(!showNew)}
              aria-label={showNew ? "Hide new password" : "Show new password"}
            >
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        {errors.new && <div className={styles.error}>{errors.new}</div>}
        <div className={styles.formGroup}>
          <label className={styles.label}>{text.cnfrmPswd}</label>
          <div className={styles.inputWrapper}>
            <input
              type={showConfirm ? "text" : "password"}
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirm: "", notMatch: "" }));
                if (
                  e.target.value.trim().length > 5 &&
                  newPassword.trim().length > 5
                ) {
                  setErrors((prev) => ({ ...prev, noSixChar: "" }));
                }
              }}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={
                showConfirm ? "Hide confirm password" : "Show confirm password"
              }
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        {errors.confirm && <div className={styles.error}>{errors.confirm}</div>}
        {errors.notMatch && (
          <div className={styles.error}>{errors.notMatch}</div>
        )}
        {errors.noSixChar && (
          <div className={styles.error}>{errors.noSixChar}</div>
        )}
        <div className={styles.buttonGroup}>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            {text.cancel}
          </button>
          <button type="submit" className={styles.saveBtn}>
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
