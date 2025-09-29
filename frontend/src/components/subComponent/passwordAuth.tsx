import { useState } from "react";
import type { FormEvent } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "../../styles/PasswordAuth.module.css";
import { useLang } from "../../hooks/useLang";
import passwordAuthAm from "../../locates/amharic/passwordAuth.json";
import passwordAuthEn from "../../locates/english/passwordAuth.json";
import { useAppData } from "../../hooks/useAppData";

interface PasswordAuthProps {
  handleAuthResult: (success: boolean) => void;
  setPasswordAuth: (value: boolean) => void;
}

export default function PasswordAuth({
  handleAuthResult,
  setPasswordAuth,
}: PasswordAuthProps) {
  const { serverAddress } = useAppData();
  const { lang } = useLang();
  const translate = {
    am: passwordAuthAm,
    en: passwordAuthEn,
  };
  const text = translate[lang];
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError(text.pswdError);
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${serverAddress}/users/check-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      });
      if (res.status === 200) {
        handleAuthResult(true);
        setTimeout(() => {
          setPasswordAuth(false);
        }, 500);
      } else {
        setError(text.wrongPswd);
        handleAuthResult(false);
      }
    } catch (err) {
      setError(
        lang === "en" ? "Error checking password" : "የይለፍ ቃሉን ማረጋገጥ አልተቻለም"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authOverlay} role="dialog" aria-modal="true">
      <div className={styles.authContainer}>
        <button
          aria-label="Close password dialog"
          onClick={() => setPasswordAuth(false)}
          className={styles.authCloseBtn}
          type="button"
        >
          <svg
            width="22"
            height="22"
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
        <h2 className={styles.header}>{text.title}</h2>
        <form
          onSubmit={handleSubmit}
          className={styles.authForm}
          autoComplete="off"
        >
          <label htmlFor="auth-password" className={styles.authLabel}>
            {text.enterPassword}
          </label>
          <div className={styles.inputContainer}>
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.length > 0) {
                  setError("");
                }
              }}
              className={styles.authInput}
              placeholder={text.password}
              disabled={isSubmitting}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className={styles.eyeIcon}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>
          {error && <div className={styles.authError}>{error}</div>}
          <button
            type="submit"
            className={styles.authSubmitBtn}
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? text.verifying : text.verify}
          </button>
        </form>
      </div>
    </div>
  );
}
