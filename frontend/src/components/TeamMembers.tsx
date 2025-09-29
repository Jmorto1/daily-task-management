import { useState, useEffect, useRef, type FormEvent } from "react";
import styles from "../styles/employee.module.css";
import { useLang } from "../hooks/useLang";
import teamMemberAm from "../locates/amharic/teamMember.json";
import teammemberEn from "../locates/english/teamMember.json";
import { FiMoreVertical, FiEye, FiPlus } from "react-icons/fi";
import { useIsMoblie } from "../hooks/useIsMobile";
import PasswordAuth from "./subComponent/passwordAuth";
import type { Service, User } from "../context/appDataContext";
import { useAppData } from "../hooks/useAppData";
export default function TeamMembers() {
  const { employees, services, setServices, serverAddress } = useAppData();
  const { lang } = useLang();
  const translate = {
    am: teamMemberAm,
    en: teammemberEn,
  };
  const text = translate[lang];
  const isMobile = useIsMoblie(960);
  const [passwordAuth, setPasswordAuth] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [showFailMessage, setShowFailMessage] = useState<boolean>(false);
  const [submitType, setSubmitType] = useState("");
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [assignService, setAssignService] = useState<User | null>(null);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [seeService, SetSeeService] = useState<User | null>(null);
  const [deleteService, setDeleteService] = useState<{
    service: Service;
    employee: User;
  } | null>(null);
  const filteredServices = (): Service[] => {
    if (assignService) {
      return services.filter(
        (service) => !service.user_ids.includes(assignService.id)
      );
    } else if (seeService) {
      return services.filter((service) =>
        service.user_ids.includes(seeService.id)
      );
    }
    return [];
  };
  const handleCheckboxChange = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  //close panels
  const closeAssignServicePanel = () => {
    setSelectedServices([]);
    setAssignService(null);
  };
  const handleAssignSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitType("assignService");
    setPasswordAuth(true);
  };
  async function handleAssignServiceApi() {
    if (assignService) {
      try {
        const putData = {
          user_id: assignService.id,
          service_ids: selectedServices,
        };
        const response = await fetch(`${serverAddress}/assignServices/`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(putData),
        });

        if (response.ok) {
          setServices((prev) =>
            prev.map((service) => {
              if (selectedServices.includes(service.id)) {
                return {
                  ...service,
                  user_ids: [...service.user_ids, assignService.id],
                };
              }
              return service;
            })
          );
          setShowSuccessMessage(true);
          setTimeout(() => {
            closeAssignServicePanel();
            setShowSuccessMessage(false);
          }, 3000);
        } else {
          setShowFailMessage(true);
          setTimeout(() => {
            setShowFailMessage(false);
          }, 3000);
        }
      } catch (error) {
        console.error("error:", error);
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      }
    }
  }
  const handleDeleteServiceSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitType("deleteService");
    setPasswordAuth(true);
  };
  async function handleDeleteServiceApi() {
    if (deleteService) {
      try {
        const putData = {
          user_id: deleteService.employee.id,
          service_ids: [deleteService.service.id],
        };

        const response = await fetch(`${serverAddress}/removeServices/`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(putData),
        });

        if (response.ok) {
          setServices((prev) =>
            prev.map((service) => {
              if (deleteService.service.id === service.id) {
                return {
                  ...service,
                  user_ids: service.user_ids.filter(
                    (id) => id !== deleteService.employee.id
                  ),
                };
              }
              return service;
            })
          );
          setShowSuccessMessage(true);
          setTimeout(() => {
            setDeleteService(null);
            setShowSuccessMessage(false);
          }, 3000);
        } else {
          setShowFailMessage(true);
          setTimeout(() => setShowFailMessage(false), 3000);
        }
      } catch (error) {
        console.error("error:", error);
        setShowFailMessage(true);
        setTimeout(() => setShowFailMessage(false), 3000);
      }
    }
  }
  const handleAuthResult = (success: boolean) => {
    if (success) {
      if (submitType === "assignService") {
        handleAssignServiceApi();
      } else if (submitType === "deleteService") {
        handleDeleteServiceApi();
      }
      setSubmitType("");
    } else {
      return;
    }
  };
  const dropdownRef = useRef<{ [key: string]: any }>({});
  useEffect(() => {
    const handleMousedown = (event: MouseEvent) => {
      if (
        actionDropdown &&
        dropdownRef.current[actionDropdown] &&
        !dropdownRef.current[actionDropdown]!.contains(event.target as Node)
      ) {
        setActionDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleMousedown);
    return () => {
      document.removeEventListener("mousedown", handleMousedown);
    };
  }, [actionDropdown]);
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{text.title}</h2>
      {/* employees table */}
      {employees.length === 0 ? (
        <div className={styles.noFoundMessage}>{text.noMember}</div>
      ) : isMobile ? (
        employees.map((emp) => (
          <div key={emp.id} className={styles.tableRow}>
            <div>
              <div>{text.name}</div>
              <div>{emp.name[lang]}</div>
            </div>
            <div>
              <div>{text.phoneNo}</div>
              <div>{emp.phone_number}</div>
            </div>
            <div>
              <div>{text.gender}</div>
              <div>{emp.gender[lang]}</div>
            </div>
            <div>
              <div>{text.profession}</div>
              <div>{emp.profession[lang]}</div>
            </div>
            <div
              className={styles.moreVertical}
              ref={(el) => {
                dropdownRef.current[`m${emp.id}`] = el;
              }}
            >
              {actionDropdown === `m${emp.id}` ? (
                <div className={styles.actionWrapper2}>
                  <button
                    className={styles.assignBtn}
                    onClick={() => {
                      setAssignService(emp);
                      setActionDropdown(null);
                    }}
                  >
                    <FiPlus />
                    {text.assignService}{" "}
                  </button>
                  <button
                    onClick={() => {
                      SetSeeService(emp);
                      setActionDropdown(null);
                    }}
                    className={styles.seeBtn}
                  >
                    <FiEye />
                    {text.seeService}{" "}
                  </button>
                </div>
              ) : (
                <div
                  className={styles.moreVertical}
                  onClick={() => setActionDropdown(`m${emp.id}`)}
                >
                  <FiMoreVertical />
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <table className={styles.Dtable}>
          <thead>
            <tr className={styles.DtableHeader}>
              <th>{text.num}</th>
              <th>{text.name}</th>
              <th>{text.phoneNo}</th>
              <th>{text.gender}</th>
              <th>{text.profession}</th>
              <th>{text.action}</th>
            </tr>
          </thead>
          <tbody className={styles.DtableBody}>
            {employees.map((emp, idx) => (
              <tr key={emp.id}>
                <td>{idx + 1}</td>
                <td>{emp.name[lang]}</td>
                <td>{emp.phone_number}</td>
                <td>{emp.gender[lang]}</td>
                <td>{emp.profession[lang]}</td>
                <td
                  ref={(el) => {
                    dropdownRef.current[`d${emp.id}`] = el;
                  }}
                >
                  {actionDropdown === `d${emp.id}` ? (
                    <div className={styles.actionWrapper2}>
                      <button
                        className={styles.assignBtn}
                        onClick={() => {
                          setAssignService(emp);
                          setActionDropdown(null);
                        }}
                      >
                        <FiPlus />
                        {text.assignService}{" "}
                      </button>
                      <button
                        onClick={() => {
                          SetSeeService(emp);
                          setActionDropdown(null);
                        }}
                        className={styles.seeBtn}
                      >
                        <FiEye />
                        {text.seeService}{" "}
                      </button>
                    </div>
                  ) : (
                    <div
                      className={styles.moreVertical}
                      onClick={() => setActionDropdown(`d${emp.id}`)}
                    >
                      <FiMoreVertical />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* assign services */}
      {assignService && (
        <div className="overlay">
          <div className={styles.assignService}>
            <button
              className={styles.closeIconButton}
              aria-label="Close panel"
              onClick={() => {
                setSelectedServices([]);
                setAssignService(null);
              }}
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
            {lang === "en" ? (
              <h2 className={styles.panelHeader}>
                {text.assignTitile} {assignService.name[lang]}
              </h2>
            ) : (
              <h2 className={styles.panelHeader}>
                ለ {assignService.name[lang]} {text.assignTitile}
              </h2>
            )}
            {filteredServices().length === 0 ? (
              <h2 className={styles.noService}>{text.noService}</h2>
            ) : (
              <form className={styles.form} onSubmit={handleAssignSubmit}>
                <div className={styles.serviceHeader}>
                  <div className={styles.selectedBadge}>
                    {selectedServices.length} {text.selected}
                  </div>
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={() => {
                      setSelectedServices([]);
                    }}
                  >
                    {text.clear}
                  </button>
                </div>
                <div className={styles.serviceContainer}>
                  {filteredServices().map((service) => (
                    <div key={service.id} className={styles.service}>
                      <label>
                        <input
                          type="checkbox"
                          value={service.id}
                          checked={selectedServices.includes(service.id)}
                          onChange={() => handleCheckboxChange(service.id)}
                        />
                        <span>{service.name[lang]}</span>
                      </label>
                    </div>
                  ))}
                </div>
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => {
                      setSelectedServices([]);
                      setAssignService(null);
                    }}
                  >
                    {text.cancel}
                  </button>
                  <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={selectedServices.length === 0}
                  >
                    {text.save}
                  </button>
                </div>
              </form>
            )}
            {showSuccessMessage && (
              <>
                <div className="successMessageWrapper">
                  <div className="successMessage">{text.assignMessage} </div>
                </div>
                <div className="overlay" style={{ zIndex: "1001" }}></div>
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
      )}
      {/* see services */}
      {seeService && (
        <div className="overlay">
          <div className={styles.seeService}>
            <button
              className={styles.closeIconButton}
              aria-label="Close panel"
              onClick={() => {
                setDeleteService(null);
                SetSeeService(null);
              }}
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
            {lang === "en" ? (
              <h2 className={styles.panelHeader}>
                {text.assignedTitle} {seeService.name[lang]}
              </h2>
            ) : (
              <h2 className={styles.panelHeader}>
                ለ{seeService.name[lang]} {text.assignedTitle}
              </h2>
            )}
            {filteredServices().length === 0 ? (
              <h2 className={styles.noService}>{text.noService}</h2>
            ) : (
              <form
                className={styles.form}
                onSubmit={handleDeleteServiceSubmit}
              >
                <div className={styles.serviceContainer}>
                  {filteredServices().map((service) => (
                    <div key={service.id} className={styles.service}>
                      <div className={styles.serviceWrapper}>
                        <span>{service.name[lang]}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteService({
                              service,
                              employee: seeService,
                            });
                          }}
                          className={styles.deleteServiceBtn}
                        >
                          {text.delete}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {deleteService && (
                  <div className="overlay">
                    <div className={styles.deleteService}>
                      <button
                        onClick={() => {
                          setDeleteService(null);
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
                      {lang === "en" ? (
                        <div className={styles.deleteWarning}>
                          {text.deleteWarning}
                          {deleteService.service.name[lang]} from{" "}
                          {deleteService.employee.name[lang]} ?
                        </div>
                      ) : (
                        <div className={styles.deleteWarning}>
                          {deleteService.service.name[lang]}ን ከ
                          {deleteService.employee.name[lang]}{" "}
                          {text.deleteWarning}
                        </div>
                      )}
                      <div className={styles.formActions}>
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          onClick={() => {
                            setDeleteService(null);
                          }}
                        >
                          {text.no}
                        </button>
                        <button type="submit" className={styles.saveBtn}>
                          {text.yes}
                        </button>
                      </div>
                      {showSuccessMessage && (
                        <>
                          <div className="successMessageWrapper">
                            <div className="successMessage">
                              {text.deleteMessage}
                            </div>
                          </div>
                          <div
                            className="overlay"
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
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
      {passwordAuth && (
        <PasswordAuth
          handleAuthResult={handleAuthResult}
          setPasswordAuth={setPasswordAuth}
        />
      )}
    </div>
  );
}
