export function gregorianToEthiopian(date: Date): {
    year: number;
    month: number;
    day: number;
  } {
    const base = date.getTime();
    const jd = Math.floor(base / 86400000 + 2440588); // Julian Day
    const r = (jd - 1723856) % 1461;
    const n = (r % 365) + 365 * Math.floor(r / 1460);
    const year =
      4 * Math.floor((jd - 1723856) / 1461) +
      Math.floor(r / 365) -
      Math.floor(r / 1460);
    const month = Math.floor(n / 30) + 1;
    const day = (n % 30) + 1;
    return { year, month, day };
  }

  export function ethiopianToGregorian(
    year: number,
    month: number,
    day: number
  ): Date {
    const jd =
      1723856 +
      365 * year +
      Math.floor(year / 4) +
      30 * (month - 1) +
      (day - 1);
    const g = jd + 68569;
    const n = Math.floor((4 * g) / 146097);
    const r = g - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (r + 1)) / 1461001);
    const j = r - Math.floor((1461 * i) / 4) + 31;
    const k = Math.floor((80 * j) / 2447);
    const d = j - Math.floor((2447 * k) / 80);
    const l = Math.floor(k / 11);
    const m = k + 2 - 12 * l;
    const y = 100 * (n - 49) + i + l;
    return new Date(y, m - 1, d);
  }
  export const ETHIOPIAN_MONTHS = [
    "መስከረም",
    "ጥቅምት",
    "ኅዳር",
    "ታኅሣሥ",
    "ጥር",
    "የካቲት",
    "መጋቢት",
    "ሚያዝያ",
    "ግንቦት",
    "ሰኔ",
    "ሐምሌ",
    "ነሐሴ",
    "ጳጉሜ",
  ];
  export const formatEthDate = (ethDate: {
    year: number;
    month: number;
    day: number;
  }) =>
    `${ethDate.year}-${String(ethDate.month).padStart(2, "0")}-${String(
      ethDate.day
    ).padStart(2, "0")}`;