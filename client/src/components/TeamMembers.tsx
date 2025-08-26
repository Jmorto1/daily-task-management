import { useState, useEffect, useRef, type FormEvent } from "react";
import styles from "../styles/employee.module.css";
import { useLang } from "../hooks/useLang";
import teamMemberAm from "../locates/amharic/teamMember.json";
import teammemberEn from "../locates/english/teamMember.json";
import { FiMoreVertical, FiEye, FiPlus } from "react-icons/fi";
import { useIsMoblie } from "../hooks/useIsMobile";
import PasswordAuth from "./subComponent/passwordAuth";

type Male = {
  am: string;
  en: string;
};

type Female = {
  am: string;
  en: string;
};
type Employee = {
  id: string;
  name: {
    en: string;
    am: string;
  };
  phone: string;
  gender: Male | Female;
  profession: {
    am: string;
    en: string;
  };
};

type Service = {
  id: string;
  name: {
    am: string;
    en: string;
  };
  employeeIDs: string[];
};

const employees: Employee[] = [
  {
    id: "e1",
    name: { en: "John Smith", am: "ጆን ስሚዝ" },
    phone: "0911000001",
    gender: { en: "Male", am: "ወንድ" },
    profession: { en: "Team Leader", am: "ቡድን አለቃ" },
  },
  {
    id: "e2",
    name: { en: "Sara Tesfaye", am: "ሳራ ተስፋዬ" },
    phone: "0911000002",
    gender: { en: "Female", am: "ሴት" },
    profession: { en: "Cleaner", am: "አጽዳቂ" },
  },
  {
    id: "e3",
    name: { en: "Michael Alemu", am: "ሚካኤል አለሙ" },
    phone: "0911000003",
    gender: { en: "Male", am: "ወንድ" },
    profession: { en: "Gardener", am: "አትክልተኛ" },
  },
  {
    id: "e4",
    name: { en: "Hana Bekele", am: "ሀና በቀለ" },
    phone: "0911000004",
    gender: { en: "Female", am: "ሴት" },
    profession: { en: "Electrician", am: "ኤሌክትሪክ ባለሙያ" },
  },
  {
    id: "e5",
    name: { en: "Daniel Fikru", am: "ዳንኤል ፍቅሩ" },
    phone: "0911000005",
    gender: { en: "Male", am: "ወንድ" },
    profession: { en: "Plumber", am: "የቧንቧ ሰሪ" },
  },
  {
    id: "e6",
    name: { en: "Marta Gebre", am: "ማርታ ገብረ" },
    phone: "0911000006",
    gender: { en: "Female", am: "ሴት" },
    profession: { en: "Security Guard", am: "የደህንነት ጠባቂ" },
  },
  {
    id: "e7",
    name: { en: "Kebede Mekonnen", am: "ከበደ መኮንን" },
    phone: "0911000007",
    gender: { en: "Male", am: "ወንድ" },
    profession: { en: "Driver", am: "አሽከርካሪ" },
  },
  {
    id: "e8",
    name: { en: "Selamawit Girma", am: "ሰላማዊት ግርማ" },
    phone: "0911000008",
    gender: { en: "Female", am: "ሴት" },
    profession: { en: "Cook", am: "በጋራ" },
  },
  {
    id: "e9",
    name: { en: "Abel Yohannes", am: "አቤል ዮሐንስ" },
    phone: "0911000009",
    gender: { en: "Male", am: "ወንድ" },
    profession: { en: "Technician", am: "ቴክኒሻን" },
  },
  {
    id: "e10",
    name: { en: "Lily Worku", am: "ሊሊ ወርቁ" },
    phone: "0911000010",
    gender: { en: "Female", am: "ሴት" },
    profession: { en: "Janitor", am: "ቤት አጽዳቂ" },
  },
];
const services: Service[] = [
  {
    id: "s1",
    name: { en: "Cleaning", am: "ንጽህና" },
    employeeIDs: ["e1", "e2", "e10"],
  },
  {
    id: "s2",
    name: { en: "Gardening", am: "አትክልት" },
    employeeIDs: ["e1", "e3"],
  },
  {
    id: "s3",
    name: { en: "Electrical Maintenance", am: "ኤሌክትሪክ ጥገና" },
    employeeIDs: ["e4", "e9"],
  },
  {
    id: "s4",
    name: { en: "Plumbing", am: "የቧንቧ" },
    employeeIDs: ["e5"],
  },
  {
    id: "s5",
    name: { en: "Security", am: "ደህንነት" },
    employeeIDs: ["e6", "e7"],
  },
  {
    id: "s6",
    name: { en: "Cooking & Food Service", am: "ምግብ አሰራር" },
    employeeIDs: ["e8"],
  },
];

export default function TeamMembers() {
  const { lang, setLang } = useLang();
  const translate = {
    am: teamMemberAm,
    en: teammemberEn,
  };
  const text = translate[lang];
  const isMobile = useIsMoblie(960);
  const [passwordAuth, setPasswordAuth] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [assignService, setAssignService] = useState<Employee | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [seeService, SetSeeService] = useState<Employee | null>(null);
  const [deleteService, setDeleteService] = useState<{
    service: Service;
    employee: Employee;
  } | null>(null);
  const filteredServices = (): Service[] => {
    if (assignService) {
      return services.filter(
        (service) => !service.employeeIDs.includes(assignService.id)
      );
    } else if (seeService) {
      return services.filter((service) =>
        service.employeeIDs.includes(seeService.id)
      );
    }
    return [];
  };
  const handleCheckboxChange = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  const handleAssignSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordAuth(true);
  };
  const handleDeleteServiceSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordAuth(true);
  };
  const handleAuthResult = (success: boolean) => {
    if (success) {
      setPasswordAuth(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setDeleteService(null);
      }, 3000);
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
              <div>{emp.phone}</div>
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
                <td>{emp.phone}</td>
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
