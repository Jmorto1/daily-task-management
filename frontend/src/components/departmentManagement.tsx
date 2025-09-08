import { useState, useEffect, useRef, type FormEvent } from "react";
import Select from "react-select";
import departmentAm from "../locates/amharic/department.json";
import departmentEn from "../locates/english/department.json";
import { useLang } from "../hooks/useLang";
import styles from "../styles/departmentManagement.module.css";
import {
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiUserMinus,
  FiMove,
} from "react-icons/fi";
import PasswordAuth from "./subComponent/passwordAuth";
import { useAppData } from "../hooks/useAppData";
import type { Department, User } from "../context/appDataContext";
type optionEmployees = {
  value: User;
  label: string;
};
type optionDepts = {
  value: Department;
  label: string;
};
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
export default function DepartmentManagement() {
  const { lang } = useLang();
  const translate = {
    en: departmentEn,
    am: departmentAm,
  };
  const text = translate[lang];
  const {
    employees,
    setEmployees,
    departments,
    setDepartments,
    serverAddress,
  } = useAppData();
  const [submitType, setSubmitType] = useState("");
  const optionEmployees = (employees: User[]) => {
    return employees.map((emp) => ({
      value: emp,
      label: emp.name[lang],
    }));
  };
  const optionDepartments = (departments: Department[]) => {
    return departments.map((dept) => ({
      value: dept,
      label: dept.name[lang],
    }));
  };
  const [addEditDept, setAddEditDept] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<optionEmployees[] | null>(
    null
  );
  const [deleteAdminPanel, setDeleteAdminPanel] = useState(false);
  const [addAdmin, setAddAdmin] = useState<optionEmployees[] | null>(null);
  const [addAdminPanel, setAddAdminPanel] = useState(false);
  const [deleteDept, setDeleteDept] = useState<Department | null>();
  const [moveEmployee, setMoveEmployee] = useState<User | null>(null);
  const [prevDept, setPrevDept] = useState<Department | null>(null);
  const [moveEmployeePanel, setMoveEmployeePanel] = useState(false);
  const [passwordAuth, setPasswordAuth] = useState<boolean>(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [showFailMessage, setShowFailMessage] = useState<boolean>(false);
  const [deptForm, setDeptForm] = useState({
    nameEn: "",
    nameAm: "",
  });
  const [deleteAdminForm, setDeleteAdminForm] =
    useState<optionEmployees | null>(null);
  const [addAdminForm, setAddAdminForm] = useState<optionEmployees | null>(
    null
  );
  const [moveEmployeeForm, setMoveEmployeeForm] = useState<optionDepts | null>(
    null
  );
  const [deptError, setDeptError] = useState({ nameEn: "", nameAm: "" });
  const [deleteAdminError, setDeleteAdminError] = useState("");
  const [addAdminError, setAddAdminError] = useState("");
  const [moveEmployeeError, setMoveEmployeeError] = useState("");
  const [deptOptions, setDeptOptions] = useState<optionDepts[] | null>(null);
  const [adminDropdown, setAdminDropdown] = useState<number | null>(null);
  const [empDropdown, setEmpDropdown] = useState<number | null>(null);
  const [actionDropdown, setActionDropdown] = useState<number | null>(null);

  const [userQuery, setUserQuery] = useState<{
    [deptId: string]: string;
  }>({});
  const moreVerticalRef = useRef<{ [key: string]: HTMLButtonElement | null }>(
    {}
  );
  const adminDropdownListRef = useRef<{ [key: string]: HTMLDivElement | null }>(
    {}
  );
  const employeeDropdownListRef = useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});
  const [moreVerticalBottomDistance, setMoreVerticalBottomDistance] = useState<{
    [key: string]: number;
  }>({});
  const [adminDropdownListBottomDistance, setAdminDropdownListBottomDistance] =
    useState<{
      [key: string]: number;
    }>({});
  const [
    employeeDropdownListBottomDistance,
    setEmployeeDropdownBottomDistance,
  ] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    const handleDistance = () => {
      const newDistances: { [key: string]: number } = {};
      for (const id in moreVerticalRef.current) {
        const el = moreVerticalRef.current[id];
        newDistances[id] = el
          ? window.innerHeight - el.getBoundingClientRect().bottom
          : 0;
      }
      setMoreVerticalBottomDistance(newDistances);
      const newDistances1: { [key: string]: number } = {};
      for (const id in adminDropdownListRef.current) {
        const el = adminDropdownListRef.current[id];
        newDistances1[id] = el
          ? window.innerHeight - el.getBoundingClientRect().bottom
          : 0;
      }
      setAdminDropdownListBottomDistance(newDistances1);
      const newDistances3: { [key: string]: number } = {};
      for (const id in employeeDropdownListRef.current) {
        const el = employeeDropdownListRef.current[id];
        newDistances3[id] = el
          ? window.innerHeight - el.getBoundingClientRect().bottom
          : 0;
      }
      setEmployeeDropdownBottomDistance(newDistances3);
    };

    handleDistance();
    window.addEventListener("resize", handleDistance);
    window.addEventListener("scroll", handleDistance, true);
    return () => {
      window.removeEventListener("resize", handleDistance);
      window.removeEventListener("scroll", handleDistance, true);
    };
  }, []);
  const dropdownRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
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
  useEffect(() => {
    if (editingDept) {
      setDeptForm({
        nameEn: editingDept.name["en"],
        nameAm: editingDept.name["am"],
      });
    } else {
      setDeptForm({ nameEn: "", nameAm: "" });
    }
  }, [editingDept]);

  //close panel
  const closeAddEditPanel = () => {
    setEditingDept(null);
    setAddEditDept(false);
    setDeptForm({ nameAm: "", nameEn: "" });
    setDeptError({ nameAm: "", nameEn: "" });
  };
  const closeDeleteAdminPanel = () => {
    setDeleteAdmin(null);
    setDeleteAdminPanel(false);
    setDeleteAdminForm(null);
    setDeleteAdminError("");
  };
  const closeAddAdminPanel = () => {
    setAddAdmin(null);
    setAddAdminPanel(false);
    setAddAdminForm(null);
    setAddAdminError("");
  };
  const closeMoveEmployeePanel = () => {
    setMoveEmployee(null);
    setMoveEmployeePanel(false);
    setMoveEmployeeForm(null);
    setPrevDept(null);
    setDeptOptions(null);
    setMoveEmployeeError("");
  };
  const validate = () => {
    let valid = true;
    const newError = {
      nameEn: "",
      nameAm: "",
    };
    if (!deptForm.nameEn.trim()) {
      newError.nameEn = "department name required.";
      valid = false;
    }
    if (!deptForm.nameAm.trim()) {
      newError.nameAm = "ፅ/ቤት ስም ያስፈልጋል";
      valid = false;
    }
    setDeptError(newError);
    return valid;
  };
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editingDept) {
      setSubmitType("editDept");
    } else {
      setSubmitType("addDept");
    }
    setPasswordAuth(true);
  };
  async function handleAddDeptApi() {
    const department = {
      name: {
        am: deptForm.nameAm,
        en: deptForm.nameEn,
      },
    };

    try {
      const response = await fetch(`${serverAddress}/departments/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(department),
      });

      if (response.ok) {
        setShowSuccessMessage(true);
        const newDepartment = await response.json();

        setDepartments((prev) => [...prev, newDepartment]);
        setTimeout(() => {
          setShowSuccessMessage(false);
          closeAddEditPanel();
        }, 2000);
      } else {
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error adding department:", error);
      setShowFailMessage(true);
      setTimeout(() => {
        setShowFailMessage(false);
      }, 2000);
    }
  }
  async function handleEditDeptApi() {
    const department = {
      name: {
        am: deptForm.nameAm,
        en: deptForm.nameEn,
      },
    };
    if (editingDept) {
      try {
        const response = await fetch(
          `${serverAddress}/departments/${editingDept.id}/`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(department),
          }
        );

        if (response.ok) {
          setShowSuccessMessage(true);
          const newDepartment = await response.json();

          setDepartments((prev) => {
            let index = prev.findIndex((d) => d.id === editingDept.id);
            if (index !== -1) {
              return [
                ...prev.slice(0, index),
                newDepartment,
                ...prev.slice(index + 1),
              ];
            } else {
              return [...prev, newDepartment];
            }
          });
          setTimeout(() => {
            setShowSuccessMessage(false);
            closeAddEditPanel();
          }, 2000);
        } else {
          console.error("Failed:", await response.json());
          setShowFailMessage(true);
          setTimeout(() => {
            setShowFailMessage(false);
          }, 2000);
        }
      } catch (error) {
        console.error("Error adding department:", error);
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 2000);
      }
    }
  }
  const handleAddAdminSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!addAdminForm) {
      setAddAdminError(text.selectEmployee);
      return;
    }
    setSubmitType("addAdmin");
    setPasswordAuth(true);
  };
  async function handleAddAdminApi() {
    if (addAdminForm) {
      try {
        const user = {
          id: addAdminForm.value.id,
          role: "admin",
        };
        const response = await fetch(`${serverAddress}/users/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
          credentials: "include",
        });
        if (response.ok) {
          setShowSuccessMessage(true);
          const updatedEmp = await response.json();
          setEmployees((prev) => {
            const index = prev.findIndex((p) => p.id === updatedEmp.id);
            if (index !== -1) {
              return [
                ...prev.slice(0, index),
                updatedEmp,
                ...prev.slice(index + 1),
              ];
            } else {
              return [...prev, updatedEmp];
            }
          });
          setTimeout(() => {
            setShowSuccessMessage(false);
            closeAddAdminPanel();
          }, 2000);
        } else {
          console.error("Failed:", await response.json());
          setShowFailMessage(true);
          setTimeout(() => {
            setShowFailMessage(false);
          }, 2000);
        }
      } catch (error) {
        console.error("error romoving admin:", error);
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 2000);
      }
    }
  }
  const handleDeleteAdminSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!deleteAdminForm) {
      setDeleteAdminError(text.selectAdmin);
      return;
    }
    setSubmitType("deleteAdmin");
    setPasswordAuth(true);
  };
  async function handleDeleteAdminApi() {
    if (deleteAdminForm) {
      try {
        const user = {
          id: deleteAdminForm.value.id,
          role: "user",
        };
        const response = await fetch(`${serverAddress}/users/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
          credentials: "include",
        });
        if (response.ok) {
          setShowSuccessMessage(true);
          const updatedEmp = await response.json();
          setEmployees((prev) => {
            const index = prev.findIndex((p) => p.id === updatedEmp.id);
            if (index !== -1) {
              return [
                ...prev.slice(0, index),
                updatedEmp,
                ...prev.slice(index + 1),
              ];
            } else {
              return [...prev, updatedEmp];
            }
          });
          setTimeout(() => {
            setShowSuccessMessage(false);
            closeDeleteAdminPanel();
          }, 2000);
        } else {
          console.error("Failed:", await response.json());
          setShowFailMessage(true);
          setTimeout(() => {
            setShowFailMessage(false);
          }, 2000);
        }
      } catch (error) {
        console.error("error romoving admin:", error);
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 2000);
      }
    }
  }
  const handleDeleteDeptSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitType("deleteDept");
    setPasswordAuth(true);
  };
  async function handleDeleteDeptApi() {
    if (deleteDept) {
      try {
        const response = await fetch(
          `${serverAddress}/departments/${deleteDept.id}/`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setShowSuccessMessage(true);
          setDepartments((prev) => prev.filter((d) => d.id !== deleteDept.id));
          setTimeout(() => {
            setShowSuccessMessage(false);
            setDeleteDept(null);
          }, 2000);
        } else {
          console.error("Failed:", await response.json());
          setShowFailMessage(true);
          setTimeout(() => {
            setShowFailMessage(false);
          }, 2000);
        }
      } catch (error) {
        console.error("Error adding department:", error);
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 2000);
      }
    }
  }
  const handleMoveEmployeeSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!moveEmployeeForm) {
      setMoveEmployeeError(text.selectDept);
      return;
    }
    setSubmitType("moveEmp");
    setPasswordAuth(true);
  };
  async function handleMoveEmployeeApi() {
    if (moveEmployee && moveEmployeeForm) {
      try {
        const user = {
          id: moveEmployee.id,
          department_id: moveEmployeeForm.value.id,
          role: "user",
        };
        const response = await fetch(`${serverAddress}/users/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
          credentials: "include",
        });
        if (response.ok) {
          setShowSuccessMessage(true);
          const updatedEmp = await response.json();
          setEmployees((prev) => {
            const index = prev.findIndex((p) => p.id === updatedEmp.id);
            if (index !== -1) {
              return [
                ...prev.slice(0, index),
                updatedEmp,
                ...prev.slice(index + 1),
              ];
            } else {
              return [...prev, updatedEmp];
            }
          });
          setTimeout(() => {
            setShowSuccessMessage(false);
            closeMoveEmployeePanel();
          }, 2000);
        } else {
          console.error("Failed:", await response.json());
          setShowFailMessage(true);
          setTimeout(() => {
            setShowFailMessage(false);
          }, 2000);
        }
      } catch (error) {
        console.error("error transfering employee :", error);
        setShowFailMessage(true);
        setTimeout(() => {
          setShowFailMessage(false);
        }, 2000);
      }
    }
  }
  const handleAuthResult = (success: boolean) => {
    if (success) {
      setPasswordAuth(false);
      if (submitType === "addDept") {
        handleAddDeptApi();
        return;
      } else if (submitType === "editDept") {
        handleEditDeptApi();
      } else if (submitType === "deleteAdmin") {
        handleDeleteAdminApi();
      } else if (submitType === "addAdmin") {
        handleAddAdminApi();
      } else if (submitType === "moveEmp") {
        handleMoveEmployeeApi();
      } else if (submitType === "deleteDept") {
        handleDeleteDeptApi();
      }
    }
    setSubmitType("");
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.createBtn}
          onClick={() => setAddEditDept(true)}
        >
          {text.addDept}
        </button>
        <h2 className={styles.title}>{text.title}</h2>
      </div>
      {/* Departments Table */}
      {departments.length == 0 ? (
        <div className={styles.noFoundMessage}>{text.noDept}</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th>{text.num}</th>
                <th>{text.name}</th>
                <th>{text.admin}</th>
                <th>{text.employee}</th>
                <th>{text.action}</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {departments.map((dept, idx) => (
                <tr key={dept.id} className={styles.tableRow}>
                  <td>{idx + 1}</td>
                  <td>{dept.name[lang]}</td>
                  <td>
                    <div className={styles.countDropdown}>
                      <button
                        className={styles.iconButton}
                        onClick={() => {
                          setAdminDropdown(
                            adminDropdown === dept.id ? null : dept.id
                          );
                          setEmpDropdown(null);
                          setActionDropdown(null);
                          setUserQuery({});
                        }}
                      >
                        {adminDropdown === dept.id
                          ? ArrowIcon({ open: true })
                          : ArrowIcon({ open: false })}
                      </button>
                      {adminDropdown === dept.id ? (
                        <div
                          className={styles.dropdownListWrapper}
                          ref={(el) => {
                            adminDropdownListRef.current[dept.id] = el;
                          }}
                        >
                          <input
                            type="text"
                            placeholder={text.search}
                            className={styles.searchInput}
                            value={userQuery[dept.id] || ""}
                            onChange={(e) => {
                              setUserQuery({
                                ...userQuery,
                                [dept.id]: e.target.value,
                              });
                            }}
                          />
                          <div
                            className={styles.dropdownList}
                            style={
                              adminDropdownListBottomDistance[dept.id] !==
                                undefined &&
                              adminDropdownListBottomDistance[dept.id] < 130
                                ? {
                                    top: "unset",
                                    bottom: "30px",
                                  }
                                : undefined
                            }
                          >
                            {employees
                              .filter(
                                (e) =>
                                  e.role === "admin" &&
                                  e.department?.id === dept.id
                              )
                              .filter((admin) =>
                                admin.name[lang]
                                  .toLowerCase()
                                  .includes(
                                    (userQuery[dept.id] || "").toLowerCase()
                                  )
                              )
                              .map((admin) => (
                                <div
                                  key={admin.id}
                                  className={styles.adminItem}
                                >
                                  {admin.name[lang]}
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          {
                            employees.filter(
                              (e) =>
                                e.role === "admin" &&
                                e.department?.id === dept.id
                            ).length
                          }{" "}
                          {employees.filter(
                            (e) =>
                              e.role === "admin" && e.department?.id === dept.id
                          ).length > 1
                            ? text.admin
                            : text.adminSingle}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.countDropdown}>
                      <button
                        className={styles.iconButton}
                        onClick={() => {
                          setEmpDropdown(
                            empDropdown === dept.id ? null : dept.id
                          );
                          setAdminDropdown(null);
                          setActionDropdown(null);
                          setUserQuery({});
                        }}
                      >
                        {empDropdown === dept.id
                          ? ArrowIcon({ open: true })
                          : ArrowIcon({ open: false })}
                      </button>
                      {empDropdown === dept.id ? (
                        <div
                          className={styles.dropdownListWrapper}
                          ref={(el) => {
                            employeeDropdownListRef.current[dept.id] = el;
                          }}
                        >
                          <input
                            type="text"
                            placeholder={text.search}
                            className={styles.searchInput}
                            value={userQuery[dept.id] || ""}
                            onChange={(e) => {
                              setUserQuery({
                                ...userQuery,
                                [dept.id]: e.target.value,
                              });
                            }}
                          />
                          <div
                            className={styles.dropdownList}
                            style={
                              employeeDropdownListBottomDistance[dept.id] !==
                                undefined &&
                              employeeDropdownListBottomDistance[dept.id] < 130
                                ? {
                                    top: "unset",
                                    bottom: "30px",
                                  }
                                : undefined
                            }
                          >
                            {employees
                              .filter((e) => e.department?.id === dept.id)
                              .filter((emp) =>
                                emp.name[lang]
                                  .toLowerCase()
                                  .includes(
                                    (userQuery[dept.id] || "").toLowerCase()
                                  )
                              )
                              .map((emp) => (
                                <div
                                  key={emp.id}
                                  className={styles.employeeItem}
                                >
                                  <div>{emp.name[lang]}</div>
                                  <button
                                    className={styles.iconButton}
                                    title={text.moveEmoployee}
                                    onClick={() => {
                                      const option = departments.filter(
                                        (d) => d.id !== dept.id
                                      );
                                      const candidate =
                                        optionDepartments(option);
                                      setDeptOptions(candidate);
                                      setMoveEmployee(emp);
                                      setMoveEmployeePanel(true);
                                      setPrevDept(dept);
                                      setEmpDropdown(null);
                                    }}
                                  >
                                    <FiMove />
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          {
                            employees.filter(
                              (e) => e.department?.id === dept.id
                            ).length
                          }{" "}
                          {employees.filter((e) => e.department?.id === dept.id)
                            .length > 1
                            ? text.employee
                            : text.employeeSingle}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div
                      className={styles.dropdown}
                      ref={(el) => {
                        dropdownRef.current[dept.id] = el;
                      }}
                    >
                      <button
                        className={styles.iconButton}
                        onClick={() => {
                          setActionDropdown(
                            actionDropdown === dept.id ? null : dept.id
                          );
                          setEmpDropdown(null);
                          setAdminDropdown(null);
                        }}
                        ref={(el) => {
                          moreVerticalRef.current[dept.id] = el;
                        }}
                      >
                        <FiMoreVertical size={18} />
                      </button>
                      {actionDropdown === dept.id && (
                        <div
                          className={styles.dropdownMenu}
                          style={
                            moreVerticalBottomDistance[dept.id] !== undefined &&
                            moreVerticalBottomDistance[dept.id] < 220
                              ? {
                                  top: "unset",
                                  bottom: "40px",
                                }
                              : undefined
                          }
                        >
                          <button
                            onClick={() => {
                              setEditingDept(dept);
                              setAddEditDept(true);
                              setActionDropdown(null);
                            }}
                          >
                            <FiEdit />
                            {text.edit}
                          </button>
                          <button
                            onClick={() => {
                              const candidate: User[] = employees.filter(
                                (e) =>
                                  e.role !== "admin" &&
                                  e.department?.id === dept.id
                              );
                              const optionAdmins = optionEmployees(candidate);
                              setAddAdmin(optionAdmins);
                              setAddAdminPanel(true);
                              setActionDropdown(null);
                            }}
                          >
                            <FiUserMinus /> {text.addAdmin}
                          </button>
                          <button
                            onClick={() => {
                              const admins: User[] = employees.filter(
                                (e) =>
                                  e.role === "admin" &&
                                  e.department?.id === dept.id
                              );
                              const optionAdmins = optionEmployees(admins);
                              setDeleteAdmin(optionAdmins);
                              setDeleteAdminPanel(true);
                              setActionDropdown(null);
                            }}
                          >
                            <FiUserMinus /> {text.deleteAdmin}
                          </button>
                          <button
                            onClick={() => {
                              setDeleteDept(dept);
                              setActionDropdown(null);
                            }}
                          >
                            <FiTrash2 /> {text.deleteDept}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Form Panel */}
      {addEditDept && (
        <div className="overlay">
          <div className={styles.addEditDept}>
            <button
              onClick={closeAddEditPanel}
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
            <h2>{editingDept ? text.editDept : text.addDept}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Department</label>
                <input
                  type="text"
                  value={deptForm.nameEn}
                  onChange={(e) => {
                    setDeptForm({ ...deptForm, nameEn: e.target.value });
                    setDeptError({ ...deptError, nameEn: "" });
                  }}
                  placeholder="department name"
                  className={styles.input}
                />
              </div>
              {deptError.nameEn && (
                <div className={styles.error}>{deptError.nameEn}</div>
              )}
              <div className={styles.formGroup}>
                <label>ፅህፈት ቤት</label>
                <input
                  type="text"
                  value={deptForm.nameAm}
                  onChange={(e) => {
                    setDeptForm({ ...deptForm, nameAm: e.target.value });
                    setDeptError({ ...deptError, nameAm: "" });
                  }}
                  placeholder="ፅህፈት ቤት ስም"
                  className={styles.input}
                />
              </div>
              {deptError.nameAm && (
                <div className={styles.error}>{deptError.nameAm}</div>
              )}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={closeAddEditPanel}
                >
                  {text.cancel}
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingDept ? text.update : text.save}
                </button>
              </div>
            </form>
            {showSuccessMessage && (
              <>
                <div className="successMessageWrapper">
                  <div className="successMessage">
                    {editingDept ? text.editMessage : text.addMessage}
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
      {/* Add Admin Modal */}
      {addAdminPanel && (
        <div className="overlay">
          <div className={styles.addAdmin}>
            <button
              onClick={closeAddAdminPanel}
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
            <h2>{text.addAdmin}</h2>
            {addAdmin == null || addAdmin.length < 1 ? (
              <div className={styles.noFoundMessage}>{text.noEmployee}</div>
            ) : (
              <form className={styles.form} onSubmit={handleAddAdminSubmit}>
                <div className={styles.formGroup}>
                  <label>{text.selectEmployee}</label>
                  <Select
                    options={addAdmin || undefined}
                    isSearchable
                    value={addAdminForm}
                    onChange={(option) => {
                      setAddAdminForm(option);
                      setAddAdminError("");
                    }}
                    placeholder={text.search}
                    className={styles.selectContainer}
                    classNamePrefix="select"
                  />
                </div>
                {addAdminError && (
                  <div className={styles.error}>{addAdminError}</div>
                )}
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={closeAddAdminPanel}
                  >
                    {text.cancel}
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    {text.save}
                  </button>
                </div>
              </form>
            )}
            {showSuccessMessage && (
              <>
                <div className="successMessageWrapper">
                  <div className="successMessage">{text.addMessage}</div>
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
      {/* Delete Admin Modal */}
      {deleteAdminPanel && (
        <div className="overlay">
          <div className={styles.deleteAdmin}>
            <button
              onClick={closeDeleteAdminPanel}
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
            <h2>{text.deleteAdmin}</h2>
            {deleteAdmin == null || deleteAdmin.length < 1 ? (
              <div className={styles.noFoundMessage}>{text.noAdmin}</div>
            ) : (
              <form className={styles.form} onSubmit={handleDeleteAdminSubmit}>
                <div className={styles.formGroup}>
                  <label>{text.selectAdmin}</label>
                  <Select
                    options={deleteAdmin || undefined}
                    isSearchable
                    value={deleteAdminForm}
                    onChange={(option) => {
                      setDeleteAdminForm(option);
                      setDeleteAdminError("");
                    }}
                    placeholder={text.search}
                    className={styles.selectContainer}
                    classNamePrefix="select"
                  />
                </div>
                {deleteAdminError && (
                  <div className={styles.error}>{deleteAdminError}</div>
                )}
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={closeDeleteAdminPanel}
                  >
                    {text.cancel}
                  </button>
                  <button type="submit" className={styles.deleteBtn}>
                    {text.delete}
                  </button>
                </div>
              </form>
            )}
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
      {/*delete department*/}
      {deleteDept && (
        <div className="overlay">
          <div className={styles.deleteDept}>
            <button
              onClick={() => {
                setDeleteDept(null);
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
            {employees.filter((e) => e.department?.id === deleteDept.id)
              .length > 0 || departments.length < 2 ? (
              departments.length < 2 ? (
                <h2 className={styles.preventDelete}>{text.oneDeptLeft}</h2>
              ) : (
                <h2 className={styles.preventDelete}>{text.preventDelete}</h2>
              )
            ) : (
              <form className={styles.form} onSubmit={handleDeleteDeptSubmit}>
                {lang === "en" ? (
                  <div>
                    {text.deleteDeptWarning}
                    {deleteDept.name[lang]}?
                  </div>
                ) : (
                  <div>
                    {deleteDept.name[lang]}
                    {text.deleteDeptWarning}
                  </div>
                )}
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => {
                      setDeleteDept(null);
                    }}
                  >
                    {text.no}
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    {text.yes}
                  </button>
                </div>
              </form>
            )}
            {showSuccessMessage && (
              <>
                <div className="successMessageWrapper">
                  <div className="successMessage">{text.deleteMessage}</div>
                </div>
                <div
                  className={styles.overlay}
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
      {/* Move Employee Modal */}
      {moveEmployeePanel && (
        <div className="overlay">
          <div className={styles.moveEmployee}>
            <button
              onClick={closeMoveEmployeePanel}
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
            <h2>{text.moveEmoployee}</h2>

            {deptOptions == null || deptOptions.length < 1 ? (
              <div className={styles.noFoundMessage}>{text.noDept}</div>
            ) : (
              <>
                <div className={styles.formGroup}>
                  <label>{text.name}</label>
                  <div>{moveEmployee && moveEmployee.name[lang]}</div>
                </div>
                <div className={styles.formGroup}>
                  <label>{text.from}</label>
                  <div>{prevDept && prevDept.name[lang]}</div>
                </div>
                <form
                  className={styles.form}
                  onSubmit={handleMoveEmployeeSubmit}
                >
                  <div className={styles.formGroup}>
                    <label>{text.selectDept}</label>
                    <Select
                      options={deptOptions || undefined}
                      value={moveEmployeeForm}
                      placeholder={text.search}
                      isSearchable={true}
                      onChange={(option) => {
                        setMoveEmployeeForm(option);
                        setMoveEmployeeError("");
                      }}
                      className={styles.selectContainer}
                      classNamePrefix="select"
                    />
                  </div>
                  {moveEmployeeError && (
                    <div className={styles.error}>{moveEmployeeError}</div>
                  )}
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={closeMoveEmployeePanel}
                    >
                      {text.cancel}
                    </button>
                    <button type="submit" className={styles.saveBtn}>
                      {text.move}
                    </button>
                  </div>
                </form>
              </>
            )}
            {showSuccessMessage && (
              <>
                <div className="successMessageWrapper">
                  <div className="successMessage">{text.transferMessage}</div>
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
