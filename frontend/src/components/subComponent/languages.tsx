import { FaGlobe } from "react-icons/fa";
import "../../styles/language.css";
import { useLang } from "../../hooks/useLang";
import type React from "react";
export default function Language() {
  const { lang, setLang } = useLang();
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(e.target.value as "en" | "am");
  };
  return (
    <div className="language-selector">
      <FaGlobe className="language-icon" />
      <select value={lang} onChange={handleChange}>
        <option value="en">English</option>
        <option value="am">አማርኛ</option>
      </select>
    </div>
  );
}
