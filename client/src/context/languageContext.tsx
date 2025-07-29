import { useState, createContext } from "react";
import type { ReactNode } from "react";
type langContextType = {
  lang: "en" | "am";
  setLang: (lang: "en" | "am") => void;
};
export const LangContext = createContext<langContextType | undefined>(
  undefined
);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<"en" | "am">("en");
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}
