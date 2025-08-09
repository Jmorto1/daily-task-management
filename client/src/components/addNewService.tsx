import styles from "../styles/services.module.css";
import { useState } from "react";
interface AddNewServiceProps {
  setAddNew: (value: boolean) => void;
}
export default function AddNewService({ setAddNew }: AddNewServiceProps) {
  const handleNewServiceSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Save logic here
    setAddNew(false);
    setNewService({
      nameAm: "",
      nameEn: "",
      subServices: [
        {
          nameAm: "",
          nameEn: "",
          activities: [
            { name: "", nameAm: "", frequency: "", time: "", quality: "" },
          ],
        },
      ],
    });
    console.log("New service added:", newService);
  };
  const [newService, setNewService] = useState({
    nameAm: "",
    nameEn: "",
    subServices: [
      {
        nameAm: "",
        nameEn: "",
        activities: [
          { name: "", nameAm: "", frequency: "", time: "", quality: "" },
        ],
      },
    ],
  });
  const handleNewServiceChange = (field: string, value: string) => {
    setNewService((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubServiceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setNewService((prev) => {
      const updated = prev.subServices.map((sub, i) =>
        i === index ? { ...sub, [field]: value } : sub
      );
      return { ...prev, subServices: updated };
    });
  };
  const handleActivityChange = (
    subIdx: number,
    actIdx: number,
    field: string,
    value: string
  ) => {
    setNewService((prev) => {
      const updatedSubServices = prev.subServices.map((sub, i) => {
        if (i !== subIdx) return sub;
        const updatedActivities = sub.activities.map((act, j) =>
          j === actIdx ? { ...act, [field]: value } : act
        );
        return { ...sub, activities: updatedActivities };
      });
      return { ...prev, subServices: updatedSubServices };
    });
  };
  const addSubService = () => {
    setNewService((prev) => ({
      ...prev,
      subServices: [
        ...prev.subServices,
        {
          nameAm: "",
          nameEn: "",
          activities: [
            { name: "", nameAm: "", frequency: "", time: "", quality: "" },
          ],
        },
      ],
    }));
  };
  const addActivity = (subIdx: number) => {
    const updated = [...newService.subServices];
    updated[subIdx].activities.push({
      name: "",
      nameAm: "",
      frequency: "",
      time: "",
      quality: "",
    });
    setNewService((prev) => ({ ...prev, subServices: updated }));
  };
  return (
    <div className={styles.overlay}>
      <div className={styles.addNew}>
        <button
          onClick={() => setAddNew(false)}
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
        <div className={styles.headerTitile}>Add New Service</div>
        <form className={styles.form} onSubmit={handleNewServiceSave}>
          <div className={styles.formGroup}>
            <label htmlFor="newServiceNameAm" className={styles.label}>
              ስም
            </label>
            <input
              type="text"
              id="newServiceNameAm"
              name="newServiceNameAm"
              placeholder="የአገልግሎት ስም"
              required
              className={styles.input}
              value={newService.nameAm}
              onChange={(e) => handleNewServiceChange("nameAm", e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newServiceNameEn" className={styles.label}>
              Name
            </label>
            <input
              type="text"
              id="newServiceNameEn"
              name="newServiceNameEn"
              placeholder="Service Name"
              required
              className={styles.input}
              value={newService.nameEn}
              onChange={(e) => handleNewServiceChange("nameEn", e.target.value)}
            />
          </div>
          <div className={styles.subServiceSection}>
            <div className={styles.subServiceHeader}>Subservices</div>
            {newService.subServices.map((sub, subIdx) => (
              <div key={subIdx} className={styles.subServiceForm}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Subservice Name (Am)</label>
                  <input
                    className={styles.input}
                    value={sub.nameAm}
                    onChange={(e) =>
                      handleSubServiceChange(subIdx, "nameAm", e.target.value)
                    }
                    placeholder="አማርኛ ስም"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Subservice Name (En)</label>
                  <input
                    className={styles.input}
                    value={sub.nameEn}
                    onChange={(e) =>
                      handleSubServiceChange(subIdx, "nameEn", e.target.value)
                    }
                    placeholder="English name"
                    required
                  />
                </div>
                <div className={styles.activitySection}>
                  <div className={styles.activityHeader}>Activities</div>
                  {sub.activities.map((act, actIdx) => (
                    <div key={actIdx} className={styles.activityForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Name (English)</label>
                        <input
                          className={styles.input}
                          value={act.name}
                          onChange={(e) =>
                            handleActivityChange(
                              subIdx,
                              actIdx,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Activity name"
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Name (Amharic)</label>
                        <input
                          className={styles.input}
                          value={act.nameAm || ""}
                          onChange={(e) =>
                            handleActivityChange(
                              subIdx,
                              actIdx,
                              "nameAm",
                              e.target.value
                            )
                          }
                          placeholder="አማርኛ ስም"
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Frequency</label>
                        <input
                          type="number"
                          min="1"
                          className={styles.input}
                          value={act.frequency}
                          onChange={(e) =>
                            handleActivityChange(
                              subIdx,
                              actIdx,
                              "frequency",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 3"
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Time</label>
                        <input
                          type="time"
                          className={styles.input}
                          value={act.time}
                          onChange={(e) =>
                            handleActivityChange(
                              subIdx,
                              actIdx,
                              "time",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Quality</label>
                        <input
                          className={styles.input}
                          value={act.quality}
                          onChange={(e) =>
                            handleActivityChange(
                              subIdx,
                              actIdx,
                              "quality",
                              e.target.value
                            )
                          }
                          placeholder="100%"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addActivityButton}
                    onClick={() => addActivity(subIdx)}
                  >
                    + Add Activity
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className={styles.addSubServiceButton}
              onClick={addSubService}
            >
              + Add Subservice
            </button>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setAddNew(false)}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
