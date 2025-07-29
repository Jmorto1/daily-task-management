import { MdMiscellaneousServices } from "react-icons/md";
import {
  FaTasks,
  FaUserTie,
  FaUsers,
  FaFileAlt,
  FaInfoCircle,
  FaEdit,
  FaKey,
  FaSignOutAlt,
} from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import amAdmin from "../locates/amharic/dashboard.json";
import enAdmin from "../locates/english/dashboard.json";
import styles from "../styles/dashboard.module.css";
import Language from "../components/languages";
import { useLang } from "../hooks/useLang";
import EditInfo from "../components/editInfo";
import About from "../components/about";
import ChangePassword from "../components/changePassword";
import { useIsMoblie } from "../hooks/useIsMobile";
import { useIsOpen } from "../hooks/useIsOpen";
export default function Dashboard() {
  const navigate = useNavigate();
  const [toggleDropdown, setToggleDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [activeView, setActiveView] = useState<string>("services");
  const prevView = useRef(activeView);
  const excludeFromHistory = ["changePassword", "editInfo"];
  const isMobile = useIsMoblie();
  const navlistRef = useRef<HTMLDivElement>(null);
  const { isOpen, setIsOpen } = useIsOpen(navlistRef);
  const { lang, setLang } = useLang();
  const translate = {
    am: amAdmin,
    en: enAdmin,
  };
  const text = translate[lang];
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!excludeFromHistory.includes(activeView)) {
      prevView.current = activeView;
    }
  }, [activeView]);
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setToggleDropdown(false);
      }
    };
    const handleScroll = () => {
      setToggleDropdown(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, []);
  return (
    <div className={styles.dashboardPage}>
      <div className={styles.menu}>
        <div className={styles.menuHeader}>
          <div className={styles.logoImage}></div>
          <div className={styles.name}>{text.city}</div>
        </div>
        {isMobile && (
          <div className={styles.menuToggle}>
            {!isOpen && (
              <button
                onClick={() => {
                  setIsOpen(true);
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
            {isOpen && (
              <button
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}
        {(isOpen || !isMobile) && (
          <div className={styles.menuList} ref={navlistRef}>
            <nav className={styles.menuListNav}>
              <ul>
                <li>
                  <MdMiscellaneousServices className={styles.icons} />
                  {text.service}
                </li>
                <li>
                  <FaTasks className={styles.icons} />
                  {text.myjob}
                </li>
                <li>
                  <FaUserTie className={styles.icons} /> {text.groupLeader}
                </li>
                <li>
                  <FaUsers className={styles.icons} />
                  {text.allGroups}
                </li>
                <li>
                  <FaFileAlt className={styles.icons} />
                  {text.reports}
                </li>
                <li
                  onClick={() => {
                    setActiveView("about");
                  }}
                  className={activeView === "about" ? styles.activebtn : ""}
                >
                  <FaInfoCircle className={styles.icons} />
                  {text.about}
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
      <div className={styles.contentArea}>
        <div className={styles.Header}>
          <div className={styles.HeaderTitle}>{text.headerTitle}</div>
          <Language />
          <div className={styles.avatorContainer} ref={profileRef}>
            <div
              className={styles.avatorWrapper}
              onClick={() => {
                setToggleDropdown((prevState) => !prevState);
              }}
            >
              <div className={styles.avator}>A</div>
            </div>
            {toggleDropdown && (
              <div className={styles.profileDropdown}>
                <div className={styles.avator}>A</div>
                <div className={styles.role}>Admin</div>
                <ul>
                  <li
                    onClick={() => {
                      setActiveView("editInfo");
                      setToggleDropdown(false);
                    }}
                  >
                    <FaEdit className={styles.icons} />
                    {text.editInfo}
                  </li>
                  <li
                    onClick={() => {
                      setActiveView("changePassword");
                      setToggleDropdown(false);
                    }}
                  >
                    <FaKey className={styles.icons} />
                    {text.changePassword}
                  </li>
                  <li
                    onClick={() => {
                      navigate("login" /*,{replace:true}*/);
                    }}
                  >
                    <FaSignOutAlt className={styles.icons} />
                    {text.logOut}
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className={styles.displayArea}>
          {activeView === "changePassword" && (
            <ChangePassword onClose={() => setActiveView(prevView.current)} />
          )}
          {activeView === "editInfo" && (
            <EditInfo
              prevView={prevView.current}
              setActiveView={setActiveView}
            />
          )}
          {activeView === "about" && <About />}
          {activeView === "about" && <About />}
          {activeView === "about" && <About />}
          {activeView === "about" && <About />}
          {activeView === "about" && <About />}
          {activeView === "about" && <About />}
          {activeView === "about" && <About />}
          {activeView === "about" && <About />}
          {activeView === "about" && <About />}
        </div>
      </div>
    </div>
  );
}
