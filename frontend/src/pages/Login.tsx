import React, { useState } from "react";
import { Link, replace, useNavigate } from "react-router-dom";
import { FaPhoneAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "../styles/LoginPage.module.css";
import Language from "../components/subComponent/languages";
import { useLang } from "../hooks/useLang";
import loginAm from "../locates/amharic/login.json";
import loginEn from "../locates/english/login.json";

interface LoginFormData {
  phone: string;
  password: string;
}

export default function LoginPage() {
  const { lang, setLang } = useLang();
  const translate = {
    am: loginAm,
    en: loginEn,
  };
  const text = translate[lang];
  const [formData, setFormData] = useState<LoginFormData>({
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      if (
        formData.phone === "0912345678" &&
        formData.password === "password123"
      ) {
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error(text.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.language}>
        <Language />
      </div>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h2>{text.title}</h2>
          <p>{text.subTitle}</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="phone">{text.phone}</label>
            <div className={styles.inputWrapper}>
              <FaPhoneAlt className={styles.inputIcon} />
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">{text.password}</label>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                className={styles.password}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className={styles.options}>
            <Link to="/login" className={styles.forgotPassword}>
              {text.forgot}
            </Link>
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={!formData.password || !formData.phone || isLoading}
          >
            {isLoading ? text.logging : text.login}
          </button>
        </form>

        <div className={styles.signupPrompt}>
          {text.noAccount}{" "}
          <Link to="/signup" className={styles.signupLink}>
            {text.signup}
          </Link>
        </div>
      </div>
    </div>
  );
}
