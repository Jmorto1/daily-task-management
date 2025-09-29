import { useState, useEffect, useRef } from "react";
import styles from "../../styles/ethioCalander.module.css";
import {
  ethiopianToGregorian,
  gregorianToEthiopian,
  ETHIOPIAN_MONTHS,
} from "../../actions/dataConverter";
import { AiOutlineCalendar } from "react-icons/ai";
interface EthiopianCalendarProps {
  value?: Date;
  onChange?: (date: string) => void; // changed to string
  className?: string;
  inputStyle?: React.CSSProperties; // New prop for input styles
}

export default function EthiopianCalendar({
  value,
  onChange,
  className = "",
  inputStyle,
}: EthiopianCalendarProps) {
  // --- Conversion functions ---

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value || new Date());
  const [currentEthiopian, setCurrentEthiopian] = useState(
    gregorianToEthiopian(selectedDate)
  );
  const [viewMonth, setViewMonth] = useState(currentEthiopian.month);
  const [viewYear, setViewYear] = useState(currentEthiopian.year);
  const [calendarAbove, setCalendarAbove] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      const ethDate = gregorianToEthiopian(value);
      setCurrentEthiopian(ethDate);
      setViewMonth(ethDate.month);
      setViewYear(ethDate.year);
    }
  }, [value]);
  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  // Prevent overflow: detect space below vs above
  useEffect(() => {
    if (showCalendar && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setCalendarAbove(spaceBelow < 300); // 300px = calendar height
    }
  }, [showCalendar]);

  const generateCalendarDays = () => {
    const days = [];
    const gregDateOfFirst = ethiopianToGregorian(viewYear, viewMonth, 1);
    const startDay = gregDateOfFirst.getDay();
    const daysInMonth = viewMonth === 13 ? (viewYear % 4 === 3 ? 6 : 5) : 30;

    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        day === currentEthiopian.day &&
        viewMonth === currentEthiopian.month &&
        viewYear === currentEthiopian.year;
      days.push({ day, isCurrentMonth: true, isSelected });
    }
    return days;
  };

  const handleDayClick = (day: number) => {
    const newGregDate = ethiopianToGregorian(viewYear, viewMonth, day);
    const newEthDate = { year: viewYear, month: viewMonth, day };

    setSelectedDate(newGregDate);
    setCurrentEthiopian(newEthDate);
    setShowCalendar(false);

    // Send yyyy-mm-dd string for consistency
    const formattedDate = `${newGregDate.getFullYear()}-${String(
      newGregDate.getMonth() + 1
    ).padStart(2, "0")}-${String(newGregDate.getDate()).padStart(2, "0")}`;

    onChange?.(formattedDate);
  };

  const navigateMonth = (direction: number) => {
    let newMonth = viewMonth + direction;
    let newYear = viewYear;
    if (newMonth > 13) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 13;
      newYear--;
    }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  const goToToday = () => {
    const today = new Date();
    const ethToday = gregorianToEthiopian(today);
    setSelectedDate(today);
    setCurrentEthiopian(ethToday);
    setViewMonth(ethToday.month);
    setViewYear(ethToday.year);

    const formattedDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    onChange?.(formattedDate);
  };

  const calendarDays = generateCalendarDays();

  const formatEthDate = (ethDate: {
    year: number;
    month: number;
    day: number;
  }) =>
    `${ethDate.day}/${String(ethDate.month).padStart(2, "0")}/${String(
      ethDate.year
    ).padStart(2, "0")}`;

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        type="text"
        className={className}
        value={formatEthDate(currentEthiopian)}
        readOnly
        onClick={() => setShowCalendar((prev) => !prev)}
        style={inputStyle}
      />
      <span
        className={styles.icon}
        onClick={() => setShowCalendar((prev) => !prev)}
        ref={iconRef}
      >
        <AiOutlineCalendar size={18} />
      </span>
      {showCalendar && (
        <div
          ref={calendarRef}
          className={`${styles.ethiopianCalendar}`}
          style={{
            top: calendarAbove ? "auto" : "110%",
            bottom: calendarAbove ? "110%" : "auto",
          }}
        >
          <div className={styles.calendarHeader}>
            <button
              className={styles.navButton}
              onClick={() => navigateMonth(-1)}
            >
              ‹
            </button>

            <div className={styles.calendarTitle}>
              {ETHIOPIAN_MONTHS[viewMonth - 1]} {viewYear}
            </div>

            <button
              className={styles.navButton}
              onClick={() => navigateMonth(1)}
            >
              ›
            </button>
          </div>

          <div className={styles.weekDays}>
            {["እ", "ሰ", "ማ", "ረ", "ሐ", "ዓ", "ቅ"].map((day, i) => (
              <div key={i}>{day}</div>
            ))}
          </div>

          <div className={styles.calendarGrid}>
            {calendarDays.map(({ day, isCurrentMonth, isSelected }, index) => (
              <div
                key={index}
                className={`${styles.calendarDay} ${
                  !isCurrentMonth ? styles.empty : ""
                } ${isSelected ? styles.selected : ""}`}
                onClick={() => isCurrentMonth && day && handleDayClick(day)}
              >
                {day}
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <button className={styles.todayBtn} onClick={goToToday}>
              ዛሬ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
