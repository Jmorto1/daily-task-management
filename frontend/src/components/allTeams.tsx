import { useState, useEffect, useRef, type FormEvent } from "react";
import Select from "react-select";
import styles from "../styles/allTeams.module.css";
import allTeamsAm from "../locates/amharic/allTeams.json";
import allTeamsEn from "../locates/english/allTeams.json";
import { useLang } from "../hooks/useLang";
import PasswordAuth from "./subComponent/passwordAuth";
import {
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPlus,
} from "react-icons/fi";
import { MdChangeCircle } from "react-icons/md";
import { useAppData } from "../hooks/useAppData";
import type { Team, User } from "../context/appDataContext";

type Service = {
  id: number;
  name: {
    am: string;
    en: string;
  };
  teamIDs?: number[];
  adminID?: number;
};
type OptionLeader = {
  value: User;
  label: string;
};
type CreateForm = {
  nameEn: string;
  nameAm: string;
  leader?: OptionLeader | null;
};
type CreateErrors = {
  nameEn: string;
  nameAm: string;
  leader?: string;
};
export default function AllTeams() {
  const { lang } = useLang();
  const translate = {
    am: allTeamsAm,
    en: allTeamsEn,
  };
  const text = translate[lang];
  const { teams, setTeams, employees, setEmployees, user, serverAddress } =
    useAppData();
  const services: Service[] = [];
  const [createTeam, setCreateTeam] = useState(false);
  const [editTeam, setEditTeam] = useState(false);
  const [submitType, setSubmitType] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [assignService, setAssignService] = useState<{
    value: Team | User;
    type: "admin" | "team";
  } | null>(null);
  const [seeService, SetSeeService] = useState<{
    value: Team | User;
    type: "admin" | "team";
  } | null>(null);

  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [deleteService, setDeleteService] = useState<{
    service: Service;
    adminTeam: User | Team;
    type: "team" | "admin";
  } | null>(null);
  const [deleteTeam, setDeleteTeam] = useState<Team | null>(null);
  const leaderOption: OptionLeader[] = employees.map((emp) => {
    return {
      value: emp,
      label: emp.name[lang],
    };
  });
  const [actionDropdown, setActionDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const moreVerticalRef = useRef<{ [key: string]: HTMLButtonElement | null }>(
    {}
  );
  useEffect(() => {
    const handleScroll = () => {
      setActionDropdown(null);
    };
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
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleMousedown);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [actionDropdown]);
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
  }, [createTeam]);
  const [passwordAuth, setPasswordAuth] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [showFailMessage, setShowFailMessage] = useState<boolean>(false);
  const emptyCreateForm: CreateForm = { nameEn: "", nameAm: "", leader: null };
  const emptyCreateErrors: CreateErrors = {
    nameEn: "",
    nameAm: "",
    leader: "",
  };
  const [createForm, setCreateFrom] = useState<CreateForm>(emptyCreateForm);
  const [createErrors, setCreateErrors] =
    useState<CreateErrors>(emptyCreateErrors);
  const [changeLeader, setChangeLeader] = useState<Team | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<OptionLeader | null>(
    null
  );
  const [changeLeaderError, setChangeLeaderError] = useState("");
  const leaderChangeOption = (): OptionLeader[] => {
    if (!changeLeader) return [];

    return employees
      .filter(
        (emp) => emp.role !== "teamLeader" && emp.team?.id === changeLeader.id
      )
      .map((emp) => ({
        value: emp,
        label: emp.name[lang],
      }));
  };

  const filteredServices = (): Service[] => {
    if (assignService) {
      if (assignService.type === "admin") {
        return services.filter((service) => service.adminID !== user.id);
      } else {
        return services.filter(
          (service) => !service.teamIDs?.includes(assignService.value.id)
        );
      }
    } else if (seeService) {
      if (seeService.type === "admin") {
        return services.filter((service) => service.adminID === user.id);
      } else {
        return services.filter(
          (service) =>
            service.teamIDs !== undefined &&
            service.teamIDs.includes(seeService.value.id)
        );
      }
    }
    return [];
  };

  const createValidate = () => {
    let isValid = true;
    const newErrors: CreateErrors = emptyCreateErrors;
    if (!createForm.nameAm.trim()) {
      newErrors.nameAm = "የቡድን ስም ያስፈልጋል";
      isValid = false;
    }
    if (!createForm.nameEn.trim()) {
      newErrors.nameEn = "team name is required";
      isValid = false;
    }
    if (createTeam) {
      if (!createForm.leader) {
        newErrors.leader = text.leaderError;
        isValid = false;
      }
    }
    setCreateErrors(newErrors);
    return isValid;
  };
  const handleCreateChange = (
    field: string,
    value: string | OptionLeader | null
  ) => {
    setCreateFrom((prev) => ({ ...prev, [field]: value }));
    setCreateErrors((prev) => ({ ...prev, [field]: "" }));
  };
  //close panels
  const closeCreateEditPanel = () => {
    {
      setCreateErrors(emptyCreateErrors);
      setCreateFrom(emptyCreateForm);
      setCreateTeam(false);
      setSelectedTeam(null);
      setEditTeam(false);
    }
  };
  const closeChangeLeaderPanel = () => {
    setSelectedLeader(null);
    setChangeLeaderError("");
    setChangeLeader(null);
  };
  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!createValidate()) return;
    setSubmitType("createTeam");
    setPasswordAuth(true);
  };
  async function handleCreateTeamApi() {
    if (user.department && createForm.leader) {
      try {
        const team = {
          name: {
            am: createForm.nameAm,
            en: createForm.nameEn,
          },
          department_id: user.department.id,
        };
        const response1 = await fetch(`${serverAddress}/teams/`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(team),
        });

        if (response1.ok) {
          const newTeam = await response1.json();
          setTeams((prev) => [...prev, newTeam]);
          const leader = {
            id: createForm.leader.value.id,
            role: "teamLeader",
            team_id: newTeam.id,
          };
          const response2 = await fetch(`${serverAddress}/users/`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(leader),
          });
          if (response2.ok) {
            const updatedEmp = await response2.json();
            const index = employees.findIndex((e) => e.id === updatedEmp.id);
            if (index !== -1) {
              setEmployees((prev) => [
                ...prev.slice(0, index),
                updatedEmp,
                ...prev.slice(index + 1),
              ]);
            } else {
              setEmployees((prev) => [...prev, updatedEmp]);
            }
          }
          setShowSuccessMessage(true);
          setTimeout(() => {
            closeCreateEditPanel();
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
  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!createValidate()) return;
    setSubmitType("editTeam");
    setPasswordAuth(true);
  };
  async function handleEditTeamApi() {
    if (selectedTeam) {
      try {
        const team = {
          name: {
            am: createForm.nameAm,
            en: createForm.nameEn,
          },
        };
        const response = await fetch(
          `${serverAddress}/teams/${selectedTeam.id}/`,
          {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(team),
          }
        );

        if (response.ok) {
          const updatedTeam = await response.json();
          const index = teams.findIndex((t) => t.id === updatedTeam.id);
          if (index !== -1) {
            setTeams((prev) => [
              ...prev.slice(0, index),
              updatedTeam,
              ...prev.slice(index + 1),
            ]);
          } else {
            setTeams((prev) => [...prev, updatedTeam]);
          }
          setShowSuccessMessage(true);
          setTimeout(() => {
            closeCreateEditPanel();
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
  const handleCheckboxChange = (serviceId: number) => {
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
  const handleDeleteTeamSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitType("deleteTeam");
    setPasswordAuth(true);
  };
  async function handleDeleteTeamApi() {
    if (deleteTeam) {
      try {
        const leader = employees.find(
          (emp) => emp.team?.id === deleteTeam.id && emp.role === "teamLeader"
        );
        let leaderUpdated = true;
        if (leader) {
          const response = await fetch(`${serverAddress}/users/`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: leader.id, role: "user" }),
          });
          if (!response.ok) {
            leaderUpdated = false;
          }
        }
        if (leaderUpdated) {
          const response = await fetch(
            `${serverAddress}/teams/${deleteTeam.id}/`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );

          if (response.ok) {
            setTeams((prev) => prev.filter((t) => t.id !== deleteTeam.id));
            setShowSuccessMessage(true);
            setTimeout(() => {
              setDeleteTeam(null);
              setShowSuccessMessage(false);
            }, 3000);
          } else {
            setShowFailMessage(true);
            setTimeout(() => {
              setShowFailMessage(false);
            }, 3000);
          }
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
  const handleChangeLeaderSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLeader) {
      setChangeLeaderError(text.leaderError);
      return;
    }
    setSubmitType("changeLeader");
    setPasswordAuth(true);
  };
  async function handleChangeLeaderApi() {
    if (changeLeader && selectedLeader) {
      try {
        const prevLeader = employees.find(
          (emp) => emp.team?.id === changeLeader.id && emp.role === "teamLeader"
        );
        let leaderUpdated = true;
        if (prevLeader) {
          const response = await fetch(`${serverAddress}/users/`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: prevLeader.id, role: "user" }),
          });
          if (response.ok) {
            const updatedEmp = await response.json();
            const index = employees.findIndex(
              (emp) => emp.id === updatedEmp.id
            );
            if (index !== -1) {
              setEmployees((prev) => [
                ...prev.slice(0, index),
                updatedEmp,
                ...prev.slice(index + 1),
              ]);
            } else {
              setEmployees((prev) => [...prev, updatedEmp]);
            }
          } else {
            leaderUpdated = false;
          }
        }
        if (leaderUpdated) {
          const newLeader = {
            id: selectedLeader.value.id,
            role: "teamLeader",
            team_id: changeLeader.id,
          };
          const response = await fetch(`${serverAddress}/users/`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newLeader),
          });
          if (response.ok) {
            const updatedEmp = await response.json();
            const index = employees.findIndex(
              (emp) => emp.id === updatedEmp.id
            );
            if (index !== -1) {
              setEmployees((prev) => [
                ...prev.slice(0, index),
                updatedEmp,
                ...prev.slice(index + 1),
              ]);
            } else {
              setEmployees((prev) => [...prev, updatedEmp]);
            }
            setShowSuccessMessage(true);
            setTimeout(() => {
              closeChangeLeaderPanel();
              setShowSuccessMessage(false);
            }, 3000);
          } else {
            setShowFailMessage(true);
            setTimeout(() => {
              setShowFailMessage(false);
            }, 3000);
          }
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
  const handleAuthResult = (success: boolean) => {
    if (success) {
      setPasswordAuth(false);
      if (submitType === "createTeam") {
        handleCreateTeamApi();
      } else if (submitType === "editTeam") {
        handleEditTeamApi();
      } else if (submitType === "deleteTeam") {
        handleDeleteTeamApi();
      } else if (submitType === "changeLeader") {
        handleChangeLeaderApi();
      }
    }
    setSubmitType("");
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerBtn}>
          <button
            className={styles.createBtn}
            onClick={() => {
              setCreateTeam(true);
            }}
          >
            {text.addTeam}
          </button>
          <div className={styles.adminContainer}>
            <div className={styles.adminHeader}>{text.forAdmin}</div>
            <button
              className={styles.adminAssignBtn}
              onClick={() => {
                setAssignService({ value: user, type: "admin" });
              }}
            >
              {text.assignService}
            </button>
            <button
              onClick={() => {
                SetSeeService({ value: user, type: "admin" });
              }}
              className={styles.adminSeeBtn}
            >
              {text.seeService}
            </button>
          </div>
        </div>
        <h2 className={styles.title}>{text.teams}</h2>
      </div>

      {/* Teams Table */}
      {teams.length === 0 ? (
        <div className={styles.noFoundMessage}>{text.noTeam}</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th>{text.num}</th>
              <th>{text.teamName}</th>
              <th>{text.teamLeader}</th>
              <th>{text.action}</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {teams.map((team, index) => {
              const leader = employees.find(
                (emp) => emp.team?.id === team.id && emp.role === "teamLeader"
              );
              return (
                <tr key={team.id}>
                  <td>{index + 1}</td>
                  <td>{team.name[lang]}</td>
                  <td>{leader?.name[lang]}</td>
                  <td>
                    <div
                      className={styles.dropdown}
                      ref={(el) => {
                        dropdownRef.current[team.id] = el;
                      }}
                    >
                      <button
                        className={styles.iconButton}
                        ref={(el) => {
                          moreVerticalRef.current[team.id] = el;
                        }}
                        onClick={() => {
                          setActionDropdown(
                            actionDropdown === team.id ? null : team.id
                          );
                        }}
                      >
                        <FiMoreVertical size={18} />
                      </button>
                      {actionDropdown === team.id && (
                        <div className={styles.dropdownMenu}>
                          <button
                            className={styles.assignBtn}
                            onClick={() => {
                              setAssignService({ value: team, type: "team" });
                              setActionDropdown(null);
                            }}
                          >
                            <FiPlus />
                            {text.assignService}
                          </button>
                          <button
                            onClick={() => {
                              SetSeeService({ value: team, type: "team" });
                              setActionDropdown(null);
                            }}
                            className={styles.seeBtn}
                          >
                            <FiEye /> {text.seeService}
                          </button>
                          <button
                            className={styles.editBtn}
                            onClick={() => {
                              setCreateFrom({
                                nameAm: team.name["am"],
                                nameEn: team.name["en"],
                              });
                              setSelectedTeam(team);
                              setEditTeam(true);
                              setActionDropdown(null);
                            }}
                          >
                            <FiEdit />
                            {text.edit}
                          </button>
                          <button
                            className={styles.changeBtn}
                            onClick={() => {
                              setChangeLeader(team);
                              setActionDropdown(null);
                            }}
                          >
                            <MdChangeCircle />
                            {text.changeLeader}
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => {
                              setDeleteTeam(team);
                              setActionDropdown(null);
                            }}
                          >
                            <FiTrash2 /> {text.deleteTeam}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {/* Add/edit team */}
      {(createTeam || editTeam) && (
        <div className="overlay">
          <div className={styles.addTeam}>
            <button
              className={styles.closeIconButton}
              aria-label="Close panel"
              onClick={closeCreateEditPanel}
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
            <h2 className={styles.panelHeader}>
              {createTeam ? text.addTeam : text.editTeam}
            </h2>
            <form
              className={styles.form}
              onSubmit={createTeam ? handleCreateSubmit : handleEditSubmit}
            >
              <div className={styles.formGroup}>
                <label>Team</label>
                <input
                  type="text"
                  placeholder="Team name"
                  name="nameEn"
                  value={createForm.nameEn}
                  onChange={(e) =>
                    handleCreateChange(e.target.name, e.target.value)
                  }
                  className={styles.input}
                  ref={inputRef}
                />
              </div>
              {createErrors.nameEn && (
                <div className={styles.error}>{createErrors.nameEn}</div>
              )}
              <div className={styles.formGroup}>
                <label>ቡድን</label>
                <input
                  type="text"
                  placeholder="የቡድን ስም"
                  name="nameAm"
                  value={createForm.nameAm}
                  onChange={(e) =>
                    handleCreateChange(e.target.name, e.target.value)
                  }
                  className={styles.input}
                />
              </div>
              {createErrors.nameAm && (
                <div className={styles.error}>{createErrors.nameAm}</div>
              )}
              {createTeam && (
                <>
                  <div className={styles.formGroup}>
                    <label>{text.teamLeader}</label>
                    <Select
                      options={leaderOption}
                      className={styles.selectContainer}
                      classNamePrefix="select"
                      name="leader"
                      isMulti={false}
                      value={createForm.leader}
                      onChange={(option) =>
                        handleCreateChange("leader", option)
                      }
                      styles={{
                        control: (base) => ({
                          ...base,
                          width: `${width}px`,
                        }),
                      }}
                    ></Select>
                  </div>
                  {createErrors.leader && (
                    <div className={styles.error}>{createErrors.leader}</div>
                  )}
                </>
              )}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeCreateEditPanel}
                >
                  {text.cancel}
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {createTeam ? text.save : text.update}
                </button>
              </div>
            </form>
            {showSuccessMessage && (
              <>
                <div className="successMessageWrapper">
                  <div className="successMessage">
                    {createTeam ? text.addMessage : text.editMessage}
                  </div>
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
            {assignService && assignService.type === "admin" ? (
              <h2>{text.assignAdmin}</h2>
            ) : lang === "en" ? (
              <h2 className={styles.panelHeader}>
                {text.assignTeam} {assignService.value.name[lang]}
              </h2>
            ) : (
              <h2 className={styles.panelHeader}>
                ለ {assignService.value.name[lang]} {text.assignTeam}
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
                  <div className="successMessage">{text.assignedMessage}</div>
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
            {seeService && seeService.type === "admin" ? (
              <h2>{text.assignedAdmin}</h2>
            ) : lang === "en" ? (
              <h2 className={styles.panelHeader}>
                {text.assignedTeam} {seeService.value.name[lang]}
              </h2>
            ) : (
              <h2 className={styles.panelHeader}>
                ለ{seeService.value.name[lang]} {text.assignedTeam}
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
                              adminTeam: seeService.value,
                              type: seeService.type,
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
                          {deleteService.adminTeam.name[lang]} ?
                        </div>
                      ) : (
                        <div className={styles.deleteWarning}>
                          {deleteService.service.name[lang]}ን ከ
                          {deleteService.adminTeam.name[lang]}{" "}
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
                              {text.deleteServiceMessage}
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
      {/* change leader */}
      {changeLeader && (
        <div className="overlay">
          <div className={styles.changeLeader}>
            <button
              className={styles.closeIconButton}
              aria-label="Close panel"
              onClick={closeChangeLeaderPanel}
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
                {text.changeLeader} for {changeLeader.name[lang]}
              </h2>
            ) : (
              <h2 className={styles.panelHeader}>
                ለ{changeLeader.name[lang]}
                {text.changeLeader}
              </h2>
            )}
            <form className={styles.form} onSubmit={handleChangeLeaderSubmit}>
              <div className={styles.formGroup}>
                <label>{text.teamLeader}</label>
                <Select
                  options={leaderChangeOption()}
                  className={styles.selectContainer}
                  classNamePrefix="select"
                  name="leader"
                  isMulti={false}
                  value={selectedLeader}
                  onChange={(option) => {
                    setSelectedLeader(option);
                    setChangeLeaderError("");
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      width: `180px`,
                    }),
                  }}
                ></Select>
              </div>
              {changeLeaderError && (
                <div className={styles.error}>{changeLeaderError}</div>
              )}

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeChangeLeaderPanel}
                >
                  {text.cancel}
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {text.save}
                </button>
              </div>
            </form>
            {showSuccessMessage && (
              <>
                <div className="successMessageWrapper">
                  <div className="successMessage">{text.changeMessage}</div>
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
      {/* delete team */}
      {deleteTeam && (
        <div className="overlay">
          <div className={styles.assignService}>
            <button
              className={styles.closeIconButton}
              aria-label="Close panel"
              onClick={() => {
                setDeleteTeam(null);
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
            <form className={styles.form} onSubmit={handleDeleteTeamSubmit}>
              {lang === "en" ? (
                <div className={styles.deleteWarning}>
                  {text.deleteWarning} {deleteTeam.name[lang]}?
                </div>
              ) : (
                <div className={styles.deleteWarning}>
                  {deleteTeam.name[lang]}ን {text.deleteWarning}
                </div>
              )}

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setDeleteTeam(null);
                  }}
                >
                  No
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Yes
                </button>
              </div>
            </form>

            {showSuccessMessage && (
              <>
                <div className="successMessageWrapper">
                  <div className="successMessage">
                    Team deleted successfully
                  </div>
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
