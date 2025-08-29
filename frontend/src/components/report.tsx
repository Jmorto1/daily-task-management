import TaskReport from "./subComponent/tasksReport";
import styles from "../styles/report.module.css";
import { FaUsers, FaUser } from "react-icons/fa";
import Select, { type SingleValue } from "react-select";
import { useLang } from "../hooks/useLang";
import { useEffect, useState } from "react";
import { useAppData } from "../hooks/useAppData";

type teamUser = {
  id: string;
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
const teams: teamUser[] = [
  {
    id: "1",
    name: { en: "Software Development Team", am: "የሶፍትዌር ልማት ቡድን" },
  },
  {
    id: "2",
    name: { en: "Database Management Team", am: "የዳታቤዝ አስተዳደር ቡድን" },
  },
  {
    id: "3",
    name: { en: "Network Installation Team", am: "የኔትዎርክ መግጠሚያ ቡድን" },
  },
  {
    id: "4",
    name: {
      en: "System Maintenance and Repair Team",
      am: "የስርዓት ጥገና እና እድሳት ቡድን",
    },
  },
  {
    id: "5",
    name: {
      en: "Cybersecurity and IT Support Team",
      am: "የሳይበር ደህንነት እና አይቲ ድጋፍ ቡድን",
    },
  },
];

export default function Report({ preview }: { preview: string }) {
  const { lang, setLang } = useLang();

  const optionTeam: TeamUserOption[] = teams.map((team) => ({
    value: team,
    label: team.name[lang],
  }));
  optionTeam.unshift({
    value: { id: "all", name: { en: "All", am: "ሁሉም" } },
    label: lang === "en" ? "All" : "ሁሉም",
  });
  const [selectedTeamUser, setSelectedTeamUser] =
    useState<TeamUserOption | null>(optionTeam[0]);
  const { user, setUser } = useAppData();
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
        <TaskReport
          preview={preview}
          parent={parent}
          selectedTeamUser={selectedTeamUser}
        />
      </div>
    </div>
  );
}
