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
  const [error, setError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { lang, setLang } = useLang();
  const translate = {
    en: enChangePassword,
    am: amChangePassword,
  };
  const text = translate[lang];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(
        "የአዲሱ የሚስጥር ቁልፍ አይደለም እና ማረጋገጫው (New password and confirmation do not match)"
      );
      return;
    }
    setError("");
    alert("የይለፍ ቃል ተቀይሯል (Password changed successfully)");
    onClose();
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
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
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
        <div className={styles.formGroup}>
          <label className={styles.label}>{text.newPswd}</label>
          <div className={styles.inputWrapper}>
            <input
              type={showNew ? "text" : "password"}
              className={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
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
        <div className={styles.formGroup}>
          <label className={styles.label}>{text.cnfrmPswd}</label>
          <div className={styles.inputWrapper}>
            <input
              type={showConfirm ? "text" : "password"}
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
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

        {error && <p className={styles.errorMessage}>{error}</p>}

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.saveBtn}>
            {text.save}
          </button>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            {text.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
