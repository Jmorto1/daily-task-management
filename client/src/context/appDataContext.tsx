import { useEffect, useState, createContext } from "react";
import type { ReactNode } from "react";
// type Service = {
//   id: number;
//   name_en: string;
//   name_am: string;
//   frequency: number;
//   start_time: string;
//   end_time: string;
// };

// type User = {
//   id: number;
//   username: string;
//   email: string;
// };
// type AppData = {
//   services: Service[];
//   users: User[];
// };
type AppData = string;
export const AppDataContext = createContext<AppData | null>(null);
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [appData, setAppData] = useState<AppData>(
    // {
    //     services: [],
    //     users: []
    // }
    "user"
  );

  //   useEffect(() => {
  //     async function fetchAllData() {
  //       try {
  //         const [servicesRes, usersRes, settingsRes] = await Promise.all([
  //           fetch("http://localhost:8000/api/services/"),
  //           fetch("http://localhost:8000/api/users/"),
  //           fetch("http://localhost:8000/api/settings/"),
  //         ]);

  //         const [services, users] = await Promise.all([
  //           servicesRes.json(),
  //           usersRes.json(),
  //           settingsRes.json(),
  //         ]);

  //         setAppData({ services, users});
  //       } catch (error) {
  //         console.error("Failed to fetch app data", error);
  //       }
  //     }

  //     fetchAllData();
  //   }, []);
  return (
    <AppDataContext.Provider value={appData}>
      {children}
    </AppDataContext.Provider>
  );
}
