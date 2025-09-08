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
import { useAppData } from "../hooks/useAppData";
import type { Department } from "../context/appDataContext";
type DeptOption = {
  value: Department;
  label: string;
};

export default function SignupPage() {
  const { departments, serverAddress } = useAppData();
  const { lang } = useLang();
  const translate = {
    am: singupAm,
    en: singupEn,
  };
  const text = translate[lang];
  // Sample department data
  const optionDept: DeptOption[] = departments.map((dept) => ({
    value: dept,
    label: dept.name[lang],
  }));

  const emptyFormData = {
    name: { am: "", en: "" },
    department: null as Department | null,
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  };
  // ✅ Form state
  const [formData, setFormData] = useState(emptyFormData);

  // ✅ Error state
  const [formErrors, setFormErrors] = useState({
    nameAm: "",
    nameEn: "",
    department: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showFailMessage, setShowFailMessage] = useState<boolean>(false);
  const [phoneExists, setPhoneExists] = useState(false);
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
      valid = false;
    }
    if (formData.password.trim() && formData.confirmPassword.trim()) {
      if (formData.password.trim() !== formData.confirmPassword.trim()) {
        errors.confirmPassword = text.notMatch;
        valid = false;
      } else if (formData.password.length < 6) {
        errors.confirmPassword = text.notSixChar;
        valid = false;
      }
    }
    setFormErrors(errors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      try {
        const user = {
          name: formData.name,
          phone_number: formData.phoneNumber.trim(),
          department_id: formData.department?.id,
          password: formData.password.trim(),
          status: "pending",
        };
        user.name.en = user.name.en.replace(/\b\w/g, (c) => c.toUpperCase());
        const response = await fetch(`${serverAddress}/users/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        if (response.ok) {
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
            setFormData(emptyFormData);
          }, 3000);
        } else {
          const data = await response.json();
          console.error(data.errors);
          if (data.field === "phone_number") {
            setPhoneExists(true);
          }
          setShowFailMessage(true);
          setTimeout(() => {
            setShowFailMessage(false);
            setPhoneExists(false);
          }, 3000);
        }
      } catch (error) {
        console.error("error :", error);
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      }
    }
  }
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
                menu: (provided: any) => ({
                  ...provided,
                  width: `${width}px`,
                  minWidth: `${width}px`,
                  fontWeight: "500",
                  fontSize: "17px",
                }),
                placeholder: (provided) => ({
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
          {showFailMessage && (
            <div className="failMessageWrapper">
              <div className="failMessage">
                {phoneExists
                  ? lang === "en"
                    ? "User with this phone number already exists.Please change the Phone number"
                    : "በዚህ ስልክ ቁጥር የተከፈተ አካውንት አለ።እባክዎ ስልኩን ይቀይሩ።"
                  : lang === "en"
                  ? "Request failed.Please try again later."
                  : "ጥያቄዎን ማስተናገድ አልተቻለም። እባክዎን እንደገና ይሞክሩ።"}
              </div>
            </div>
          )}
        </form>

        <div className={styles.loginLink}>
          {text.haveAccount} <Link to="/">{text.login} </Link>
        </div>
      </div>
    </div>
  );
}
