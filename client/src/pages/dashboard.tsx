import { MdMiscellaneousServices } from "react-icons/md";
import {
  FaBuilding,
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
import amDashboard from "../locates/amharic/dashboard.json";
import enDashboard from "../locates/english/dashboard.json";
import styles from "../styles/dashboard.module.css";
import Language from "../components/subComponent/languages";
import { useLang } from "../hooks/useLang";
import DepartmentManagement from "../components/departmentManagement";
import EditInfo from "../components/editInfo";
import About from "../components/about";
import Services from "../components/services";
import Employee from "../components/employee.";
import MyTasks from "../components/myTask";
import ChangePassword from "../components/changePassword";
import Report from "../components/report";
import AllTeams from "../components/allTeams";
import TeamMembers from "../components/TeamMembers";
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
  const navlistRef = useRef<HTMLDivElement | null>(null);
  const { isOpen, setIsOpen } = useIsOpen(navlistRef);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { lang, setLang } = useLang();
  const translate = {
    am: amDashboard,
    en: enDashboard,
  };
  const text = translate[lang];
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      alert("Only image files are allowed!");
      return;
    }

    setImage(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };
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
                <li
                  onClick={() => {
                    setActiveView("departments");
                  }}
                  className={
                    activeView === "departments" ? styles.activebtn : ""
                  }
                >
                  <FaBuilding className={styles.icons} />
                  {text.department}
                </li>
                <li
                  onClick={() => {
                    setActiveView("services");
                  }}
                  className={activeView === "services" ? styles.activebtn : ""}
                >
                  <MdMiscellaneousServices className={styles.icons} />
                  {text.service}
                </li>
                <li
                  onClick={() => {
                    setActiveView("myTasks");
                  }}
                  className={activeView === "myTasks" ? styles.activebtn : ""}
                >
                  <FaTasks className={styles.icons} />
                  {text.myTask}
                </li>
                <li
                  onClick={() => {
                    setActiveView("allTeams");
                  }}
                  className={activeView === "allTeams" ? styles.activebtn : ""}
                >
                  <FaUsers className={styles.icons} />
                  {text.allTeams}
                </li>
                <li
                  onClick={() => {
                    setActiveView("teamMembers");
                  }}
                  className={
                    activeView === "teamMembers" ? styles.activebtn : ""
                  }
                >
                  <FaUserTie className={styles.icons} />
                  {text.teamMember}
                </li>
                <li
                  onClick={() => {
                    setActiveView("report");
                  }}
                  className={activeView === "report" ? styles.activebtn : ""}
                >
                  <FaFileAlt className={styles.icons} />
                  {text.reports}
                </li>
                <li
                  onClick={() => {
                    setActiveView("employee");
                  }}
                  className={activeView === "employee" ? styles.activebtn : ""}
                >
                  <FaUserTie className={styles.icons} /> {text.employees}
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
              <div
                className={styles.profile}
                style={{
                  backgroundImage: preview ? `url(${preview})` : undefined,
                }}
              >
                {!preview && <div>A</div>}
              </div>
            </div>
            {toggleDropdown && (
              <div className={styles.profileDropdown}>
                <div className={styles.profileHandler}>
                  <div
                    className={styles.profile}
                    style={{
                      backgroundImage: preview ? `url(${preview})` : undefined,
                    }}
                  >
                    {!preview && <div>A</div>}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={inputRef}
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                    <button
                      onClick={() => {
                        inputRef.current?.click();
                      }}
                      className={styles.uploadButton}
                      title={
                        preview
                          ? "Change Profile Picture"
                          : "Upload Profile Picture"
                      }
                    >
                      <span>+</span>
                    </button>
                  </div>
                </div>
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
          {activeView === "departments" && <DepartmentManagement />}
          {activeView === "services" && <Services />}
          {activeView === "myTasks" && <MyTasks preview={preview} />}
          {activeView === "allTeams" && <AllTeams />}
          {activeView === "teamMembers" && <TeamMembers />}
          {activeView === "report" && <Report preview={preview} />}
          {activeView === "employee" && <Employee />}
          {activeView === "about" && <About preview={preview} />}
        </div>
      </div>
    </div>
  );
}
