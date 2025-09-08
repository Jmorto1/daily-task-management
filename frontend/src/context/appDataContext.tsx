import { useEffect, useState, createContext } from "react";
import type { ReactNode } from "react";
export type Department = {
  id: number;
  name: {
    am: string;
    en: string;
  };
};
export type Team = {
  id: number;
  name: {
    am: string;
    en: string;
  };
  department_id: number;
};
export type User = {
  id: number;
  name: {
    am: string;
    en: string;
  };
  role: "admin" | "user" | "teamLeader" | "sysAdmin" | "";
  gender: {
    am: string;
    en: string;
  };
  office: {
    am: string;
    en: string;
  };
  profession: {
    am: string;
    en: string;
  };
  phone_number: string;
  department: Department | null;
  team: Team | null;
  profile: File | null;
  status?: "user" | "pending";
};

type AppDataContextType = {
  emptyUser: User;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  employees: User[];
  setEmployees: React.Dispatch<React.SetStateAction<User[]>>;
  pendingEmployees: User[];
  setPendingEmployees: React.Dispatch<React.SetStateAction<User[]>>;
  isLoggedIn: boolean;
  loading: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  serverAddress: string;
  profileImage: string;
};

export const AppDataContext = createContext<AppDataContextType | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const emptyUser: User = {
    id: 0,
    name: {
      am: "",
      en: "",
    },
    role: "",
    gender: {
      am: "",
      en: "",
    },
    office: {
      am: "",
      en: "",
    },
    profession: {
      am: "",
      en: "",
    },
    phone_number: "",
    department: null,
    team: null,
    profile: null,
  };
  const [user, setUser] = useState<User>(emptyUser);
  const [profileImage, setProfileImage] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [pendingEmployees, setPendingEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const serverAddress = "http://10.243.121.154:8000";

  // fetch loggedin user and departments
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch(`${serverAddress}/users/me/`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setIsLoggedIn(true);
        }
      } catch (error) {}
    }
    async function fetchDepartments() {
      try {
        const response = await fetch(`${serverAddress}/departments/`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setDepartments(data);
        }
      } catch (error) {
        console.error("catch Error:", error);
      }
    }
    fetchDepartments();
    fetchCurrentUser();

    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);
  // fetch appData
  useEffect(() => {
    if (isLoggedIn) {
      async function fetchEmployees() {
        try {
          const response = await fetch(`${serverAddress}/users/`, {
            method: "GET",
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setEmployees(data.filter((e: User) => e.status === "user"));
            setPendingEmployees(
              data.filter((e: User) => e.status === "pending")
            );
          }
        } catch (error) {
          console.error("error:", error);
        }
      }
      async function fetchTeams() {
        if (user.role === "admin" && user.department) {
          try {
            const response = await fetch(
              `${serverAddress}/teams/?department_id=${user.department.id}`,
              {
                method: "GET",
                credentials: "include",
              }
            );
            if (response.ok) {
              const data = await response.json();
              setTeams(data);
              console.log(data);
            }
          } catch (error) {
            console.error("error:", error);
          }
        }
      }
      fetchEmployees();
      fetchTeams();
    }
  }, [isLoggedIn]);
  //profile image
  useEffect(() => {
    if (user.profile) {
      const url = `${serverAddress}${user.profile}`;
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfileImage(reader.result as string);
          };
          reader.readAsDataURL(blob);
        })
        .catch((err) => {
          console.error("Error loading image:", err);
        });
    } else {
      setProfileImage("");
    }
  }, [user]);

  return (
    <AppDataContext.Provider
      value={{
        emptyUser,
        user,
        setUser,
        employees,
        setEmployees,
        pendingEmployees,
        setPendingEmployees,
        isLoggedIn,
        loading,
        setIsLoggedIn,
        departments,
        setDepartments,
        teams,
        setTeams,
        serverAddress,
        profileImage,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
