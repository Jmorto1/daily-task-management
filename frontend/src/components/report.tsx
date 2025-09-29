import TaskReport from "./subComponent/tasksReport";
import styles from "../styles/report.module.css";
import { FaUsers, FaUser } from "react-icons/fa";
import Select, { type SingleValue } from "react-select";
import { useLang } from "../hooks/useLang";
import { useState } from "react";
import { useAppData } from "../hooks/useAppData";

type teamUser = {
  type: "user" | "team" | "all";
  id: number;
  name: {
    en: string;
    am: string;
  };
};
export type TeamUserOption = {
  value: teamUser;
  label: string;
};
const parent = "report";

export default function Report() {
  const { employees, teams, user } = useAppData();
  const { lang } = useLang();

  const optionTeam: TeamUserOption[] =
    user.role === "admin"
      ? teams.map((team) => ({
          value: { type: "team", id: team.id, name: team.name },
          label: team.name[lang],
        }))
      : employees.map((emp) => ({
          value: { type: "user", id: emp.id, name: emp.name },
          label: emp.name[lang],
        }));

  optionTeam.unshift({
    value: { type: "all", id: 0, name: { en: "All", am: "ሁሉም" } },
    label: lang === "en" ? "All" : "ሁሉም",
  });
  const [selectedTeamUser, setSelectedTeamUser] =
    useState<TeamUserOption | null>(optionTeam[0]);
  const teamTitle = lang === "en" ? "Teams Report" : "የቡድን ሪፖርት";
  const memberTitle = lang === "en" ? "Team Members Report" : "የቡድን አባላት ሪፖርት";
  const TeamSelectLabel = lang === "en" ? "Select Team:" : "ቡድን ምረጥ:";
  const MemberSelectLabel = lang === "en" ? "Select Member:" : "የቡድን አባል ምረጥ:";
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titlewrapper}>
          {user.role === "admin" ? (
            <FaUsers size={32} className={styles.icon} />
          ) : (
            <FaUser size={32} className={styles.icon} />
          )}
          <h2 className={styles.title}>
            {user.role === "admin" ? teamTitle : memberTitle}
          </h2>
        </div>
        <div className={styles.teamSelectWrapper}>
          <label htmlFor="teams" className={styles.label}>
            {user.role === "admin" ? TeamSelectLabel : MemberSelectLabel}
          </label>
          <Select
            name="teams"
            id="teams"
            className={styles.select}
            classNamePrefix="select"
            options={optionTeam}
            value={selectedTeamUser}
            isSearchable
            onChange={(option: SingleValue<TeamUserOption>) =>
              setSelectedTeamUser(option)
            }
          />
        </div>
      </div>
      <div className={styles.reportContent}>
        <TaskReport parent={parent} selectedTeamUser={selectedTeamUser} />
      </div>
    </div>
  );
}
