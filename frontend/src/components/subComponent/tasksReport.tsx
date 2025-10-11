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
import type {
  AdditionalReport,
  ReportActivity,
  StandardReport,
} from "../../context/appDataContext";
import EthiopianCalendar from "./ethioCalander";
import {
  gregorianToEthiopian,
  ETHIOPIAN_MONTHS,
  formatEthDate,
} from "../../actions/dataConverter";
interface tasksReportProps {
  parent: "report" | "myTask";
  selectedTeamUser?: TeamUserOption | null;
}
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

export default function TaskReport({
  parent,
  selectedTeamUser,
}: tasksReportProps) {
  const {
    standardReports,
    setStandardReports,
    additionalReports,
    setAdditionalReports,
    profileImage,
    employees,
    user,
    serverAddress,
    services,
  } = useAppData();

  const today = new Date();
  const { lang } = useLang();
  const translate = {
    am: tasksReportAm,
    en: tasksReportEn,
  };
  const text = translate[lang];
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [showFailMessage, setShowFailMessage] = useState<boolean>(false);
  const [inAPIRequest, setInAPIRequest] = useState<boolean>(false);
  const [initialDate, setInitialDate] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate());
    return d.toISOString().split("T")[0];
  });
  const [finalDate, setFinalDate] = useState(
    () => today.toISOString().split("T")[0]
  );
  const [filteredStandardServices, setFilteredStandardServices] = useState<
    StandardReport[] | null
  >(standardReports);
  const [filteredAdditionalServices, setFilteredAdditionalServices] = useState<
    AdditionalReport[] | null
  >(additionalReports);
  const [editMode, setEditMode] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selected, setSelected] = useState<{
    type: "ad" | "st";
    act: ReportActivity | AdditionalReport;
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
  //close panels
  const closeEditPanel = () => {
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
  };
  const closeDeletePanel = () => {
    setDeleteMode(false);
    setSelected(null);
  };
  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setInAPIRequest(true);

    if (!selected) return;

    // Prepare postData
    const postData =
      selected.type === "st"
        ? {
            frequency: formData.frequency,
            quality: formData.quality,
            startingTime: formData.startingTime,
            endingTime: formData.endingTime,
            totalHour: formData.totalHour,
            date: formData.date,
          }
        : {
            name: { am: formData.nameAm, en: formData.nameEn },
            frequency: formData.frequency,
            startingTime: formData.startingTime,
            endingTime: formData.endingTime,
            totalHour: formData.totalHour,
            date: formData.date,
          };

    try {
      const response = await fetch(
        `${serverAddress}/reports/${selected.act.id}/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Update failed:", error);
        setShowFailMessage(true);
        setTimeout(() => setShowFailMessage(false), 3000);
        return;
      }

      const data = await response.json();
      if (selected.type === "st") {
        const updatedActivity = data[0]?.subServices?.[0]?.activities?.[0];
        if (!updatedActivity)
          throw new Error("Invalid update response for standard activity");

        setStandardReports((prev) =>
          prev.map((service) => ({
            ...service,
            subServices: service.subServices.map((sub) => ({
              ...sub,
              activities: sub.activities.map((act) =>
                act.id === updatedActivity.id ? updatedActivity : act
              ),
            })),
          }))
        );
      } else {
        const updatedActivity = data[0];
        if (!updatedActivity)
          throw new Error("Invalid update response for additional activity");

        setAdditionalReports((prev) =>
          prev.map((act) =>
            act.id === updatedActivity.id ? updatedActivity : act
          )
        );
      }

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        closeEditPanel();
      }, 3000);
    } catch (error) {
      console.error("Error updating report:", error);
      setShowFailMessage(true);
      setTimeout(() => setShowFailMessage(false), 3000);
    } finally {
      setInAPIRequest(false);
    }
  };

  const handleDeleteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setInAPIRequest(true);
    if (!selected) return;
    try {
      const response = await fetch(
        `${serverAddress}/reports/${selected.act.id}/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Update failed:", error);
        setShowFailMessage(true);
        setTimeout(() => setShowFailMessage(false), 3000);
        return;
      }
      if (selected.type === "st") {
        setStandardReports((prev) =>
          prev
            .map((service) => {
              const subCopy = service.subServices
                .map((sub) => {
                  const actCopy = sub.activities.filter(
                    (act) => act.id !== selected.act.id
                  );
                  if (actCopy.length > 0) {
                    return { ...sub, activities: actCopy };
                  }
                  return null;
                })
                .filter((sub) => sub !== null);
              if (subCopy.length > 0) {
                return { ...service, subServices: subCopy };
              }
              return null;
            })
            .filter((s) => s !== null)
        );
      } else {
        setAdditionalReports((prev) =>
          prev.filter((act) => act.id !== selected.act.id)
        );
      }

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        closeDeletePanel();
      }, 3000);
    } catch (error) {
      console.error("Error updating report:", error);
      setShowFailMessage(true);
      setTimeout(() => setShowFailMessage(false), 3000);
    } finally {
      setInAPIRequest(false);
    }
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
    return new Date(date).toLocaleDateString("en-US", {
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
  const formatEthiopianDateToHumanDate = (dateString: string) => {
    const date = new Date(dateString);
    const { day, month, year } = gregorianToEthiopian(date);
    return ETHIOPIAN_MONTHS[month - 1] + " " + day + " " + year;
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
        lang === "am"
          ? formatToDDMMYYYY(
              formatEthDate(gregorianToEthiopian(new Date(service.date)))
            )
          : formatToDDMMYYYY(service.date),
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
      didDrawPage: () => {
        doc.setFont("NotoSansEthiopic", "normal"); // ensure Amharic font

        // -------- SIGNATURE ROW (every page) --------
        const sigY = pageHeight - margin - 20;
        const pattern = [2, 2, 1, 1, 2, 2, 1, 1];
        const gapPattern = [5, 20, 5, 20];
        const blockHeight = 20;
        const labels = [
          text.employeeName,
          user.name[lang],
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
        lang === "am"
          ? formatToDDMMYYYY(
              formatEthDate(gregorianToEthiopian(new Date(service.date)))
            )
          : formatToDDMMYYYY(service.date),
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

    if (!filteredStandardServices && !filteredAdditionalServices)
      return totalServices;

    const parseTimeToMinutes = (time?: string | null) => {
      if (!time) return 0;
      const parts = time.split(":").map((p) => p.trim());
      const hh = parts[0] ? parseInt(parts[0], 10) : 0;
      const mm = parts[1] ? parseInt(parts[1], 10) : 0;
      if (Number.isNaN(hh) || Number.isNaN(mm)) return 0;
      return hh * 60 + mm;
    };

    const parseQuality = (q?: string | number | null) => {
      if (q == null) return 0;
      if (typeof q === "number") return q;
      const asNum = parseFloat(String(q).replace("%", "").trim());
      return Number.isNaN(asNum) ? 0 : asNum;
    };

    // --- Standard services ---
    if (filteredStandardServices) {
      for (const s of filteredStandardServices) {
        for (const sub of s.subServices) {
          const activityPerformances: number[] = [];

          for (const act of sub.activities) {
            const originalActivity = services
              .find((service) => service.id === s.id)
              ?.subServices.find((ss) => ss.id === sub.id)
              ?.activities.find((a) => a.id === act.activity_id);
            let actQTQ = "";
            let avgActQlt = "";
            let avgsubServiceQlt = "";

            if (originalActivity) {
              const plannedFreq = parseInt(
                originalActivity.frequency || "0",
                10
              );
              const plannedTimeMinutes = parseTimeToMinutes(
                originalActivity.time
              );
              const actualFreq = act.frequency
                ? parseInt(act.frequency, 10)
                : 0;
              const actualTimeMinutes = parseTimeToMinutes(act.totalHour);

              const plannedQuality = parseQuality(originalActivity.quality);
              const actualQuality = parseQuality(act.quality);

              let timeScore = 0;
              if (plannedTimeMinutes > 0 && actualTimeMinutes > 0) {
                timeScore =
                  ((plannedTimeMinutes * actualFreq) /
                    (actualTimeMinutes * plannedFreq)) *
                  100;
              }

              let freqScore = 0;
              if (plannedFreq > 0 && actualTimeMinutes > 0) {
                freqScore =
                  ((actualFreq * plannedTimeMinutes) /
                    (actualTimeMinutes * plannedFreq)) *
                  100;
              }

              let qualityScore = 0;
              if (plannedQuality > 0) {
                qualityScore = (actualQuality / plannedQuality) * 100;
              } else {
                qualityScore = actualQuality;
              }

              const activityPerf = (timeScore + freqScore + qualityScore) / 3;
              activityPerformances.push(activityPerf);

              const fmt = (v: number) => Number(v.toFixed(2));

              actQTQ = `${fmt(freqScore)}%, ${fmt(timeScore)}%, ${fmt(
                qualityScore
              )}%`;
              avgActQlt = `${fmt(timeScore)}% + ${fmt(freqScore)}% + ${fmt(
                qualityScore
              )}% / 3 =${fmt(activityPerf)}%`;
            }

            const activity: pdfDataFormat = {
              serviceName: s.name[lang],
              subServiceName: sub.name[lang],
              activityName: act.name[lang],
              date: act.date,
              frequency: act.frequency,
              quality: act.quality || "",
              startingTime: act.startingTime,
              endingTime: act.endingTime,
              totalHour: act.totalHour,
              activityBPR: originalActivity
                ? `${originalActivity.frequency}, ${originalActivity.time}, ${originalActivity.quality}`
                : "",
              actQTQ,
              avgActQlt,
              avgsubServiceQlt, // will update below
            };
            totalServices.push(activity);
          }

          // --- compute subservice average ---
          if (activityPerformances.length > 0) {
            const subAvg =
              activityPerformances.reduce((a, b) => a + b, 0) /
              activityPerformances.length;

            // update activities of this subservice with avgsubServiceQlt
            totalServices.forEach((a) => {
              if (
                a.subServiceName === sub.name[lang] &&
                a.serviceName === s.name[lang]
              ) {
                if (subAvg) {
                  if (subAvg < 100)
                    a.avgsubServiceQlt =
                      lang === "am"
                        ? `በሰሌቱ መሰረት የንኡስ አገልግሎት አፈፃፀም ${subAvg.toFixed(
                            2
                          )}% ሲሆን ክንውኑም ከሰታንዳርድ በታች ነዉ።`
                        : `Based on the calculation sub service's performance is ${subAvg.toFixed(
                            2
                          )}% and it is below the standard`;
                  else if (subAvg === 100) {
                    a.avgsubServiceQlt =
                      lang === "am"
                        ? "በሰሌቱ መሰረት የንኡስ አገልግሎት አፈፃፀም 100% ሲሆን ክንውኑም በሰታንዳርድ መሰረት ነዉ።"
                        : "Based on the calculation sub service's performance is 100% and it is based on the standard.";
                  } else {
                    a.avgsubServiceQlt =
                      lang === "am"
                        ? `በሰሌቱ መሰረት የንኡስ አገልግሎት አፈፃፀም ${subAvg.toFixed(
                            2
                          )}% ሲሆን ክንውኑም ከሰታንዳርድ በላይ ነዉ።`
                        : `Based on the calculation sub service's performance is ${subAvg.toFixed(
                            2
                          )}% and it is above the standard`;
                  }
                } else {
                  a.avgsubServiceQlt =
                    lang === "am" ? "በስታንዳርድ የተሰራ" : "Done based on standard.";
                }
              }
            });
          }
        }
      }
    }

    // --- Additional services ---
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
          avgsubServiceQlt:
            lang === "am"
              ? "ከቢፒአር ዕቅድ ውጭ የተሰራ"
              : "It has been done without BPR plan.",
        };
        totalServices.push(activity);
      }
    }

    // --- sort by date desc ---
    totalServices.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return totalServices;
  };

  useEffect(() => {
    const filterStandardServices = (
      services: StandardReport[] | null,
      startDate: string,
      endDate: string
    ): StandardReport[] | null => {
      if (services === null) return null;
      const start = new Date(startDate);
      const end = new Date(endDate);

      return services
        .map((service) => {
          const filteredSubServices = service.subServices
            .map((sub) => {
              const filteredActivities = sub.activities.filter((act) => {
                const actDate = new Date(act.date);
                if (actDate >= start && actDate <= end) {
                  if (parent === "myTask") {
                    return act.user_id === user.id;
                  } else if (parent === "report" && selectedTeamUser) {
                    if (selectedTeamUser.value.type === "all") {
                      return true;
                    } else if (selectedTeamUser.value.type === "team") {
                      const emp = employees.find(
                        (emp) => emp.id === act.user_id
                      );
                      return emp?.team?.id === selectedTeamUser.value.id;
                    } else if (selectedTeamUser.value.type === "user") {
                      return act.user_id === selectedTeamUser.value.id;
                    }
                  } else {
                    return true;
                  }
                } else {
                  return false;
                }
              });
              return { ...sub, activities: filteredActivities };
            })
            .filter((sub) => sub.activities.length > 0);

          return { ...service, subServices: filteredSubServices };
        })
        .filter((service) => service.subServices.length > 0);
    };
    const filterAdditionalActivities = (
      activities: AdditionalReport[] | null,
      initialDate: string,
      finalDate: string
    ): AdditionalReport[] | null => {
      if (activities === null) return null;
      const start = new Date(initialDate);
      const end = new Date(finalDate);

      return activities.filter((act) => {
        const actDate = new Date(act.date);
        if (actDate >= start && actDate <= end) {
          if (parent === "myTask") {
            return act.user_id === user.id;
          } else if (parent === "report" && selectedTeamUser) {
            if (selectedTeamUser.value.type === "all") {
              return true;
            } else if (selectedTeamUser.value.type === "team") {
              const emp = employees.find((emp) => emp.id === act.user_id);
              return emp?.team?.id === selectedTeamUser.value.id;
            } else if (selectedTeamUser.value.type === "user") {
              return act.user_id === selectedTeamUser.value.id;
            }
          } else {
            return true;
          }
        } else {
          return false;
        }
      });
    };
    if (initialDate && finalDate) {
      setFilteredStandardServices(
        filterStandardServices(standardReports, initialDate, finalDate)
      );
      setFilteredAdditionalServices(
        filterAdditionalActivities(additionalReports, initialDate, finalDate)
      );
    }
  }, [
    initialDate,
    finalDate,
    parent,
    selectedTeamUser,
    standardReports,
    additionalReports,
  ]);
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
              {lang === "am" ? (
                <EthiopianCalendar
                  value={new Date(initialDate) || new Date()}
                  onChange={(selectedDate: string) => {
                    setInitialDate(selectedDate);
                  }}
                  className={styles.datePicker}
                />
              ) : (
                <input
                  type="date"
                  className={styles.datePicker}
                  value={initialDate}
                  onChange={handleInitialDateChange}
                  max={finalDate}
                />
              )}
            </div>
            <div>
              <label className={styles.label}>{text.finalDate}</label>
              {lang === "am" ? (
                <EthiopianCalendar
                  value={new Date(finalDate) || new Date()}
                  onChange={(selectedDate: string) => {
                    setFinalDate(selectedDate);
                  }}
                  className={styles.datePicker}
                />
              ) : (
                <input
                  type="date"
                  className={styles.datePicker}
                  value={finalDate}
                  onChange={handleFinalDateChange}
                  min={initialDate}
                />
              )}
            </div>
          </div>
          <div className={styles.dateRange}>
            <div>
              {text.from}{" "}
              {lang === "am"
                ? formatEthiopianDateToHumanDate(initialDate)
                : formatToHumanDate(initialDate)}{" "}
            </div>
            <div>
              {text.to}{" "}
              {lang === "am"
                ? formatEthiopianDateToHumanDate(finalDate)
                : formatToHumanDate(finalDate)}{" "}
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
                            {/* <span>
                              {text.quality}: {sub.quality}
                            </span> */}
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
                                  <td>
                                    {lang === "am"
                                      ? formatToDDMMYYYY(
                                          formatEthDate(
                                            gregorianToEthiopian(
                                              new Date(act.date)
                                            )
                                          )
                                        )
                                      : formatToDDMMYYYY(act.date)}
                                  </td>
                                  <td>{act.frequency}</td>
                                  <td>{act.quality}</td>
                                  <td>{act.startingTime}</td>
                                  <td>{act.endingTime}</td>
                                  <td>{act.totalHour}</td>
                                  {parent === "report" && (
                                    <td>
                                      {
                                        [...employees, user].find(
                                          (emp) => emp.id === act.user_id
                                        )?.name[lang]
                                      }
                                    </td>
                                  )}
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
                                    {lang === "am"
                                      ? formatToDDMMYYYY(
                                          formatEthDate(
                                            gregorianToEthiopian(
                                              new Date(act.date)
                                            )
                                          )
                                        )
                                      : formatToDDMMYYYY(act.date)}
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
                                      {
                                        [...employees, user].find(
                                          (emp) => emp.id === act.user_id
                                        )?.name[lang]
                                      }
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
                      <td>
                        {lang === "am"
                          ? formatToDDMMYYYY(
                              formatEthDate(
                                gregorianToEthiopian(new Date(act.date))
                              )
                            )
                          : formatToDDMMYYYY(act.date)}
                      </td>
                      <td>{act.frequency}</td>
                      <td>{act.startingTime}</td>
                      <td>{act.endingTime}</td>
                      <td>{act.totalHour}</td>
                      {parent === "report" && (
                        <td>
                          {
                            [...employees, user].find(
                              (emp) => emp.id === act.user_id
                            )?.name[lang]
                          }
                        </td>
                      )}
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
                        {lang === "am"
                          ? formatToDDMMYYYY(
                              formatEthDate(
                                gregorianToEthiopian(new Date(act.date))
                              )
                            )
                          : formatToDDMMYYYY(act.date)}
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
                        <span className={styles.activityCardValue}>
                          {
                            [...employees, user].find(
                              (emp) => emp.id === act.user_id
                            )?.name[lang]
                          }
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
        {/* edit or delete */}
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
                      onClick={closeEditPanel}
                      disabled={inAPIRequest}
                    >
                      {text.cancel}
                    </button>
                    <button
                      type="submit"
                      className={styles.saveButton}
                      disabled={inAPIRequest}
                    >
                      {inAPIRequest ? text.saving : text.save}
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
                {showFailMessage && (
                  <div className="failMessageWrapper">
                    <div className="failMessage">
                      {lang === "en"
                        ? "Request failed.Please try again later."
                        : "ጥያቄዎን ማስተናገድ አልተቻለም። እባክዎን እንደገና ይሞክሩ።"}
                    </div>
                  </div>
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
                      onClick={closeDeletePanel}
                      disabled={inAPIRequest}
                    >
                      {text.no}
                    </button>
                    <button
                      type="submit"
                      className={styles.saveButton}
                      disabled={inAPIRequest}
                    >
                      {inAPIRequest ? text.deleting : text.yes}
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
                {showFailMessage && (
                  <div className="failMessageWrapper">
                    <div className="failMessage">
                      {lang === "en"
                        ? "Request failed.Please try again later."
                        : "ጥያቄዎን ማስተናገድ አልተቻለም። እባክዎን እንደገና ይሞክሩ።"}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
