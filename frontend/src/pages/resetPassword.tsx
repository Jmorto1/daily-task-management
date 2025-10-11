import React, { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styles from "../styles/resetpassword.module.css";
import { useAppData } from "../hooks/useAppData";
import { useLang } from "../hooks/useLang"; // you said you'll import this later
import Language from "../components/subComponent/languages";
const ResetPasswordForm: React.FC = () => {
  const { serverAddress } = useAppData();
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const { lang } = useLang();

  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [inAPIRequest, setInAPIRequest] = useState(false);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage(
        lang === "en" ? "Passwords do not match!" : "የይለፍቃል ቃል አይመሳሰልም!"
      );
      setColor("red");
      return;
    } else if (password.length < 6) {
      setMessage(
        lang === "en"
          ? "Password is short.it requires atlearst 6 character!"
          : "የይለፍቃሉ ትንሽ ነው።ቢያንስ 6ቁልፎችን ያስገቡ!"
      );
      setColor("red");
      return;
    }
    setInAPIRequest(true);
    try {
      const res = await fetch(
        `${serverAddress}/users/reset-password/${uid}/${token}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: password }),
        }
      );

      const data = await res.json();
      setMessage(
        data.detail ||
          (lang === "en"
            ? "Password reset successful. Try logging in."
            : "የይለፍቃል ቃል በተሳካ ሁኔታ ተቀይሯል። እባክዎን ወደ አካውንትዎ ይግቡ።")
      );
      if (data.detail) {
        setColor("red");
      } else {
        setColor("green");
      }
    } catch (err) {
      setColor("red");
      setMessage(
        lang === "en"
          ? "Invalid or expired link."
          : "የሊንኩ ጊዜ አልፎ ነው ወይም የተሳሳተ ነው።"
      );
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
        {lang === "en" ? "Reset Password" : "የይለፍቃል መቀየር"}
      </h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <input
            className={styles.input}
            type={showPassword ? "text" : "password"}
            placeholder={lang === "en" ? "New password" : "አዲስ የይለፍቃል ቃል"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className={styles.icon}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
        </div>

        <div className={styles.inputGroup}>
          <input
            className={styles.input}
            type={showConfirm ? "text" : "password"}
            placeholder={
              lang === "en" ? "Confirm new password" : "የይለፍቃል ቃል ያረጋግጡ"
            }
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <span
            className={styles.icon}
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
        </div>

        <button className={styles.button} type="submit" disabled={inAPIRequest}>
          {!inAPIRequest
            ? lang === "en"
              ? "Reset Password"
              : "የይለፍቃል መቀየር"
            : lang === "en"
            ? "Reseting Password..."
            : "የይለፍቃል በመቀየር ላይ..."}
        </button>
      </form>
      {message && (
        <p className={styles.message} style={{ color: color }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ResetPasswordForm;
