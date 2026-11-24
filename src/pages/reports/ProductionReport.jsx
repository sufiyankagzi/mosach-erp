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
// GRID COLUMNS
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
  ["upperinsolecontractor", "Upper/Insole Stitch"],
  ["upperinsoleissueddate", "UISD"],
  ["upperstorereceiveddate", "USRD"],
];

// ======================================================
// HELPERS
// ======================================================

const getReportRows = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.records)) return data.records;

  return [];
};

const getNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

// ======================================================
// CARTON CALCULATION
// ======================================================

// Carton = Pair / Packing
// Rounded to nearest whole number.
// Database carton field is NOT used.

const calculateCarton = (pair, packing) => {
  const totalPair = getNumber(pair);
  const packingQty = getNumber(packing);

  if (totalPair <= 0 || packingQty <= 0) {
    return 0;
  }

  return Math.round(totalPair / packingQty);
};

// ======================================================
// DATE HELPERS
// ======================================================

const getDateValue = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).substring(0, 10);
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatDate = (value) => {
  if (!value) return "-";

  const dateString = getDateValue(value);

  if (!dateString) return "-";

  const parts = dateString.split("-");

  if (parts.length !== 3) return String(value);

  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

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

      console.log(
        "PRODUCTION REPORT DATA:",
        reportRows.slice(0, 10).map((row) => ({
          jobcard: row.jobcard,
          sku: row.sku,
          pair: row.pair,
          packing: row.packing,
          calculatedCarton: calculateCarton(
            row.pair,
            row.packing
          ),
        }))
      );

      setRows(reportRows);
      setPage(1);
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

  const getColumnValue = (row, key) => {
    if (!row) return "";

    // Runtime carton calculation.
    // Do not read row.carton from database.

    if (key === "carton") {
      return calculateCarton(row.pair, row.packing);
    }

    return row[key] ?? "";
  };

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
  }, [rows, search, fromDate, toDate]);

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
  }, [filteredRows, sortField, sortDirection]);

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

  const totalPair = useMemo(
    () =>
      filteredRows.reduce(
        (total, row) => total + getNumber(row.pair),
        0
      ),
    [filteredRows]
  );

  // Total Carton = Sum of individually rounded cartons.

  const totalCarton = useMemo(
    () =>
      filteredRows.reduce(
        (total, row) =>
          total + calculateCarton(row.pair, row.packing),
        0
      ),
    [filteredRows]
  );

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
        <>
          <span className="hidden sm:inline-flex items-center gap-1 whitespace-nowrap font-bold text-green-600">
            <MdCheckCircle size={17} />
            Completed
          </span>

          <span className="inline-flex sm:hidden items-center justify-center text-green-600">
            <MdCheckCircle size={21} />
          </span>
        </>
      );
    }

    return (
      <>
        <span className="hidden sm:inline-flex items-center gap-1 whitespace-nowrap font-semibold text-orange-600">
          <MdError size={16} />
          Pending
        </span>

        <span className="inline-flex sm:hidden items-center justify-center text-orange-600">
          <MdError size={21} />
        </span>
      </>
    );
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="w-full space-y-4 p-3 sm:p-4">

      {/* RESPONSIVE STICKY CSS */}

      <style>{`
        @media (min-width: 768px) {
          .production-report-grid .production-index-cell {
            position: sticky;
            left: 0;
          }
        }

        @media (max-width: 767px) {
          .production-report-grid th,
          .production-report-grid td {
            position: static !important;
            left: auto !important;
            right: auto !important;
            z-index: auto !important;
          }

          /* ONLY # FROZEN */

          .production-report-grid .production-index-cell {
            position: sticky !important;
            left: 0 !important;
            width: 48px !important;
            min-width: 48px !important;
            max-width: 48px !important;
            z-index: 60 !important;
            box-sizing: border-box !important;
          }

          .production-report-grid thead .production-index-cell {
            background: #0A4B57 !important;
            color: white !important;
            z-index: 100 !important;
          }

          .production-report-grid tbody .production-index-cell {
            background: white !important;
          }

          .production-report-grid tbody tr:hover .production-index-cell {
            background: #fff7ed !important;
          }

          /* ONLY STATUS FROZEN */

          .production-report-grid .production-status-cell {
            position: sticky !important;
            left: 48px !important;
            width: 65px !important;
            min-width: 65px !important;
            max-width: 65px !important;
            z-index: 50 !important;
            box-sizing: border-box !important;
          }

          .production-report-grid thead .production-status-cell {
            background: #0A4B57 !important;
            color: white !important;
            z-index: 100 !important;
          }

          .production-report-grid tbody .production-status-cell {
            background: white !important;
          }

          .production-report-grid tbody tr:hover .production-status-cell {
            background: #fff7ed !important;
          }

          .production-report-grid th:not(.production-index-cell):not(.production-status-cell),
          .production-report-grid td:not(.production-index-cell):not(.production-status-cell) {
            position: static !important;
            left: auto !important;
            right: auto !important;
            z-index: auto !important;
          }
        }
      `}</style>

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

          <div>
            <label className="mb-1 block text-xs font-bold text-gray-600">
              Records Per Page
            </label>

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
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

        <div className="production-report-grid relative w-full max-w-full overflow-auto overscroll-x-contain">

          <table
            className="w-full border-collapse text-left text-sm"
            style={{ minWidth: "max-content" }}
          >
            <thead>
              <tr>
                <th
                  className="production-index-cell sticky left-0 z-30 border-b border-r border-gray-200 bg-[#0A4B57] px-3 py-3 text-center font-bold text-white"
                  style={{
                    minWidth: "48px",
                    width: "48px",
                    maxWidth: "48px",
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
                    } ${
                      key === "upperstorestatus"
                        ? "production-status-cell"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {label}

                      {sortField === key &&
                        (sortDirection === "asc" ? (
                          <MdKeyboardArrowUp size={17} />
                        ) : (
                          <MdKeyboardArrowDown size={17} />
                        ))}
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
                      className="production-index-cell sticky left-0 z-20 border-b border-r border-gray-100 bg-white px-3 py-2.5 text-center font-bold text-gray-500 group-hover:bg-orange-50"
                      style={{
                        minWidth: "48px",
                        width: "48px",
                        maxWidth: "48px",
                      }}
                    >
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    {columns.map(([key]) => {
                      const value = getColumnValue(row, key);

                      return (
                        <td
                          key={key}
                          style={getStickyStyle(key)}
                          className={`whitespace-nowrap border-b border-r border-gray-100 px-3 py-2.5 text-gray-700 group-hover:bg-orange-50 ${
                            stickyWidths[key] ? "bg-white" : ""
                          } ${
                            key === "upperstorestatus"
                              ? "production-status-cell"
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
                                  ? "font-semibold text-orange-700"
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
            {Math.min(currentPage * pageSize, sortedRows.length)}
            {" "}of {sortedRows.length}
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

            {/* MODAL HEADER */}

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

            {/* MODAL BODY */}

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
                  const value = getColumnValue(selectedRow, key);

                  return (
                    <div
                      key={key}
                      className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-3 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-red-800">
                        {label}
                      </p>

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

            {/* MODAL FOOTER */}

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