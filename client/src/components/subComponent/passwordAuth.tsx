import { useState } from "react";
import type { FormEvent } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "../../styles/PasswordAuth.module.css";

interface PasswordAuthProps {
  handleAuthResult: (success: boolean) => void;
  setPasswordAuth: (value: boolean) => void;
}

export default function PasswordAuth({
  handleAuthResult,
  setPasswordAuth,
}: PasswordAuthProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required");
      return;
    }
    setError("");
    setIsSubmitting(true);
    setTimeout(() => {
      if (password === "password") {
        handleAuthResult(true);
        setTimeout(() => {
          setPasswordAuth(false);
        }, 500);
      } else {
        handleAuthResult(false);
        setError("Wrong Password");
      }
      setIsSubmitting(false);
    }, 1000);
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
        <h2 className={styles.header}>Authenticate Action</h2>
        <form
          onSubmit={handleSubmit}
          className={styles.authForm}
          autoComplete="off"
        >
          <label htmlFor="auth-password" className={styles.authLabel}>
            Enter your password
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
              placeholder="Password"
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
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
