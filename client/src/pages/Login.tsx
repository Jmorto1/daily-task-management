import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPhoneAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "../styles/LoginPage.module.css";

interface LoginFormData {
  phone: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Replace with your actual authentication logic
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      // Mock validation
      if (
        formData.phone === "user@example.com" &&
        formData.password === "password123"
      ) {
        // Store auth state (in real app, use context/state management)
        navigate("/dashboard"); // Redirect after login
      } else {
        throw new Error("Invalid phone or password");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h2>Welcome Back</h2>
          <p>Please enter your credentials</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="phone">phone</label>
            <div className={styles.inputWrapper}>
              <FaPhoneAlt className={styles.inputIcon} />
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="0912345678"
                value={formData.phone}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
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
            <Link to="/forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className={styles.signupPrompt}>
          Don't have an account?{" "}
          <Link to="/signup" className={styles.signupLink}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
