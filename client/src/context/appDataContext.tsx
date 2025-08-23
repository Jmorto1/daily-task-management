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
type AppData = {
  id: string;
  name: string;
  role: "admin" | "user" | "groupLeader" | "sysAdmin";
};
type AppDataContextType = {
  user: AppData;
  setUser: React.Dispatch<React.SetStateAction<AppData>>;
};
export const AppDataContext = createContext<AppDataContextType | null>(null);
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [appData, setAppData] = useState<AppData>({
    id: "1",
    name: "yealem",
    role: "admin",
  });

  return (
    <AppDataContext.Provider value={{ user: appData, setUser: setAppData }}>
      {children}
    </AppDataContext.Provider>
  );
}
