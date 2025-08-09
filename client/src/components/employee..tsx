import React, { useState } from "react";
import styles from "../styles/employee.module.css";
import { useIsMoblie } from "../hooks/useIsMobile";
interface Employee {
  id: number;
  fullName: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  team: string;
  profession: string;
}

interface PendingEmployee {
  id: number;
  fullName: string;
  phone: string;
}

const allTeams = ["Sales", "Marketing", "Support", "Development", "HR"];
const allProfessions = [
  "Developer",
  "Designer",
  "Manager",
  "Analyst",
  "Tester",
];
const allGenders = ["Male", "Female", "Other"];

const initialEmployees: Employee[] = [
  {
    id: 1,
    fullName: "John Doe",
    phone: "1234567890",
    gender: "Male",
    team: "Sales",
    profession: "Manager",
  },
  {
    id: 2,
    fullName: "Jane Smith",
    phone: "9876543210",
    gender: "Female",
    team: "Development",
    profession: "Developer",
  },
  {
    id: 3,
    fullName: "Alice Johnson",
    phone: "5555555555",
    gender: "Female",
    team: "Marketing",
    profession: "Designer",
  },
  {
    id: 1,
    fullName: "John Doe",
    phone: "1234567890",
    gender: "Male",
    team: "Sales",
    profession: "Manager",
  },
  {
    id: 2,
    fullName: "Jane Smith",
    phone: "9876543210",
    gender: "Female",
    team: "Development",
    profession: "Developer",
  },
  {
    id: 3,
    fullName: "Alice Johnson",
    phone: "5555555555",
    gender: "Female",
    team: "Marketing",
    profession: "Designer",
  },
  {
    id: 1,
    fullName: "John Doe",
    phone: "1234567890",
    gender: "Male",
    team: "Sales",
    profession: "Manager",
  },
  {
    id: 2,
    fullName: "Jane Smith",
    phone: "9876543210",
    gender: "Female",
    team: "Development",
    profession: "Developer",
  },
  {
    id: 3,
    fullName: "Alice Johnson",
    phone: "5555555555",
    gender: "Female",
    team: "Marketing",
    profession: "Designer",
  },
  {
    id: 1,
    fullName: "John Doe",
    phone: "1234567890",
    gender: "Male",
    team: "Sales",
    profession: "Manager",
  },
  {
    id: 2,
    fullName: "Jane Smith",
    phone: "9876543210",
    gender: "Female",
    team: "Development",
    profession: "Developer",
  },
  {
    id: 3,
    fullName: "Alice Johnson",
    phone: "5555555555",
    gender: "Female",
    team: "Marketing",
    profession: "Designer",
  },
  {
    id: 1,
    fullName: "John Doe",
    phone: "1234567890",
    gender: "Male",
    team: "Sales",
    profession: "Manager",
  },
  {
    id: 2,
    fullName: "Jane Smith",
    phone: "9876543210",
    gender: "Female",
    team: "Development",
    profession: "Developer",
  },
  {
    id: 3,
    fullName: "Alice Johnson",
    phone: "5555555555",
    gender: "Female",
    team: "Marketing",
    profession: "Designer",
  },
];

const initialPending: PendingEmployee[] = [
  { id: 101, fullName: "Pending One", phone: "1111111111" },
  { id: 102, fullName: "Pending Two", phone: "2222222222" },
];

export default function EmployeeManager() {
  const isMobile = useIsMoblie(640);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [pending, setPending] = useState<PendingEmployee[]>(initialPending);
  const [showPending, setShowPending] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [tempTeam, setTempTeam] = useState<string>("");
  const [approvingId, setApprovingId] = useState<number | null>(null);

  // Approve form state
  const [approveGender, setApproveGender] = useState<string>(allGenders[0]);
  const [approveTeam, setApproveTeam] = useState<string>(allTeams[0]);
  const [approveProfession, setApproveProfession] = useState<string>("");

  // Start editing team for existing employee
  const startEditing = (id: number, team: string) => {
    setEditId(id);
    setTempTeam(team);
  };
  const cancelEditing = () => setEditId(null);
  const saveEditing = () => {
    if (editId !== null) {
      setEmployees((emps) =>
        emps.map((e) => (e.id === editId ? { ...e, team: tempTeam } : e))
      );
    }
    setEditId(null);
  };

  // Start approving pending employee
  const startApproving = (id: number) => {
    const pendEmp = pending.find((p) => p.id === id);
    if (!pendEmp) return;
    setApprovingId(id);
    setApproveGender(allGenders[0]);
    setApproveTeam(allTeams[0]);
    setApproveProfession("");
  };

  // Cancel approve form
  const cancelApproving = () => setApprovingId(null);

  // Confirm approve and add to employees
  const confirmApprove = () => {
    if (approvingId === null) return;
    const pendEmp = pending.find((p) => p.id === approvingId);
    if (!pendEmp) return;

    const newEmp: Employee = {
      id: Date.now(),
      fullName: pendEmp.fullName,
      phone: pendEmp.phone,
      gender: approveGender as Employee["gender"],
      team: approveTeam,
      profession: approveProfession || "Unknown",
    };

    setEmployees([...employees, newEmp]);
    setPending(pending.filter((p) => p.id !== approvingId));
    setApprovingId(null);
  };

  // Delete pending employee
  const deletePending = (id: number) => {
    if (approvingId === id) setApprovingId(null);
    setPending(pending.filter((p) => p.id !== id));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>All Employees</h2>

      {pending.length > 0 && (
        <>
          <button
            className={styles.pendingBtn}
            onClick={() => setShowPending(!showPending)}
            aria-expanded={showPending}
            aria-label="Toggle pending employees list"
          >
            Pending Employees
            <span className={styles.badge}>{pending.length}</span>
          </button>

          {showPending && (
            <div className={styles.pendingList}>
              {pending.map((p) => (
                <div key={p.id} className={styles.pendingItem}>
                  {approvingId === p.id ? (
                    <div className={styles.approveForm}>
                      <div>
                        <label>Full Name:</label>
                        <input type="text" value={p.fullName} readOnly />
                      </div>
                      <div>
                        <label>Phone:</label>
                        <input type="text" value={p.phone} readOnly />
                      </div>
                      <div>
                        <label>Gender:</label>
                        <select
                          value={approveGender}
                          onChange={(e) => setApproveGender(e.target.value)}
                        >
                          {allGenders.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>Team:</label>
                        <select
                          value={approveTeam}
                          onChange={(e) => setApproveTeam(e.target.value)}
                        >
                          {allTeams.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>Profession:</label>
                        <input
                          type="text"
                          value={approveProfession}
                          onChange={(e) => setApproveProfession(e.target.value)}
                          placeholder="Enter profession"
                        />
                      </div>
                      <div className={styles.approveFormActions}>
                        <button
                          className={styles.approveBtn}
                          onClick={confirmApprove}
                        >
                          Approve
                        </button>
                        <button
                          className={styles.cancelBtn}
                          onClick={cancelApproving}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.pendingContainer}>
                      <div className={styles.column}>
                        <div className={styles.header}>Name:</div>
                        <div> {p.fullName}</div>
                      </div>
                      <div className={styles.column}>
                        <div className={styles.header}>Phone number:</div>
                        <div>{p.phone}</div>
                      </div>
                      <div
                        className={`${styles.pendingActions} ${styles.column}`}
                      >
                        <button
                          className={styles.approveBtn}
                          onClick={() => startApproving(p.id)}
                          aria-label={`Approve ${p.fullName}`}
                        >
                          Approve
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => deletePending(p.id)}
                          aria-label={`Delete ${p.fullName}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <div className={styles.employeeTable}>
        {!isMobile && (
          <div className={styles.tableHeader}>
            <div>Full Name</div>
            <div>Phone</div>
            <div>Gender</div>
            <div>Team</div>
            <div>Profession</div>
            <div>Actions</div>
          </div>
        )}
        {employees.map((emp) => (
          <div key={emp.id} className={styles.tableRow}>
            {isMobile ? (
              <>
                <div>
                  <div>Full Name</div>
                  <div>{emp.fullName}</div>
                </div>
                <div>
                  <div>Phone</div>
                  <div>{emp.phone}</div>
                </div>
                <div>
                  <div>Gender</div>
                  <div>{emp.gender}</div>
                </div>
                <div>
                  <div>Team</div>
                  <div>
                    {editId === emp.id ? (
                      <select
                        value={tempTeam}
                        onChange={(e) => setTempTeam(e.target.value)}
                        className={styles.select}
                      >
                        {allTeams.map((team) => (
                          <option key={team} value={team}>
                            {team}
                          </option>
                        ))}
                      </select>
                    ) : (
                      emp.team
                    )}
                  </div>
                </div>
                <div>
                  <div>Profession</div>
                  <div>{emp.profession}</div>
                </div>
              </>
            ) : (
              <>
                <div>{emp.fullName}</div>
                <div>{emp.phone}</div>
                <div>{emp.gender}</div>
                <div>
                  {editId === emp.id ? (
                    <select
                      value={tempTeam}
                      onChange={(e) => setTempTeam(e.target.value)}
                      className={styles.select}
                    >
                      {allTeams.map((team) => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>
                  ) : (
                    emp.team
                  )}
                </div>
                <div>{emp.profession}</div>
              </>
            )}
            <div className={styles.actions}>
              {editId === emp.id ? (
                <>
                  <button onClick={saveEditing} className={styles.saveBtn}>
                    Save
                  </button>
                  <button onClick={cancelEditing} className={styles.cancelBtn}>
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startEditing(emp.id, emp.team)}
                  className={styles.editBtn}
                  aria-label={`Edit team for ${emp.fullName}`}
                >
                  Edit Team
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
