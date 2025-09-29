import styles from "../../styles/services.module.css";
import React, { useState, useEffect, useRef } from "react";
import submitReportAm from "../../locates/amharic/submitReport.json";
import submitReportEn from "../../locates/english/submitReport.json";
import { useLang } from "../../hooks/useLang";
import type { Activity } from "../../context/appDataContext";
import { useAppData } from "../../hooks/useAppData";
import EthiopianCalendar from "./ethioCalander";
interface submitReportProps {
  setSubmitReport: (value: boolean) => void;
  activity: Activity | null;
  service_id: number | null;
}
interface formErrors {
  frequency?: string;
  startingTime?: string;
  endingTime?: string;
  quality?: string;
  date?: string;
}
interface form {
  frequency: string;
  startingTime: string;
  endingTime: string;
  TotalHour: string;
  quality: string;
  date: string;
}
export default function SubmitReport({
  setSubmitReport,
  activity,
  service_id,
}: submitReportProps) {
  const { lang } = useLang();
  const translate = {
    en: submitReportEn,
    am: submitReportAm,
  };
  const text = translate[lang];
  const { user, serverAddress, standardReports, setStandardReports } =
    useAppData();
  const [showFailMessage, setShowFailMessage] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [inAPIRequest, setInAPIRequest] = useState<boolean>(false);
  const [form, setForm] = useState<form>({
    frequency: "",
    startingTime: "",
    endingTime: "",
    TotalHour: "",
    quality: "",
    date: "",
  });
  const [errors, setErrors] = useState<formErrors>({
    frequency: "",
    startingTime: "",
    endingTime: "",
    quality: "",
    date: "",
  });
  const validate = () => {
    const percentPattern = /^(\d+)(\.\d+)?%$/;
    const newErrors: formErrors = {};
    if (!form.frequency.trim()) newErrors.frequency = text.freqError;
    if (!form.startingTime.trim())
      newErrors.startingTime = text.startingTimeError;
    if (!form.endingTime.trim()) newErrors.endingTime = text.endingTimeError;
    if (!form.quality.trim()) {
      newErrors.quality = text.qualityError;
    } else if (!percentPattern.test(form.quality.trim())) {
      newErrors.quality = text.invalidQualityError;
    }
    if (!form.date.trim()) newErrors.date = text.dateError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    if (name === "startingTime" || name === "endingTime") {
      if (updatedForm.startingTime && updatedForm.endingTime) {
        const [sh, sm] = updatedForm.startingTime.split(":").map(Number);
        const [eh, em] = updatedForm.endingTime.split(":").map(Number);
        let diff = eh * 60 + em - (sh * 60 + sm);
        if (diff < 0) diff += 24 * 60;

        const hours = String(Math.floor(diff / 60)).padStart(2, "0");
        const minutes = String(diff % 60).padStart(2, "0");
        updatedForm.TotalHour = `${hours}:${minutes}`;
      } else {
        updatedForm.TotalHour = "";
      }
    }
    setForm(updatedForm);

    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setInAPIRequest(true);
    if (activity && service_id) {
      const postData = {
        type: "standard",
        service_id: service_id,
        subService_id: activity.subService_id,
        user_id: user.id,
        name: activity.name,
        quality: form.quality,
        activity_id: activity.id,
        frequency: form.frequency,
        startingTime: form.startingTime,
        endingTime: form.endingTime,
        totalHour: form.TotalHour,
        date: form.date,
      };
      try {
        const response = await fetch(`${serverAddress}/reports/`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });

        if (!response.ok) {
          const error = await response.json();
          console.log("error:", error);
          setShowFailMessage(true);
          setTimeout(() => setShowFailMessage(false), 3000);
        } else {
          const data = await response.json();
          const newEntry = data[0];
          let reportCopy = [...standardReports];

          const { id: serviceId, subServices } = newEntry;
          const newSubService = subServices[0];
          const newActivity = newSubService.activities[0];
          let service = reportCopy.find((s) => s.id === serviceId);

          if (!service) {
            reportCopy.push(newEntry);
          } else {
            let subService = service.subServices.find(
              (ss) => ss.id === newSubService.id
            );

            if (!subService) {
              service.subServices.push(newSubService);
            } else {
              subService.activities.push(newActivity);
            }
          }

          setStandardReports(reportCopy);

          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
            setSubmitReport(false);
          }, 3000);
        }
      } catch (error) {
        console.error("Error creating report:", error);
        setShowFailMessage(true);
        setTimeout(() => setShowFailMessage(false), 3000);
      }
    }
    setInAPIRequest(false);
  };
  const refTextInput = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState<number>(0);
  useEffect(() => {
    const handleResize = () => {
      if (refTextInput.current) {
        setWidth(refTextInput.current.getBoundingClientRect().width);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div className={styles.overlay}>
      <div className={styles.submitReport}>
        <button
          onClick={() => {
            setSubmitReport(false);
          }}
          className={styles.closeIconButton}
          aria-label="Close panel"
        >
          <svg
            width="20"
            height="20"
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
        <div className={styles.reportTitle}>{text.title}</div>
        <div className={styles.headerTitile}>
          {text.activity}: {activity?.name[lang]}
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="frequency" className={styles.label}>
              {text.freq}
            </label>
            <input
              type="number"
              id="frequency"
              name="frequency"
              min="1"
              placeholder="e.g. 3"
              value={form.frequency}
              onChange={handleChange}
              className={styles.input}
              ref={refTextInput}
            />
          </div>
          {errors.frequency && (
            <div className={styles.error}>{errors.frequency}</div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="startingTime" className={styles.label}>
              {text.startingTime}
            </label>
            <input
              type="time"
              id="startingTime"
              name="startingTime"
              value={form.startingTime}
              onChange={handleChange}
              className={styles.input}
              style={{ width: `${width}px` }}
            />
          </div>
          {errors.startingTime && (
            <div className={styles.error}>{errors.startingTime}</div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="endingTime" className={styles.label}>
              {text.endingTime}
            </label>
            <input
              type="time"
              id="endingTime"
              name="endingTime"
              value={form.endingTime}
              onChange={handleChange}
              className={styles.input}
              style={{ width: `${width}px` }}
            />
          </div>
          {errors.endingTime && (
            <div className={styles.error}>{errors.endingTime}</div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="TotalHour" className={styles.label}>
              {text.hour}
            </label>
            <input
              type="text"
              id="TotalHour"
              name="TotalHour"
              value={form.TotalHour}
              onChange={handleChange}
              className={styles.input}
              disabled
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="Quality" className={styles.label}>
              {text.quality}
            </label>
            <input
              type="text"
              id="quality"
              name="quality"
              min="1"
              placeholder="e.g.100%"
              value={form.quality}
              onChange={handleChange}
              className={styles.input}
              ref={refTextInput}
            />
          </div>
          {errors.quality && (
            <div className={styles.error}>{errors.quality}</div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>
              {text.date}
            </label>

            {lang === "am" ? (
              <EthiopianCalendar
                value={(form.date && new Date(form.date)) || new Date()}
                onChange={(selectedDate: string) => {
                  setForm((prev) => ({ ...prev, date: selectedDate }));
                  setErrors((prev) => ({ ...prev, date: "" }));
                }}
                className={styles.input}
              />
            ) : (
              <input
                type="date"
                id="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={styles.input}
                style={{ width: `${width}px` }}
              />
            )}
          </div>
          {errors.date && <div className={styles.error}>{errors.date}</div>}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setSubmitReport(false)}
              disabled={inAPIRequest}
            >
              {text.cancel}
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={inAPIRequest}
            >
              {inAPIRequest ? text.submiting : text.submit}
            </button>
          </div>
        </form>
        {showSuccessMessage && (
          <>
            <div className="successMessageWrapper">
              <div className="successMessage">{text.message}</div>
            </div>
            <div className={styles.overlay} style={{ zIndex: "1001" }}></div>
          </>
        )}
        {showFailMessage && (
          <div className="failMessageWrapper">
            <div className="failMessage">
              {lang === "en"
                ? "Request failed.Please try again later."
                : "ጥያቄዎን ማስተናገድ አልተቻለም። እባክዎን እንደገና ይሞክሩ።"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
