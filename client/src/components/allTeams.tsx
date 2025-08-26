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
type Service = {
  id: string;
  name: {
    am: string;
    en: string;
  };
  teamIDs?: string[];
  adminID?: string;
};
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
    am: string;
    en: string;
  };
  role: "user" | "teamLeader" | "admin";
  teamID: string;
};
type OptionLeader = {
  value: Employee;
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
  const { lang, setLang } = useLang();
  const translate = {
    am: allTeamsAm,
    en: allTeamsEn,
  };
  const text = translate[lang];
  const teams: Team[] = [
    {
      id: "t1",
      name: { am: "የጽዳት ቡድን", en: "Cleaning Team" },
    },
    {
      id: "t2",
      name: { am: "የግብርና ቡድን", en: "Gardening Team" },
    },
    {
      id: "t3",
      name: { am: "የጥገና ቡድን", en: "Maintenance Team" },
    },
    {
      id: "t4",
      name: { am: "የደህንነት ቡድን", en: "Security Team" },
    },
  ];
  type Employee = {
    id: string;
    name: {
      am: string;
      en: string;
    };
    role: "user" | "teamLeader" | "admin";
    teamID: string;
  };

  const employees: Employee[] = [
    // Cleaning Team
    {
      id: "e1",
      name: { am: "ሀና መኮንን", en: "Hanna Mekonnen" },
      role: "teamLeader",
      teamID: "t1",
    },
    {
      id: "e2",
      name: { am: "አበበ ተስፋዬ", en: "Abebe Tesfaye" },
      role: "user",
      teamID: "t1",
    },
    {
      id: "e3",
      name: { am: "ሀና አለም", en: "Hana Alem" },
      role: "user",
      teamID: "t1",
    },
    {
      id: "e4",
      name: { am: "ሀዋርያ አለም", en: "Hawarya Alem" },
      role: "teamLeader",
      teamID: "t2",
    },
    {
      id: "e5",
      name: { am: "መሀሪ ደሳለኝ", en: "Mehari Desalegn" },
      role: "user",
      teamID: "t2",
    },
    {
      id: "e6",
      name: { am: "ሰላም ተስፋዬ", en: "Selam Tesfaye" },
      role: "user",
      teamID: "t2",
    },

    {
      id: "e7",
      name: { am: "ዮሴፍ ተፈራ", en: "Yoseph Tefera" },
      role: "teamLeader",
      teamID: "t3",
    },
    {
      id: "e8",
      name: { am: "አልሙ ተክለ", en: "Almu Tekle" },
      role: "user",
      teamID: "t3",
    },
    {
      id: "e9",
      name: { am: "ሀና ደሳለኝ", en: "Hanna Desalegn" },
      role: "user",
      teamID: "t3",
    },
    {
      id: "e10",
      name: { am: "ሰላም ወልደቀርበ", en: "Selam Woldekerbe" },
      role: "teamLeader",
      teamID: "t4",
    },
    {
      id: "e11",
      name: { am: "ተስፋዬ ሀገር", en: "Tesfaye Hager" },
      role: "user",
      teamID: "t4",
    },
    {
      id: "e12",
      name: { am: "ሀና ተፈራ", en: "Hanna Tefera" },
      role: "user",
      teamID: "t4",
    },
  ];
  const admin: Employee = {
    id: "admin1",
    name: {
      am: "የአለም ብርሃኑ",
      en: "yealem",
    },
    role: "admin",
    teamID: "null",
  };
  const services: Service[] = [
    // Cleaning Services assigned to multiple teams
    {
      id: "s1",
      name: {
        am: "የመጀመሪያ ክፍል ጽዳት",
        en: "Lobby CleaningLobby CleaningLobby CleaningLobby CleaningLobby CleaningLobby CleaningLobby Cleaning",
      },
      teamIDs: ["t1", "t2"],
    },
    {
      id: "s2",
      name: { am: "መመገቢያ ጽዳት", en: "Dining Area Cleaning" },
      teamIDs: ["t1"],
    },
    {
      id: "s3",
      name: { am: "መስኮት ማጽዳት", en: "Window Cleaning" },
      teamIDs: ["t1", "t3"],
    },

    // Gardening Services
    {
      id: "s4",
      name: { am: "አትክልት እንክብካቤ", en: "Vegetable Care" },
      teamIDs: ["t2"],
    },
    {
      id: "s5",
      name: { am: "አበባ መዝራት", en: "Flower Planting" },
      teamIDs: ["t2", "t1"],
    },

    // Maintenance Services
    {
      id: "s6",
      name: { am: "ኤሌክትሪክ ጥገና", en: "Electrical Repair" },
      teamIDs: ["t3"],
    },
    {
      id: "s7",
      name: { am: "ውሃ ቱቦ ጥገና", en: "Plumbing Repair" },
      teamIDs: ["t3"],
    },

    // Security Services
    {
      id: "s8",
      name: { am: "መግቢያ ክትትል", en: "Entrance Monitoring" },
      teamIDs: ["t4"],
    },
    {
      id: "s9",
      name: { am: "ካሜራ ክትትል", en: "CCTV Monitoring" },
      teamIDs: ["t4", "t1"],
    },

    // Services assigned only to Admin
    {
      id: "s10",
      name: { am: "የግል ሪፖርት አስተዳደር", en: "Personal Report Management" },
      adminID: "admin1",
    },
    {
      id: "s11",
      name: { am: "የኮንፈረንስ ክፍል ቦታ ማስያዝ", en: "Conference Room Booking" },
      adminID: "admin1",
    },

    // Services assigned to both admin and teams
    {
      id: "s12",
      name: { am: "ጽዳት እና አስተዳደር", en: "Cleaning & Admin Task" },
      teamIDs: ["t1", "t2"],
      adminID: "admin1",
    },

    // Unassigned services (for testing)
    {
      id: "s13",
      name: { am: "ተራ አገልግሎት", en: "Unassigned Test Service 1" },
    },
    {
      id: "s14",
      name: { am: "ሌላ አገልግሎት", en: "Unassigned Test Service 2" },
    },
  ];
  const [createTeam, setCreateTeam] = useState(false);
  const [editTeam, setEditTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [assignService, setAssignService] = useState<{
    value: Team | Employee;
    type: "admin" | "team";
  } | null>(null);
  const [seeService, SetSeeService] = useState<{
    value: Team | Employee;
    type: "admin" | "team";
  } | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [deleteService, setDeleteService] = useState<{
    service: Service;
    adminTeam: Employee | Team;
    type: "team" | "admin";
  } | null>(null);
  const [deleteTeam, setDeleteTeam] = useState<Team | null>(null);
  const leaderOption: OptionLeader[] = employees.map((emp) => {
    return {
      value: emp,
      label: emp.name[lang],
    };
  });
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
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
        (emp) => !(emp.role === "teamLeader" && emp.teamID === changeLeader.id)
      )
      .map((emp) => ({
        value: emp,
        label: emp.name[lang],
      }));
  };

  const filteredServices = (): Service[] => {
    if (assignService) {
      if (assignService.type === "admin") {
        return services.filter((service) => service.adminID !== admin.id);
      } else {
        return services.filter(
          (service) => !service.teamIDs?.includes(assignService.value.id)
        );
      }
    } else if (seeService) {
      if (seeService.type === "admin") {
        return services.filter((service) => service.adminID === admin.id);
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
  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!createValidate()) return;
    setPasswordAuth(true);
  };
  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!createValidate()) return;
    setPasswordAuth(true);
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
  const handleDeleteTeamSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordAuth(true);
  };
  const handleChangeLeaderSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLeader) {
      setChangeLeaderError(text.leaderError);
      return;
    }
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
                setAssignService({ value: admin, type: "admin" });
              }}
            >
              {text.assignService}
            </button>
            <button
              onClick={() => {
                SetSeeService({ value: admin, type: "admin" });
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
                (emp) => emp.teamID === team.id && emp.role === "teamLeader"
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
              onClick={() => {
                setCreateErrors(emptyCreateErrors);
                setCreateFrom(emptyCreateForm);
                setCreateTeam(false);
                setSelectedTeam(null);
                setEditTeam(false);
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
                  onClick={() => {
                    setCreateErrors(emptyCreateErrors);
                    setCreateFrom(emptyCreateForm);
                    setCreateTeam(false);
                    setSelectedTeam(null);
                    setEditTeam(false);
                  }}
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
                  <div className="successMessage">{text.addMessage}</div>
                </div>
                <div className="overlay" style={{ zIndex: "1001" }}></div>
              </>
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
              onClick={() => {
                setSelectedLeader(null);
                setChangeLeaderError("");
                setChangeLeader(null);
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
                  onClick={() => {
                    setSelectedLeader(null);
                    setChangeLeaderError("");
                    setChangeLeader(null);
                  }}
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
