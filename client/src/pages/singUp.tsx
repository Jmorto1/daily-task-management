import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBuilding,
} from "react-icons/fa";
import Language from "../components/subComponent/languages";
import styles from "../styles/SignupPage.module.css";
import { useLang } from "../hooks/useLang";
import Select from "react-select";
import type { SingleValue } from "react-select";
import singupAm from "../locates/amharic/singup.json";
import singupEn from "../locates/english/singup.json";

type Department = {
  id: string;
  name: {
    am: string;
    en: string;
  };
};

type DeptOption = {
  value: Department;
  label: string;
};

export default function SignupPage() {
  const { lang } = useLang();
  const translate = {
    am: singupAm,
    en: singupEn,
  };
  const text = translate[lang];
  // Sample department data
  const departments: Department[] = [
    { id: "d1", name: { am: "የሂሳብ መምሪያ", en: "Finance Department" } },
    { id: "d2", name: { am: "የሰው ኃይል አስተዳደር", en: "Human Resources" } },
    { id: "d3", name: { am: "የቴክኖሎጂ አገልግሎት", en: "IT Department" } },
    { id: "d4", name: { am: "የግብይት እና ሽያጭ", en: "Sales and Marketing" } },
    { id: "d5", name: { am: "የአስተዳደር አገልግሎት", en: "Administration" } },
    { id: "d6", name: { am: "የህግ አገልግሎት", en: "Legal Department" } },
    {
      id: "d7",
      name: { am: "የግንባታ እና ጥገና", en: "Maintenance and Construction" },
    },
  ];

  const optionDept: DeptOption[] = departments.map((dept) => ({
    value: dept,
    label: dept.name[lang],
  }));

  // ✅ Form state
  const [formData, setFormData] = useState({
    name: { am: "", en: "" },
    department: null as Department | null,
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ✅ Error state
  const [formErrors, setFormErrors] = useState({
    nameAm: "",
    nameEn: "",
    department: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // ✅ Validation function
  const validate = () => {
    let valid = true;
    const errors = {
      nameAm: "",
      nameEn: "",
      department: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.name.am.trim()) {
      errors.nameAm = "ምሉ  ስም ያስገቡ";
      valid = false;
    }
    if (!formData.name.en.trim()) {
      errors.nameEn = "Please enter your full name";
      valid = false;
    }
    if (!formData.department) {
      errors.department = text.selectDept;
      valid = false;
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = text.phoneError;
      valid = false;
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = text.invalidPhone;
      valid = false;
    }
    if (!formData.password.trim()) {
      errors.password = text.passwordError;
      valid = false;
    }
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = text.cfrmPasswordError;
    }
    if (formData.password.trim() && formData.confirmPassword.trim()) {
      if (formData.password.trim() !== formData.confirmPassword.trim()) {
        errors.confirmPassword = text.notMatch;
      } else if (formData.password.length < 6) {
        errors.confirmPassword = text.notSixChar;
        valid = false;
      }
    }
    setFormErrors(errors);
    return valid;
  };

  // ✅ Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle nested name fields
    if (name === "nameAm" || name === "nameEn") {
      setFormData((prev) => ({
        ...prev,
        name: {
          ...prev.name,
          [name === "nameAm" ? "am" : "en"]: value,
        },
      }));
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  };
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [width, setWidht] = useState<number>(0);
  useEffect(() => {
    const handleWidth = () => {
      if (inputRef.current) {
        setWidht(inputRef.current.getBoundingClientRect().width);
      }
    };
    handleWidth();
    window.addEventListener("resize", handleWidth);
    return () => window.removeEventListener("resize", handleWidth);
  }, []);
  return (
    <div className={styles.signupContainer}>
      <div className={styles.language}>
        <Language />
      </div>
      <div className={styles.signupForm}>
        <h2>{text.title}</h2>
        <form onSubmit={handleSubmit}>
          {/* Name Amharic */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <FaUser />
            </span>
            <input
              type="text"
              name="nameAm"
              placeholder="ሙሉ ስም"
              value={formData.name.am}
              onChange={handleChange}
              ref={inputRef}
            />
          </div>
          {formErrors.nameAm && (
            <span className={styles.error}>{formErrors.nameAm}</span>
          )}

          {/* Name English */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <FaUser />
            </span>
            <input
              type="text"
              name="nameEn"
              placeholder="Full Name"
              value={formData.name.en}
              onChange={handleChange}
            />
          </div>
          {formErrors.nameEn && (
            <span className={styles.error}>{formErrors.nameEn}</span>
          )}

          {/* Phone Number */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <FaPhone />
            </span>
            <input
              type="tel"
              name="phoneNumber"
              placeholder={text.phone}
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>
          {formErrors.phoneNumber && (
            <span className={styles.error}>{formErrors.phoneNumber}</span>
          )}

          {/* Department */}
          <div className={styles.inputGroup}>
            <span className={styles.selectIcon}>
              <FaBuilding />
            </span>
            <Select
              isMulti={false}
              value={
                formData.department
                  ? {
                      value: formData.department,
                      label: formData.department.name[lang],
                    }
                  : null
              }
              options={optionDept}
              onChange={(option: SingleValue<DeptOption>) => {
                setFormData((prev) => ({
                  ...prev,
                  department: option ? option.value : null,
                }));
                setFormErrors((prev) => ({ ...prev, department: "" }));
              }}
              className={styles.selectContainer}
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  width: `${width}px`,
                  paddingLeft: "25px",
                }),
                placeholder: (provided, state) => ({
                  ...provided,
                  fontWeight: "500",
                  fontSize: "17px",
                }),
              }}
              placeholder={text.selectDept}
            />
          </div>
          {formErrors.department && (
            <span className={styles.error}>{formErrors.department}</span>
          )}

          {/* Password */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <FaLock />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={text.password}
              value={formData.password}
              onChange={handleChange}
              className={styles.password}
            />
            <span className={styles.eyeIcon} onClick={togglePasswordVisibility}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {formErrors.password && (
            <span className={styles.error}>{formErrors.password}</span>
          )}

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <FaLock />
            </span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder={text.CfrmPassword}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={styles.confirmPassword}
            />
            <span
              className={styles.eyeIcon}
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {formErrors.confirmPassword && (
            <span className={styles.error}>{formErrors.confirmPassword}</span>
          )}

          <button type="submit" className={styles.signupButton}>
            {text.signup}
          </button>
          {showSuccessMessage && (
            <>
              <div className="successMessageWrapper">
                <div className="successMessage">{text.message}</div>
              </div>
              <div className="overlay" style={{ zIndex: "1001" }}></div>
            </>
          )}
        </form>

        <div className={styles.loginLink}>
          {text.haveAccount} <Link to="/">{text.login} </Link>
        </div>
      </div>
    </div>
  );
}
