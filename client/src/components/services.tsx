import { useEffect, useRef, useState } from "react";
import SearchBar from "./searchBar";
import amService from "../locates/amharic/service.json";
import enService from "../locates/english/service.json";
import AddNewService from "./addNewService";
import MoreService from "./moreService";
import { useAppData } from "../hooks/useAppData";
import { useLang } from "../hooks/useLang";
import styles from "../styles/services.module.css";

interface Activity {
  id: number;
  name: string;
  frequency?: string;
  time?: string;
  quality?: string;
}

interface SubService {
  id: number;
  name: string;
  activities: Activity[];
}

interface MainService {
  id: number;
  name: string;
  subServices: SubService[];
}

const services: MainService[] = [
  {
    id: 1,
    name: "Service A",
    subServices: [
      {
        id: 101,
        name: "Sub Service A1",
        activities: [
          {
            id: 1001,
            name: "Activity A1-1Activity A1-1Activity A1-1Activity A1-1Activity A1-1Activity A1-1Activity A1-1Activity A1-1Activity A1-1",
          },
          { id: 1002, name: "Activity A1-2" },
        ],
      },
      {
        id: 102,
        name: "Sub Service A2",
        activities: [{ id: 1003, name: "Activity A2-1" }],
      },
    ],
  },
  {
    id: 2,
    name: "Service B",
    subServices: [
      {
        id: 201,
        name: "Sub Service B1",
        activities: [{ id: 2001, name: "Activity B1-1" }],
      },
    ],
  },
];

const ArrowIcon = ({ open }: { open: boolean }) => (
  <div className={open ? styles.circleOpen : styles.circleClosed}>
    <svg
      className={open ? styles.arrowUp : styles.arrowDown}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </div>
);
export default function Services() {
  const { lang } = useLang();
  const translate = {
    am: amService,
    en: enService,
  };
  const text = translate[lang];

  const user = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [openMain, setOpenMain] = useState<number | null>(null);
  const [openSub, setOpenSub] = useState<number | null>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [selected, setSelected] = useState<
    | { type: "main"; mainId: number }
    | { type: "sub"; mainId: number; subId: number }
    | { type: "activity"; mainId: number; subId: number; actId: number }
    | null
  >(null);

  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState<any>({});
  const [more, setMore] = useState<boolean>(false);
  const [addNew, setAddNew] = useState<boolean>(false);
  const handleEdit = () => {
    if (!selected) return;

    if (selected.type === "main") {
      setEditFields({
        nameAm: "",
        nameEn: services.find((s) => s.id === selected.mainId)?.name || "",
      });
    } else if (selected.type === "sub") {
      setEditFields({
        nameAm: "",
        nameEn:
          services
            .find((s) => s.id === selected.mainId)
            ?.subServices.find((sub) => sub.id === selected.subId)?.name || "",
      });
    } else if (selected.type === "activity") {
      const act = services
        .find((s) => s.id === selected.mainId)
        ?.subServices.find((sub) => sub.id === selected.subId)
        ?.activities.find((act) => act.id === selected.actId);
      setEditFields({
        name: act?.name || "",
        frequency: act?.frequency || "",
        time: act?.time || "",
        quality: act?.quality || "",
      });
    }
    setEditMode(true);
  };

  const handleEditFieldChange = (field: string, value: string) => {
    setEditFields((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = () => {
    // In a real app, you would update your state or make an API call here
    console.log("Saved changes:", editFields);
    setEditMode(false);
  };

  const handleDelete = () => {
    if (!selected) return;
    const confirmMessage =
      selected.type === "main"
        ? `Delete main service ${selected.mainId}?`
        : selected.type === "sub"
        ? `Delete subservice ${selected.subId}?`
        : `Delete activity ${selected.actId}?`;

    if (window.confirm(confirmMessage)) {
      console.log("Deleted:", selected);
      setSelected(null);
    }
  };

  const closePanel = () => {
    setSelected(null);
    setEditMode(false);
  };

  const toggleMain = (id: number) => {
    setOpenMain(openMain === id ? null : id);
    setOpenSub(null);
  };

  const toggleSub = (mainId: number, subId: number) => {
    setOpenSub(openSub === subId ? null : subId);
  };

  const selectActivity = (mainId: number, subId: number, actId: number) => {
    setSelected({
      type: "activity",
      mainId,
      subId,
      actId,
    });
  };
  const [adminMode, setAdminMode] = useState("admin");
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  useEffect(() => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      setBoxWidth(entry.contentRect.width);
    });
    if (boxRef.current) {
      resizeObserver.observe(boxRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {user !== "admin" ? (
          <button
            className={styles.moreButton}
            onClick={() => {
              setMore(true);
            }}
          >
            {text.more}
          </button>
        ) : adminMode === "admin" ? (
          <div className={styles.buttonGroup}>
            <button
              className={styles.mineButton}
              onClick={() => {
                setAdminMode("user");
              }}
            >
              {text.mine}
            </button>
            <button
              className={styles.addButton}
              onClick={() => {
                setAddNew(true);
              }}
            >
              {text.add}
            </button>
          </div>
        ) : (
          <div className={styles.buttonGroup}>
            <button
              className={styles.allButton}
              onClick={() => {
                setAdminMode("admin");
              }}
            >
              {text.all}
            </button>
            <button
              className={styles.moreButton}
              onClick={() => {
                setMore(true);
              }}
            >
              {text.more}
            </button>
          </div>
        )}
      </div>
      <div className={styles.displayArea}>
        {filteredServices.length === 0 ? (
          <div className={styles.noServiceMessage}>{text.noFound}</div>
        ) : (
          <>
            <div className={styles.serviceHeader} ref={boxRef}>
              {text.title}
            </div>
            {filteredServices.map((main) => (
              <div key={main.id} className={styles.mainService}>
                <button
                  onClick={() => toggleMain(main.id)}
                  onDoubleClick={() =>
                    setSelected({ type: "main", mainId: main.id })
                  }
                  className={styles.mainButton}
                  aria-expanded={openMain === main.id}
                  aria-controls={`main-${main.id}`}
                >
                  <ArrowIcon open={openMain === main.id} />
                  <span className={styles.mainText}>{main.name}</span>
                </button>

                {openMain === main.id && (
                  <div
                    id={`main-${main.id}`}
                    className={styles.subServicesContainer}
                  >
                    <div className={styles.subServiceTitle}>
                      {text.subservice}
                    </div>
                    {main.subServices.map((sub) => (
                      <div key={sub.id} className={styles.subService}>
                        <button
                          onClick={() => toggleSub(main.id, sub.id)}
                          onDoubleClick={() =>
                            setSelected({
                              type: "sub",
                              mainId: main.id,
                              subId: sub.id,
                            })
                          }
                          className={styles.subButton}
                          aria-expanded={openSub === sub.id}
                          aria-controls={`sub-${sub.id}`}
                        >
                          <ArrowIcon open={openSub === sub.id} />
                          <span className={styles.subText}>{sub.name}</span>
                        </button>

                        {openSub === sub.id && (
                          <>
                            {boxWidth > 580 && (
                              <div className={styles.activityHeader}>
                                <div className={styles.cell}>No.</div>
                                <div className={styles.cell}>Activity Name</div>
                                <div className={styles.cell}>Frequency</div>
                                <div className={styles.cell}>Time</div>
                                <div className={styles.cell}>Quality</div>
                                <div className={styles.cell}></div>
                              </div>
                            )}
                            <ul
                              id={`sub-${sub.id}`}
                              className={styles.activitiesList}
                            >
                              {sub.activities.map((act, index) => (
                                <li
                                  key={act.id}
                                  className={styles.activityItem}
                                  onDoubleClick={() =>
                                    selectActivity(main.id, sub.id, act.id)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  {boxWidth > 580 ? (
                                    <div className={styles.activityRow}>
                                      <div className={styles.cell}>
                                        {index + 1}
                                      </div>
                                      <div className={styles.cell}>
                                        {act.name}
                                      </div>
                                      <div className={styles.cell}>
                                        {act.frequency || "N/A"}
                                      </div>
                                      <div className={styles.cell}>
                                        {act.time || "N/A"}
                                      </div>
                                      <div className={styles.cell}>
                                        {act.quality || "N/A"}
                                      </div>
                                      <div className={styles.cell}>
                                        <button className={styles.submitButton}>
                                          Submit Report
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className={styles.mobileActivityBox}>
                                      <div className={styles.row}>
                                        <span>No.</span>
                                        <span>{index + 1}</span>
                                      </div>
                                      <div className={styles.row}>
                                        <span>Name</span>
                                        <span>{act.name}</span>
                                      </div>
                                      <div className={styles.row}>
                                        <span>Frequency</span>
                                        <span>{act.frequency || "N/A"}</span>
                                      </div>
                                      <div className={styles.row}>
                                        <span>Time</span>
                                        <span>{act.time || "N/A"}</span>
                                      </div>
                                      <div className={styles.row}>
                                        <span>Quality</span>
                                        <span>{act.quality || "N/A"}</span>
                                      </div>
                                      <div className={styles.row}>
                                        <button className={styles.submitButton}>
                                          Submit
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {selected && (
              <div className={styles.overlay}>
                <div
                  className={
                    editMode
                      ? `${styles.actionsPanelCentered}`
                      : `${styles.actionsPanel}`
                  }
                >
                  <div className={styles.panelHeader}>
                    <h3 className={styles.headerTitile}>
                      {selected.type === "main" &&
                        `Service: ${
                          services.find((s) => s.id === selected.mainId)?.name
                        }`}
                      {selected.type === "sub" &&
                        `Subservice: ${
                          services
                            .find((s) => s.id === selected.mainId)
                            ?.subServices.find(
                              (sub) => sub.id === selected.subId
                            )?.name
                        }`}
                      {selected.type === "activity" &&
                        `Activity: ${
                          services
                            .find((s) => s.id === selected.mainId)
                            ?.subServices.find(
                              (sub) => sub.id === selected.subId
                            )
                            ?.activities.find(
                              (act) => act.id === selected.actId
                            )?.name
                        }`}
                    </h3>
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

                  {editMode ? (
                    <form
                      className={styles.form}
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleEditSave();
                      }}
                    >
                      {(selected.type === "main" ||
                        selected.type === "sub") && (
                        <>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>Name</label>
                            <input
                              className={styles.input}
                              value={editFields.nameEn}
                              onChange={(e) =>
                                handleEditFieldChange("nameEn", e.target.value)
                              }
                              placeholder="English name"
                              required
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>ስም</label>
                            <input
                              className={styles.input}
                              value={editFields.nameAm}
                              onChange={(e) =>
                                handleEditFieldChange("nameAm", e.target.value)
                              }
                              placeholder="አማርኛ ስም"
                              required
                            />
                          </div>
                        </>
                      )}

                      {selected.type === "activity" && (
                        <>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>Name</label>
                            <input
                              className={styles.input}
                              value={editFields.name}
                              onChange={(e) =>
                                handleEditFieldChange("nameEn", e.target.value)
                              }
                              placeholder=" name"
                              required
                            />
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>ስም</label>
                            <input
                              className={styles.input}
                              value={editFields.name}
                              onChange={(e) =>
                                handleEditFieldChange("nameAm", e.target.value)
                              }
                              placeholder="ስም"
                              required
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.label}>Frequency</label>
                            <input
                              type="number"
                              min="1"
                              className={styles.input}
                              value={editFields.frequency}
                              onChange={(e) =>
                                handleEditFieldChange(
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
                              className={styles.input}
                              value={editFields.time}
                              onChange={(e) =>
                                handleEditFieldChange("time", e.target.value)
                              }
                              type="time"
                              placeholder="HH:MM"
                              required
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.label}>Quality</label>
                            <input
                              className={styles.input}
                              value={editFields.quality}
                              onChange={(e) =>
                                handleEditFieldChange("quality", e.target.value)
                              }
                              placeholder="100%"
                              required
                            />
                          </div>
                        </>
                      )}

                      <div className={styles.formActions}>
                        <button
                          type="button"
                          className={styles.cancelButton}
                          onClick={() => setEditMode(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className={styles.saveButton}>
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className={styles.viewActions}>
                      <button
                        onClick={handleEdit}
                        className={styles.editButton}
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={handleDelete}
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
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {more && <MoreService setMore={setMore} />}
      {addNew && <AddNewService setAddNew={setAddNew} />}
    </div>
  );
}
