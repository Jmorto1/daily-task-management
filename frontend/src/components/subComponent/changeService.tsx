import type { Dispatch, SetStateAction, FormEvent } from "react";
import { useState, useRef } from "react";
import type { Activity, SubService } from "../../context/appDataContext";
import changeServiceAm from "../../locates/amharic/changeService.json";
import changeServiceEn from "../../locates/english/changeService.json";
import { useLang } from "../../hooks/useLang";
import PasswordAuth from "./passwordAuth";
import styles from "../../styles/services.module.css";
import { useAppData } from "../../hooks/useAppData";
type ChangeServiceProps = {
  selected:
    | { type: "service"; service_id: number }
    | { type: "subService"; service_id: number; subService_id: number }
    | {
        type: "activity";
        service_id: number;
        subService_id: number;
        activity_id: number;
      };
  setSelected: Dispatch<
    SetStateAction<
      | { type: "service"; service_id: number }
      | { type: "subService"; service_id: number; subService_id: number }
      | {
          type: "activity";
          service_id: number;
          subService_id: number;
          activity_id: number;
        }
      | null
    >
  >;
};
export default function ChangeService({
  selected,
  setSelected,
}: ChangeServiceProps) {
  const { serverAddress, services, setServices } = useAppData();
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editError, setEditError] = useState<any>({});
  const [passwordAuth, setPasswordAuth] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [showFailMessage, setShowFailMessage] = useState<boolean>(false);
  const [inAPIRequest, setInAPIRequest] = useState<boolean>(false);
  const [submitType, setSubmitType] = useState("");
  const { lang } = useLang();
  const translate = {
    am: changeServiceAm,
    en: changeServiceEn,
  };
  const text = translate[lang];
  const handleEdit = () => {
    if (!selected) return;
    if (selected.type === "service") {
      setEditForm({
        nameAm:
          services.find((s) => s.id === selected.service_id)?.name["am"] || "",
        nameEn:
          services.find((s) => s.id === selected.service_id)?.name["en"] || "",
      });
      setEditError({
        nameAm: "",
        nameEn: "",
      });
    } else if (selected.type === "subService") {
      setEditForm({
        nameAm:
          services
            .find((s) => s.id === selected.service_id)
            ?.subServices.find(
              (subService: SubService) =>
                subService.id === selected.subService_id
            )?.name["am"] || "",
        nameEn:
          services
            .find((s) => s.id === selected.service_id)
            ?.subServices.find(
              (subService: SubService) =>
                subService.id === selected.subService_id
            )?.name["en"] || "",
      });
      setEditError({
        nameAm: "",
        nameEn: "",
      });
    } else if (selected.type === "activity") {
      const act = services
        .find((s) => s.id === selected.service_id)
        ?.subServices.find(
          (subService: SubService) => subService.id === selected.subService_id
        )
        ?.activities.find((act: Activity) => act.id === selected.activity_id);
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
    const timePattern = /^\d+:[0-5]\d$/;
    const percentPattern = /^(\d+)(\.\d+)?%$/;

    const newError: any = {};
    if (selected.type === "service" || selected.type === "subService") {
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
      } else if (!timePattern.test(editForm.time.trim())) {
        newError.time = text.invalidTimeError;
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
  const closePanel = () => {
    setSelected(null);
    setEditMode(false);
    setDeleteMode(false);
    setEditForm(null);
    setEditError({});
  };
  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    if (selected.type === "service") {
      handleEditServiceApi();
    } else if (selected.type === "subService") {
      handleEditSubServiceApi();
    } else if (selected.type === "activity") {
      handleEditActivityApi();
    }
  };
  async function handleEditServiceApi() {
    setInAPIRequest(true);
    try {
      const patchData = {
        name: {
          am: editForm.nameAm,
          en: editForm.nameEn,
        },
      };
      const response = await fetch(
        `${serverAddress}/services/${selected.service_id}/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchData),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const index = services.findIndex((service) => service.id === data.id);
        if (index !== -1) {
          setServices((prev) => [
            ...prev.slice(0, index),
            data,
            ...prev.slice(index + 1),
          ]);
        } else {
          setServices((prev) => [...prev, data]);
        }
        setShowSuccessMessage(true);
        setTimeout(() => {
          closePanel();
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      }
    } catch (error) {
      setShowFailMessage(true);
      setTimeout(() => {
        setShowFailMessage(false);
      }, 3000);
    }
    setInAPIRequest(false);
  }
  async function handleEditSubServiceApi() {
    if (selected.type !== "subService") return;
    setInAPIRequest(true);
    try {
      const patchData = {
        name: {
          am: editForm.nameAm,
          en: editForm.nameEn,
        },
      };
      const response = await fetch(
        `${serverAddress}/subServices/${selected.subService_id}/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchData),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setServices((prev) => {
          return prev.map((service) => {
            const subServicesCopy: SubService[] = service.subServices.map(
              (subService) => (subService.id === data.id ? data : subService)
            );
            return { ...service, subServices: subServicesCopy };
          });
        });
        setShowSuccessMessage(true);
        setTimeout(() => {
          closePanel();
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      }
    } catch (error) {
      setShowFailMessage(true);
      setTimeout(() => {
        setShowFailMessage(false);
      }, 3000);
    }
    setInAPIRequest(false);
  }
  async function handleEditActivityApi() {
    if (selected.type !== "activity") return;
    setInAPIRequest(true);
    try {
      const patchData = {
        name: {
          am: editForm.nameAm,
          en: editForm.nameEn,
        },
        frequency: editForm.frequency,
        time: editForm.time,
        quality: editForm.quality,
      };
      const response = await fetch(
        `${serverAddress}/activities/${selected.activity_id}/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchData),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setServices((prev) => {
          return prev.map((service) => {
            const subServicesCopy: SubService[] = service.subServices.map(
              (subService) => {
                const activitiesCopy: Activity[] = subService.activities.map(
                  (activity) => (activity.id === data.id ? data : activity)
                );
                return { ...subService, activities: activitiesCopy };
              }
            );
            return { ...service, subServices: subServicesCopy };
          });
        });
        setShowSuccessMessage(true);
        setTimeout(() => {
          closePanel();
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      }
    } catch (error) {
      setShowFailMessage(true);
      setTimeout(() => {
        setShowFailMessage(false);
      }, 3000);
    }
    setInAPIRequest(false);
  }
  const handleDeleteSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selected.type === "service") {
      setSubmitType("service");
    } else if (selected.type === "subService") {
      setSubmitType("subService");
    } else if (selected.type === "activity") {
      setSubmitType("activity");
    }
    setPasswordAuth(true);
  };
  async function handleDeleteServiceApi() {
    setInAPIRequest(true);
    try {
      const response = await fetch(
        `${serverAddress}/services/${selected.service_id}/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (response.ok) {
        setServices((prev) =>
          prev.filter((service) => service.id !== selected.service_id)
        );
        setShowSuccessMessage(true);
        setTimeout(() => {
          closePanel();
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      }
    } catch (error) {
      setShowFailMessage(true);
      setTimeout(() => {
        setShowFailMessage(false);
      }, 3000);
    }
    setInAPIRequest(false);
  }
  async function handleDeleteSubServiceApi() {
    if (selected.type !== "subService") return;
    setInAPIRequest(true);
    try {
      const response = await fetch(
        `${serverAddress}/subServices/${selected.subService_id}/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (response.ok) {
        setServices((prev) => {
          return prev.map((service) => {
            const subServicesCopy: SubService[] = service.subServices.filter(
              (subService) => subService.id !== selected.subService_id
            );
            return { ...service, subServices: subServicesCopy };
          });
        });
        setShowSuccessMessage(true);
        setTimeout(() => {
          closePanel();
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      }
    } catch (error) {
      setShowFailMessage(true);
      setTimeout(() => {
        setShowFailMessage(false);
      }, 3000);
    }
    setInAPIRequest(false);
  }
  async function handleDeleteActivityApi() {
    if (selected.type !== "activity") return;
    setInAPIRequest(true);
    try {
      const response = await fetch(
        `${serverAddress}/activities/${selected.activity_id}/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (response.ok) {
        setServices((prev) => {
          return prev.map((service) => {
            const subServicesCopy: SubService[] = service.subServices.map(
              (subService) => {
                const activitiesCopy: Activity[] = subService.activities.filter(
                  (activity) => activity.id !== selected.activity_id
                );
                return { ...subService, activities: activitiesCopy };
              }
            );
            return { ...service, subServices: subServicesCopy };
          });
        });
        setShowSuccessMessage(true);
        setTimeout(() => {
          closePanel();
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      }
    } catch (error) {
      setShowFailMessage(true);
      setTimeout(() => {
        setShowFailMessage(false);
      }, 3000);
    }
    setInAPIRequest(false);
  }
  const handleAuthResult = (success: boolean) => {
    if (success) {
      setPasswordAuth(false);
      if (submitType === "service") {
        handleDeleteServiceApi();
      } else if (submitType === "subService") {
        handleDeleteSubServiceApi();
      } else if (submitType === "activity") {
        handleDeleteActivityApi();
      }
      setSubmitType("");
    }
  };
  const refTextInput = useRef<HTMLInputElement>(null);
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
              {selected.type === "service" &&
                `${text.service}: ${
                  services.find((s) => s.id === selected.service_id)?.name[lang]
                }`}
              {selected.type === "subService" &&
                `${text.subService}: ${
                  services
                    .find((s) => s.id === selected.service_id)
                    ?.subServices.find(
                      (subService: SubService) =>
                        subService.id === selected.subService_id
                    )?.name[lang]
                }`}
              {selected.type === "activity" &&
                `${text.activity}: ${
                  services
                    .find((s) => s.id === selected.service_id)
                    ?.subServices.find(
                      (subService: SubService) =>
                        subService.id === selected.subService_id
                    )
                    ?.activities.find(
                      (act: Activity) => act.id === selected.activity_id
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
                {(selected.type === "service" ||
                  selected.type === "subService") && (
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
                        placeholder="e.g. 2:00"
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
                    disabled={inAPIRequest}
                  >
                    {text.cancel}
                  </button>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={inAPIRequest}
                  >
                    {inAPIRequest ? text.saving : text.save}
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
              {showFailMessage && (
                <div className="failMessageWrapper">
                  <div className="failMessage">
                    {lang === "en"
                      ? "Request failed.Please try again later."
                      : "ጥያቄዎን ማስተናገድ አልተቻለም። እባክዎን እንደገና ይሞክሩ።"}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <form className={styles.form} onSubmit={handleDeleteSubmit}>
                {lang === "en" ? (
                  <div>
                    {selected.type === "service" &&
                      `${text.deleteDeptWarning} ${
                        services.find((s) => s.id === selected.service_id)
                          ?.name[lang]
                      }?`}
                    {selected.type === "subService" &&
                      `${text.deleteDeptWarning} ${
                        services
                          .find((s) => s.id === selected.service_id)
                          ?.subServices.find(
                            (subService: SubService) =>
                              subService.id === selected.subService_id
                          )?.name[lang]
                      }?`}
                    {selected.type === "activity" &&
                      `${text.deleteDeptWarning} ${
                        services
                          .find((s) => s.id === selected.service_id)
                          ?.subServices.find(
                            (subService: SubService) =>
                              subService.id === selected.subService_id
                          )
                          ?.activities.find(
                            (act: Activity) => act.id === selected.activity_id
                          )?.name[lang]
                      }?`}
                  </div>
                ) : (
                  <div>
                    {selected.type === "service" &&
                      `${
                        services.find((s) => s.id === selected.service_id)
                          ?.name[lang]
                      }${text.deleteDeptWarning}`}
                    {selected.type === "subService" &&
                      `${
                        services
                          .find((s) => s.id === selected.service_id)
                          ?.subServices.find(
                            (subService: SubService) =>
                              subService.id === selected.subService_id
                          )?.name[lang]
                      }${text.deleteDeptWarning}`}
                    {selected.type === "activity" &&
                      `${
                        services
                          .find((s) => s.id === selected.service_id)
                          ?.subServices.find(
                            (subService: SubService) =>
                              subService.id === selected.subService_id
                          )
                          ?.activities.find(
                            (act: Activity) => act.id === selected.activity_id
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
                    disabled={inAPIRequest}
                  >
                    {text.no}
                  </button>
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={inAPIRequest}
                  >
                    {inAPIRequest ? text.deleting : text.yes}
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
              {showFailMessage && (
                <div className="failMessageWrapper">
                  <div className="failMessage">
                    {lang === "en"
                      ? "Request failed.Please try again later."
                      : "ጥያቄዎን ማስተናገድ አልተቻለም። እባክዎን እንደገና ይሞክሩ።"}
                  </div>
                </div>
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
