/**
 * Parse date string in format "D-MMM-YYYY" (e.g., "8-Sep-2025")
 * @param {string} dateStr
 * @returns {Date}
 */
export function parseDate(dateStr) {
  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };

  const parts = dateStr.split('-');
  const day = parseInt(parts[0], 10);
  const month = months[parts[1]];
  const year = parseInt(parts[2], 10);

  return new Date(year, month, day);
}

/**
 * Generate a unique column key for a report
 * @param {Object} report
 * @returns {string}
 */
export function getColumnKey(report) {
  return `${report.date}_${report.lab_name}`;
}

/**
 * Transform reports into matrix format for table display
 * @param {Array} reports - Array of report objects
 * @returns {Object} - { columns: sorted reports, rows: biomarker data }
 */
export function transformToMatrix(reports) {
  // Sort reports by date descending (newest first)
  const sortedReports = [...reports].sort((a, b) =>
    parseDate(b.date) - parseDate(a.date)
  );

  // Extract all unique biomarker names across all reports
  const biomarkerSet = new Set();
  sortedReports.forEach(report => {
    report.results.forEach(result => {
      biomarkerSet.add(result.name);
    });
  });

  // Create rows where each row is a biomarker with results from each report
  const rows = Array.from(biomarkerSet).map(biomarkerName => {
    const row = { biomarker: biomarkerName };

    sortedReports.forEach(report => {
      const result = report.results.find(r => r.name === biomarkerName);
      const key = getColumnKey(report);
      row[key] = result ? {
        result: result.result,
        unit: result.unit,
        reference: result.reference
      } : null;
    });

    return row;
  });

  return {
    columns: sortedReports,
    rows
  };
}

/**
 * Get all unique biomarker names from reports
 * @param {Array} reports
 * @returns {Array<string>}
 */
export function getAllBiomarkers(reports) {
  const biomarkerSet = new Set();
  reports.forEach(report => {
    report.results.forEach(result => {
      biomarkerSet.add(result.name);
    });
  });
  return Array.from(biomarkerSet).sort();
}
