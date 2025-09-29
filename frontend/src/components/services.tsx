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

import type { Activity, Service } from "../context/appDataContext";
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
  const { services } = useAppData();
  const { user } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [openMain, setOpenMain] = useState<number | null>(null);
  const [openSub, setOpenSub] = useState<number | null>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [selected, setSelected] = useState<
    | { type: "service"; service_id: number }
    | { type: "subService"; service_id: number; subService_id: number }
    | {
        type: "activity";
        service_id: number;
        subService_id: number;
        activity_id: number;
      }
    | null
  >(null);
  const [submitReport, setSubmitReport] = useState<boolean>(false);
  let [activityProp, setActivityProp] = useState<Activity | null>(null);
  let [serviceIdProp, setServiceIdProp] = useState<number | null>(null);
  const [more, setMore] = useState<boolean>(false);
  const [addNew, setAddNew] = useState<boolean>(false);

  const toggleMain = (id: number) => {
    setOpenMain(openMain === id ? null : id);
    setOpenSub(null);
  };

  const toggleSub = (subService_id: number) => {
    setOpenSub(openSub === subService_id ? null : subService_id);
  };

  const selectActivity = (
    service_id: number,
    subService_id: number,
    activity_id: number
  ) => {
    setSelected({
      type: "activity",
      service_id,
      subService_id,
      activity_id,
    });
  };
  const [mode, setMode] = useState<"user" | "notUser">("notUser");
  const isAdminClickable = user.role === "admin" && mode === "notUser";
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  useEffect(() => {
    if (mode === "user") {
      setFilteredServices(
        services.filter(
          (service) =>
            service.user_ids.includes(user.id) &&
            service.name[lang].toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredServices(
        services.filter((service) =>
          service.name[lang].toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [mode, searchQuery, services]);
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
            {filteredServices.map((service) => {
              const handleSelectService = () =>
                setSelected({ type: "service", service_id: service.id });
              return (
                <div key={service.id} className={styles.mainService}>
                  <button
                    onClick={() => toggleMain(service.id)}
                    className={styles.mainButton}
                    aria-expanded={openMain === service.id}
                    aria-controls={`service-${service.id}`}
                  >
                    <ArrowIcon open={openMain === service.id} />
                    <span className={styles.mainText}>
                      {service.name[lang]}
                    </span>
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
                  {openMain === service.id && (
                    <div
                      id={`service-${service.id}`}
                      className={styles.subServicesContainer}
                    >
                      <div className={styles.subServiceTitle}>
                        {text.subservice}
                      </div>
                      {service.subServices.map((subService) => {
                        const handleSelectSubService = () =>
                          setSelected({
                            type: "subService",
                            service_id: service.id,
                            subService_id: subService.id,
                          });
                        return (
                          <div
                            key={subService.id}
                            className={styles.subService}
                          >
                            <button
                              onClick={() => toggleSub(subService.id)}
                              className={styles.subButton}
                              aria-expanded={openSub === subService.id}
                              aria-controls={`subService-${subService.id}`}
                            >
                              <ArrowIcon open={openSub === subService.id} />
                              <span className={styles.subText}>
                                {subService.name[lang]}
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

                            {openSub === subService.id && (
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
                                  id={`subService-${subService.id}`}
                                  className={styles.activitiesList}
                                >
                                  {subService.activities.map(
                                    (act: Activity, index: number) => {
                                      const handleSelectActivity = () => {
                                        selectActivity(
                                          service.id,
                                          subService.id,
                                          act.id
                                        );
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
                                                        setServiceIdProp(
                                                          service.id
                                                        );
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
                                                        setServiceIdProp(
                                                          service.id
                                                        );
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
              <ChangeService selected={selected} setSelected={setSelected} />
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
          service_id={serviceIdProp}
        />
      )}
    </div>
  );
}
