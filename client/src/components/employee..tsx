import React, { useState, useEffect, useRef, type FormEvent } from "react";
import styles from "../styles/employee.module.css";
import { useIsMoblie } from "../hooks/useIsMobile";
import { FiMoreVertical, FiTrash2, FiEdit } from "react-icons/fi";
import { useLang } from "../hooks/useLang";
import employeeAm from "../locates/amharic/employee.json";
import employeeEn from "../locates/english/employee.json";
import PasswordAuth from "./subComponent/passwordAuth";
import Select, { type SingleValue } from "react-select";
type Team = {
  id: string;
  name: {
    am: string;
    en: string;
  };
};
type Employee = {
  id: string;
  name: {
    en: string;
    am: string;
  };
  phone: string;
  gender: {
    am: string;
    en: string;
  };
  profession: {
    am: string;
    en: string;
  };
  teamid: string;
};

type PendingEmployee = {
  id: string;
  name: {
    en: string;
    am: string;
  };
  phone: string;
};

const teams: Team[] = [
  { id: "t1", name: { am: "ሽያጭ", en: "Sales" } },
  { id: "t2", name: { am: "ገበያ", en: "Marketing" } },
  { id: "t3", name: { am: "ድጋፍ", en: "Support" } },
  { id: "t4", name: { am: "ልማት", en: "Development" } },
  { id: "t5", name: { am: "ሰው ኃይል", en: "HR" } },
];

const employees: Employee[] = [
  {
    id: "e1",
    name: { en: "John Doe", am: "ጆን ዶ" },
    phone: "0911111111",
    gender: { am: "ወንድ", en: "Male" },
    profession: { am: "አስተዳዳሪ", en: "Manager" },
    teamid: "t1",
  },
  {
    id: "e2",
    name: { en: "Jane Smith", am: "ጄን ስሚዝ" },
    phone: "0922222222",
    gender: { am: "ሴት", en: "Female" },
    profession: { am: "አበልጻጊ", en: "Developer" },
    teamid: "t4",
  },
  {
    id: "e3",
    name: { en: "Alice Johnson", am: "አሊስ ጆንሰን" },
    phone: "0933333333",
    gender: { am: "ሴት", en: "Female" },
    profession: { am: "አርቲስት", en: "Designer" },
    teamid: "t2",
  },
  {
    id: "e4",
    name: { en: "Michael Brown", am: "ሚካኤል ብራውን" },
    phone: "0944444444",
    gender: { am: "ወንድ", en: "Male" },
    profession: { am: "ተንታኝ", en: "Analyst" },
    teamid: "t3",
  },
  {
    id: "e5",
    name: { en: "Sara Wilson", am: "ሳራ ዊልሰን" },
    phone: "0955555555",
    gender: { am: "ሴት", en: "Female" },
    profession: { am: "መሞከሪ", en: "Tester" },
    teamid: "t5",
  },
];
const allGenders = [
  {
    id: "m",
    am: "ወንድ",
    en: "Male",
  },
  {
    id: "f",
    am: "ሴት",
    en: "Female",
  },
];
const emptyEmployee = (): Employee => ({
  id: "",
  name: { en: "", am: "" },
  phone: "",
  gender: { am: "", en: "" },
  profession: {
    am: "",
    en: "",
  },
  teamid: "",
});
type TeamOption = { value: Team; label: string };
export default function EmployeeManager() {
  const [pendingEmployees, setPendingEmployees] = useState<PendingEmployee[]>([
    {
      id: "101",
      name: { en: "Daniel Green", am: "ዳንኤል ግሪን" },
      phone: "0966666666",
    },
    {
      id: "102",
      name: { en: "Emily White", am: "ኤሚሊ ዋይት" },
      phone: "0977777777",
    },
    {
      id: "103",
      name: { en: "Robert King", am: "ሮበርት ኪንግ" },
      phone: "0988888888",
    },
  ]);
  const { lang, setLang } = useLang();
  const translate = {
    am: employeeAm,
    en: employeeEn,
  };
  const text = translate[lang];
  const isMobile = useIsMoblie(960);
  const [showPending, setShowPending] = useState(false);
  const [passwordAuth, setPasswordAuth] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [approvingForm, setApprovingForm] = useState<Employee>(emptyEmployee());
  const [isApproving, setIsApproving] = useState<PendingEmployee | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamOption | null>(null);
  const [professionErrors, setProfessionError] = useState<{
    am: String;
    en: string;
  }>({ am: "", en: "" });
  const [selectTeamError, setSelectTeamError] = useState("");
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [width, setWidht] = useState<number>(0);
  useEffect(() => {
    const handleWidth = () => {
      if (inputRef.current) {
        setWidht(inputRef.current.getBoundingClientRect().width);
      }
    };
    handleWidth();
    window.addEventListener("resize", handleWidth);
    return () => window.removeEventListener("resize", handleWidth);
  }, [isApproving]);
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
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
  // Start approving pending employee
  const startApproving = (pendEmp: PendingEmployee) => {
    setApprovingForm((prev) => ({
      ...prev,
      id: pendEmp.id,
      name: pendEmp.name,
      phone: pendEmp.phone,
    }));
    setIsApproving(pendEmp);
  };
  const handleApprovingChange = (field: string, value: any) => {
    setApprovingForm((prev) => {
      if (field === "gender") {
        const gender = allGenders.find((g) => g.id === value);
        return gender ? { ...prev, gender } : prev;
      }
      if (field === "team") {
        return { ...prev, teamid: value };
      }
      if (field === "professionAm") {
        setProfessionError((prev) => ({ ...prev, am: "" }));
        return { ...prev, profession: { ...prev.profession, am: value } };
      }
      if (field === "professionEn") {
        setProfessionError((prev) => ({ ...prev, en: "" }));
        return { ...prev, profession: { ...prev.profession, en: value } };
      }
      return prev;
    });
  };
  const handleapprovingSubmint = (e: FormEvent) => {
    e.preventDefault();
    if (
      !approvingForm.profession.am.trim() ||
      !approvingForm.profession.en.trim()
    ) {
      if (!approvingForm.profession.am.trim()) {
        setProfessionError((prev) => ({ ...prev, am: "ሙያ ያስፈልጋል" }));
      }
      if (!approvingForm.profession.en.trim()) {
        setProfessionError((prev) => ({
          ...prev,
          en: "profession is required",
        }));
      }
      return;
    }

    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };
  const handlePendingDelete = (pendEmp: PendingEmployee) => {
    setPendingEmployees((prev) => prev.filter((emp) => emp.id !== pendEmp.id));
  };
  const handleEditSubmint = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) {
      setSelectTeamError(text.selectTeam);
      return;
    }
    setPasswordAuth(true);
  };
  const handleDeleteEmployeeSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordAuth(true);
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
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{text.allemp}</h2>

      {pendingEmployees.length > 0 && (
        <>
          <button
            className={styles.pendingBtn}
            onClick={() => setShowPending(!showPending)}
            aria-expanded={showPending}
            aria-label="Toggle pending employees list"
          >
            {text.pendingEmp}
            <span className={styles.badge}>{pendingEmployees.length}</span>
          </button>

          {showPending && (
            <div className={styles.pendingList}>
              {pendingEmployees.map((p) => (
                <div key={p.id} className={styles.pendingItem}>
                  <div className={styles.pendingContainer}>
                    <div className={styles.column}>
                      <div className={styles.header}>{text.name}</div>
                      <div> {p.name[lang]}</div>
                    </div>
                    <div className={styles.column}>
                      <div className={styles.header}>{text.phoneNo}</div>
                      <div>{p.phone}</div>
                    </div>
                    <div
                      className={`${styles.pendingActions} ${styles.column}`}
                    >
                      <button
                        className={styles.approveBtn}
                        onClick={() => {
                          startApproving(p);
                        }}
                        aria-label={`Approve ${p.name[lang]}`}
                      >
                        {text.approve}
                      </button>
                      <button
                        onClick={() => {
                          handlePendingDelete(p);
                        }}
                        className={styles.deleteBtn}
                        aria-label={`Delete ${p.name[lang]}`}
                      >
                        {text.delete}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {/* employees table */}
      {employees.length > 0 &&
        (isMobile ? (
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
                <div>{text.team}</div>
                <div>
                  {teams.find((team) => team.id === emp.teamid)?.name[lang]}
                </div>
              </div>
              <div>
                <div>{text.profession}</div>
                <div>{emp.profession[lang]}</div>
              </div>
              <div>
                <div
                  className={styles.moreVertical}
                  ref={(el) => {
                    dropdownRef.current[`m${emp.id}`] = el;
                  }}
                >
                  {actionDropdown === `m${emp.id}` ? (
                    <div className={styles.actionWrapper}>
                      <button
                        className={styles.editBtn}
                        onClick={() => {
                          setEditEmployee(emp);
                          setActionDropdown(null);
                        }}
                      >
                        <span>
                          <FiEdit />
                        </span>
                        <span>{text.edit}</span>
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => {
                          setDeleteEmployee(emp);
                        }}
                      >
                        <span>
                          <FiTrash2 />
                        </span>
                        <span>{text.delete}</span>
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
                <th>{text.team}</th>
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
                  <td>
                    {teams.find((team) => team.id === emp.teamid)?.name[lang]}
                  </td>
                  <td>{emp.profession[lang]}</td>
                  <td
                    ref={(el) => {
                      dropdownRef.current[`d${emp.id}`] = el;
                    }}
                  >
                    {actionDropdown === `d${emp.id}` ? (
                      <div className={styles.actionWrapper}>
                        <button
                          className={styles.editBtn}
                          onClick={() => {
                            setEditEmployee(emp);
                            setActionDropdown(null);
                          }}
                        >
                          <span>
                            <FiEdit />
                          </span>
                          <span>{text.edit}</span>
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => {
                            setDeleteEmployee(emp);
                          }}
                        >
                          <span>
                            <FiTrash2 />
                          </span>
                          <span>{text.delete}</span>
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
        ))}
      {/* approve pending */}
      {isApproving && (
        <div className="overlay">
          <div className={styles.approveForm}>
            <button
              className={styles.closeIconButton}
              aria-label="Close panel"
              onClick={() => {
                setApprovingForm(emptyEmployee());
                setIsApproving(null);
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
            <h2 className={styles.panelHeader}>{text.approveEmp}</h2>
            <form className={styles.form} onSubmit={handleapprovingSubmint}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{text.name}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={isApproving.name[lang]}
                  readOnly
                  ref={inputRef}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{text.phoneNo}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={isApproving.phone}
                  readOnly
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{text.gender}</label>
                <select
                  name="gender"
                  className={styles.input}
                  value={
                    approvingForm.gender.en
                      ? allGenders.find((g) => g.en === approvingForm.gender.en)
                          ?.id
                      : ""
                  }
                  onChange={(e) =>
                    handleApprovingChange("gender", e.target.value)
                  }
                  style={{
                    width: `${width}px`,
                  }}
                >
                  {allGenders.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g[lang]}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{text.team}</label>
                <select
                  name="team"
                  value={approvingForm.teamid}
                  className={styles.input}
                  onChange={(e) =>
                    handleApprovingChange(e.target.name, e.target.value)
                  }
                  style={{
                    width: `${width}px`,
                  }}
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name[lang]}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>ሙያ</label>
                <input
                  type="text"
                  className={styles.input}
                  value={approvingForm.profession.am}
                  onChange={(e) =>
                    handleApprovingChange("professionAm", e.target.value)
                  }
                  placeholder="ሙያ"
                />
              </div>
              {professionErrors.am && (
                <div className={styles.error}>{professionErrors.am}</div>
              )}
              <div className={styles.formGroup}>
                <label className={styles.label}>Profession</label>
                <input
                  type="text"
                  className={styles.input}
                  value={approvingForm.profession.en}
                  onChange={(e) =>
                    handleApprovingChange("professionEn", e.target.value)
                  }
                  placeholder="Profession"
                />
              </div>
              {professionErrors.en && (
                <div className={styles.error}>{professionErrors.en}</div>
              )}
              <div className={styles.formActions}>
                <button
                  className={styles.cancelBtn}
                  type="button"
                  onClick={() => {
                    setApprovingForm(emptyEmployee());
                    setIsApproving(null);
                  }}
                >
                  {text.cancel}
                </button>
                <button className={styles.approveBtn} type="submit">
                  {text.approve}
                </button>
              </div>
            </form>
            {showSuccessMessage && (
              <>
                <div className="successMessageWrapper">
                  <div className="successMessage">{text.approvedMessage}</div>
                  <div className="overlay" style={{ zIndex: "1001" }}></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* edit employee */}
      {editEmployee && (
        <div className="overlay">
          <div className={styles.editEmployee}>
            <button
              className={styles.closeIconButton}
              aria-label="Close panel"
              onClick={() => {
                setEditEmployee(null);
                setSelectTeamError("");
                setSelectedTeam(null);
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
                {text.changeTeam} {editEmployee.name[lang]}
              </h2>
            ) : (
              <h2 className={styles.panelHeader}>
                ለ {editEmployee.name[lang]} {text.changeTeam}
              </h2>
            )}
            <form className={styles.form} onSubmit={handleEditSubmint}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{text.selectTeam}</label>
                <Select
                  value={selectedTeam}
                  isSearchable
                  isMulti={false}
                  options={teams
                    .filter((team) => team.id !== editEmployee.teamid)
                    .map((team) => ({
                      value: team,
                      label: team.name[lang],
                    }))}
                  onChange={(option: SingleValue<TeamOption>) => {
                    setSelectedTeam(option);
                    setSelectTeamError("");
                  }}
                  className={styles.selectContainer}
                  classNamePrefix="select"
                />
              </div>
              {selectTeamError && (
                <div className={styles.error}>{selectTeamError}</div>
              )}
              <div className={styles.formActions}>
                <button
                  className={styles.cancelBtn}
                  type="button"
                  onClick={() => {
                    setEditEmployee(null);
                    setSelectTeamError("");
                    setSelectedTeam(null);
                  }}
                >
                  {text.cancel}
                </button>
                <button className={styles.saveBtn} type="submit">
                  {text.save}
                </button>
              </div>
            </form>
            {showSuccessMessage && (
              <>
                <div className="successMessageWrapper">
                  <div className="successMessage">{text.teamChangeMessage}</div>
                  <div className="overlay" style={{ zIndex: "1001" }}></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {deleteEmployee && (
        <div className="overlay">
          <div className={styles.deleteEmployee}>
            <button
              onClick={() => {
                setDeleteEmployee(null);
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
            <form className={styles.form} onSubmit={handleDeleteEmployeeSubmit}>
              {lang === "en" ? (
                <div>
                  {text.deleteWarning} {deleteEmployee.name[lang]}?
                </div>
              ) : (
                <div>
                  {deleteEmployee.name[lang]} {text.deleteWarning}
                </div>
              )}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setDeleteEmployee(null);
                  }}
                >
                  {text.no}
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {text.yes}
                </button>
              </div>
            </form>
            {showSuccessMessage && (
              <>
                <div className="successMessageWrapper">
                  <div className="successMessage">{text.deleteMessage}</div>
                </div>
                <div className="overlay" style={{ zIndex: "1001" }}></div>
              </>
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
