import styles from "../../styles/services.module.css";
import addNewServiceAm from "../../locates/amharic/addNewService.json";
import addNewServiceEn from "../../locates/english/addNewService.json";
import { useLang } from "../../hooks/useLang";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useAppData } from "../../hooks/useAppData";
interface AddNewServiceProps {
  setAddNew: (value: boolean) => void;
}
type ActivityType = {
  nameAm: { value: string; error: string };
  nameEn: { value: string; error: string };
  frequency: { value: string; error: string };
  time: { value: string; error: string };
  quality: { value: string; error: string };
};
type SubServiceType = {
  nameAm: { value: string; error: string };
  nameEn: { value: string; error: string };
  activities: ActivityType[];
};
type NewServiceType = {
  nameAm: { value: string; error: string };
  nameEn: { value: string; error: string };
  subServices: SubServiceType[];
};
const emptyActivity = (): ActivityType => ({
  nameEn: { value: "", error: "" },
  nameAm: { value: "", error: "" },
  frequency: { value: "", error: "" },
  time: { value: "", error: "" },
  quality: { value: "", error: "" },
});

const emptySubService = (): SubServiceType => ({
  nameAm: { value: "", error: "" },
  nameEn: { value: "", error: "" },
  activities: [emptyActivity()],
});
export default function AddNewService({ setAddNew }: AddNewServiceProps) {
  const { user, setServices, serverAddress } = useAppData();
  const [newService, setNewService] = useState<NewServiceType>({
    nameAm: { value: "", error: "" },
    nameEn: { value: "", error: "" },
    subServices: [emptySubService()],
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [showFailMessage, setShowFailMessage] = useState<boolean>(false);
  const [inAPIRequest, setInAPIRequest] = useState<boolean>(false);
  const { lang } = useLang();
  const translate = { am: addNewServiceAm, en: addNewServiceEn };
  const text = translate[lang];

  const validate = () => {
    let valid = true;
    const timePattern = /^\d+:[0-5]\d$/;
    const percentPattern = /^(\d+)(\.\d+)?%$/;

    const updatedService = { ...newService };
    if (!updatedService.nameEn.value.trim()) {
      updatedService.nameEn.error = "Service name is required";
      valid = false;
    }
    if (!updatedService.nameAm.value.trim()) {
      updatedService.nameAm.error = "የአገልግሎት ስም ያስፈልጋል";
      valid = false;
    }
    updatedService.subServices = updatedService.subServices.map((sub) => {
      const updatedSub = { ...sub };
      if (!updatedSub.nameEn.value.trim()) {
        updatedSub.nameEn.error = "Subservice name is required";
        valid = false;
      }
      if (!updatedSub.nameAm.value.trim()) {
        updatedSub.nameAm.error = "የንዑስ-አገልግሎት ስም ያስፈልጋል";
        valid = false;
      }
      // Validate activities
      updatedSub.activities = updatedSub.activities.map((act) => {
        const updatedAct = { ...act };
        if (!updatedAct.nameEn.value.trim()) {
          updatedAct.nameEn.error = "Activity name is required";
          valid = false;
        }
        if (!updatedAct.nameAm.value.trim()) {
          updatedAct.nameAm.error = "የተገባር ስም ያስፈልጋል";
          valid = false;
        }
        if (!updatedAct.frequency.value.trim()) {
          updatedAct.frequency.error = text.freqError;
          valid = false;
        }
        if (!updatedAct.time.value.trim()) {
          updatedAct.time.error = text.timeError;
          valid = false;
        } else if (!timePattern.test(updatedAct.time.value.trim())) {
          updatedAct.time.error = text.invalidTimeError;
          valid = false;
        }
        if (!updatedAct.quality.value.trim()) {
          updatedAct.quality.error = text.qualityError;
          valid = false;
        } else if (!percentPattern.test(updatedAct.quality.value.trim())) {
          updatedAct.quality.error = text.invalidQualityError;
          valid = false;
        }
        return updatedAct;
      });
      return updatedSub;
    });
    setNewService(updatedService);
    return valid;
  };
  const handleNewServiceChange = (
    field: keyof NewServiceType,
    value: string
  ) => {
    setNewService((prev) => ({
      ...prev,
      [field]: { value, error: "" },
    }));
  };
  const handleSubServiceChange = (
    index: number,
    field: keyof SubServiceType,
    value: string
  ) => {
    setNewService((prev) => {
      const updated = prev.subServices.map((sub, i) =>
        i === index ? { ...sub, [field]: { value, error: "" } } : sub
      );
      return { ...prev, subServices: updated };
    });
  };
  const handleActivityChange = (
    subIdx: number,
    actIdx: number,
    field: keyof ActivityType,
    value: string
  ) => {
    setNewService((prev) => {
      const updatedSubServices = prev.subServices.map((sub, i) => {
        if (i !== subIdx) return sub;
        const updatedActivities = sub.activities.map((act, j) =>
          j === actIdx ? { ...act, [field]: { value, error: "" } } : act
        );
        return { ...sub, activities: updatedActivities };
      });
      return { ...prev, subServices: updatedSubServices };
    });
  };
  const addSubService = () => {
    setNewService((prev) => ({
      ...prev,
      subServices: [...prev.subServices, emptySubService()],
    }));
  };
  const addActivity = (subIdx: number) => {
    setNewService((prev) => {
      const updated = prev.subServices.map((sub, i) =>
        i === subIdx
          ? { ...sub, activities: [...sub.activities, emptyActivity()] }
          : sub
      );
      return { ...prev, subServices: updated };
    });
  };
  const closeAddPanel = () => {
    setNewService({
      nameAm: { value: "", error: "" },
      nameEn: { value: "", error: "" },
      subServices: [emptySubService()],
    });
    setAddNew(false);
  };
  function transformServiceForPost(
    service: NewServiceType,
    departmentId: number
  ) {
    return {
      name: {
        am: service.nameAm.value,
        en: service.nameEn.value,
      },
      department_id: departmentId,
      subServices: service.subServices.map((sub) => ({
        name: {
          am: sub.nameAm.value,
          en: sub.nameEn.value,
        },
        activities: sub.activities.map((act) => ({
          name: {
            am: act.nameAm.value,
            en: act.nameEn.value,
          },
          frequency: act.frequency.value,
          time: act.time.value,
          quality: act.quality.value,
        })),
      })),
    };
  }
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!(validate() && user.department)) return;

    const postData = transformServiceForPost(newService, user.department.id);
    setInAPIRequest(true);
    try {
      const response = await fetch(`${serverAddress}/services/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      } else {
        const data = await response.json();
        setServices((prev) => [...prev, data]);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          closeAddPanel();
        }, 3000);
      }
    } catch (err) {
      console.error("Network error:", err);
      setShowFailMessage(true);
      setTimeout(() => {
        setShowFailMessage(false);
      }, 3000);
    }
    setInAPIRequest(false);
  }
  const panelRef = useRef<HTMLDivElement>(null);

  const [successPosition, setSuccessPosition] = useState<{
    top: number;
    right: number;
    width: number;
  }>({ top: 0, right: 0, width: 0 });

  useEffect(() => {
    if (!showSuccessMessage || !panelRef.current) return;

    const updatePosition = () => {
      const rect = panelRef.current!.getBoundingClientRect();
      setSuccessPosition({
        top: rect.top + 15,
        right: window.innerWidth - rect.right + 30,
        width: rect.width - 30,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);

    return () => window.removeEventListener("resize", updatePosition);
  }, [showSuccessMessage]);
  return (
    <div className={styles.overlay}>
      <div className={styles.addNew} ref={panelRef}>
        <button
          onClick={closeAddPanel}
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
        <div className={styles.headerTitile}>{text.title}</div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="newServiceNameEn" className={styles.label}>
              Name
            </label>
            <input
              type="text"
              id="newServiceNameEn"
              name="newServiceNameEn"
              placeholder="Service Name"
              className={styles.input}
              value={newService.nameEn.value}
              onChange={(e) => handleNewServiceChange("nameEn", e.target.value)}
            />
          </div>
          {newService.nameEn.error && (
            <div className={styles.error}>{newService.nameEn.error}</div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="newServiceNameAm" className={styles.label}>
              ስም
            </label>
            <input
              type="text"
              id="newServiceNameAm"
              name="newServiceNameAm"
              placeholder="የአገልግሎት ስም"
              className={styles.input}
              value={newService.nameAm.value}
              onChange={(e) => handleNewServiceChange("nameAm", e.target.value)}
            />
          </div>
          {newService.nameAm.error && (
            <div className={styles.error}>{newService.nameAm.error}</div>
          )}
          <div className={styles.subServiceSection}>
            <div className={styles.subServiceHeader}>{text.subservices}</div>
            {newService.subServices.map((sub, subIdx) => (
              <div key={subIdx} className={styles.subServiceForm}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Name</label>
                  <input
                    className={styles.input}
                    value={sub.nameEn.value}
                    onChange={(e) =>
                      handleSubServiceChange(subIdx, "nameEn", e.target.value)
                    }
                    placeholder="Subservice name"
                  />
                </div>
                {sub.nameEn.error && (
                  <div className={styles.error}>{sub.nameEn.error}</div>
                )}
                <div className={styles.formGroup}>
                  <label className={styles.label}> ስም</label>
                  <input
                    className={styles.input}
                    value={sub.nameAm.value}
                    onChange={(e) =>
                      handleSubServiceChange(subIdx, "nameAm", e.target.value)
                    }
                    placeholder="የንዑስ-አገልግሎት ስም"
                  />
                </div>
                {sub.nameAm.error && (
                  <div className={styles.error}>{sub.nameAm.error}</div>
                )}
                <div className={styles.activitySection}>
                  <div className={styles.activityHeader}>{text.activity}</div>
                  {sub.activities.map((act, actIdx) => (
                    <div key={actIdx} className={styles.activityForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Name</label>
                        <input
                          className={styles.input}
                          value={act.nameEn.value}
                          onChange={(e) =>
                            handleActivityChange(
                              subIdx,
                              actIdx,
                              "nameEn",
                              e.target.value
                            )
                          }
                          placeholder="Activity name"
                        />
                      </div>
                      {act.nameEn.error && (
                        <div className={styles.error}>{act.nameEn.error}</div>
                      )}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>ስም</label>
                        <input
                          className={styles.input}
                          value={act.nameAm.value}
                          onChange={(e) =>
                            handleActivityChange(
                              subIdx,
                              actIdx,
                              "nameAm",
                              e.target.value
                            )
                          }
                          placeholder="የተገባር ስም"
                        />
                      </div>
                      {act.nameAm.error && (
                        <div className={styles.error}>{act.nameAm.error}</div>
                      )}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>{text.freq}</label>
                        <input
                          type="number"
                          min="1"
                          className={styles.input}
                          value={act.frequency.value}
                          onChange={(e) =>
                            handleActivityChange(
                              subIdx,
                              actIdx,
                              "frequency",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 3"
                        />
                      </div>
                      {act.frequency.error && (
                        <div className={styles.error}>
                          {act.frequency.error}
                        </div>
                      )}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>{text.time}</label>
                        <input
                          type="text"
                          className={styles.input}
                          value={act.time.value}
                          onChange={(e) =>
                            handleActivityChange(
                              subIdx,
                              actIdx,
                              "time",
                              e.target.value
                            )
                          }
                          placeholder="2:00"
                        />
                      </div>
                      {act.time.error && (
                        <div className={styles.error}>{act.time.error}</div>
                      )}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>{text.quality}</label>
                        <input
                          className={styles.input}
                          value={act.quality.value}
                          onChange={(e) =>
                            handleActivityChange(
                              subIdx,
                              actIdx,
                              "quality",
                              e.target.value
                            )
                          }
                          placeholder="100%"
                        />
                      </div>
                      {act.quality.error && (
                        <div className={styles.error}>{act.quality.error}</div>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addActivityButton}
                    onClick={() => addActivity(subIdx)}
                  >
                    {text.addActivity}
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className={styles.addSubServiceButton}
              onClick={addSubService}
            >
              {text.addSubService}
            </button>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={closeAddPanel}
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
      </div>
      {showSuccessMessage && (
        <>
          <div
            className="successMessageWrapper"
            style={{
              position: "fixed",
              top: `${successPosition.top}px`,
              right: `${successPosition.right}px`,
              width: `${successPosition.width}px`,
            }}
          >
            <div className="successMessage">{text.message}</div>
            <div className={styles.overlay} style={{ zIndex: "1001" }}></div>
          </div>
        </>
      )}
      {showFailMessage && (
        <div
          className="failMessageWrapper"
          style={{
            position: "fixed",
            top: `${successPosition.top}px`,
            right: `${successPosition.right}px`,
            width: `${successPosition.width}px`,
          }}
        >
          <div className="failMessage">
            {lang === "en"
              ? "Request failed.Please try again later."
              : "ጥያቄዎን ማስተናገድ አልተቻለም። እባክዎን እንደገና ይሞክሩ።"}
          </div>
        </div>
      )}
    </div>
  );
}
