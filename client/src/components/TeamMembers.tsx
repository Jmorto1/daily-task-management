import React, { useState } from "react";
import styles from "../styles/employee.module.css";

interface Member {
  id: number;
  fullName: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  profession: string;
  services: string[];
}

const allServices = ["Service A", "Service B", "Service C", "Service D"];
const allGenders = ["Male", "Female"];
const allProfessions = [
  "Developer",
  "Designer",
  "Manager",
  "Analyst",
  "Tester",
];

const initialMembers: Member[] = [
  {
    id: 1,
    fullName: "John Doe",
    phone: "1234567890",
    gender: "Male",
    profession: "Manager",
    services: ["Service A", "Service B"],
  },
  {
    id: 2,
    fullName: "Jane Smith",
    phone: "9876543210",
    gender: "Female",
    profession: "Developer",
    services: ["Service C"],
  },
  {
    id: 3,
    fullName: "Alice Johnson",
    phone: "5555555555",
    gender: "Female",
    profession: "Designer",
    services: [],
  },
];

export default function TeamMembers() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [assignId, setAssignId] = useState<number | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showServicesId, setShowServicesId] = useState<number | null>(null);

  // Assign Services
  const startAssign = (id: number) => {
    const member = members.find((m) => m.id === id);
    if (member) {
      setAssignId(id);
      setSelectedServices([]);
    }
  };
  const saveAssign = () => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === assignId
          ? { ...m, services: [...m.services, ...selectedServices] }
          : m
      )
    );
    setAssignId(null);
  };
  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  // View & Delete Services
  const deleteServiceFromMember = (service: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === showServicesId
          ? { ...m, services: m.services.filter((s) => s !== service) }
          : m
      )
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Team Members</h2>
      <div className={styles.employeeTable}>
        <div className={styles.tableHeader}>
          <div>Full Name</div>
          <div>Phone</div>
          <div>Gender</div>
          <div>Profession</div>
          <div>Actions</div>
        </div>
        {members.map((member) => (
          <div key={member.id} className={styles.tableRow}>
            <div>{member.fullName}</div>
            <div>{member.phone}</div>
            <div>{member.gender}</div>
            <div>{member.profession}</div>
            <div className={styles.actions}>
              <button
                className={styles.editBtn}
                onClick={() => startAssign(member.id)}
              >
                Assign Service
              </button>
              <button
                className={styles.viewBtn}
                onClick={() => setShowServicesId(member.id)}
              >
                View Services
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Assign Services Modal */}
      {assignId && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeBtn}
              onClick={() => setAssignId(null)}
            >
              &times;
            </button>
            <h3>Assign Services</h3>
            <div className={styles.serviceList}>
              {(() => {
                const member = members.find((m) => m.id === assignId);
                const assigned = member ? member.services : [];
                const unassigned = allServices.filter(
                  (s) => !assigned.includes(s)
                );
                const uniqueUnassigned = Array.from(new Set(unassigned));
                return uniqueUnassigned.length ? (
                  uniqueUnassigned.map((service) => (
                    <label key={service} className={styles.serviceBar}>
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service)}
                        onChange={() => toggleService(service)}
                      />
                      {service}
                    </label>
                  ))
                ) : (
                  <p className={styles.noService}>All services assigned</p>
                );
              })()}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.saveBtn} onClick={saveAssign}>
                Save
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setAssignId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Services Modal */}
      {showServicesId && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeBtn}
              onClick={() => setShowServicesId(null)}
            >
              &times;
            </button>
            <h3>Assigned Services</h3>
            <div className={styles.serviceListView}>
              {members.find((m) => m.id === showServicesId)?.services.length ? (
                members
                  .find((m) => m.id === showServicesId)
                  ?.services.map((s) => (
                    <div key={s} className={styles.serviceBarView}>
                      <span>{s}</span>
                      <button
                        className={styles.deleteServiceBtn}
                        onClick={() => deleteServiceFromMember(s)}
                        title="Delete Service"
                      >
                        &times;
                      </button>
                    </div>
                  ))
              ) : (
                <p className={styles.noService}>No services assigned</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
