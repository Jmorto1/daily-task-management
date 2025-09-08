import React, { useEffect, useState, useRef, type FormEvent } from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "../../styles/tasksReport.module.css";
import { useLang } from "../../hooks/useLang";
import NotoSansEthiopic from "../../fonts/NotoSansEthiopic-Regular-normal";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FiMoreVertical, FiEdit, FiTrash2 } from "react-icons/fi";
import tasksReportAm from "../../locates/amharic/tasksReport.json";
import tasksReportEn from "../../locates/english/tasksReport.json";
import type { TeamUserOption } from "../report";
import { useAppData } from "../../hooks/useAppData";
interface tasksReportProps {
  parent: "report" | "myTask";
  selectedTeamUser?: TeamUserOption | null;
}
type Activity = {
  id: string;
  name: { en: string; am: string };
  quality?: string;
  frequency: string;
  startingTime: string;
  endingTime: string;
  totalHour: string;
  date: string;
};
type SubService = {
  id: string;
  name: { en: string; am: string };
  quality: string;
  activities: Activity[];
};

type StandardService = {
  id: string;
  name: { en: string; am: string };
  quality: string;
  subServices: SubService[];
};
type pdfDataFormat = {
  serviceName: string;
  subServiceName: string;
  activityName: string;
  date: string;
  frequency: string;
  quality: string;
  startingTime: string;
  endingTime: string;
  totalHour: string;
  activityBPR: string;
  actQTQ: string;
  avgActQlt: string;
  avgsubServiceQlt: string;
};
const standardServices: StandardService[] | null = [
  {
    id: "s1",
    name: { en: "Cleaning Service", am: "ንጹህ አገልግሎት" },
    quality: "90%",
    subServices: [
      {
        id: "ss1",
        name: { en: "Floor Cleaning", am: "የአፈር ንጹህነት" },
        quality: "85%",
        activities: [
          {
            id: "a1",
            name: { en: "Sweeping", am: "ማስወገጃ" },
            quality: "85%",
            frequency: "3",
            startingTime: "08:00",
            endingTime: "09:00",
            totalHour: "1",
            date: "2025-08-01",
          },
          {
            id: "a2",
            name: { en: "Mopping", am: "መጠጥ ማድረግ" },
            quality: "90%",
            frequency: "3",
            startingTime: "09:30",
            endingTime: "10:30",
            totalHour: "1",
            date: "2025-08-02",
          },
          {
            id: "a3",
            name: { en: "Vacuuming", am: "መሳሪያ ማጠብ" },
            quality: "95%",
            frequency: "3",
            startingTime: "11:00",
            endingTime: "12:00",
            totalHour: "1",
            date: "2025-08-03",
          },
          {
            id: "a4",
            name: { en: "Dusting", am: "ንጹህ ማድረግ" },
            quality: "88%",
            frequency: "3",
            startingTime: "13:00",
            endingTime: "14:00",
            totalHour: "1",
            date: "2025-08-04",
          },
          {
            id: "a5",
            name: { en: "Sanitizing", am: "መጠጥ ማድረግ" },
            quality: "92%",
            frequency: "3",
            startingTime: "14:30",
            endingTime: "15:30",
            totalHour: "1",
            date: "2025-08-05",
          },
        ],
      },
      {
        id: "ss2",
        name: { en: "Window Cleaning", am: "መስኮት ንጹህነት" },
        quality: "88%",
        activities: [
          {
            id: "a6",
            name: { en: "Interior Windows", am: "የውስጥ መስኮቶች" },
            quality: "90%",
            frequency: "2",
            startingTime: "08:00",
            endingTime: "09:00",
            totalHour: "1",
            date: "2025-08-01",
          },
          {
            id: "a7",
            name: { en: "Exterior Windows", am: "የውጭ መስኮቶች" },
            quality: "85%",
            frequency: "2",
            startingTime: "09:30",
            endingTime: "10:30",
            totalHour: "1",
            date: "2025-08-02",
          },
          {
            id: "a8",
            name: { en: "Glass Polishing", am: "የብረት ማቀነባበር" },
            quality: "92%",
            frequency: "2",
            startingTime: "11:00",
            endingTime: "12:00",
            totalHour: "1",
            date: "2025-08-03",
          },
          {
            id: "a9",
            name: { en: "Frame Cleaning", am: "የመስኮት መስመር" },
            quality: "87%",
            frequency: "2",
            startingTime: "13:00",
            endingTime: "14:00",
            totalHour: "1",
            date: "2025-08-04",
          },
          {
            id: "a10",
            name: { en: "Screen Cleaning", am: "የማስከፊያ ንጹህነት" },
            quality: "89%",
            frequency: "2",
            startingTime: "14:30",
            endingTime: "15:30",
            totalHour: "1",
            date: "2025-08-05",
          },
        ],
      },
      {
        id: "ss3",
        name: { en: "Office Cleaning", am: "የጽ/ቤት ንጹህነት" },
        quality: "91%",
        activities: [
          {
            id: "a11",
            name: { en: "Desk Cleaning", am: "የጽ/ቤት ዴስክ ንጹህነት" },
            quality: "93%",
            frequency: "3",
            startingTime: "08:00",
            endingTime: "09:00",
            totalHour: "01:00",
            date: "2025-08-01",
          },
          {
            id: "a12",
            name: { en: "Trash Removal", am: "ትራሽ ማስወገጃ" },
            quality: "90%",
            frequency: "3",
            startingTime: "09:30",
            endingTime: "10:30",
            totalHour: "1",
            date: "2025-08-02",
          },
          {
            id: "a13",
            name: { en: "Chair Cleaning", am: "የወንበር ንጹህነት" },
            quality: "88%",
            frequency: "3",
            startingTime: "11:00",
            endingTime: "12:00",
            totalHour: "1",
            date: "2025-08-03",
          },
          {
            id: "a14",
            name: { en: "Floor Polishing", am: "የአፈር ማቀነባበር" },
            quality: "92%",
            frequency: "3",
            startingTime: "13:00",
            endingTime: "14:00",
            totalHour: "1",
            date: "2025-08-04",
          },
          {
            id: "a15",
            name: { en: "Sanitizer Refill", am: "የመጠጥ መሙላት" },
            quality: "95%",
            frequency: "3",
            startingTime: "14:30",
            endingTime: "15:30",
            totalHour: "1",
            date: "2025-08-05",
          },
        ],
      },
      {
        id: "ss4",
        name: { en: "Restroom Cleaning", am: "የምታገስባት ቤት ንጹህነት" },
        quality: "87%",
        activities: [
          {
            id: "a16",
            name: { en: "Toilet Cleaning", am: "ሽንት ቤት ንጹህነት" },
            quality: "88%",
            frequency: "3",
            startingTime: "08:00",
            endingTime: "09:00",
            totalHour: "1",
            date: "2025-08-01",
          },
          {
            id: "a17",
            name: { en: "Urinal Cleaning", am: "የሁሉም ሽንት ቤት" },
            quality: "85%",
            frequency: "3",
            startingTime: "09:30",
            endingTime: "10:30",
            totalHour: "1",
            date: "2025-08-02",
          },
          {
            id: "a18",
            name: { en: "Sink Cleaning", am: "የምስኪን ንጹህነት" },
            quality: "90%",
            frequency: "3",
            startingTime: "11:00",
            endingTime: "12:00",
            totalHour: "1",
            date: "2025-08-03",
          },
          {
            id: "a19",
            name: { en: "Mirror Cleaning", am: "መስኮት ንጹህነት" },
            quality: "92%",
            frequency: "3",
            startingTime: "13:00",
            endingTime: "14:00",
            totalHour: "1",
            date: "2025-08-04",
          },
          {
            id: "a20",
            name: { en: "Hand Dryer Cleaning", am: "የእጅ ማጠቢያ ንጹህነት" },
            quality: "89%",
            frequency: "3",
            startingTime: "14:30",
            endingTime: "15:30",
            totalHour: "1",
            date: "2025-08-05",
          },
        ],
      },
    ],
  },
];

const additionalActivities: Activity[] | null = [
  {
    id: "aa1",
    name: { en: "Pest Control", am: "የእንስሳት መቆጣጠሪያ" },
    frequency: "1",
    startingTime: "09:00",
    endingTime: "11:00",
    totalHour: "2",
    date: "2025-08-01",
  },
  {
    id: "aa2",
    name: { en: "Garden Maintenance", am: "የአትክልት አንድ አገልግሎት" },
    frequency: "2",
    startingTime: "07:00",
    endingTime: "09:00",
    totalHour: "2",
    date: "2025-08-02",
  },
  {
    id: "aa3",
    name: { en: "IT Equipment Check", am: "የአይቲ መሳሪያ ምርመራ" },
    frequency: "2",
    startingTime: "10:00",
    endingTime: "12:00",
    totalHour: "2",
    date: "2025-08-03",
  },
  {
    id: "aa4",
    name: { en: "Electricity Check", am: "የኤሌክትሪክ ምርመራ" },
    frequency: "1",
    startingTime: "08:00",
    endingTime: "10:00",
    totalHour: "2",
    date: "2025-08-04",
  },
  {
    id: "aa5",
    name: { en: "Water System Check", am: "የውሃ ስርዓት ምርመራ" },
    frequency: "1",
    startingTime: "11:00",
    endingTime: "13:00",
    totalHour: "2",
    date: "2025-08-05",
  },
  {
    id: "aa6",
    name: { en: "Air Conditioning Maintenance", am: "የኤር ኮንዲሽነር አገልግሎት" },
    frequency: "1",
    startingTime: "14:00",
    endingTime: "16:00",
    totalHour: "2",
    date: "2025-08-06",
  },
  {
    id: "aa7",
    name: { en: "Fire Safety Check", am: "የእሳት ደህንነት ምርመራ" },
    frequency: "1",
    startingTime: "09:00",
    endingTime: "11:00",
    totalHour: "2",
    date: "2025-08-07",
  },
  {
    id: "aa8",
    name: { en: "Parking Lot Cleaning", am: "የመኪና ቦታ ንጹህነት" },
    frequency: "2",
    startingTime: "07:00",
    endingTime: "09:00",
    totalHour: "2",
    date: "2025-08-08",
  },
  {
    id: "aa9",
    name: { en: "Document Filing", am: "የሰነድ ማደራጃ" },
    frequency: "3",
    startingTime: "08:00",
    endingTime: "10:00",
    totalHour: "2",
    date: "2025-08-09",
  },
  {
    id: "aa10",
    name: { en: "Inventory Check", am: "የእቃ ምርመራ" },
    frequency: "2",
    startingTime: "10:00",
    endingTime: "12:00",
    totalHour: "2",
    date: "2025-08-10",
  },
  {
    id: "aa11",
    name: { en: "CCTV Monitoring", am: "የስልክ ካሜራ እና ተመልከት" },
    frequency: "3",
    startingTime: "09:00",
    endingTime: "11:00",
    totalHour: "2",
    date: "2025-08-01",
  },
  {
    id: "aa12",
    name: { en: "Signage Maintenance", am: "የምልክት እና መግለጫ አገልግሎት" },
    frequency: "1",
    startingTime: "14:00",
    endingTime: "16:00",
    totalHour: "2",
    date: "2025-08-02",
  },
  {
    id: "aa13",
    name: { en: "Printer Maintenance", am: "የቅርጸ-ተነባባ መተንበያ አገልግሎት" },
    frequency: "2",
    startingTime: "11:00",
    endingTime: "13:00",
    totalHour: "2",
    date: "2025-08-03",
  },
  {
    id: "aa14",
    name: { en: "Conference Room Setup", am: "የኮንፈረንስ ክፍል አሰራር" },
    frequency: "3",
    startingTime: "08:00",
    endingTime: "10:00",
    totalHour: "2",
    date: "2025-08-04",
  },
  {
    id: "aa15",
    name: { en: "Mail Distribution", am: "የፖስታ መደርሰያ" },
    frequency: "3",
    startingTime: "09:00",
    endingTime: "10:00",
    totalHour: "1",
    date: "2025-08-05",
  },
];

export default function TaskReport({
  parent,
  selectedTeamUser,
}: tasksReportProps) {
  const { profileImage } = useAppData();
  const today = new Date();
  const { lang } = useLang();
  const translate = {
    am: tasksReportAm,
    en: tasksReportEn,
  };
  const text = translate[lang];
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [initialDate, setInitialDate] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate());
    return d.toISOString().split("T")[0];
  });
  const [finalDate, setFinalDate] = useState(
    () => today.toISOString().split("T")[0]
  );
  const [filteredStandardServices, setFilteredStandardServices] = useState<
    StandardService[] | null
  >(standardServices);
  const [filteredAdditionalServices, setFilteredAdditionalServices] = useState<
    Activity[] | null
  >(additionalActivities);
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selected, setSelected] = useState<{
    type: "ad" | "st";
    act: Activity;
  } | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAm: "",
    date: "",
    quality: "",
    frequency: "",
    startingTime: "",
    endingTime: "",
    totalHour: "",
  });
  const [errors, setErrors] = useState({
    nameEn: "",
    nameAm: "",
    date: "",
    quality: "",
    frequency: "",
    startingTime: "",
    endingTime: "",
  });
  const handleEditFieldChange = (field: string, value: string) => {
    const updatedForm = { ...formData, [field]: value };
    if (field === "startingTime" || field === "endingTime") {
      if (updatedForm.startingTime && updatedForm.endingTime) {
        const [sh, sm] = updatedForm.startingTime.split(":").map(Number);
        const [eh, em] = updatedForm.endingTime.split(":").map(Number);
        let diff = eh * 60 + em - (sh * 60 + sm);
        if (diff < 0) diff += 24 * 60;

        const hours = String(Math.floor(diff / 60)).padStart(2, "0");
        const minutes = String(diff % 60).padStart(2, "0");
        updatedForm.totalHour = `${hours}:${minutes}`;
      } else {
        updatedForm.totalHour = "";
      }
    }
    setFormData(updatedForm);
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
  };
  const validate = () => {
    let isValid = true;
    const percentPattern = /^(\d+)(\.\d+)?%$/;
    const newError: any = {};
    if (selected?.type === "ad") {
      if (!formData.nameAm.trim()) {
        newError.nameAm = "ስም ያስፈልጋል.";
        isValid = false;
      }
      if (!formData.nameEn.trim()) {
        newError.nameEn = "name is required";
        isValid = false;
      }
    }
    if (!formData.date.trim()) {
      newError.date = text.dateError;
      isValid = false;
    }
    if (!formData.frequency.trim()) {
      newError.frequency = text.freqError;
      isValid = false;
    }
    if (selected?.type === "st") {
      if (!formData.quality.trim()) {
        newError.quality = text.qualityError;
        isValid = false;
      } else if (!percentPattern.test(formData.quality.trim())) {
        newError.quality = text.invalidQualityError;
        isValid = false;
      }
    }
    if (!formData.startingTime) {
      newError.startingTime = text.startingTimeError;
      isValid = false;
    }
    if (!formData.endingTime) {
      newError.endingTime = text.endingTimeError;
      isValid = false;
    }
    setErrors(newError);
    return isValid;
  };
  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };
  const handleDeleteSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };
  const handleInitialDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInitialDate(e.target.value);
    if (e.target.value > finalDate) setFinalDate(e.target.value);
  };
  const handleFinalDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFinalDate(e.target.value);
    if (e.target.value < initialDate) setInitialDate(e.target.value);
  };
  const formatToHumanDate = (date: string): string => {
    const locates = lang === "am" ? "am-ET" : "en-US";
    return new Date(date).toLocaleDateString(locates, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const formatToDDMMYYYY = (dateInput: string | Date): string => {
    const date = new Date(dateInput);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };
  const handleDownloadTotalServicesPDF = () => {
    const margin = 15;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add Amharic font
    if (NotoSansEthiopic) {
      doc.addFileToVFS("NotoSansEthiopic.ttf", NotoSansEthiopic);
      doc.addFont("NotoSansEthiopic.ttf", "NotoSansEthiopic", "normal");
      doc.setFont("NotoSansEthiopic", "normal");
    }
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    const formattedDate = now.toLocaleDateString("en-US", options);
    const timeText = now.toLocaleTimeString("en-US");

    const headerText =
      lang === "am"
        ? "በለሚ ኩራ ክ/ከተማ ኢ/ቴ/ል/ፅ/ቤት መሰረተ ልማት እና ዳታ ማዕከል ቡድን የባለሙያዎች የዕለት ዕቅድ ክንዉን መመዝገቢና ማነጻጻሪ ቅጹ"
        : "Daily Work Plan Registration and Evaluation Form for the Employee's of the Development and Data Center Team of Lemi Kura Sub-City ኢ/ቴ/ል/ፅ/ቤት";

    const titleWidth = pageWidth - 2 * margin - 190;
    const splitTitle = doc.splitTextToSize(headerText, titleWidth);
    const lineHeight = 16;
    const headerHeight = Math.max(90, splitTitle.length * lineHeight + 20);

    // -------- HEADER (only on page 1)  ---------
    autoTable(doc, {
      startY: margin,
      theme: "plain",
      margin: { left: margin },
      head: [
        [
          { content: "", styles: { cellWidth: 95 } },
          {
            content: headerText,
            styles: { cellWidth: titleWidth, halign: "center" },
          },
          {
            content: formattedDate + " " + timeText,
            styles: { cellWidth: 95, halign: "right" },
          },
        ],
      ],
      styles: {
        font: "NotoSansEthiopic",
        fontStyle: "normal",
        fontSize: 14,
        textColor: [255, 255, 255],
        valign: "middle",
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [11, 179, 230],
        textColor: [255, 255, 255],
        font: "NotoSansEthiopic",
        fontStyle: "normal",
        minCellHeight: headerHeight,
      },
      didDrawCell: (data) => {
        if (data.column.index === 0 && profileImage) {
          const imgY = data.cell.y + (data.cell.height - 50) / 2;
          doc.addImage(profileImage, "PNG", data.cell.x + 10, imgY, 75, 50);
        }
        doc.setFont("NotoSansEthiopic", "normal"); // reset font
      },
    });
    const docAny = doc as any;
    const headerEndY = docAny.lastAutoTable?.finalY || margin + headerHeight;

    // -------- MAIN TABLE (every page) ----------
    const TotalServices = getTotalServices();
    const rows =
      TotalServices?.map((service, idx) => [
        idx + 1,
        service.serviceName,
        service.subServiceName,
        service.activityName,
        formatToDDMMYYYY(service.date),
        service.frequency,
        service.quality,
        service.startingTime,
        service.endingTime,
        service.totalHour,
        service.activityBPR,
        service.actQTQ,
        service.avgActQlt,
        service.avgsubServiceQlt,
      ]) || [];
    autoTable(doc, {
      startY: headerEndY,
      margin: { left: margin, right: margin },
      head: [
        [
          text.num,
          text.fileService,
          text.fileSubService,
          text.fileActivity,
          text.fileDate,
          text.freq,
          text.quality,
          text.startingTime,
          text.endingTime,
          text.totalHour,
          text.fileActivityPlan,
          text.fileActivityperformance,
          text.fileActivityAverage,
          text.fileSubServicePerformance,
        ],
      ],
      body: rows,
      theme: "grid",
      styles: {
        font: "NotoSansEthiopic",
        fontStyle: "normal",
        fontSize: 11,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [11, 179, 230],
        textColor: [255, 255, 255],
        font: "NotoSansEthiopic",
        halign: "center",
      },
      didParseCell: (data) => {
        if (data.section === "body") {
          if (data.row.index % 2 === 0) {
            data.cell.styles.fillColor = [245, 245, 245]; // light grey
          } else {
            data.cell.styles.fillColor = [255, 255, 255]; // white
          }
        }
      },
      tableWidth: pageWidth - 2 * margin,
      didDrawPage: (data) => {
        doc.setFont("NotoSansEthiopic", "normal"); // ensure Amharic font

        // -------- SIGNATURE ROW (every page) --------
        const sigY = pageHeight - margin - 20;
        const pattern = [2, 2, 1, 1, 2, 2, 1, 1];
        const gapPattern = [5, 20, 5, 20];
        const blockHeight = 20;
        const labels = [
          text.employeeName,
          "Yealem Birhanu",
          text.signature,
          "",
          text.adminName,
          "",
          text.signature,
          "",
        ];

        const totalUnits = pattern.reduce((a, b) => a + b, 0);
        const totalGaps = 5 + 20 + 5 + 20;
        const unitWidth = (pageWidth - 2 * margin - totalGaps) / totalUnits - 3;

        let x = margin;
        for (let i = 0; i < pattern.length; i++) {
          const blockWidth = pattern[i] * unitWidth;

          if (labels[i]) {
            if (i % 2 == 0) {
              doc.setFillColor(11, 179, 230);
            } else {
              doc.setFillColor(255, 255, 255);
            }
            doc.rect(x, sigY, blockWidth, blockHeight, "F");
            doc.setTextColor(0, 0, 0);
            doc.setFont("NotoSansEthiopic", "normal"); // ensure Amharic
            doc.setFontSize(10);
            doc.text(labels[i], x + 4, sigY + blockHeight / 2 + 3);
          } else {
            doc.rect(x, sigY, blockWidth, blockHeight);
          }

          const gap = gapPattern[i % gapPattern.length];
          x += blockWidth + gap;
        }
      },
    });
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // Format filename
    const filename = `ServicesReport_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.pdf`;
    doc.save(filename);
  };
  const handleDownloadTotalServicesExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Additional Services");

    const headerColor = "0BB3E6";
    const marginRow = 2;

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-US");

    // -------- HEADER IMAGE (with top/bottom margin) --------
    const imageTopMargin = 5; // extra space above image
    const imageBottomMargin = 5; // extra space below image
    const imageHeight = 70; // image display height
    if (profileImage) {
      const imageId = workbook.addImage({
        base64: profileImage,
        extension: "png",
      });
      sheet.addImage(imageId, {
        tl: { col: 0, row: marginRow - 1 + imageTopMargin / 20 } as any,
        br: {
          col: 1,
          row:
            marginRow -
            1 +
            (imageHeight + imageTopMargin + imageBottomMargin) / 20,
        } as any,
        editAs: "oneCell",
      });
    }

    // -------- HEADER TITLE (merged + taller) --------
    // Merge title across columns with extra rows
    sheet.mergeCells(`B${marginRow}:K${marginRow + 3}`); // added 1 extra row for taller header
    const headerCell = sheet.getCell(`B${marginRow}`);
    headerCell.value =
      "በለሚ ኩራ ክ/ከተማ ኢ/ቴ/ል/ፅ/ቤት መሰረተ ልማት እና ዳታ ማዕከል ቡድን የባለሙያዎች የዕለት ዕቅድ ክንዉን መመዝገቢና ማነጻጻሪ ቅጹ";
    headerCell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    headerCell.font = {
      name: "Noto Sans Ethiopic",
      size: 14,
      bold: true,
      color: { argb: "FFFFFF" },
    };
    headerCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: headerColor },
    };

    // -------- HEADER DATE/TIME (right side) --------
    sheet.mergeCells(`L${marginRow}:M${marginRow + 3}`);
    const dateCell = sheet.getCell(`L${marginRow}`);
    dateCell.value = `${formattedDate} ${formattedTime}`;
    dateCell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    dateCell.font = {
      name: "Noto Sans Ethiopic",
      size: 12,
      bold: true,
      color: { argb: "FFFFFF" },
    };
    dateCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: headerColor },
    };

    // -------- TABLE HEADER --------
    const tableStartRow = marginRow + 5; // leave 1 extra row for spacing
    sheet.addRow([
      "No.",
      "አገልግሎት ስም",
      "SubServiceName",
      "ActivityName",
      "Date",
      "Frequency",
      "Quality",
      "Starting Time",
      "Ending Time",
      "Total Hour",
      "activityBPR",
      "actQTQ",
      "avgActQlt",
      "avgsubServiceQlt",
    ]);

    const headerRow = sheet.getRow(tableStartRow);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: headerColor },
      };
      cell.font = {
        name: "Noto Sans Ethiopic",
        color: { argb: "FFFFFF" },
        bold: true,
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // -------- TABLE DATA --------
    const totalServices = getTotalServices();
    totalServices.forEach((service, idx) => {
      const row = sheet.addRow([
        idx + 1,
        service.serviceName,
        service.subServiceName,
        service.activityName,
        formatToDDMMYYYY(service.date),
        service.frequency,
        service.quality,
        service.startingTime,
        service.endingTime,
        service.totalHour,
        service.activityBPR,
        service.actQTQ,
        service.avgActQlt,
        service.avgsubServiceQlt,
      ]);

      row.eachCell((cell) => {
        cell.font = { name: "Noto Sans Ethiopic", size: 11 };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
    // -------- ADJUST COLUMN WIDTHS --------
    sheet.columns.forEach((col) => {
      col.width = 20;
    });

    // -------- SAVE EXCEL --------
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // Format filename
    const filename = `ServicesReport_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.xlsx`;

    // Save Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, filename);
  };

  const getTotalServices = () => {
    const totalServices: pdfDataFormat[] = [];
    if (filteredStandardServices) {
      for (const service of filteredStandardServices) {
        for (const sub of service.subServices) {
          for (const act of sub.activities) {
            const activity: pdfDataFormat = {
              serviceName: service.name[lang],
              subServiceName: sub.name[lang],
              activityName: act.name[lang],
              date: act.date,
              frequency: act.frequency,
              quality: act.quality || "",
              startingTime: act.startingTime,
              endingTime: act.endingTime,
              totalHour: act.totalHour,
              activityBPR: "",
              actQTQ: "",
              avgActQlt: "",
              avgsubServiceQlt: "",
            };
            totalServices.push(activity);
          }
        }
      }
    }
    if (filteredAdditionalServices) {
      for (const act of filteredAdditionalServices) {
        const activity: pdfDataFormat = {
          serviceName: "",
          subServiceName: "",
          activityName: act.name[lang],
          date: act.date,
          frequency: act.frequency,
          quality: act.quality || "",
          startingTime: act.startingTime,
          endingTime: act.endingTime,
          totalHour: act.totalHour,
          activityBPR: "",
          actQTQ: "",
          avgActQlt: "",
          avgsubServiceQlt: "",
        };
        totalServices.push(activity);
      }
    }
    totalServices.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return totalServices;
  };
  useEffect(() => {
    const filterStandardServicesByDate = (
      services: StandardService[] | null,
      startDate: string,
      endDate: string
    ): StandardService[] | null => {
      if (services === null) return null;
      const start = new Date(startDate);
      const end = new Date(endDate);

      return services
        .map((service) => {
          const filteredSubServices = service.subServices
            .map((sub) => {
              const filteredActivities = sub.activities.filter((act) => {
                const actDate = new Date(act.date);
                return actDate >= start && actDate <= end;
              });
              return { ...sub, activities: filteredActivities };
            })
            .filter((sub) => sub.activities.length > 0);

          return { ...service, subServices: filteredSubServices };
        })
        .filter((service) => service.subServices.length > 0);
    };
    const filterAdditionalActivitiesByDate = (
      activities: Activity[] | null,
      initialDate: string,
      finalDate: string
    ): Activity[] | null => {
      if (activities === null) return null;
      const start = new Date(initialDate);
      const end = new Date(finalDate);

      return activities.filter((act) => {
        const actDate = new Date(act.date);
        return actDate >= start && actDate <= end;
      });
    };
    if (initialDate && finalDate) {
      setFilteredStandardServices(
        filterStandardServicesByDate(standardServices, initialDate, finalDate)
      );
      setFilteredAdditionalServices(
        filterAdditionalActivitiesByDate(
          additionalActivities,
          initialDate,
          finalDate
        )
      );
    }
  }, [initialDate, finalDate]);
  const noStandardService =
    !filteredStandardServices || filteredStandardServices.length === 0;
  const noAdditionalService =
    !filteredAdditionalServices || filteredAdditionalServices.length === 0;
  const dropdownRef = useRef<{ [key: string]: any }>({});
  useEffect(() => {
    const handleMousedown = (event: MouseEvent) => {
      if (
        actionDropdown &&
        dropdownRef.current[actionDropdown] &&
        !dropdownRef.current[actionDropdown]!.contains(event.target as Node)
      ) {
        setActionDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleMousedown);
    return () => {
      document.removeEventListener("mousedown", handleMousedown);
    };
  }, [actionDropdown]);
  const refTextInput = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState<number>(0);
  useEffect(() => {
    const handleResize = () => {
      if (refTextInput.current) {
        setWidth(refTextInput.current.getBoundingClientRect().width);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [editMode]);
  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.datePickerWrapper}>
            <div>
              <label className={styles.label}>{text.initialDate}</label>
              <input
                type="date"
                className={styles.datePicker}
                value={initialDate}
                onChange={handleInitialDateChange}
                max={finalDate}
              />
            </div>
            <div>
              <label className={styles.label}>{text.finalDate}</label>
              <input
                type="date"
                className={styles.datePicker}
                value={finalDate}
                onChange={handleFinalDateChange}
                min={initialDate}
              />
            </div>
          </div>
          <div className={styles.dateRange}>
            <div>
              {text.from} {formatToHumanDate(initialDate)}{" "}
            </div>
            <div>
              {text.to} {formatToHumanDate(finalDate)}
            </div>
          </div>
          {!(noStandardService && noAdditionalService) &&
            parent === "myTask" && (
              <div className={styles.downloadButtons}>
                <button onClick={handleDownloadTotalServicesPDF}>
                  {text.getPdf}
                </button>
                <button onClick={handleDownloadTotalServicesExcel}>
                  {text.getExcel}
                </button>
              </div>
            )}
        </div>
        {/*Standard Services*/}
        <div className={styles.standardService}>
          <h1>{text.standardService}</h1>
          {noStandardService ? (
            <div className={styles.noTaskMessage}>{text.noStandardService}</div>
          ) : (
            <>
              {filteredStandardServices.map((service) => (
                <div key={service.id} className={styles.serviceBlock}>
                  <details className={styles.serviceDetails}>
                    <summary className={styles.serviceTitle}>
                      <div className={styles.serviceTitleContent}>
                        <span>{service.name[lang]} </span>
                        <span>
                          {text.quality}: {service.quality}
                        </span>
                      </div>
                    </summary>
                    <div>
                      <div className={styles.subServiceHeader}>
                        {text.subService}
                      </div>
                      {service.subServices.map((sub) => (
                        <div key={sub.id} className={styles.subServiceBlock}>
                          <h4 className={styles.subServiceTitle}>
                            <span>{sub.name[lang]}</span>{" "}
                            <span>
                              {text.quality}: {sub.quality}
                            </span>
                          </h4>
                          {/* Table for desktop */}
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th>{text.num}</th>
                                <th>{text.activity}</th>
                                <th>{text.date}</th>
                                <th>{text.freq}</th>
                                <th>{text.quality}</th>
                                <th> {text.startingTime}</th>
                                <th>{text.endingTime}</th>
                                <th>{text.totalHour}</th>
                                {parent === "report" && <th>{text.doneBy}</th>}
                                {parent === "myTask" && <th>{text.action}</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {sub.activities.map((act, idx) => (
                                <tr key={act.id}>
                                  <td>{idx + 1}</td>
                                  <td>{act.name[lang]}</td>
                                  <td>{formatToDDMMYYYY(act.date)}</td>
                                  <td>{act.frequency}</td>
                                  <td>{act.quality}</td>
                                  <td>{act.startingTime}</td>
                                  <td>{act.endingTime}</td>
                                  <td>{act.totalHour}</td>
                                  {parent === "report" && <td>empty</td>}
                                  {parent === "myTask" && (
                                    <td
                                      ref={(el) => {
                                        dropdownRef.current[`std${act.id}`] =
                                          el;
                                      }}
                                    >
                                      {actionDropdown === `std${act.id}` ? (
                                        <div className={styles.actionWrapper}>
                                          <button
                                            className={styles.editBtn}
                                            onClick={() => {
                                              setFormData({
                                                nameEn: "",
                                                nameAm: "",
                                                date: act.date,
                                                quality: act.quality || "",
                                                frequency: act.frequency,
                                                startingTime: act.startingTime,
                                                endingTime: act.endingTime,
                                                totalHour: act.totalHour,
                                              });
                                              setSelected({ type: "st", act });
                                              setEditMode(true);
                                              setActionDropdown(null);
                                            }}
                                          >
                                            <span>
                                              <FiEdit />
                                            </span>
                                            <span>{text.edit}</span>
                                          </button>
                                          <button
                                            className={styles.deleteBtn}
                                            onClick={() => {
                                              setSelected({ type: "st", act });
                                              setDeleteMode(true);
                                              setActionDropdown(null);
                                            }}
                                          >
                                            <span>
                                              <FiTrash2 />
                                            </span>
                                            <span>{text.delete}</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <div
                                          className={styles.moreVertical}
                                          onClick={() =>
                                            setActionDropdown(`std${act.id}`)
                                          }
                                        >
                                          <FiMoreVertical />
                                        </div>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {/* Card table for mobile */}
                          <div className={styles.activityTableCard}>
                            {sub.activities.map((act, idx) => (
                              <div key={act.id} className={styles.activityCard}>
                                <div className={styles.activityCardRow}>
                                  <span className={styles.activityCardLabel}>
                                    {text.num}
                                  </span>
                                  <span className={styles.activityCardValue}>
                                    {idx + 1}
                                  </span>
                                </div>
                                <div className={styles.activityCardRow}>
                                  <span className={styles.activityCardLabel}>
                                    {text.activity}
                                  </span>
                                  <span className={styles.activityCardValue}>
                                    {act.name[lang]}
                                  </span>
                                </div>
                                <div className={styles.activityCardRow}>
                                  <span className={styles.activityCardLabel}>
                                    {text.date}
                                  </span>
                                  <span className={styles.activityCardValue}>
                                    {formatToDDMMYYYY(act.date)}
                                  </span>
                                </div>
                                <div className={styles.activityCardRow}>
                                  <span className={styles.activityCardLabel}>
                                    {text.freq}
                                  </span>
                                  <span className={styles.activityCardValue}>
                                    {act.frequency}
                                  </span>
                                </div>
                                <div className={styles.activityCardRow}>
                                  <span className={styles.activityCardLabel}>
                                    {text.quality}
                                  </span>
                                  <span className={styles.activityCardValue}>
                                    {act.quality}
                                  </span>
                                </div>
                                <div className={styles.activityCardRow}>
                                  <span className={styles.activityCardLabel}>
                                    {text.startingTime}{" "}
                                  </span>
                                  <span className={styles.activityCardValue}>
                                    {act.startingTime}
                                  </span>
                                </div>
                                <div className={styles.activityCardRow}>
                                  <span className={styles.activityCardLabel}>
                                    {text.endingTime}{" "}
                                  </span>
                                  <span className={styles.activityCardValue}>
                                    {act.endingTime}
                                  </span>
                                </div>
                                <div className={styles.activityCardRow}>
                                  <span className={styles.activityCardLabel}>
                                    {text.totalHour}{" "}
                                  </span>
                                  <span className={styles.activityCardValue}>
                                    {act.totalHour}
                                  </span>
                                </div>
                                {parent === "report" && (
                                  <div className={styles.activityCardRow}>
                                    <span className={styles.activityCardLabel}>
                                      {text.doneBy}{" "}
                                    </span>
                                    <span className={styles.activityCardValue}>
                                      empty
                                    </span>
                                  </div>
                                )}
                                {parent === "myTask" && (
                                  <div className={styles.activityCardRow}>
                                    <span className={styles.activityCardLabel}>
                                      {text.action}
                                    </span>
                                    <span
                                      className={styles.activityCardValue}
                                      ref={(el) => {
                                        dropdownRef.current[`stm${act.id}`] =
                                          el;
                                      }}
                                    >
                                      {actionDropdown === `stm${act.id}` ? (
                                        <div className={styles.actionWrapper}>
                                          <button
                                            className={styles.editBtn}
                                            onClick={() => {
                                              setFormData({
                                                nameEn: "",
                                                nameAm: "",
                                                date: act.date,
                                                quality: act.quality || "",
                                                frequency: act.frequency,
                                                startingTime: act.startingTime,
                                                endingTime: act.endingTime,
                                                totalHour: act.totalHour,
                                              });
                                              setSelected({ type: "st", act });
                                              setEditMode(true);
                                              setActionDropdown(null);
                                            }}
                                          >
                                            <span>
                                              <FiEdit />
                                            </span>
                                            <span>{text.edit}</span>
                                          </button>
                                          <button
                                            className={styles.deleteBtn}
                                            onClick={() => {
                                              setSelected({ type: "st", act });
                                              setDeleteMode(true);
                                              setActionDropdown(null);
                                            }}
                                          >
                                            <span>
                                              <FiTrash2 />
                                            </span>
                                            <span>{text.delete}</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <div
                                          className={styles.moreVertical}
                                          onClick={() =>
                                            setActionDropdown(`stm${act.id}`)
                                          }
                                        >
                                          <FiMoreVertical />
                                        </div>
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
            </>
          )}
        </div>
        {/* Additional Services */}
        <div className={styles.additionalService}>
          <h1>{text.additionalService}</h1>
          {noAdditionalService ? (
            <div className={styles.noTaskMessage}>
              {text.noAdditionalServie}
            </div>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{text.doneBy}</th>
                    <th>{text.activity}</th>
                    <th>{text.date}</th>
                    <th>{text.freq}</th>
                    <th> {text.startingTime}</th>
                    <th> {text.endingTime}</th>
                    <th>{text.totalHour}</th>
                    {parent === "report" && <th>{text.doneBy} </th>}
                    {parent === "myTask" && <th>{text.action}</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredAdditionalServices.map((act, idx) => (
                    <tr key={act.id}>
                      <td>{idx + 1}</td>
                      <td>{act.name[lang]}</td>
                      <td>{formatToDDMMYYYY(act.date)}</td>
                      <td>{act.frequency}</td>
                      <td>{act.startingTime}</td>
                      <td>{act.endingTime}</td>
                      <td>{act.totalHour}</td>
                      {parent === "report" && <td>empty</td>}
                      {parent === "myTask" && (
                        <td
                          ref={(el) => {
                            dropdownRef.current[`add${act.id}`] = el;
                          }}
                        >
                          {actionDropdown === `add${act.id}` ? (
                            <div className={styles.actionWrapper}>
                              <button
                                className={styles.editBtn}
                                onClick={() => {
                                  setFormData({
                                    nameEn: act.name["en"],
                                    nameAm: act.name["am"],
                                    date: act.date,
                                    quality: "",
                                    frequency: act.frequency,
                                    startingTime: act.startingTime,
                                    endingTime: act.endingTime,
                                    totalHour: act.totalHour,
                                  });
                                  setSelected({ type: "ad", act });
                                  setEditMode(true);
                                  setActionDropdown(null);
                                }}
                              >
                                <span>
                                  <FiEdit />
                                </span>
                                <span>{text.edit}</span>
                              </button>
                              <button
                                className={styles.deleteBtn}
                                onClick={() => {
                                  setSelected({ type: "ad", act });
                                  setDeleteMode(true);
                                  setActionDropdown(null);
                                }}
                              >
                                <span>
                                  <FiTrash2 />
                                </span>
                                <span>{text.delete}</span>
                              </button>
                            </div>
                          ) : (
                            <div
                              className={styles.moreVertical}
                              onClick={() => setActionDropdown(`add${act.id}`)}
                            >
                              <FiMoreVertical />
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Card table for mobile */}
              <div className={styles.activityTableCard}>
                {filteredAdditionalServices.map((act, idx) => (
                  <div key={act.id} className={styles.activityCard}>
                    <div className={styles.activityCardRow}>
                      <span className={styles.activityCardLabel}>
                        {text.num}
                      </span>
                      <span className={styles.activityCardValue}>
                        {idx + 1}
                      </span>
                    </div>
                    <div className={styles.activityCardRow}>
                      <span className={styles.activityCardLabel}>
                        {text.activity}
                      </span>
                      <span className={styles.activityCardValue}>
                        {act.name[lang]}
                      </span>
                    </div>
                    <div className={styles.activityCardRow}>
                      <span className={styles.activityCardLabel}>
                        {text.date}
                      </span>
                      <span className={styles.activityCardValue}>
                        {formatToDDMMYYYY(act.date)}
                      </span>
                    </div>
                    <div className={styles.activityCardRow}>
                      <span className={styles.activityCardLabel}>
                        {text.freq}
                      </span>
                      <span className={styles.activityCardValue}>
                        {act.frequency}
                      </span>
                    </div>
                    <div className={styles.activityCardRow}>
                      <span className={styles.activityCardLabel}>
                        {text.startingTime}{" "}
                      </span>
                      <span className={styles.activityCardValue}>
                        {act.startingTime}
                      </span>
                    </div>
                    <div className={styles.activityCardRow}>
                      <span className={styles.activityCardLabel}>
                        {text.endingTime}{" "}
                      </span>
                      <span className={styles.activityCardValue}>
                        {act.endingTime}
                      </span>
                    </div>
                    <div className={styles.activityCardRow}>
                      <span className={styles.activityCardLabel}>
                        {text.totalHour}{" "}
                      </span>
                      <span className={styles.activityCardValue}>
                        {act.totalHour}
                      </span>
                    </div>
                    {parent === "report" && (
                      <div className={styles.activityCardRow}>
                        <span className={styles.activityCardLabel}>
                          {text.doneBy}
                        </span>
                        <span className={styles.activityCardValue}>empty</span>
                      </div>
                    )}
                    {parent === "myTask" && (
                      <div className={styles.activityCardRow}>
                        <span className={styles.activityCardLabel}>
                          {text.action}
                        </span>
                        <span
                          className={styles.activityCardValue}
                          ref={(el) => {
                            dropdownRef.current[`adm${act.id}`] = el;
                          }}
                        >
                          {actionDropdown === `adm${act.id}` ? (
                            <div className={styles.actionWrapper}>
                              <button
                                className={styles.editBtn}
                                onClick={() => {
                                  setFormData({
                                    nameEn: act.name["en"],
                                    nameAm: act.name["am"],
                                    date: act.date,
                                    quality: "",
                                    frequency: act.frequency,
                                    startingTime: act.startingTime,
                                    endingTime: act.endingTime,
                                    totalHour: act.totalHour,
                                  });
                                  setSelected({ type: "ad", act });
                                  setEditMode(true);
                                  setActionDropdown(null);
                                }}
                              >
                                <span>
                                  <FiEdit />
                                </span>
                                <span>{text.edit}</span>
                              </button>
                              <button
                                className={styles.deleteBtn}
                                onClick={() => {
                                  setSelected({ type: "ad", act });
                                  setDeleteMode(true);
                                  setActionDropdown(null);
                                }}
                              >
                                <span>
                                  <FiTrash2 />
                                </span>
                                <span>{text.delete}</span>
                              </button>
                            </div>
                          ) : (
                            <div
                              className={styles.moreVertical}
                              onClick={() => setActionDropdown(`adm${act.id}`)}
                            >
                              <FiMoreVertical />
                            </div>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {/* eidt or delete */}
      </div>
      {(editMode || deleteMode) && (
        <div className="overlay">
          <div className={styles.editDelete}>
            <div className={styles.panelHeader}>
              {editMode && (
                <h3 className={styles.headerTitile}>
                  {text.activity} : {selected && selected.act.name[lang]}
                </h3>
              )}
              <button
                onClick={() => {
                  setEditMode(false);
                  setDeleteMode(false);
                  setSelected(null);
                  setErrors({
                    nameEn: "",
                    nameAm: "",
                    date: "",
                    quality: "",
                    frequency: "",
                    startingTime: "",
                    endingTime: "",
                  });
                  setFormData({
                    nameEn: "",
                    nameAm: "",
                    date: "",
                    quality: "",
                    frequency: "",
                    startingTime: "",
                    endingTime: "",
                    totalHour: "",
                  });
                }}
                className={styles.closeIconButton}
                aria-label="Close panel"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {editMode && (
              <>
                <form className={styles.form} onSubmit={handleEditSubmit}>
                  {selected?.type === "ad" && (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Name</label>
                        <input
                          className={styles.input}
                          value={formData.nameEn}
                          onChange={(e) =>
                            handleEditFieldChange("nameEn", e.target.value)
                          }
                          placeholder=" name"
                        />
                      </div>
                      {errors.nameEn && (
                        <div className={styles.error}>{errors.nameEn}</div>
                      )}
                      <div className={styles.formGroup}>
                        <label className={styles.label}>ስም</label>
                        <input
                          className={styles.input}
                          value={formData.nameAm}
                          onChange={(e) =>
                            handleEditFieldChange("nameAm", e.target.value)
                          }
                          placeholder="ስም"
                        />
                      </div>
                      {errors.nameAm && (
                        <div className={styles.error}>{errors.nameAm}</div>
                      )}
                    </>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{text.date}</label>
                    <input
                      className={styles.input}
                      value={formData.date}
                      onChange={(e) =>
                        handleEditFieldChange("date", e.target.value)
                      }
                      type="Date"
                      style={{ width: `${width}px` }}
                    />
                  </div>
                  {errors.date && (
                    <div className={styles.error}>{errors.date}</div>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{text.freq}</label>
                    <input
                      type="number"
                      min="1"
                      className={styles.input}
                      value={formData.frequency}
                      onChange={(e) =>
                        handleEditFieldChange("frequency", e.target.value)
                      }
                      placeholder="e.g. 3"
                      ref={refTextInput}
                    />
                  </div>
                  {errors.frequency && (
                    <div className={styles.error}>{errors.frequency}</div>
                  )}
                  {selected?.type === "st" && (
                    <>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>{text.quality}</label>
                        <input
                          className={styles.input}
                          value={formData.quality}
                          onChange={(e) =>
                            handleEditFieldChange("quality", e.target.value)
                          }
                          placeholder="100%"
                        />
                      </div>
                      {errors.quality && (
                        <div className={styles.error}>{errors.quality}</div>
                      )}
                    </>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{text.startingTime}</label>
                    <input
                      className={styles.input}
                      value={formData.startingTime}
                      onChange={(e) =>
                        handleEditFieldChange("startingTime", e.target.value)
                      }
                      type="time"
                      style={{ width: `${width}px` }}
                    />
                  </div>
                  {errors.startingTime && (
                    <div className={styles.error}>{errors.startingTime}</div>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{text.endingTime}</label>
                    <input
                      className={styles.input}
                      value={formData.endingTime}
                      onChange={(e) =>
                        handleEditFieldChange("endingTime", e.target.value)
                      }
                      type="time"
                      style={{ width: `${width}px` }}
                    />
                  </div>
                  {errors.endingTime && (
                    <div className={styles.error}>{errors.endingTime}</div>
                  )}
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{text.totalHour}</label>
                    <input
                      className={styles.input}
                      value={formData.totalHour}
                      onChange={(e) =>
                        handleEditFieldChange("totalHour", e.target.value)
                      }
                      type="text"
                      disabled
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => {
                        setEditMode(false);
                        setSelected(null);
                        setErrors({
                          nameEn: "",
                          nameAm: "",
                          date: "",
                          quality: "",
                          frequency: "",
                          startingTime: "",
                          endingTime: "",
                        });
                        setFormData({
                          nameEn: "",
                          nameAm: "",
                          date: "",
                          quality: "",
                          frequency: "",
                          startingTime: "",
                          endingTime: "",
                          totalHour: "",
                        });
                      }}
                    >
                      {text.cancel}
                    </button>
                    <button type="submit" className={styles.saveButton}>
                      {text.save}
                    </button>
                  </div>
                </form>
                {showSuccessMessage && (
                  <>
                    <div className="successMessageWrapper">
                      <div className="successMessage">{text.editMessage}</div>
                      <div className="overlay" style={{ zIndex: "1001" }}></div>
                    </div>
                  </>
                )}
              </>
            )}
            {deleteMode && (
              <>
                <form className={styles.form} onSubmit={handleDeleteSubmit}>
                  {lang === "en" ? (
                    <div>
                      are you sure you wan to delete{" "}
                      {selected && selected.act.name[lang]}?
                    </div>
                  ) : (
                    <div>
                      {selected && selected.act.name[lang]}ን ለማጥፋት ይፈልጋሉ?
                    </div>
                  )}
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => {
                        setDeleteMode(false);
                        setSelected(null);
                      }}
                    >
                      {text.no}
                    </button>
                    <button type="submit" className={styles.saveButton}>
                      {text.yes}
                    </button>
                  </div>
                </form>
                {showSuccessMessage && (
                  <>
                    <div className="successMessageWrapper">
                      <div className="successMessage">{text.deleteMessage}</div>
                    </div>
                    <div className="overlay" style={{ zIndex: "1001" }}></div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
