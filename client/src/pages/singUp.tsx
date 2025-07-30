import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaPhone, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Language from "../components/languages";
import styles from "../styles/SignupPage.module.css";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add validation & signup logic here
    console.log("Form submitted:", formData);
  };
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);
  return (
    <div className={styles.signupContainer}>
      <div className={styles.language}>
        <Language />
      </div>
      <div className={styles.signupForm}>
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          {/* First Name */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <FaUser />
            </span>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Last Name */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <FaUser />
            </span>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone Number */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <FaPhone />
            </span>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <FaLock />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.password}
            />
            <span className={styles.eyeIcon} onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password Field */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <FaLock />
            </span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={styles.confirmPassword}
            />
            <span
              className={styles.eyeIcon}
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className={styles.signupButton}>
            Sign Up
          </button>
        </form>

        <div className={styles.loginLink}>
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}
