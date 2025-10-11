import React, { useState, type FormEvent } from "react";
import styles from "../styles/forgetpassword.module.css";
import { useAppData } from "../hooks/useAppData";
import { useLang } from "../hooks/useLang";
import Language from "../components/subComponent/languages";
const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const { serverAddress } = useAppData();
  const { lang } = useLang();
  const [inAPIRequest, setInAPIRequest] = useState(false);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setInAPIRequest(true);
    try {
      const res = await fetch(`${serverAddress}/users/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!data.detail) {
        setMessage(lang === "en" ? data.detail : "ይህ ኢይሜል ያለው ተጠቃሚ የለም።");
        setColor("red");
      } else {
        setMessage(
          lang === "en"
            ? "A reset link has been sent."
            : "የይለፍቃል ማስተካከያ ሊንክ ተልኳል።"
        );
        setColor("green");
      }
    } catch (err) {
      setMessage(
        lang === "en"
          ? "Something went wrong. Try again."
          : "ጥያቄዎን ማስተናገድ አልተቻለም። እባክዎን እንደገና ይሞክሩ።"
      );
      setColor("red");
    } finally {
      setInAPIRequest(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.lang}>
        <Language />
      </div>
      <h2 className={styles.title}>
        {lang === "en" ? "Forgot Password" : "የይለፍቃል ማስተካከያ"}
      </h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="email"
          placeholder={lang === "en" ? "Enter your email" : "ኢሜይልዎን ያስገቡ"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className={styles.button} type="submit" disabled={inAPIRequest}>
          {inAPIRequest
            ? lang === "en"
              ? "Sending Reset Link..."
              : "የይለፍቃል ሊንክ በመላክ ላይ..."
            : lang === "en"
            ? "Send Reset Link"
            : "የይለፍቃል ሊንክ ላክ"}
        </button>
      </form>
      {message && (
        <p style={{ color: color }} className={styles.message}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ForgotPasswordForm;
