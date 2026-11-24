
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  MdCheckCircle,
  MdError,
  MdRefresh,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdSearch,
  MdClose,
  MdVisibility,
} from "react-icons/md";

// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL =
  "https://mosach-erp-server.onrender.com/api/production-report";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ======================================================
// GRID COLUMNS - GRID AND MODAL SAME SEQUENCE
// ======================================================

const columns = [
  ["upperstorestatus", "Status"],
  ["reportdate", "Report Date"],
  ["jobcard", "Job Card"],
  ["sku", "SKU"],
  ["pair", "Pair"],
  ["carton", "Carton"],
  ["cuttingreceiveddate", "Cutting Date"],
  ["cuttingcontractor", "Cutting Cont."],
  ["uppercontractor", "Upper Cont."],
  ["upperissuedate", "UID"],
  ["upperreceiveddate", "URD"],
  ["upperreceivedctn", "URC"],
  ["upperinsolecontractor", "Upper/Insole Stitch"],
  ["upperinsoleissueddate", "UISD"],
  ["upperstorereceiveddate", "USRD"],
  ["upperstorectn", "USC"],
];

// ======================================================
// NUMBER HELPERS
// ======================================================

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(
    String(value).replace(/,/g, "").trim()
  );

  return Number.isFinite(number) ? number : 0;
};

// ======================================================
// PACKING VALUE
// Supports common API/database field names.
// Default packing = 24.
// ======================================================

const getPacking = (row) => {
  if (!row) return 24;

  const possibleFields = [
    "packing",
    "packingqty",
    "packing_qty",
    "packingquantity",
    "packingQuantity",
    "packingpercarton",
    "packing_per_carton",
    "pairspercarton",
    "pairs_per_carton",
  ];

  for (const field of possibleFields) {
    const value = toNumber(row[field]);

    if (value > 0) {
      return value;
    }
  }

  return 24;
};

// ======================================================
// CARTON CALCULATION
// Carton = Pair / Packing
// ======================================================

const getRoundedCTN = (pairQty, packing) => {
  const pairs = toNumber(pairQty);
  const pack = toNumber(packing);

  if (pairs <= 0 || pack <= 0) {
    return 0;
  }

  return Math.round(pairs / pack);
};

// Main Carton calculation
const getRowCarton = (row) => {
  if (!row) return 0;

  const packing = getPacking(row);

  return getRoundedCTN(row.pair, packing);
};

// ======================================================
// RESPONSE HELPER
// ======================================================

const getReportRows = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.data?.rows)) return data.data.rows;
  if (Array.isArray(data?.data?.records)) return data.data.records;

  return [];
};

// ======================================================
// DATE HELPERS
// ======================================================

const getDateValue = (value) => {
  if (!value) return "";

  const text = String(value).substring(0, 10);

  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (match) {
    return text;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const formatDate = (value) => {
  if (!value) return "-";

  const dateString = getDateValue(value);

  if (!dateString) return "-";

  const parts = dateString.split("-");

  if (parts.length !== 3) return String(value);

  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// ======================================================
// DATE COLUMNS
// ======================================================

const dateColumns = [
  "reportdate",
  "cuttingreceiveddate",
  "upperissuedate",
  "upperreceiveddate",
  "upperinsoleissueddate",
  "upperstorereceiveddate",
];

// ======================================================
// DISPLAY VALUE
// ======================================================

const displayValue = (value, key) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  if (dateColumns.includes(key)) {
    return formatDate(value);
  }

  if (
    key === "carton" ||
    key === "upperreceivedctn" ||
    key === "upperstorectn"
  ) {
    return toNumber(value).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });
  }

  return String(value);
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function ProductionReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [sortField, setSortField] = useState("jobcard");
  const [sortDirection, setSortDirection] = useState("asc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedRow, setSelectedRow] = useState(null);

  // ====================================================
  // FETCH REPORT
  // ====================================================

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_BASE_URL, {
        timeout: 120000,
      });

      const reportRows = getReportRows(response);

      setRows(reportRows);

      console.log(
        "Production Report Loaded:",
        reportRows.length
      );

    } catch (err) {
      console.error("Production Report Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load production report."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // ====================================================
  // GET COLUMN VALUE
  // ====================================================

  const getColumnValue = useCallback((row, key) => {
    if (!row) return "";

    // MAIN CARTON:
    // Pair / Packing
    // Database carton field is ignored.

    if (key === "carton") {
      return getRowCarton(row);
    }

    // Upper Received Carton

    if (key === "upperreceivedctn") {
      return getRoundedCTN(
        row.upperreceivedpair,
        getPacking(row)
      );
    }

    // Upper Store Carton

    if (key === "upperstorectn") {
      return getRoundedCTN(
        row.upperstorepairqty,
        getPacking(row)
      );
    }

    return row[key] ?? "";
  }, []);

  // ====================================================
  // FILTER DATA
  // ====================================================

  const filteredRows = useMemo(() => {
    let result = [...rows];

    // UISD DATE FILTER

    if (fromDate || toDate) {
      result = result.filter((row) => {
        const rowDate = getDateValue(
          row.upperinsoleissueddate
        );

        if (!rowDate) return false;

        if (fromDate && rowDate < fromDate) {
          return false;
        }

        if (toDate && rowDate > toDate) {
          return false;
        }

        return true;
      });
    }

    // SEARCH FILTER

    if (search.trim()) {
      const searchText = search.toLowerCase().trim();

      result = result.filter((row) =>
        columns.some(([key]) => {
          const value = getColumnValue(row, key);

          return String(value ?? "")
            .toLowerCase()
            .includes(searchText);
        })
      );
    }

    return result;
  }, [
    rows,
    search,
    fromDate,
    toDate,
    getColumnValue,
  ]);

  // ====================================================
  // SORT DATA
  // ====================================================

  const sortedRows = useMemo(() => {
    const result = [...filteredRows];

    result.sort((a, b) => {
      let valueA = getColumnValue(a, sortField);
      let valueB = getColumnValue(b, sortField);

      if (dateColumns.includes(sortField)) {
        valueA = getDateValue(valueA);
        valueB = getDateValue(valueB);
      }

      const numberA = Number(valueA);
      const numberB = Number(valueB);

      let comparison;

      if (
        valueA !== "" &&
        valueB !== "" &&
        !Number.isNaN(numberA) &&
        !Number.isNaN(numberB)
      ) {
        comparison = numberA - numberB;
      } else {
        comparison = String(valueA ?? "").localeCompare(
          String(valueB ?? ""),
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          }
        );
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });

    return result;
  }, [
    filteredRows,
    sortField,
    sortDirection,
    getColumnValue,
  ]);

  // ====================================================
  // PAGINATION
  // ====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(sortedRows.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, fromDate, toDate, pageSize]);

  // ====================================================
  // TOTALS
  // ====================================================

  const totalPair = useMemo(() => {
    return filteredRows.reduce(
      (total, row) => total + toNumber(row.pair),
      0
    );
  }, [filteredRows]);

  // IMPORTANT:
  // Total Carton = Sum of calculated row-wise cartons.
  // Original database row.carton is NOT used.

  const totalCarton = useMemo(() => {
    return filteredRows.reduce(
      (total, row) => total + getRowCarton(row),
      0
    );
  }, [filteredRows]);

  // ====================================================
  // SORT HANDLER
  // ====================================================

  const handleSort = (key) => {
    if (sortField === key) {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(key);
      setSortDirection("asc");
    }
  };

  // ====================================================
  // MODAL CLOSE
  // ====================================================

  const closeModal = () => {
    setSelectedRow(null);
  };

  useEffect(() => {
    if (!selectedRow) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedRow]);

  // ====================================================
  // STICKY COLUMN WIDTHS
  // ====================================================

  const stickyWidths = {
    upperstorestatus: 65,
    reportdate: 105,
    jobcard: 110,
    sku: 240,
    pair: 75,
    carton: 75,
  };

  let stickyLeft = 48;

  const stickyPositions = {};

  columns.forEach(([key]) => {
    if (stickyWidths[key]) {
      stickyPositions[key] = stickyLeft;
      stickyLeft += stickyWidths[key];
    }
  });

  const getStickyStyle = (key) => {
    if (!stickyWidths[key]) return {};

    return {
      position: "sticky",
      left: `${stickyPositions[key]}px`,
      minWidth: `${stickyWidths[key]}px`,
      width: `${stickyWidths[key]}px`,
      zIndex: 10,
    };
  };

  // ====================================================
  // STATUS DISPLAY
  // ====================================================

  const renderStatus = (value) => {
    if (Number(value) === 1) {
      return (
        <span className="inline-flex items-center gap-1 whitespace-nowrap font-bold text-green-600">
          <MdCheckCircle size={17} />
          Completed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-orange-600">
        <MdError size={16} />
        Pending
      </span>
    );
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="w-full space-y-4 p-3 sm:p-4">

      {/* PAGE HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#0A4B57] sm:text-2xl">
            Production Report
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage production report records
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReport}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0A4B57] px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#083c46] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <MdRefresh
            size={19}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* FILTER SECTION */}

      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {/* Search */}

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              Search
            </label>

            <div className="relative">
              <MdSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={19}
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search SKU / Job Card..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#0A4B57] focus:ring-2 focus:ring-[#0A4B57]/10"
              />
            </div>
          </div>

          {/* From Date */}

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              UISD From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0A4B57]"
            />
          </div>

          {/* To Date */}

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              UISD To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0A4B57]"
            />
          </div>

          {/* Page Size */}

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              Records Per Page
            </label>

            <select
              value={pageSize}
              onChange={(e) =>
                setPageSize(Number(e.target.value))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0A4B57]"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} Records
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary */}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">

          <p className="text-sm text-gray-600">
            Total Records:
            <span className="ml-1 font-bold text-[#0A4B57]">
              {filteredRows.length}
            </span>
          </p>

          {(search || fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFromDate("");
                setToDate("");
              }}
              className="rounded-md px-3 py-1.5 text-xs font-bold text-orange-600 transition hover:bg-orange-50"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* GRID */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-3 py-3">
          <h2 className="font-bold text-[#0A4B57]">
            Production Records
          </h2>

          <span className="text-xs text-gray-500">
            Click any row to view complete details
          </span>
        </div>

        <div className="w-full overflow-x-auto">

          <table className="w-full border-collapse text-left text-sm">

            <thead>
              <tr>
                <th
                  className="sticky left-0 z-30 border-b border-r border-gray-200 bg-[#0A4B57] px-3 py-3 text-center font-bold text-white"
                  style={{
                    minWidth: "48px",
                    width: "48px",
                  }}
                >
                  #
                </th>

                {columns.map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    style={getStickyStyle(key)}
                    className={`cursor-pointer whitespace-nowrap border-b border-r border-gray-200 bg-[#0A4B57] px-3 py-3 font-bold text-white transition hover:bg-[#083c46] ${
                      stickyWidths[key] ? "z-30" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {label}

                      {sortField === key && (
                        sortDirection === "asc" ? (
                          <MdKeyboardArrowUp size={17} />
                        ) : (
                          <MdKeyboardArrowDown size={17} />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="py-12 text-center text-sm font-semibold text-gray-500"
                  >
                    Loading production records...
                  </td>
                </tr>
              ) : paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="py-12 text-center text-sm font-semibold text-gray-500"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, index) => (
                  <tr
                    key={
                      row.productionreportid ||
                      row.jobcard ||
                      index
                    }
                    onClick={() => setSelectedRow(row)}
                    title="Click to view complete details"
                    className="group cursor-pointer transition hover:bg-orange-50"
                  >
                    <td
                      className="sticky left-0 z-20 border-b border-r border-gray-100 bg-white px-3 py-2.5 text-center font-bold text-gray-500 group-hover:bg-orange-50"
                      style={{
                        minWidth: "48px",
                        width: "48px",
                      }}
                    >
                      {(currentPage - 1) * pageSize +
                        index +
                        1}
                    </td>

                    {columns.map(([key]) => {
                      const value = getColumnValue(row, key);

                      return (
                        <td
                          key={key}
                          style={getStickyStyle(key)}
                          className={`whitespace-nowrap border-b border-r border-gray-100 px-3 py-2.5 text-gray-700 group-hover:bg-orange-50 ${
                            stickyWidths[key]
                              ? "bg-white"
                              : ""
                          }`}
                        >
                          {key === "upperstorestatus" ? (
                            renderStatus(value)
                          ) : (
                            <span
                              className={
                                key === "sku"
                                  ? "font-bold text-[#0A4B57]"
                                  : key === "jobcard"
                                  ? "font-semibold"
                                  : key === "carton"
                                  ? "font-bold text-orange-600"
                                  : ""
                              }
                            >
                              {displayValue(value, key)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

        {/* GRID TOTAL */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#0A4B57] bg-[#f0f7f8] px-4 py-3">

          <div className="flex flex-wrap items-center gap-5">

            <div>
              <span className="text-xs font-semibold text-gray-500">
                Total Pair
              </span>

              <p className="text-lg font-extrabold text-[#0A4B57]">
                {totalPair.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-500">
                Total Carton
              </span>

              <p className="text-lg font-extrabold text-orange-600">
                {totalCarton.toLocaleString("en-IN")}
              </p>
            </div>

          </div>

          <span className="text-xs font-semibold text-gray-500">
            Filtered Records: {filteredRows.length}
          </span>
        </div>

        {/* PAGINATION */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-3 py-3">

          <p className="text-xs text-gray-500">
            Showing{" "}
            {sortedRows.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {" - "}
            {Math.min(
              currentPage * pageSize,
              sortedRows.length
            )}{" "}
            of {sortedRows.length}
          </p>

          <div className="flex items-center gap-2">

            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() =>
                setPage((prev) => Math.max(1, prev - 1))
              }
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="rounded-lg bg-[#0A4B57] px-3 py-1.5 text-xs font-bold text-white">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((prev) =>
                  Math.min(totalPages, prev + 1)
                )
              }
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>

          </div>
        </div>
      </div>

      {/* ROW DETAILS MODAL */}

      {selectedRow && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-5"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="production-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >

            {/* Modal Header */}

            <div className="flex items-center justify-between gap-3 bg-[#0A4B57] px-4 py-4 text-white sm:px-6">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <MdVisibility size={23} />
                </div>

                <div className="min-w-0">
                  <h2
                    id="production-modal-title"
                    className="text-lg font-bold sm:text-xl"
                  >
                    Production Details
                  </h2>

                  <p className="truncate text-xs text-white/75">
                    Job Card: {selectedRow.jobcard || "-"}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 transition hover:bg-white/30"
              >
                <MdClose size={23} />
              </button>

            </div>

            {/* Modal Body */}

            <div className="overflow-y-auto p-4 sm:p-6">

              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[#0A4B57]">
                  Complete Record Information
                </h3>

                {Number(selectedRow.upperstorestatus) === 1 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                    <MdCheckCircle size={16} />
                    Completed
                  </span>
                ) : (
                  <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
                    Pending
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                {columns.map(([key, label]) => {
                  const value = getColumnValue(
                    selectedRow,
                    key
                  );

                  return (
                    <div
                      key={key}
                      className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-3 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-red-800">
                          {label}
                        </p>
                      </div>

                      <div className="break-words text-sm font-semibold text-gray-800">
                        {key === "upperstorestatus" ? (
                          renderStatus(value)
                        ) : (
                          displayValue(value, key)
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>

            </div>

            {/* Modal Footer */}

            <div className="flex items-center justify-end border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg bg-[#0A4B57] px-6 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#083c46]"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
