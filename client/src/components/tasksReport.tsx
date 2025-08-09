import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import styles from "../styles/tasksReport.module.css";

const data = [
  {
    serviceName: "Cleaning Service",
    quality: 85,
    subServices: [
      {
        subServiceName: "Floor Cleaning",
        quality: 80,
        activities: [
          {
            activityName: "Sweeping",
            time: "08:00",
            frequency: "Daily",
            quality: "Good",
            performance: "95%",
          },
          {
            activityName: "Mopping",
            time: "10:00",
            frequency: "Daily",
            quality: "Very Good",
            performance: "92%",
          },
        ],
      },
      {
        subServiceName: "Window Cleaning",
        quality: 90,
        activities: [
          {
            activityName: "Interior Windows",
            time: "12:00",
            frequency: "Weekly",
            quality: "Excellent",
            performance: "98%",
          },
        ],
      },
    ],
  },
  {
    serviceName: "Security Service",
    quality: 92,
    subServices: [
      {
        subServiceName: "Gate Monitoring",
        quality: 93,
        activities: [
          {
            activityName: "Entry Logs",
            time: "24/7",
            frequency: "Hourly",
            quality: "Excellent",
            performance: "99%",
          },
        ],
      },
    ],
  },
];

const additionalActivities = [
  {
    serviceName: "Pest Control",
    frequency: "Monthly",
    startTime: "09:00",
    endTime: "10:00",
  },
  {
    serviceName: "Garden Maintenance",
    frequency: "Weekly",
    startTime: "07:00",
    endTime: "09:00",
  },
];

export default function TaskReport() {
  const today = new Date();
  const [initialDate, setInitialDate] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [finalDate, setFinalDate] = useState(
    () => today.toISOString().split("T")[0]
  );

  const handleInitialDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInitialDate(e.target.value);
    if (e.target.value > finalDate) setFinalDate(e.target.value);
  };
  const handleFinalDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFinalDate(e.target.value);
    if (e.target.value < initialDate) setInitialDate(e.target.value);
  };

  const handleDownloadStandardPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Standard Service Report", 14, 20);

    let y = 30;
    data.forEach((service, index) => {
      doc.setFontSize(14);
      doc.text(
        `${index + 1}. ${service.serviceName} (${service.quality}%)`,
        14,
        y
      );
      y += 12; // More space after service title
      service.subServices.forEach((sub) => {
        doc.setFontSize(12);
        doc.text(`- ${sub.subServiceName} (${sub.quality}%)`, 16, y);
        y += 8; // More space after subservice title

        const rows = sub.activities.map((act) => [
          act.activityName,
          act.time,
          act.frequency,
          act.quality,
          act.performance,
        ]);

        autoTable(doc, {
          head: [["Activity", "Time", "Frequency", "Quality", "Performance"]],
          body: rows,
          startY: y,
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 11 },
          margin: { left: 14, right: 14 },
        });

        const autoTableDoc = doc as jsPDF & {
          lastAutoTable?: { finalY: number };
        };
        y = (autoTableDoc.lastAutoTable?.finalY || y) + 16;
      });
      y += 8; // Extra space between services
    });

    doc.save("StandardServiceReport.pdf");
  };

  const handleDownloadStandardExcel = () => {
    const wb = XLSX.utils.book_new();

    const ws_data: any[][] = [
      [
        "Service Name",
        "Quality (Service)",
        "SubService Name",
        "Quality (SubService)",
        "Activity",
        "Time",
        "Frequency",
        "Quality (Activity)",
        "Performance",
      ],
    ];

    const merges: XLSX.Range[] = [];
    let rowIndex = 1; // header is 0

    data.forEach((service) => {
      const serviceStartRow = rowIndex;

      service.subServices.forEach((sub) => {
        const subStartRow = rowIndex;

        sub.activities.forEach((act) => {
          ws_data.push([
            service.serviceName,
            service.quality,
            sub.subServiceName,
            sub.quality,
            act.activityName,
            act.time,
            act.frequency,
            act.quality,
            act.performance,
          ]);
          rowIndex++;
        });

        if (sub.activities.length > 1) {
          merges.push({
            s: { r: subStartRow, c: 2 },
            e: { r: rowIndex - 1, c: 2 },
          });
          merges.push({
            s: { r: subStartRow, c: 3 },
            e: { r: rowIndex - 1, c: 3 },
          });
        }
      });

      if (rowIndex - serviceStartRow > 1) {
        merges.push({
          s: { r: serviceStartRow, c: 0 },
          e: { r: rowIndex - 1, c: 0 },
        });
        merges.push({
          s: { r: serviceStartRow, c: 1 },
          e: { r: rowIndex - 1, c: 1 },
        });
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    if (!ws["!merges"]) ws["!merges"] = [];
    merges.forEach((m) => (ws["!merges"] as XLSX.Range[]).push(m));
    XLSX.utils.book_append_sheet(wb, ws, "Standard Services");
    XLSX.writeFile(wb, "StandardServiceReport.xlsx");
  };

  const handleDownloadAdditionalPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Additional Services Report", 14, 20);

    const rows = additionalActivities.map((act) => [
      act.serviceName,
      act.frequency,
      act.startTime,
      act.endTime,
    ]);

    autoTable(doc, {
      head: [["Service Name", "Frequency", "Start Time", "End Time"]],
      body: rows,
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 11 },
    });

    doc.save("AdditionalServicesReport.pdf");
  };

  const handleDownloadAdditionalExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = [
      ["Service Name", "Frequency", "Start Time", "End Time"],
      ...additionalActivities.map((act) => [
        act.serviceName,
        act.frequency,
        act.startTime,
        act.endTime,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Additional Activities");
    XLSX.writeFile(wb, "AdditionalActivities.xlsx");
  };

  // Check for empty services
  const noStandardService = !data || data.length === 0;
  const noAdditionalService =
    !additionalActivities || additionalActivities.length === 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <label>From:</label>
          <input
            type="date"
            className={styles.datePicker}
            value={initialDate}
            onChange={handleInitialDateChange}
            max={finalDate}
          />
        </div>
        <div>
          <span>To:</span>
          <input
            type="date"
            className={styles.datePicker}
            value={finalDate}
            onChange={handleFinalDateChange}
            min={initialDate}
          />
        </div>
      </div>
      <div className={styles.standardService}>
        <h1>Standard Services</h1>
        {noStandardService ? (
          <div className={styles.noTaskMessage}>
            No standard services available.
          </div>
        ) : (
          <>
            {data.map((service, idx) => (
              <div key={idx} className={styles.serviceBlock}>
                <details className={styles.serviceDetails}>
                  <summary className={styles.serviceTitle}>
                    <div className={styles.serviceTitleContent}>
                      <span>{service.serviceName} </span>
                      <span>quality: {service.quality}%</span>
                    </div>
                  </summary>
                  {service.subServices.map((sub, i) => (
                    <div key={i} className={styles.subServiceBlock}>
                      <h4 className={styles.subServiceTitle}>
                        <span>{sub.subServiceName}</span>{" "}
                        <span>quality: {sub.quality}%</span>
                      </h4>
                      {/* Table for desktop */}
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Activity</th>
                            <th>Time</th>
                            <th>Frequency</th>
                            <th>Quality</th>
                            <th>Performance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sub.activities.map((act, j) => (
                            <tr key={j}>
                              <td>{act.activityName}</td>
                              <td>{act.time}</td>
                              <td>{act.frequency}</td>
                              <td>{act.quality}</td>
                              <td>{act.performance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* Card table for mobile */}
                      <div className={styles.activityTableCard}>
                        {sub.activities.map((act, j) => (
                          <div key={j} className={styles.activityCard}>
                            <div className={styles.activityCardRow}>
                              <span className={styles.activityCardLabel}>
                                Activity
                              </span>
                              <span className={styles.activityCardValue}>
                                {act.activityName}
                              </span>
                            </div>
                            <div className={styles.activityCardRow}>
                              <span className={styles.activityCardLabel}>
                                Time
                              </span>
                              <span className={styles.activityCardValue}>
                                {act.time}
                              </span>
                            </div>
                            <div className={styles.activityCardRow}>
                              <span className={styles.activityCardLabel}>
                                Frequency
                              </span>
                              <span className={styles.activityCardValue}>
                                {act.frequency}
                              </span>
                            </div>
                            <div className={styles.activityCardRow}>
                              <span className={styles.activityCardLabel}>
                                Quality
                              </span>
                              <span className={styles.activityCardValue}>
                                {act.quality}
                              </span>
                            </div>
                            <div className={styles.activityCardRow}>
                              <span className={styles.activityCardLabel}>
                                Performance
                              </span>
                              <span className={styles.activityCardValue}>
                                {act.performance}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </details>
              </div>
            ))}
            <div className={styles.downloadButtons}>
              <button onClick={handleDownloadStandardPDF}>Get pdf file</button>
              <button onClick={handleDownloadStandardExcel}>
                Get excel file
              </button>
            </div>
          </>
        )}
      </div>
      <div className={styles.additionalService}>
        <h1>Additional Services</h1>
        {noAdditionalService ? (
          <div className={styles.noTaskMessage}>
            No additional services available.
          </div>
        ) : (
          <>
            {/* Table for desktop */}
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Frequency</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                </tr>
              </thead>
              <tbody>
                {additionalActivities.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.serviceName}</td>
                    <td>{item.frequency}</td>
                    <td>{item.startTime}</td>
                    <td>{item.endTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Card table for mobile */}
            <div className={styles.activityTableCard}>
              {additionalActivities.map((item, idx) => (
                <div key={idx} className={styles.activityCard}>
                  <div className={styles.activityCardRow}>
                    <span className={styles.activityCardLabel}>
                      Service Name
                    </span>
                    <span className={styles.activityCardValue}>
                      {item.serviceName}
                    </span>
                  </div>
                  <div className={styles.activityCardRow}>
                    <span className={styles.activityCardLabel}>Frequency</span>
                    <span className={styles.activityCardValue}>
                      {item.frequency}
                    </span>
                  </div>
                  <div className={styles.activityCardRow}>
                    <span className={styles.activityCardLabel}>Start Time</span>
                    <span className={styles.activityCardValue}>
                      {item.startTime}
                    </span>
                  </div>
                  <div className={styles.activityCardRow}>
                    <span className={styles.activityCardLabel}>End Time</span>
                    <span className={styles.activityCardValue}>
                      {item.endTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.downloadButtons}>
              <button onClick={handleDownloadAdditionalPDF}>
                Get pdf file
              </button>
              <button onClick={handleDownloadAdditionalExcel}>
                Get excel file
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
