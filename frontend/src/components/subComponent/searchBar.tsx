import { FaSearch } from "react-icons/fa";
import styles from "../../styles/searchBar.module.css";
import { useLang } from "../../hooks/useLang";
interface searchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}
export default function SearchBar({
  searchQuery,
  setSearchQuery,
}: searchBarProps) {
  const {lang} = useLang();
  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder={lang === "en" ? "Search" : "ፈልግ"}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
      />
      <FaSearch className={styles.searchIcon} />
    </div>
  );
}
