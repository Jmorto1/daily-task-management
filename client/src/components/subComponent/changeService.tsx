import type { Dispatch, SetStateAction, FormEvent } from "react";
import { useState, useEffect, useRef } from "react";
import type { Activity, SubService } from "../services";
import changeServiceAm from "../../locates/amharic/changeService.json";
import changeServiceEn from "../../locates/english/changeService.json";
import { useLang } from "../../hooks/useLang";
import PasswordAuth from "./passwordAuth";
import styles from "../../styles/services.module.css";
type ChangeServiceProps = {
  selected:
    | { type: "main"; mainId: string }
    | { type: "sub"; mainId: string; subId: string }
    | { type: "activity"; mainId: string; subId: string; actId: string };
  setSelected: Dispatch<
    SetStateAction<
      | { type: "main"; mainId: string }
      | { type: "sub"; mainId: string; subId: string }
      | { type: "activity"; mainId: string; subId: string; actId: string }
      | null
    >
  >;
  services: Array<any>;
};
export default function ChangeService({
  selected,
  setSelected,
  services,
}: ChangeServiceProps) {
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editError, setEditError] = useState<any>({});
  const [passwordAuth, setPasswordAuth] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const { lang } = useLang();
  const translate = {
    am: changeServiceAm,
    en: changeServiceEn,
  };
  const text = translate[lang];
  const handleEdit = () => {
    if (!selected) return;
    if (selected.type === "main") {
      setEditForm({
        nameAm:
          services.find((s) => s.id === selected.mainId)?.name["am"] || "",
        nameEn:
          services.find((s) => s.id === selected.mainId)?.name["en"] || "",
      });
      setEditError({
        nameAm: "",
        nameEn: "",
      });
    } else if (selected.type === "sub") {
      setEditForm({
        nameAm:
          services
            .find((s) => s.id === selected.mainId)
            ?.subServices.find((sub: SubService) => sub.id === selected.subId)
            ?.name["am"] || "",
        nameEn:
          services
            .find((s) => s.id === selected.mainId)
            ?.subServices.find((sub: SubService) => sub.id === selected.subId)
            ?.name["en"] || "",
      });
      setEditError({
        nameAm: "",
        nameEn: "",
      });
    } else if (selected.type === "activity") {
      const act = services
        .find((s) => s.id === selected.mainId)
        ?.subServices.find((sub: SubService) => sub.id === selected.subId)
        ?.activities.find((act: Activity) => act.id === selected.actId);
      setEditForm({
        nameAm: act?.name["am"] || "",
        nameEn: act?.name["en"] || "",
        frequency: act?.frequency || "",
        time: act?.time || "",
        quality: act?.quality || "",
      });
      setEditError({
        nameAm: "",
        nameEn: "",
        frequency: "",
        time: "",
        quality: "",
      });
    }
    setEditMode(true);
    setDeleteMode(false);
  };

  const handleEditFieldChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
    setEditError((prev: any) => ({ ...prev, [field]: "" }));
  };
  const validate = () => {
    let isValid = true;
    const percentPattern = /^(\d+)(\.\d+)?%$/;
    const newError: any = {};
    if (selected.type === "main" || selected.type === "sub") {
      setEditError({
        nameAm: "",
        nameEn: "",
      });
      if (!editForm.nameAm.trim()) {
        newError.nameAm = "ስም ያስፈልጋል.";
        isValid = false;
      }
      if (!editForm.nameEn.trim()) {
        newError.nameEn = "name is required";
        isValid = false;
      }
    } else if (selected.type === "activity") {
      if (!editForm.nameAm.trim()) {
        newError.nameAm = "ስም ያስፈልጋል.";
        isValid = false;
      }
      if (!editForm.nameEn.trim()) {
        newError.nameEn = "name is required";
        isValid = false;
      }
      if (!editForm.frequency.trim()) {
        newError.frequency = text.freqError;
        isValid = false;
      }
      if (!editForm.time.trim()) {
        newError.time = text.timeError;
        isValid = false;
      }
      if (!editForm.quality.trim()) {
        newError.quality = text.qualityError;
        isValid = false;
      } else if (!percentPattern.test(editForm.quality.trim())) {
        newError.quality = text.invalidQualityError;
        isValid = false;
      }
    }
    setEditError(newError);
    return isValid;
  };
  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    } else {
      setPasswordAuth(true);
    }
  };
  const handleAuthResult = (success: boolean) => {
    if (success) {
      setPasswordAuth(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } else {
      return;
    }
  };
  const handleDeleteSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordAuth(true);
  };
  const closePanel = () => {
    setSelected(null);
    setEditMode(false);
    setDeleteMode(false);
    setEditForm(null);
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
  }, [editMode]);
  return (
    <div className={styles.overlay}>
      <div
        className={
          editMode || deleteMode
            ? styles.actionsPanelCentered
            : styles.actionsPanel
        }
      >
        <div className={styles.panelHeader}>
          {editMode && (
            <h3 className={styles.headerTitile}>
              {selected.type === "main" &&
                `${text.service}: ${
                  services.find((s) => s.id === selected.mainId)?.name[lang]
                }`}
              {selected.type === "sub" &&
                `${text.subService}: ${
                  services
                    .find((s) => s.id === selected.mainId)
                    ?.subServices.find(
                      (sub: SubService) => sub.id === selected.subId
                    )?.name[lang]
                }`}
              {selected.type === "activity" &&
                `${text.activity}: ${
                  services
                    .find((s) => s.id === selected.mainId)
                    ?.subServices.find(
                      (sub: SubService) => sub.id === selected.subId
                    )
                    ?.activities.find(
                      (act: Activity) => act.id === selected.actId
                    )?.name[lang]
                }`}
            </h3>
          )}
          <button
            onClick={closePanel}
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
        </div>

        {editMode || deleteMode ? (
          editMode ? (
            <>
              <form className={styles.form} onSubmit={handleEditSubmit}>
                {(selected.type === "main" || selected.type === "sub") && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Name</label>
                      <input
                        className={styles.input}
                        value={editForm.nameEn}
                        onChange={(e) =>
                          handleEditFieldChange("nameEn", e.target.value)
                        }
                        placeholder="English name"
                      />
                    </div>
                    {editError.nameEn && (
                      <div className={styles.error}>{editError.nameEn}</div>
                    )}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>ስም</label>
                      <input
                        className={styles.input}
                        value={editForm.nameAm}
                        onChange={(e) =>
                          handleEditFieldChange("nameAm", e.target.value)
                        }
                        placeholder="አማርኛ ስም"
                      />
                    </div>
                    {editError.nameAm && (
                      <div className={styles.error}>{editError.nameAm}</div>
                    )}
                  </>
                )}

                {selected.type === "activity" && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Name</label>
                      <input
                        className={styles.input}
                        value={editForm.nameEn}
                        onChange={(e) =>
                          handleEditFieldChange("nameEn", e.target.value)
                        }
                        placeholder=" name"
                      />
                    </div>
                    {editError.nameEn && (
                      <div className={styles.error}>{editError.nameEn}</div>
                    )}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>ስም</label>
                      <input
                        className={styles.input}
                        value={editForm.nameAm}
                        onChange={(e) =>
                          handleEditFieldChange("nameAm", e.target.value)
                        }
                        placeholder="ስም"
                      />
                    </div>
                    {editError.nameAm && (
                      <div className={styles.error}>{editError.nameAm}</div>
                    )}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{text.freq}</label>
                      <input
                        type="number"
                        min="1"
                        className={styles.input}
                        value={editForm.frequency}
                        onChange={(e) =>
                          handleEditFieldChange("frequency", e.target.value)
                        }
                        placeholder="e.g. 3"
                        ref={refTextInput}
                      />
                    </div>
                    {editError.frequency && (
                      <div className={styles.error}>{editError.frequency}</div>
                    )}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{text.time}</label>
                      <input
                        className={styles.input}
                        value={editForm.time}
                        onChange={(e) =>
                          handleEditFieldChange("time", e.target.value)
                        }
                        type="time"
                        placeholder="HH:MM"
                        style={{ width: `${width}px` }}
                      />
                    </div>
                    {editError.time && (
                      <div className={styles.error}>{editError.time}</div>
                    )}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>{text.quality}</label>
                      <input
                        className={styles.input}
                        value={editForm.quality}
                        onChange={(e) =>
                          handleEditFieldChange("quality", e.target.value)
                        }
                        placeholder="100%"
                      />
                    </div>
                    {editError.quality && (
                      <div className={styles.error}>{editError.quality}</div>
                    )}
                  </>
                )}

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setEditMode(false)}
                  >
                    {text.cancel}
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    {text.save}
                  </button>
                </div>
              </form>
              {showSuccessMessage && (
                <>
                  <div className="successMessageWrapper">
                    <div className="successMessage">{text.editMessage}</div>
                    <div
                      className={styles.overlay}
                      style={{ zIndex: "1001" }}
                    ></div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <form className={styles.form} onSubmit={handleDeleteSubmit}>
                {lang === "en" ? (
                  <div>
                    {selected.type === "main" &&
                      `${text.deleteDeptWarning} ${
                        services.find((s) => s.id === selected.mainId)?.name[
                          lang
                        ]
                      }?`}
                    {selected.type === "sub" &&
                      `${text.deleteDeptWarning} ${
                        services
                          .find((s) => s.id === selected.mainId)
                          ?.subServices.find(
                            (sub: SubService) => sub.id === selected.subId
                          )?.name[lang]
                      }?`}
                    {selected.type === "activity" &&
                      `${text.deleteDeptWarning} ${
                        services
                          .find((s) => s.id === selected.mainId)
                          ?.subServices.find(
                            (sub: SubService) => sub.id === selected.subId
                          )
                          ?.activities.find(
                            (act: Activity) => act.id === selected.actId
                          )?.name[lang]
                      }?`}
                  </div>
                ) : (
                  <div>
                    {selected.type === "main" &&
                      `${
                        services.find((s) => s.id === selected.mainId)?.name[
                          lang
                        ]
                      }${text.deleteDeptWarning}`}
                    {selected.type === "sub" &&
                      `${
                        services
                          .find((s) => s.id === selected.mainId)
                          ?.subServices.find(
                            (sub: SubService) => sub.id === selected.subId
                          )?.name[lang]
                      }${text.deleteDeptWarning}`}
                    {selected.type === "activity" &&
                      `${
                        services
                          .find((s) => s.id === selected.mainId)
                          ?.subServices.find(
                            (sub: SubService) => sub.id === selected.subId
                          )
                          ?.activities.find(
                            (act: Activity) => act.id === selected.actId
                          )?.name[lang]
                      }${text.deleteDeptWarning}`}
                  </div>
                )}
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                      setDeleteMode(false);
                    }}
                  >
                    {text.no}
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    {text.yes}
                  </button>
                </div>
              </form>
              {showSuccessMessage && (
                <>
                  <div className="successMessageWrapper">
                    <div className="successMessage">{text.deleteMessage}</div>
                  </div>
                  <div
                    className={styles.overlay}
                    style={{ zIndex: "1001" }}
                  ></div>
                </>
              )}
            </>
          )
        ) : (
          <div className={styles.viewActions}>
            <button onClick={handleEdit} className={styles.editButton}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <span>{text.edit}</span>
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setDeleteMode(true);
              }}
              className={styles.deleteButton}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span>{text.delete}</span>
            </button>
          </div>
        )}
      </div>
      {passwordAuth && (
        <PasswordAuth
          handleAuthResult={handleAuthResult}
          setPasswordAuth={setPasswordAuth}
        />
      )}
    </div>
  );
}
