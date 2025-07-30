import { useState } from "react";
import SearchBar from "./searchBar";
import amService from "../locates/amharic/service.json";
import enService from "../locates/english/service.json";
import { useLang } from "../hooks/useLang";
import styles from "../styles/services.module.css";
interface Activity {
  id: number;
  name: string;
}

interface SubService {
  id: number;
  name: string;
  activities: Activity[];
}

interface MainService {
  id: number;
  name: string;
  subServices: SubService[];
}

const services: MainService[] = [
  {
    id: 1,
    name: "Service A",
    subServices: [
      {
        id: 101,
        name: "Sub Service A1",
        activities: [
          { id: 1001, name: "Activity A1-1" },
          { id: 1002, name: "Activity A1-2" },
        ],
      },
      {
        id: 102,
        name: "Sub Service A2",
        activities: [{ id: 1003, name: "Activity A2-1" }],
      },
    ],
  },

  {
    id: 2,
    name: "Service B",
    subServices: [
      {
        id: 201,
        name: "Sub Service B1",
        activities: [{ id: 2001, name: "Activity B1-1" }],
      },
    ],
  },
];
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
export default function Services() {
  const { lang, setLang } = useLang();
  const translate = {
    am: amService,
    en: enService,
  };
  const text = translate[lang];
  const [searchQuery, setSearchQuery] = useState("");
  const [openMain, setOpenMain] = useState<number | null>(null);
  const [openSub, setOpenSub] = useState<number | null>(null);

  const toggleMain = (id: number) => {
    setOpenMain(openMain === id ? null : id);
    setOpenSub(null);
  };

  const toggleSub = (id: number) => {
    setOpenSub(openSub === id ? null : id);
  };
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <button className={styles.btn}>{text.add}</button>
      </div>
      <div className={styles.displayArea}>
        {filteredServices.map((main) => (
          <div key={main.id} className={styles.mainService}>
            <button
              onClick={() => toggleMain(main.id)}
              className={styles.mainButton}
              aria-expanded={openMain === main.id}
              aria-controls={`main-${main.id}`}
            >
              <ArrowIcon open={openMain === main.id} />
              <span className={styles.mainText}>{main.name}</span>
            </button>

            {openMain === main.id && (
              <div
                id={`main-${main.id}`}
                className={styles.subServicesContainer}
              >
                <div className={styles.subServiceTitle}>{text.subservice}</div>
                {main.subServices.map((sub) => (
                  <div key={sub.id} className={styles.subService}>
                    <button
                      onClick={() => toggleSub(sub.id)}
                      className={styles.subButton}
                      aria-expanded={openSub === sub.id}
                      aria-controls={`sub-${sub.id}`}
                    >
                      <ArrowIcon open={openSub === sub.id} />
                      <span className={styles.subText}>{sub.name}</span>
                    </button>

                    {openSub === sub.id && (
                      <ul
                        id={`sub-${sub.id}`}
                        className={styles.activitiesList}
                      >
                        {sub.activities.map((act) => (
                          <li key={act.id} className={styles.activityItem}>
                            {act.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
