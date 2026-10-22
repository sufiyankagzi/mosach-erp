
// ============================================
// MOSACH ERP - Production Report Utilities
// ============================================

// API URL
export const API_URL =
  "https://mosach-erp-server.onrender.com/api/production-report";


// ============================================
// GET VALUE FROM ROW
// Case-insensitive field lookup
// ============================================

export const getValue = (row, key) => {
  if (!row || !key) return "";

  if (row[key] !== undefined && row[key] !== null) {
    return row[key];
  }

  const searchKey = String(key).toLowerCase();

  const foundKey = Object.keys(row).find(
    (item) => item.toLowerCase() === searchKey
  );

  return foundKey ? row[foundKey] ?? "" : "";
};


// ============================================
// GET ROWS FROM API RESPONSE
// ============================================

export const getRowsFromResponse = (payload) => {
  const candidates = [
    payload?.data?.rows,
    payload?.data?.uploadedRows,
    payload?.data?.records,
    payload?.rows,
    payload?.uploadedRows,
    payload?.records,
    payload?.result?.rows,
    payload?.result?.uploadedRows,
    payload?.result?.records,
    payload?.data,
    payload,
  ];

  return candidates.find(Array.isArray) || [];
};


// ============================================
// NUMBER UTILITIES
// ============================================

export const numberValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "string") {
    value = value.replace(/,/g, "").trim();
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};


export const formatNumber = (value) => {
  return numberValue(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};


// ============================================
// DATE UTILITIES
// ============================================

export const dateKey = (value) => {
  if (!value) return "";

  // Handle JavaScript Date objects
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";

    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("-");
  }

  const text = String(value).trim();

  // ISO date: YYYY-MM-DD or ISO timestamp
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const indianDate = text.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/
  );

  if (indianDate) {
    const day = Number(indianDate[1]);
    const month = Number(indianDate[2]);
    const year = Number(indianDate[3]);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return "";
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};


export const formatDate = (value) => {
  const key = dateKey(value);

  if (!key) return "-";

  const [year, month, day] = key.split("-");

  return `${day}-${month}-${year}`;
};


// ============================================
// STORE STATUS
// ============================================

export const getStoreStatus = (value) => {
  const status = String(value ?? "").trim().toLowerCase();

  if (
    ["1", "true", "completed", "complete", "done"].includes(status)
  ) {
    return "Completed";
  }

  if (
    ["0", "false", "pending", "incomplete"].includes(status)
  ) {
    return "Pending";
  }

  return "Unknown";
};


// ============================================
// PRODUCTION STAGE STATUS
//
// Supported stages:
// cutting, upper, store
// ============================================

export const getStageStatus = (row, stage) => {
  if (!row) return "Pending";

  // Store status
  if (String(stage).toLowerCase() === "store") {
    return getStoreStatus(getValue(row, "upperstorestatus"));
  }

  // Total production quantity
  const total = numberValue(getValue(row, "pair"));

  // Completed quantity field
  let field = "";

  switch (String(stage).toLowerCase()) {
    case "cutting":
      field = "cuttingpairqty";
      break;

    case "upper":
      field = "upperpairqty";
      break;

    default:
      return "Pending";
  }

  const completed = numberValue(getValue(row, field));

  if (completed <= 0) {
    return "Pending";
  }

  if (total > 0 && completed >= total) {
    return "Completed";
  }

  return "Partially Completed";
};


// ============================================
// PRODUCTION STAGE QUANTITY
// ============================================

export const stageQuantity = (row, stage) => {
  const currentStage = String(stage).toLowerCase();

  switch (currentStage) {
    case "cutting":
      return numberValue(getValue(row, "cuttingpairqty"));

    case "upper":
      return numberValue(getValue(row, "upperpairqty"));

    case "store":
      return numberValue(getValue(row, "upperstorepairqty"));

    case "jobcard":
    case "article":
    default:
      return numberValue(getValue(row, "pair"));
  }
};


// ============================================
// UNIQUE FILTER VALUES
// ============================================

export const uniqueValues = (rows = [], key) => {
  const values = rows.map((row) =>
    String(getValue(row, key) ?? "").trim()
  );

  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );
};


// ============================================
// EXPORT DATA TO CSV / EXCEL-COMPATIBLE FILE
// ============================================

export const exportCsv = (
  rows = [],
  columns = [],
  filename = "production-report.csv"
) => {
  if (!rows.length) {
    alert("Export karne ke liye data available nahi hai.");
    return;
  }

  const escapeCsv = (value) => {
    let text = String(value ?? "");

    // Prevent spreadsheet formula injection for text values
    if (/^[\s]*[=+\-@]/.test(text)) {
      text = `'${text}`;
    }

    return `"${text.replace(/"/g, '""')}"`;
  };

  const header = columns
    .map((column) => escapeCsv(column.label))
    .join(",");

  const body = rows.map((row) =>
    columns
      .map((column) => {
        const value = column.value
          ? column.value(row)
          : getValue(row, column.key);

        return escapeCsv(value);
      })
      .join(",")
  );

  const csvContent = [header, ...body].join("\r\n");

  const blob = new Blob(["\uFEFF", csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename.endsWith(".csv")
    ? filename
    : `${filename}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

