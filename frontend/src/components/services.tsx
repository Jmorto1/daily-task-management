import { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import { FiMoreVertical } from "react-icons/fi";
import { MdArrowForward, MdArrowBack } from "react-icons/md";
import SearchBar from "./subComponent/searchBar";
import amService from "../locates/amharic/service.json";
import enService from "../locates/english/service.json";
import AddNewService from "./subComponent/addNewService";
import MoreService from "./subComponent/moreService";
import SubmitReport from "./subComponent/submitReport";
import ChangeService from "./subComponent/changeService";
import { useAppData } from "../hooks/useAppData";
import { useLang } from "../hooks/useLang";
import styles from "../styles/services.module.css";

export interface Activity {
  id: string;
  name: {
    am: string;
    en: string;
  };
  frequency?: string;
  time?: string;
  quality?: string;
}

export interface SubService {
  id: string;
  name: {
    en: string;
    am: string;
  };
  activities: Activity[];
}

export interface MainService {
  id: string;
  name: {
    en: string;
    am: string;
  };
  subServices: SubService[];
}

const services: MainService[] = [
  {
    id: "1",
    name: {
      en: "Service A",
      am: "አገልግሎት A",
    },
    subServices: [
      {
        id: "101",
        name: {
          en: "Sub Service A1",
          am: "ንዑስ አገልግሎት A1",
        },
        activities: [
          {
            id: "1001",
            name: {
              en: "Activity A1Activity A1Activity A1Activity A1Activity A1Activity A1",
              am: "እንቅስቃሴ A1",
            },
          },
          {
            id: "1002",
            name: {
              en: "Activity A1-2",
              am: "እንቅስቃሴ A1-2",
            },
            frequency: "2",
            time: "10:00",
            quality: "100%",
          },
        ],
      },
      {
        id: "102",
        name: {
          en: "Sub Service A2",
          am: "ንዑስ አገልግሎት A2",
        },
        activities: [
          {
            id: "1003",
            name: {
              en: "Activity A2-1",
              am: "እንቅስቃሴ A2-1",
            },
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: {
      en: "Service B",
      am: "አገልግሎት B",
    },
    subServices: [
      {
        id: "201",
        name: {
          en: "Sub Service B1",
          am: "ንዑስ አገልግሎት B1",
        },
        activities: [
          {
            id: "2001",
            name: {
              en: "Activity B1-1",
              am: "እንቅስቃሴ B1-1",
            },
            frequency: " 2",
            time: "8:00",
            quality: "100%",
          },
        ],
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

  const { user } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [openMain, setOpenMain] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [selected, setSelected] = useState<
    | { type: "main"; mainId: string }
    | { type: "sub"; mainId: string; subId: string }
    | { type: "activity"; mainId: string; subId: string; actId: string }
    | null
  >(null);
  const [submitReport, setSubmitReport] = useState<boolean>(false);
  let [activityProp, setActivityProp] = useState<Activity | null>(null);
  const [more, setMore] = useState<boolean>(false);
  const [addNew, setAddNew] = useState<boolean>(false);

  const toggleMain = (id: string) => {
    setOpenMain(openMain === id ? null : id);
    setOpenSub(null);
  };

  const toggleSub = (mainId: string, subId: string) => {
    setOpenSub(openSub === subId ? null : subId);
  };

  const selectActivity = (mainId: string, subId: string, actId: string) => {
    setSelected({
      type: "activity",
      mainId,
      subId,
      actId,
    });
  };
  const [mode, setMode] = useState("notUser");
  const isAdminClickable = user.role === "admin" && mode === "notUser";
  const filteredServices = services.filter((service) =>
    service.name[lang].toLowerCase().includes(searchQuery.toLowerCase())
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
        {user.role === "user" ? (
          <button
            className={styles.moreButton}
            onClick={() => {
              setMore(true);
            }}
          >
            {text.more}
          </button>
        ) : mode === "notUser" ? (
          <div className={styles.buttonGroup}>
            <button
              className={styles.mineButton}
              onClick={() => {
                setMode("user");
              }}
            >
              <MdArrowForward />
              <span>{text.mine}</span>
            </button>
            {user.role === "admin" && (
              <button
                className={styles.addButton}
                onClick={() => {
                  setAddNew(true);
                }}
              >
                {text.add}
              </button>
            )}
          </div>
        ) : (
          <div className={styles.buttonGroup}>
            <button
              className={styles.allButton}
              onClick={() => {
                setMode("notUser");
              }}
            >
              <span>{text.all}</span>
              <MdArrowBack />
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
            {filteredServices.map((main) => {
              const handleSelectService = () =>
                setSelected({ type: "main", mainId: main.id });
              return (
                <div key={main.id} className={styles.mainService}>
                  <button
                    onClick={() => toggleMain(main.id)}
                    className={styles.mainButton}
                    aria-expanded={openMain === main.id}
                    aria-controls={`main-${main.id}`}
                  >
                    <ArrowIcon open={openMain === main.id} />
                    <span className={styles.mainText}>{main.name[lang]}</span>
                    {isAdminClickable && (
                      <span
                        className={styles.actionContainer}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectService();
                        }}
                      >
                        <FiMoreVertical />
                      </span>
                    )}
                  </button>
                  {openMain === main.id && (
                    <div
                      id={`main-${main.id}`}
                      className={styles.subServicesContainer}
                    >
                      <div className={styles.subServiceTitle}>
                        {text.subservice}
                      </div>
                      {main.subServices.map((sub) => {
                        const handleSelectSubService = () =>
                          setSelected({
                            type: "sub",
                            mainId: main.id,
                            subId: sub.id,
                          });
                        return (
                          <div key={sub.id} className={styles.subService}>
                            <button
                              onClick={() => toggleSub(main.id, sub.id)}
                              className={styles.subButton}
                              aria-expanded={openSub === sub.id}
                              aria-controls={`sub-${sub.id}`}
                            >
                              <ArrowIcon open={openSub === sub.id} />
                              <span className={styles.subText}>
                                {sub.name[lang]}
                              </span>
                              {isAdminClickable && (
                                <span
                                  className={styles.actionContainer}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectSubService();
                                  }}
                                >
                                  <FiMoreVertical />
                                </span>
                              )}
                            </button>

                            {openSub === sub.id && (
                              <>
                                {boxWidth > 580 && (
                                  <div className={styles.activityHeader}>
                                    <div className={styles.cell}>
                                      {text.num}
                                    </div>
                                    <div className={styles.cell}>
                                      {text.ActName}
                                    </div>
                                    <div className={styles.cell}>
                                      {text.freq}
                                    </div>
                                    <div className={styles.cell}>
                                      {text.time}
                                    </div>
                                    <div className={styles.cell}>
                                      {text.quality}
                                    </div>
                                    <div className={styles.cell}></div>
                                  </div>
                                )}
                                <ul
                                  id={`sub-${sub.id}`}
                                  className={styles.activitiesList}
                                >
                                  {sub.activities.map(
                                    (act: Activity, index: number) => {
                                      const handleSelectActivity = () => {
                                        selectActivity(main.id, sub.id, act.id);
                                      };
                                      return (
                                        <li
                                          key={act.id}
                                          className={styles.activityItem}
                                        >
                                          {boxWidth > 580 ? (
                                            <div className={styles.activityRow}>
                                              <div className={styles.cell}>
                                                {index + 1}
                                              </div>
                                              <div className={styles.cell}>
                                                {act.name[lang]}
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

                                              {isAdminClickable ? (
                                                <div className={styles.cell}>
                                                  <span
                                                    className={
                                                      styles.actionContainer
                                                    }
                                                    style={{
                                                      position: "unset",
                                                      right: "unset",
                                                    }}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleSelectActivity();
                                                    }}
                                                  >
                                                    <FiMoreVertical />
                                                  </span>
                                                </div>
                                              ) : (
                                                (user.role === "user" ||
                                                  mode === "user") && (
                                                  <div className={styles.cell}>
                                                    <button
                                                      className={
                                                        styles.submitButton
                                                      }
                                                      onClick={() => {
                                                        setActivityProp(act);
                                                        setSubmitReport(true);
                                                      }}
                                                    >
                                                      <FiSend
                                                        className={styles.icon}
                                                      />
                                                    </button>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          ) : (
                                            <div
                                              className={
                                                styles.mobileActivityBox
                                              }
                                            >
                                              <div className={styles.row}>
                                                <span>{text.num}</span>
                                                <span>{index + 1}</span>
                                              </div>
                                              <div className={styles.row}>
                                                <span>{text.ActName}</span>
                                                <span>{act.name[lang]}</span>
                                              </div>
                                              <div className={styles.row}>
                                                <span>{text.freq}</span>
                                                <span>
                                                  {act.frequency || "N/A"}
                                                </span>
                                              </div>
                                              <div className={styles.row}>
                                                <span>{text.time}</span>
                                                <span>{act.time || "N/A"}</span>
                                              </div>
                                              <div className={styles.row}>
                                                <span>{text.quality}</span>
                                                <span>
                                                  {act.quality || "N/A"}
                                                </span>
                                              </div>

                                              {isAdminClickable ? (
                                                <div className={styles.row}>
                                                  <span
                                                    className={
                                                      styles.actionContainer
                                                    }
                                                    style={{
                                                      position: "unset",
                                                      right: "unset",
                                                    }}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleSelectActivity();
                                                    }}
                                                  >
                                                    <FiMoreVertical />
                                                  </span>
                                                </div>
                                              ) : (
                                                (user.role === "user" ||
                                                  mode === "user") && (
                                                  <div className={styles.row}>
                                                    <button
                                                      className={
                                                        styles.submitButton
                                                      }
                                                      onClick={() => {
                                                        setActivityProp(act);
                                                        setSubmitReport(true);
                                                      }}
                                                    >
                                                      <FiSend
                                                        className={styles.icon}
                                                      />
                                                    </button>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}
                                        </li>
                                      );
                                    }
                                  )}
                                </ul>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {selected && (
              <ChangeService
                selected={selected}
                setSelected={setSelected}
                services={services}
              />
            )}
          </>
        )}
      </div>
      {more && <MoreService setMore={setMore} />}
      {addNew && <AddNewService setAddNew={setAddNew} />}
      {submitReport && (
        <SubmitReport
          setSubmitReport={setSubmitReport}
          activity={activityProp}
        />
      )}
    </div>
  );
}
