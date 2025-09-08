import { useState, useEffect, useRef, type FormEvent } from "react";
import styles from "../styles/employee.module.css";
import { useIsMoblie } from "../hooks/useIsMobile";
import { FiMoreVertical, FiTrash2, FiEdit } from "react-icons/fi";
import { useLang } from "../hooks/useLang";
import employeeAm from "../locates/amharic/employee.json";
import employeeEn from "../locates/english/employee.json";
import PasswordAuth from "./subComponent/passwordAuth";
import Select, { type SingleValue } from "react-select";
import { useAppData } from "../hooks/useAppData";
import type { User, Team } from "../context/appDataContext";
type Gender = {
  am: string;
  en: string;
};
type GenderOption = {
  value: Gender;
  label: string;
};
type TeamOption = { value: Team; label: string };
type approvingForm = {
  id: number | null;
  profession: {
    am: string;
    en: string;
  };
  gender: GenderOption | null;
  team: TeamOption | null;
};
type UpatedUser = {
  id: number | null;
  profession: {
    am: string;
    en: string;
  };
  status: "user";
  gender?: Gender;
  team_id?: number;
};
export default function EmployeeManager() {
  const {
    employees,
    setEmployees,
    pendingEmployees,
    setPendingEmployees,
    teams,
    serverAddress,
  } = useAppData();
  const { lang } = useLang();
  const translate = {
    am: employeeAm,
    en: employeeEn,
  };
  const text = translate[lang];
  const teamOption: TeamOption[] = teams.map((team) => {
    return {
      value: team,
      label: team.name[lang],
    };
  });
  const allGenders: Gender[] = [
    {
      am: "ወንድ",
      en: "Male",
    },
    {
      am: "ሴት",
      en: "Female",
    },
  ];
  const genderOption: GenderOption[] = allGenders.map((g) => {
    return {
      value: g,
      label: g[lang],
    };
  });
  const emptyApprovingForm: approvingForm = {
    id: null,
    profession: {
      am: "",
      en: "",
    },
    gender: genderOption[0] || null,
    team: teamOption[0] || null,
  };
  const isMobile = useIsMoblie(960);
  const [showPending, setShowPending] = useState(false);
  const [passwordAuth, setPasswordAuth] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [showFailMessage, setShowFailMessage] = useState<boolean>(false);
  const [approvingForm, setApprovingForm] =
    useState<approvingForm>(emptyApprovingForm);
  const [isApproving, setIsApproving] = useState<User | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamOption | null>(null);
  const [professionErrors, setProfessionError] = useState<{
    am: String;
    en: string;
  }>({ am: "", en: "" });
  const [selectTeamError, setSelectTeamError] = useState("");
  const [editEmployee, setEditEmployee] = useState<User | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<User | null>(null);
  const [submitType, setSubmitType] = useState("");
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
  //closing panels
  const closeApprovingPanel = () => {
    setApprovingForm(emptyApprovingForm);
    setIsApproving(null);
  };
  const closeEditEmployeePanel = () => {
    {
      setEditEmployee(null);
      setSelectTeamError("");
      setSelectedTeam(null);
    }
  };
  // Start approving pending employee
  const startApproving = (pendEmp: User) => {
    setApprovingForm((prev) => ({
      ...prev,
      id: pendEmp.id,
    }));
    setIsApproving(pendEmp);
  };
  const handleApprovingChange = (field: string, value: any) => {
    setApprovingForm((prev) => {
      if (field === "gender") {
        return { ...prev, gender: value };
      }
      if (field === "team") {
        return { ...prev, team: value };
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
  async function handleapprovingSubmint(e: FormEvent) {
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
    try {
      const user: UpatedUser = {
        id: approvingForm.id,
        profession: approvingForm.profession,
        status: "user",
      };
      if (approvingForm.gender && approvingForm.gender.value) {
        user.gender = approvingForm.gender.value;
      }
      if (approvingForm.team && approvingForm.team.value.id) {
        user.team_id = approvingForm.team.value.id;
      }

      const response = await fetch(`${serverAddress}/users/`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (response.ok) {
        const data = await response.json();
        setPendingEmployees((prev) => prev.filter((p) => p.id !== data.id));
        setEmployees((prev) => [...prev, data]);
        setShowSuccessMessage(true);
        setTimeout(() => {
          closeApprovingPanel();
          setShowSuccessMessage(false);
        }, 3000);
      } else {
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      }
    } catch (error) {
      console.error("error :", error);
      setShowFailMessage(true);
      setTimeout(() => {
        setShowFailMessage(false);
      }, 3000);
    }
  }
  async function handlePendingDelete(pendEmp: User) {
    try {
      const response = await fetch(`${serverAddress}/users/`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pendEmp.id }),
      });
      if (response.ok) {
        setPendingEmployees((prev) =>
          prev.filter((emp) => emp.id !== pendEmp.id)
        );
      }
    } catch (error) {
      console.error("error:", error);
    }
  }
  const handleEditSubmint = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) {
      setSelectTeamError(text.selectTeam);
      return;
    }
    setSubmitType("editEmp");
    setPasswordAuth(true);
  };
  async function handleEditApi() {
    if (selectedTeam && editEmployee) {
      try {
        const updatedEmp = {
          id: editEmployee.id,
          team_id: selectedTeam.value.id,
          role: "user",
        };
        const response = await fetch(`${serverAddress}/users/`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedEmp),
        });
        if (response.ok) {
          const data = await response.json();

          const index = employees.findIndex((e) => e.id === data.id);
          if (index !== -1) {
            setEmployees((prev) => [
              ...prev.slice(0, index),
              data,
              ...prev.slice(index + 1),
            ]);
          } else {
            setEmployees((prev) => [...prev, data]);
          }
          setShowSuccessMessage(true);
          setTimeout(() => {
            closeEditEmployeePanel();
            setShowSuccessMessage(false);
          }, 3000);
        } else {
          setShowFailMessage(true);
          setTimeout(() => {
            setShowFailMessage(false);
          }, 3000);
        }
      } catch (error) {
        console.error("error :", error);
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      }
    }
  }
  const handleDeleteEmployeeSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordAuth(true);
    setSubmitType("deleteEmp");
  };
  async function handleDeleteEmployeeApi() {
    if (deleteEmployee) {
      try {
        const response = await fetch(`${serverAddress}/users/`, {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: deleteEmployee.id }),
        });
        if (response.ok) {
          setEmployees((prev) =>
            prev.filter((emp) => emp.id !== deleteEmployee.id)
          );
          setShowSuccessMessage(true);
          setTimeout(() => {
            setDeleteEmployee(null);
            setShowSuccessMessage(false);
          }, 3000);
        } else {
          setShowFailMessage(true);
          setTimeout(() => {
            setShowFailMessage(false);
          }, 3000);
        }
      } catch (error) {
        console.error("error :", error);
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      }
    }
  }
  const handleAuthResult = (success: boolean) => {
    if (success) {
      setPasswordAuth(false);
      if (submitType === "deleteEmp") {
        handleDeleteEmployeeApi();
      } else if (submitType === "editEmp") {
        handleEditApi();
      }
    }
    setSubmitType("");
    return;
  };
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{text.allemp}</h2>
      {/* pending employee */}
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
                      <div>{p.phone_number}</div>
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
                <div>{emp.phone_number}</div>
              </div>
              <div>
                <div>{text.gender}</div>
                <div>{emp.gender[lang]}</div>
              </div>
              <div>
                <div>{text.team}</div>
                <div>
                  {teams.find((team) => team.id === emp.team?.id)?.name[lang]}
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
                  <td>{emp.phone_number}</td>
                  <td>{emp.gender[lang]}</td>
                  <td>
                    {teams.find((team) => team.id === emp.team?.id)?.name[lang]}
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
              onClick={closeApprovingPanel}
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
                  value={isApproving.phone_number}
                  readOnly
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{text.gender}</label>
                <Select
                  value={approvingForm.gender}
                  options={genderOption}
                  onChange={(option: SingleValue<GenderOption>) => {
                    handleApprovingChange("gender", option);
                  }}
                  classNamePrefix="select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      width: `${width}px`,
                    }),
                  }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{text.team}</label>

                <Select
                  value={approvingForm.team}
                  isSearchable
                  isMulti={false}
                  options={teamOption}
                  onChange={(option: SingleValue<TeamOption>) => {
                    handleApprovingChange("team", option);
                  }}
                  classNamePrefix="select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      width: `${width}px`,
                    }),
                  }}
                />
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
                  onClick={closeApprovingPanel}
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
      {/* edit employee */}
      {editEmployee && (
        <div className="overlay">
          <div className={styles.editEmployee}>
            <button
              className={styles.closeIconButton}
              aria-label="Close panel"
              onClick={closeEditEmployeePanel}
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
                    .filter((team) => team.id !== editEmployee.team?.id)
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
                  onClick={closeEditEmployeePanel}
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
      {/* delete employee */}
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
      {passwordAuth && (
        <PasswordAuth
          handleAuthResult={handleAuthResult}
          setPasswordAuth={setPasswordAuth}
        />
      )}
    </div>
  );
}
