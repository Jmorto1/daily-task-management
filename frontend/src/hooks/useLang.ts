import { useContext } from "react";
import { LangContext } from "../context/languageContext";

export function useLang() {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error("useLang must be used inside a LangProvider");
  }
  return context;
}
