
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

  if (parts.length !== 3) return value;

  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

const getRoundedCTN = (pairQty, packing) => {
  const pairs = Number(pairQty) || 0;
  const pack = Number(packing) || 24;

  if (pack <= 0) return 0;

  return Math.round(pairs / pack);
};

const dateColumns = [
  "reportdate",
  "cuttingreceiveddate",
  "upperissuedate",
  "upperreceiveddate",
  "upperinsoleissueddate",
  "upperstorereceiveddate",
];

const displayValue = (value, key) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (dateColumns.includes(key)) {
    return formatDate(value);
  }

  if (key === "carton") {
    return Math.round(Number(value) || 0);
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

  // Selected row for modal
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

    if (key === "upperreceivedctn") {
      return getRoundedCTN(
        row.upperreceivedpair,
        row.packing
      );
    }

    if (key === "upperstorectn") {
      return getRoundedCTN(
        row.upperstorepairqty,
        row.packing
      );
    }

    return row[key] ?? "";
  };

  // ====================================================
  // FILTER DATA
  // ====================================================

  const filteredRows = useMemo(() => {
    let result = [...rows];

    // Date filter - UISD
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

    // Search filter
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
          { numeric: true, sensitivity: "base" }
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

  const totalPair = filteredRows.reduce(
    (total, row) => total + (Number(row.pair) || 0),
    0
  );

  const totalCarton = filteredRows.reduce(
    (total, row) =>
      total + Math.round(Number(row.carton) || 0),
    0
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

  // ESC key to close modal
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
        {/* Desktop */}
        <span className="hidden sm:inline-flex items-center gap-1 whitespace-nowrap font-bold text-green-600">
          <MdCheckCircle size={17} />
          Completed
        </span>

        {/* Mobile - Only Icon */}
        <span className="inline-flex sm:hidden items-center justify-center text-green-600">
          <MdCheckCircle size={21} />
        </span>
      </>
    );
  }

  return (
    <>
      {/* Desktop */}
      <span className="hidden sm:inline-flex items-center gap-1 whitespace-nowrap font-semibold text-orange-600">
        <MdError size={16} />
        Pending
      </span>

      {/* Mobile - Only Icon */}
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
        /* =========================================
           DESKTOP: EXISTING FROZEN COLUMNS
        ========================================= */

        @media (min-width: 768px) {
          .production-report-grid .production-index-cell {
            position: sticky;
            left: 0;
          }

          .production-report-grid .production-sticky-cell {
            position: sticky;
          }
        }

        /* =========================================
           MOBILE: ONLY # AND STATUS FROZEN
        ========================================= */

        @media (max-width: 767px) {

          /* First remove sticky from ALL cells */
          .production-report-grid th,
          .production-report-grid td {
            position: static !important;
            left: auto !important;
            right: auto !important;
            z-index: auto !important;
          }

          /* # COLUMN - FROZEN */
          .production-report-grid .production-index-cell {
            position: sticky !important;
            left: 0 !important;
            right: auto !important;

            width: 48px !important;
            min-width: 48px !important;
            max-width: 48px !important;

            z-index: 60 !important;
            box-sizing: border-box !important;
          }

          /* # HEADER */
          .production-report-grid thead .production-index-cell {
            background: #0A4B57 !important;
            color: white !important;
            z-index: 100 !important;
          }

          /* # BODY */
          .production-report-grid tbody .production-index-cell {
            background: white !important;
          }

          .production-report-grid tbody tr:hover .production-index-cell {
            background: #fff7ed !important;
          }

          /* STATUS COLUMN - FROZEN */
          .production-report-grid .production-status-cell {
            position: sticky !important;
            left: 48px !important;
            right: auto !important;

            width: 65px !important;
            min-width: 65px !important;
            max-width: 65px !important;

            z-index: 50 !important;
            box-sizing: border-box !important;
          }

          /* STATUS HEADER */
          .production-report-grid thead .production-status-cell {
            background: #0A4B57 !important;
            color: white !important;
            z-index: 100 !important;
          }

          /* STATUS BODY */
          .production-report-grid tbody .production-status-cell {
            background: white !important;
          }

          .production-report-grid tbody tr:hover .production-status-cell {
            background: #fff7ed !important;
          }

          /* ALL OTHER COLUMNS - NOT FROZEN */
          .production-report-grid th:not(.production-index-cell):not(.production-status-cell),
          .production-report-grid td:not(.production-index-cell):not(.production-status-cell) {
            position: static !important;
            left: auto !important;
            right: auto !important;
            z-index: auto !important;
          }
        }
      `}</style>

      {/* ================================================
          PAGE HEADER
      ================================================ */}

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

      {/* ================================================
          FILTER SECTION
      ================================================ */}

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

      {/* ================================================
          ERROR
      ================================================ */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* ================================================
          GRID
      ================================================ */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-3 py-3">
          <h2 className="font-bold text-[#0A4B57]">
            Production Records
          </h2>

          <span className="text-xs text-gray-500">
            Click any row to view complete details
          </span>
        </div>

        {/* IMPORTANT: GRID WRAPPER */}
        <div className="production-report-grid relative w-full max-w-full overflow-auto overscroll-x-contain">

          <table
            className="w-full border-collapse text-left text-sm"
            style={{
              minWidth: "max-content",
            }}
          >

            <thead>
              <tr>

                {/* SERIAL NUMBER */}
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

                    {/* SERIAL NUMBER */}
                    <td
                      className="production-index-cell sticky left-0 z-20 border-b border-r border-gray-100 bg-white px-3 py-2.5 text-center font-bold text-gray-500 group-hover:bg-orange-50"
                      style={{
                        minWidth: "48px",
                        width: "48px",
                        maxWidth: "48px",
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

        {/* ============================================
            GRID TOTAL
        ============================================ */}

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

        {/* ============================================
            PAGINATION
        ============================================ */}

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

      {/* =================================================
          ROW DETAILS MODAL
          SAME FIELD SEQUENCE AS GRID
      ================================================= */}

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

// import { useCallback, useEffect, useMemo, useState } from "react";
// import axios from "axios";

// import {
//   MdCheckCircle,
//   MdError,
//   MdRefresh,
//   MdKeyboardArrowUp,
//   MdKeyboardArrowDown,
//   MdSearch,
//   MdClose,
//   MdVisibility,
// } from "react-icons/md";

// // ======================================================
// // API CONFIGURATION
// // ======================================================

// const API_BASE_URL =
//   "https://mosach-erp-server.onrender.com/api/production-report";

// const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// // ======================================================
// // GRID COLUMNS - GRID AND MODAL SAME SEQUENCE
// // ======================================================

// const columns = [
//   ["upperstorestatus", "Status"],
//   ["reportdate", "Report Date"],
//   ["jobcard", "Job Card"],
//   ["sku", "SKU"],
//   ["pair", "Pair"],
//   ["carton", "Carton"],
//   ["cuttingreceiveddate", "Cutting Date"],
//   ["cuttingcontractor", "Cutting Cont."],
//   ["uppercontractor", "Upper Cont."],
//   ["upperissuedate", "UID"],
//   ["upperreceiveddate", "URD"],
//   ["upperreceivedctn", "URC"],
//   ["upperinsolecontractor", "Upper/Insole Stitch"],
//   ["upperinsoleissueddate", "UISD"],
//   ["upperstorereceiveddate", "USRD"],
//   ["upperstorectn", "USC"],
// ];

// // ======================================================
// // HELPERS
// // ======================================================

// const getReportRows = (response) => {
//   const data = response?.data;

//   if (Array.isArray(data)) return data;
//   if (Array.isArray(data?.data)) return data.data;
//   if (Array.isArray(data?.rows)) return data.rows;
//   if (Array.isArray(data?.records)) return data.records;

//   return [];
// };

// const getDateValue = (value) => {
//   if (!value) return "";

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return String(value).substring(0, 10);
//   }

//   return `${date.getFullYear()}-${String(
//     date.getMonth() + 1
//   ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
// };

// const formatDate = (value) => {
//   if (!value) return "-";

//   const dateString = getDateValue(value);

//   if (!dateString) return "-";

//   const parts = dateString.split("-");

//   if (parts.length !== 3) return value;

//   return `${parts[2]}-${parts[1]}-${parts[0]}`;
// };

// const getRoundedCTN = (pairQty, packing) => {
//   const pairs = Number(pairQty) || 0;
//   const pack = Number(packing) || 24;

//   if (pack <= 0) return 0;

//   return Math.round(pairs / pack);
// };

// const dateColumns = [
//   "reportdate",
//   "cuttingreceiveddate",
//   "upperissuedate",
//   "upperreceiveddate",
//   "upperinsoleissueddate",
//   "upperstorereceiveddate",
// ];

// const displayValue = (value, key) => {
//   if (value === null || value === undefined || value === "") {
//     return "-";
//   }

//   if (dateColumns.includes(key)) {
//     return formatDate(value);
//   }

//   if (key === "carton") {
//     return Math.round(Number(value) || 0);
//   }

//   return String(value);
// };

// // ======================================================
// // MAIN COMPONENT
// // ======================================================

// export default function ProductionReport() {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [search, setSearch] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const [sortField, setSortField] = useState("jobcard");
//   const [sortDirection, setSortDirection] = useState("asc");

//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   // Selected row for modal
//   const [selectedRow, setSelectedRow] = useState(null);

//   // ====================================================
//   // FETCH REPORT
//   // ====================================================

//   const fetchReport = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await axios.get(API_BASE_URL, {
//         timeout: 120000,
//       });

//       const reportRows = getReportRows(response);

//       setRows(reportRows);
//     } catch (err) {
//       console.error("Production Report Error:", err);

//       setError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Unable to load production report."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchReport();
//   }, [fetchReport]);

//   // ====================================================
//   // GET COLUMN VALUE
//   // ====================================================

//   const getColumnValue = (row, key) => {
//     if (!row) return "";

//     // Upper Received Carton
//     if (key === "upperreceivedctn") {
//       return getRoundedCTN(
//         row.upperreceivedpair,
//         row.packing
//       );
//     }

//     // Upper Store Carton
//     if (key === "upperstorectn") {
//       return getRoundedCTN(
//         row.upperstorepairqty,
//         row.packing
//       );
//     }

//     return row[key] ?? "";
//   };

//   // ====================================================
//   // FILTER DATA
//   // ====================================================

//   const filteredRows = useMemo(() => {
//     let result = [...rows];

//     // Date filter - UISD
//     if (fromDate || toDate) {
//       result = result.filter((row) => {
//         const rowDate = getDateValue(
//           row.upperinsoleissueddate
//         );

//         if (!rowDate) return false;

//         if (fromDate && rowDate < fromDate) {
//           return false;
//         }

//         if (toDate && rowDate > toDate) {
//           return false;
//         }

//         return true;
//       });
//     }

//     // Search filter
//     if (search.trim()) {
//       const searchText = search.toLowerCase().trim();

//       result = result.filter((row) =>
//         columns.some(([key]) => {
//           const value = getColumnValue(row, key);

//           return String(value ?? "")
//             .toLowerCase()
//             .includes(searchText);
//         })
//       );
//     }

//     return result;
//   }, [rows, search, fromDate, toDate]);

//   // ====================================================
//   // SORT DATA
//   // ====================================================

//   const sortedRows = useMemo(() => {
//     const result = [...filteredRows];

//     result.sort((a, b) => {
//       let valueA = getColumnValue(a, sortField);
//       let valueB = getColumnValue(b, sortField);

//       if (dateColumns.includes(sortField)) {
//         valueA = getDateValue(valueA);
//         valueB = getDateValue(valueB);
//       }

//       const numberA = Number(valueA);
//       const numberB = Number(valueB);

//       let comparison;

//       if (
//         valueA !== "" &&
//         valueB !== "" &&
//         !Number.isNaN(numberA) &&
//         !Number.isNaN(numberB)
//       ) {
//         comparison = numberA - numberB;
//       } else {
//         comparison = String(valueA ?? "").localeCompare(
//           String(valueB ?? ""),
//           undefined,
//           { numeric: true, sensitivity: "base" }
//         );
//       }

//       return sortDirection === "asc"
//         ? comparison
//         : -comparison;
//     });

//     return result;
//   }, [filteredRows, sortField, sortDirection]);

//   // ====================================================
//   // PAGINATION
//   // ====================================================

//   const totalPages = Math.max(
//     1,
//     Math.ceil(sortedRows.length / pageSize)
//   );

//   const currentPage = Math.min(page, totalPages);

//   const paginatedRows = useMemo(() => {
//     const start = (currentPage - 1) * pageSize;

//     return sortedRows.slice(start, start + pageSize);
//   }, [sortedRows, currentPage, pageSize]);

//   useEffect(() => {
//     setPage(1);
//   }, [search, fromDate, toDate, pageSize]);

//   // ====================================================
//   // TOTALS
//   // ====================================================

//   const totalPair = filteredRows.reduce(
//     (total, row) => total + (Number(row.pair) || 0),
//     0
//   );

//   const totalCarton = filteredRows.reduce(
//     (total, row) =>
//       total + Math.round(Number(row.carton) || 0),
//     0
//   );

//   // ====================================================
//   // SORT HANDLER
//   // ====================================================

//   const handleSort = (key) => {
//     if (sortField === key) {
//       setSortDirection((prev) =>
//         prev === "asc" ? "desc" : "asc"
//       );
//     } else {
//       setSortField(key);
//       setSortDirection("asc");
//     }
//   };

//   // ====================================================
//   // MODAL CLOSE
//   // ====================================================

//   const closeModal = () => {
//     setSelectedRow(null);
//   };

//   // ESC key to close modal
//   useEffect(() => {
//     if (!selectedRow) return;

//     const handleEscape = (event) => {
//       if (event.key === "Escape") {
//         closeModal();
//       }
//     };

//     window.addEventListener("keydown", handleEscape);

//     return () => {
//       window.removeEventListener("keydown", handleEscape);
//     };
//   }, [selectedRow]);

//   // ====================================================
//   // STICKY COLUMN WIDTHS
//   // ====================================================

//   const stickyWidths = {
//     upperstorestatus: 65,
//     reportdate: 105,
//     jobcard: 110,
//     sku: 240,
//     pair: 75,
//     carton: 75,
//   };

//   let stickyLeft = 48;

//   const stickyPositions = {};

//   columns.forEach(([key]) => {
//     if (stickyWidths[key]) {
//       stickyPositions[key] = stickyLeft;
//       stickyLeft += stickyWidths[key];
//     }
//   });

//   const getStickyStyle = (key) => {
//     if (!stickyWidths[key]) return {};

//     return {
//       position: "sticky",
//       left: `${stickyPositions[key]}px`,
//       minWidth: `${stickyWidths[key]}px`,
//       width: `${stickyWidths[key]}px`,
//       zIndex: 10,
//     };
//   };

//   // ====================================================
//   // STATUS DISPLAY
//   // ====================================================

//   const renderStatus = (value) => {
//     if (Number(value) === 1) {
//       return (
//         <span className="inline-flex items-center gap-1 whitespace-nowrap font-bold text-green-600">
//           <MdCheckCircle size={17} />
//           Completed
//         </span>
//       );
//     }

//     return (
//       <span className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-orange-600">
//         <MdError size={16} />
//         Pending
//       </span>
//     );
//   };

//   // ====================================================
//   // RENDER
//   // ====================================================

//   return (
//     <div className="w-full space-y-4 p-3 sm:p-4">

//       {/* ================================================
//           PAGE HEADER
//       ================================================ */}

//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-bold text-[#0A4B57] sm:text-2xl">
//             Production Report
//           </h1>

//           <p className="mt-1 text-sm text-gray-500">
//             View and manage production report records
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={fetchReport}
//           disabled={loading}
//           className="inline-flex items-center gap-2 rounded-lg bg-[#0A4B57] px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#083c46] disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           <MdRefresh
//             size={19}
//             className={loading ? "animate-spin" : ""}
//           />
//           Refresh
//         </button>
//       </div>

//       {/* ================================================
//           FILTER SECTION
//       ================================================ */}

//       <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">

//         <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

//           {/* Search */}
//           <div>
//             <label className="mb-1 block text-xs font-bold text-gray-600">
//               Search
//             </label>

//             <div className="relative">
//               <MdSearch
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                 size={19}
//               />

//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search SKU / Job Card..."
//                 className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#0A4B57] focus:ring-2 focus:ring-[#0A4B57]/10"
//               />
//             </div>
//           </div>

//           {/* From Date */}
//           <div>
//             <label className="mb-1 block text-xs font-bold text-gray-600">
//               UISD From Date
//             </label>

//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0A4B57]"
//             />
//           </div>

//           {/* To Date */}
//           <div>
//             <label className="mb-1 block text-xs font-bold text-gray-600">
//               UISD To Date
//             </label>

//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0A4B57]"
//             />
//           </div>

//           {/* Page Size */}
//           <div>
//             <label className="mb-1 block text-xs font-bold text-gray-600">
//               Records Per Page
//             </label>

//             <select
//               value={pageSize}
//               onChange={(e) =>
//                 setPageSize(Number(e.target.value))
//               }
//               className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0A4B57]"
//             >
//               {PAGE_SIZE_OPTIONS.map((size) => (
//                 <option key={size} value={size}>
//                   {size} Records
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Filter Summary */}
//         <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">

//           <p className="text-sm text-gray-600">
//             Total Records:
//             <span className="ml-1 font-bold text-[#0A4B57]">
//               {filteredRows.length}
//             </span>
//           </p>

//           {(search || fromDate || toDate) && (
//             <button
//               type="button"
//               onClick={() => {
//                 setSearch("");
//                 setFromDate("");
//                 setToDate("");
//               }}
//               className="rounded-md px-3 py-1.5 text-xs font-bold text-orange-600 transition hover:bg-orange-50"
//             >
//               Clear Filters
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ================================================
//           ERROR
//       ================================================ */}

//       {error && (
//         <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
//           {error}
//         </div>
//       )}

//       {/* ================================================
//           GRID
//       ================================================ */}

//       <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

//         <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 px-3 py-3">
//           <h2 className="font-bold text-[#0A4B57]">
//             Production Records
//           </h2>

//           <span className="text-xs text-gray-500">
//             Click any row to view complete details
//           </span>
//         </div>

//         <div className="w-full overflow-x-auto">

//           <table className="w-full border-collapse text-left text-">

//             <thead>
//               <tr>
//                 {/* Serial Number */}
//                 <th
//                   className="sticky left-0 z-30 border-b border-r border-gray-200 bg-[#0A4B57] px-3 py-3 text-center font-bold text-white"
//                   style={{
//                     minWidth: "48px",
//                     width: "48px",
//                   }}
//                 >
//                   #
//                 </th>

//                 {columns.map(([key, label]) => (
//                   <th
//                     key={key}
//                     onClick={() => handleSort(key)}
//                     style={getStickyStyle(key)}
//                     className={`cursor-pointer whitespace-nowrap border-b border-r border-gray-200 bg-[#0A4B57] px-3 py-3 font-bold text-white transition hover:bg-[#083c46] ${
//                       stickyWidths[key] ? "z-30" : ""
//                     }`}
//                   >
//                     <div className="flex items-center gap-1">
//                       {label}

//                       {sortField === key && (
//                         sortDirection === "asc" ? (
//                           <MdKeyboardArrowUp size={17} />
//                         ) : (
//                           <MdKeyboardArrowDown size={17} />
//                         )
//                       )}
//                     </div>
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td
//                     colSpan={columns.length + 1}
//                     className="py-12 text-center text-sm font-semibold text-gray-500"
//                   >
//                     Loading production records...
//                   </td>
//                 </tr>
//               ) : paginatedRows.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={columns.length + 1}
//                     className="py-12 text-center text-sm font-semibold text-gray-500"
//                   >
//                     No records found.
//                   </td>
//                 </tr>
//               ) : (
//                 paginatedRows.map((row, index) => (
//                   <tr
//                     key={
//                       row.productionreportid ||
//                       row.jobcard ||
//                       index
//                     }
//                     onClick={() => setSelectedRow(row)}
//                     title="Click to view complete details"
//                     className="group cursor-pointer transition hover:bg-orange-50"
//                   >
//                     {/* Serial Number */}
//                     <td
//                       className="sticky left-0 z-20 border-b border-r border-gray-100 bg-white px-3 py-2.5 text-center font-bold text-gray-500 group-hover:bg-orange-50"
//                       style={{
//                         minWidth: "48px",
//                         width: "48px",
//                       }}
//                     >
//                       {(currentPage - 1) * pageSize +
//                         index +
//                         1}
//                     </td>

//                     {columns.map(([key]) => {
//                       const value = getColumnValue(row, key);

//                       return (
//                         <td
//                           key={key}
//                           style={getStickyStyle(key)}
//                           className={`whitespace-nowrap border-b border-r border-gray-100 px-3 py-2.5 text-gray-700 group-hover:bg-orange-50 ${
//                             stickyWidths[key]
//                               ? "bg-white"
//                               : ""
//                           }`}
//                         >
//                           {key === "upperstorestatus" ? (
//                             renderStatus(value)
//                           ) : (
//                             <span
//                               className={
//                                 key === "sku"
//                                   ? "font-bold text-[#0A4B57]"
//                                   : key === "jobcard"
//                                   ? "font-semibold"
//                                   : ""
//                               }
//                             >
//                               {displayValue(value, key)}
//                             </span>
//                           )}
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 ))
//               )}
//             </tbody>

//           </table>
//         </div>

//         {/* ============================================
//             GRID TOTAL
//         ============================================ */}

//         <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#0A4B57] bg-[#f0f7f8] px-4 py-3">

//           <div className="flex flex-wrap items-center gap-5">
//             <div>
//               <span className="text-xs font-semibold text-gray-500">
//                 Total Pair
//               </span>

//               <p className="text-lg font-extrabold text-[#0A4B57]">
//                 {totalPair.toLocaleString("en-IN")}
//               </p>
//             </div>

//             <div>
//               <span className="text-xs font-semibold text-gray-500">
//                 Total Carton
//               </span>

//               <p className="text-lg font-extrabold text-orange-600">
//                 {totalCarton.toLocaleString("en-IN")}
//               </p>
//             </div>
//           </div>

//           <span className="text-xs font-semibold text-gray-500">
//             Filtered Records: {filteredRows.length}
//           </span>
//         </div>

//         {/* ============================================
//             PAGINATION
//         ============================================ */}

//         <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-3 py-3">

//           <p className="text-xs text-gray-500">
//             Showing{" "}
//             {sortedRows.length === 0
//               ? 0
//               : (currentPage - 1) * pageSize + 1}
//             {" - "}
//             {Math.min(
//               currentPage * pageSize,
//               sortedRows.length
//             )}{" "}
//             of {sortedRows.length}
//           </p>

//           <div className="flex items-center gap-2">

//             <button
//               type="button"
//               disabled={currentPage <= 1}
//               onClick={() =>
//                 setPage((prev) => Math.max(1, prev - 1))
//               }
//               className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Previous
//             </button>

//             <span className="rounded-lg bg-[#0A4B57] px-3 py-1.5 text-xs font-bold text-white">
//               {currentPage} / {totalPages}
//             </span>

//             <button
//               type="button"
//               disabled={currentPage >= totalPages}
//               onClick={() =>
//                 setPage((prev) =>
//                   Math.min(totalPages, prev + 1)
//                 )
//               }
//               className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Next
//             </button>

//           </div>
//         </div>
//       </div>

//       {/* =================================================
//           ROW DETAILS MODAL
//           SAME FIELD SEQUENCE AS GRID
//       ================================================= */}

//       {selectedRow && (
//         <div
//           className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-5"
//           onClick={closeModal}
//         >
//           <div
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="production-modal-title"
//             onClick={(e) => e.stopPropagation()}
//             className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
//           >

//             {/* Modal Header */}
//             <div className="flex items-center justify-between gap-3 bg-[#0A4B57] px-4 py-4 text-white sm:px-6">

//               <div className="flex min-w-0 items-center gap-3">

//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
//                   <MdVisibility size={23} />
//                 </div>

//                 <div className="min-w-0">
//                   <h2
//                     id="production-modal-title"
//                     className="text-lg font-bold sm:text-xl"
//                   >
//                     Production Details
//                   </h2>

//                   <p className="truncate text-xs text-white/75">
//                     Job Card: {selectedRow.jobcard || "-"}
//                   </p>
//                 </div>

//               </div>

//               <button
//                 type="button"
//                 onClick={closeModal}
//                 aria-label="Close modal"
//                 className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 transition hover:bg-white/30"
//               >
//                 <MdClose size={23} />
//               </button>

//             </div>

//             {/* Modal Body */}
//             <div className="overflow-y-auto p-4 sm:p-6">

//               <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
//                 <h3 className="text-sm font-bold text-[#0A4B57]">
//                   Complete Record Information
//                 </h3>

//                 {Number(selectedRow.upperstorestatus) === 1 ? (
//                   <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
//                     <MdCheckCircle size={16} />
//                     Completed
//                   </span>
//                 ) : (
//                   <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
//                     Pending
//                   </span>
//                 )}
//               </div>

//               {/* IMPORTANT:
//                   columns.map() keeps exactly the same
//                   sequence as the main grid.
//               */}

//               <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

//                 {columns.map(([key, label], index) => {
//                   const value = getColumnValue(
//                     selectedRow,
//                     key
//                   );

//                   return (
//                     <div
//                       key={key}
//                       className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-3 transition hover:border-orange-300 hover:bg-orange-50"
//                     >
//                       <div className="mb-1 flex items-center gap-2">
//                         <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-red-800">
//   {label}
// </p>
//                       </div>

//                       <div className="break-words text-sm font-semibold text-gray-800">

//                         {key === "upperstorestatus" ? (
//                           renderStatus(value)
//                         ) : (
//                           displayValue(value, key)
//                         )}

//                       </div>
//                     </div>
//                   );
//                 })}

//               </div>

//             </div>

//             {/* Modal Footer */}
//             <div className="flex items-center justify-end border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">

//               <button
//                 type="button"
//                 onClick={closeModal}
//                 className="rounded-lg bg-[#0A4B57] px-6 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#083c46]"
//               >
//                 Close
//               </button>

//             </div>

//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// // import { useCallback, useEffect, useMemo, useState } from "react";
// // import axios from "axios";

// // import {
// //   MdCheckCircle,
// //   MdError,
// //   MdRefresh,
// //   MdKeyboardArrowUp,
// //   MdKeyboardArrowDown,
// //   MdSearch,
// // } from "react-icons/md";

// // // ======================================================
// // // API CONFIGURATION
// // // ======================================================

// // const API_BASE_URL =
// //   "https://mosach-erp-server.onrender.com/api/production-report";

// // const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// // // ======================================================
// // // DATABASE FIELD MAPPING
// // // ======================================================

// // const columns = [
// //   ["upperstorestatus", "Status"],
// //   ["reportdate", "Report Date"],
// //   ["jobcard", "Job Card"],
// //   ["sku", "SKU"],
// //   ["pair", "Pair"],
// //   ["carton", "Carton"],
// //   ["cuttingreceiveddate", "Cutting Date"],
// //   ["cuttingcontractor", "Cutting Cont."],
// //   ["uppercontractor", "Upper Cont."],
// //   ["upperissuedate", "UID"],
// //   ["upperreceiveddate", "URD"],
// //   // ["upperreceivedpair", "Upper Rec. Pair"],
// //   ["upperreceivedctn", "URC"],
// //   ["upperinsolecontractor", "Upper/Insole Stitch"],
// //   ["upperinsoleissueddate", "UISD"],
// //   ["upperstorereceiveddate", "USRD"],
// //   // ["upperstorepairqty", "Upper Store Pair Qty"],
// //   ["upperstorectn", "USC"],
// // ];

// // // ======================================================
// // // STICKY COLUMN WIDTH CONFIGURATION
// // // ======================================================

// // const INDEX_COLUMN_WIDTH = 48;

// // const STICKY_COLUMN_WIDTHS = {
// //   upperstorestatus: 65,
// //   reportdate: 105,
// //   jobcard: 110,
// //   sku: 240,
// //   pair: 75,
// //   carton: 75,
// // };

// // // Automatically calculate left positions.

// // const stickyColumns = (() => {
// //   let currentLeft = INDEX_COLUMN_WIDTH;

// //   return Object.fromEntries(
// //     Object.entries(STICKY_COLUMN_WIDTHS).map(
// //       ([key, width]) => {
// //         const config = {
// //           left: currentLeft,
// //           width,
// //         };

// //         currentLeft += width;

// //         return [key, config];
// //       }
// //     )
// //   );
// // })();

// // // ======================================================
// // // REPORT ROWS
// // // ======================================================

// // const getReportRows = (data) => {
// //   if (Array.isArray(data)) return data;
// //   if (Array.isArray(data?.data)) return data.data;
// //   if (Array.isArray(data?.rows)) return data.rows;
// //   if (Array.isArray(data?.records)) return data.records;
// //   if (Array.isArray(data?.data?.rows)) return data.data.rows;
// //   if (Array.isArray(data?.data?.records)) return data.data.records;

// //   return [];
// // };

// // // ======================================================
// // // DATE FORMAT
// // // ======================================================

// // const getDateValue = (value) => {
// //   if (!value) return "";

// //   const text = String(value).slice(0, 10);

// //   const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

// //   if (match) return text;

// //   const parsed = new Date(value);

// //   if (Number.isNaN(parsed.getTime())) return "";

// //   return [
// //     parsed.getFullYear(),
// //     String(parsed.getMonth() + 1).padStart(2, "0"),
// //     String(parsed.getDate()).padStart(2, "0"),
// //   ].join("-");
// // };

// // // ======================================================
// // // CTN CONVERSION WITH ROUNDING
// // // ======================================================

// // const getRoundedCTN = (pairQty, packing) => {
// //   if (
// //     pairQty === null ||
// //     pairQty === undefined ||
// //     pairQty === ""
// //   ) {
// //     return "";
// //   }

// //   const pairs = Number(pairQty);

// //   const packingQty = Number.parseFloat(packing) || 24;

// //   if (!Number.isFinite(pairs) || packingQty <= 0) {
// //     return "";
// //   }

// //   return Math.round(pairs / packingQty);
// // };

// // // ======================================================
// // // GET COLUMN VALUE
// // // ======================================================

// // const getColumnValue = (row, key) => {
// //   // Upper Received CTN
// //   if (key === "upperreceivedctn") {
// //     return getRoundedCTN(
// //       row?.upperreceivedpair,
// //       row?.packing
// //     );
// //   }

// //   // Upper Store CTN
// //   if (key === "upperstorectn") {
// //     return getRoundedCTN(
// //       row?.upperstorepairqty,
// //       row?.packing
// //     );
// //   }

// //   return row?.[key] ?? "";
// // };

// // // ======================================================
// // // DISPLAY VALUE
// // // ======================================================

// // const displayValue = (value, key = "") => {
// //   if (
// //     value === null ||
// //     value === undefined ||
// //     value === ""
// //   ) {
// //     return "-";
// //   }

// //   if (key.toLowerCase().includes("date")) {
// //     const date = getDateValue(value);

// //     if (date) {
// //       const [year, month, day] = date.split("-");
// //       return `${day}-${month}-${year}`;
// //     }
// //   }

// //   if (key === "carton") {
// //     const number = Number(value);

// //     return Number.isFinite(number)
// //       ? Math.round(number)
// //       : value;
// //   }

// //   return String(value);
// // };

// // // ======================================================
// // // STICKY COLUMN INLINE STYLE
// // // ======================================================

// // const getStickyStyle = (key) => {
// //   const config = stickyColumns[key];

// //   if (!config) return undefined;

// //   return {
// //     "--sticky-left": `${config.left}px`,

// //     width: `${config.width}px`,
// //     minWidth: `${config.width}px`,
// //     maxWidth: `${config.width}px`,

// //     boxSizing: "border-box",
// //   };
// // };

// // // ======================================================
// // // INDEX COLUMN STYLE
// // // ======================================================

// // const getIndexStyle = () => ({
// //   width: `${INDEX_COLUMN_WIDTH}px`,
// //   minWidth: `${INDEX_COLUMN_WIDTH}px`,
// //   maxWidth: `${INDEX_COLUMN_WIDTH}px`,
// //   boxSizing: "border-box",
// // });

// // // ======================================================
// // // MAIN COMPONENT
// // // ======================================================

// // export default function ProductionReport() {
// //   const [rows, setRows] = useState([]);

// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState("");

// //   const [search, setSearch] = useState("");

// //   const [fromDate, setFromDate] = useState("");
// //   const [toDate, setToDate] = useState("");

// //   const [sortField, setSortField] = useState("jobcard");
// //   const [sortDirection, setSortDirection] = useState("asc");

// //   const [page, setPage] = useState(1);
// //   const [pageSize, setPageSize] = useState(10);

// //   // ====================================================
// //   // LOAD REPORT DATA
// //   // ====================================================

// //   const fetchReport = useCallback(async () => {
// //     setLoading(true);
// //     setError("");

// //     try {
// //       const response = await axios.get(API_BASE_URL, {
// //         timeout: 120000,
// //       });

// //       const responseData = response.data;

// //       if (responseData?.success === false) {
// //         throw new Error(
// //           responseData.message ||
// //           "Production report load nahi hui."
// //         );
// //       }

// //       const reportRows = getReportRows(responseData);

// //       setRows(reportRows);
// //       setPage(1);
// //     } catch (err) {
// //       console.error(
// //         "Production report API error:",
// //         err.response?.data || err
// //       );

// //       setRows([]);

// //       setError(
// //         err.response?.data?.message ||
// //         err.response?.data?.error ||
// //         err.message ||
// //         "Production report load nahi hui."
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     fetchReport();
// //   }, [fetchReport]);

// //   // ====================================================
// //   // SEARCH, DATE FILTER AND SORT
// //   // ====================================================

// //   const filteredRows = useMemo(() => {
// //     let list = [...rows];

// //     const query = search.trim().toLowerCase();

// //     // SEARCH
// //     if (query) {
// //       list = list.filter((row) =>
// //         columns.some(([key]) =>
// //           String(getColumnValue(row, key))
// //             .toLowerCase()
// //             .includes(query)
// //         )
// //       );
// //     }

// //     // FROM DATE
// //     // ====================================================
// //     // FROM DATE FILTER - UPPER INSOLE ISSUE DATE
// //     // ====================================================

// //     if (fromDate) {
// //       list = list.filter((row) => {
// //         const date = getDateValue(row.upperinsoleissueddate);

// //         return date && date >= fromDate;
// //       });
// //     }

// //     // ====================================================
// //     // TO DATE FILTER - UPPER INSOLE ISSUE DATE
// //     // ====================================================

// //     if (toDate) {
// //       list = list.filter((row) => {
// //         const date = getDateValue(row.upperinsoleissueddate);

// //         return date && date <= toDate;
// //       });
// //     }

// //     // SORT
// //     list.sort((a, b) => {
// //       const av = getColumnValue(a, sortField);
// //       const bv = getColumnValue(b, sortField);

// //       let comparison;

// //       if (
// //         av !== "" &&
// //         bv !== "" &&
// //         Number.isFinite(Number(av)) &&
// //         Number.isFinite(Number(bv))
// //       ) {
// //         comparison = Number(av) - Number(bv);
// //       } else {
// //         comparison = String(av).localeCompare(
// //           String(bv),
// //           undefined,
// //           {
// //             numeric: true,
// //             sensitivity: "base",
// //           }
// //         );
// //       }

// //       return sortDirection === "asc"
// //         ? comparison
// //         : -comparison;
// //     });

// //     return list;
// //   }, [
// //     rows,
// //     search,
// //     fromDate,
// //     toDate,
// //     sortField,
// //     sortDirection,
// //   ]);

// //   // ====================================================
// //   // RESET PAGE ON FILTER CHANGE
// //   // ====================================================

// //   useEffect(() => {
// //     setPage(1);
// //   }, [search, fromDate, toDate, pageSize]);

// //   // ====================================================
// //   // PAGINATION
// //   // ====================================================

// //   const totalPages = Math.max(
// //     1,
// //     Math.ceil(filteredRows.length / pageSize)
// //   );

// //   const safePage = Math.min(page, totalPages);

// //   const pageRows = filteredRows.slice(
// //     (safePage - 1) * pageSize,
// //     safePage * pageSize
// //   );

// //   // ====================================================
// //   // SORT HANDLER
// //   // ====================================================

// //   const toggleSort = (field) => {
// //     if (sortField === field) {
// //       setSortDirection((current) =>
// //         current === "asc" ? "desc" : "asc"
// //       );
// //     } else {
// //       setSortField(field);
// //       setSortDirection("asc");
// //     }

// //     setPage(1);
// //   };

// //   // ====================================================
// //   // RESET FILTERS
// //   // ====================================================

// //   const resetFilters = () => {
// //     setSearch("");

// //     setFromDate("");
// //     setToDate("");

// //     setSortField("jobcard");
// //     setSortDirection("asc");

// //     setPage(1);
// //   };

// //   // ====================================================
// //   // RENDER
// //   // ====================================================

// //   return (
// //     <main className="min-h-screen bg-slate-50 p-4 md:p-6">

// //       {/* RESPONSIVE STICKY CSS */}

// //       <style>{`
// //         @media (min-width: 768px) {

// //           .production-report-grid .production-index-cell {
// //             position: sticky;
// //             left: 0;
// //           }

// //           .production-report-grid thead .production-index-cell {
// //             z-index: 70;
// //           }

// //           .production-report-grid tbody .production-index-cell {
// //             z-index: 40;
// //           }

// //           .production-report-grid .production-sticky-cell {
// //             position: sticky;
// //             left: var(--sticky-left);
// //           }

// //           .production-report-grid thead .production-sticky-cell {
// //             z-index: 50;
// //           }

// //           .production-report-grid tbody .production-sticky-cell {
// //             z-index: 20;
// //           }
// //         }
// //       `}</style>

// //       <div className="mx-auto max-w-[1800px]">

// //         {/* HEADER */}

// //         <header className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

// //           <div>
// //             <h1 className="text-2xl font-bold text-slate-800">
// //               Production Report
// //             </h1>

// //             <p className="mt-1 text-sm text-slate-500">
// //               Production records loaded from MOSACH ERP database.
// //             </p>
// //           </div>

// //           <button
// //             type="button"
// //             onClick={fetchReport}
// //             disabled={loading}
// //             className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
// //           >
// //             <MdRefresh
// //               size={19}
// //               className={loading ? "animate-spin" : ""}
// //             />

// //             {loading ? "Loading..." : "Refresh"}
// //           </button>

// //         </header>

// //         {/* FILTERS */}

// //         <section className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">

// //           <div className="relative">
// //             <MdSearch
// //               size={20}
// //               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
// //             />

// //             <input
// //               value={search}
// //               onChange={(event) => setSearch(event.target.value)}
// //               placeholder="Search all columns..."
// //               className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400"
// //             />
// //           </div>

// //           <label className="text-xs font-semibold text-slate-600">
// //             From Date

// //             <input
// //               type="date"
// //               value={fromDate}
// //               max={toDate || undefined}
// //               onChange={(event) => setFromDate(event.target.value)}
// //               className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
// //             />
// //           </label>

// //           <label className="text-xs font-semibold text-slate-600">
// //             To Date

// //             <input
// //               type="date"
// //               value={toDate}
// //               min={fromDate || undefined}
// //               onChange={(event) => setToDate(event.target.value)}
// //               className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
// //             />
// //           </label>

// //           <button
// //             type="button"
// //             onClick={resetFilters}
// //             className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
// //           >
// //             <MdRefresh size={19} />
// //             Reset Filters
// //           </button>

// //         </section>

// //         {/* SUMMARY */}

// //         <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

// //           <span className="rounded-lg bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
// //             {filteredRows.length} records
// //           </span>

// //           <span className="text-sm text-slate-500">
// //             Page {safePage} of {totalPages}
// //           </span>

// //         </div>

// //         {/* ERROR */}

// //         {error && (
// //           <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
// //             <MdError size={20} className="shrink-0" />

// //             <span className="break-words">
// //               {error}
// //             </span>
// //           </div>
// //         )}

// //         {/* ================================================= */}
// //         {/* TABLE GRID */}
// //         {/* ================================================= */}

// //         <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

// //           <div className="production-report-grid relative w-full max-w-full overflow-auto overscroll-x-contain">

// //             <table
// //               className="border-separate border-spacing-0 text-left text-sm"
// //               style={{
// //                 width: "max-content",
// //                 minWidth: "100%",
// //                 tableLayout: "fixed",
// //               }}
// //             >

// //               {/* COLUMN WIDTHS */}

// //               <colgroup>

// //                 <col
// //                   style={{
// //                     width: `${INDEX_COLUMN_WIDTH}px`,
// //                   }}
// //                 />

// //                 {columns.map(([key]) => (
// //                   <col
// //                     key={key}
// //                     style={{
// //                       width: `${STICKY_COLUMN_WIDTHS[key] ?? 170}px`,
// //                     }}
// //                   />
// //                 ))}

// //               </colgroup>

// //               {/* TABLE HEADER */}

// //               <thead>

// //                 <tr>

// //                   {/* # COLUMN */}

// //                   <th
// //                     style={getIndexStyle()}
// //                     className="production-index-cell sticky top-0 box-border overflow-hidden border-b border-slate-600 bg-slate-800 px-2 py-2 text-white"
// //                   >
// //                     #
// //                   </th>

// //                   {columns.map(([key, label]) => {

// //                     const config = stickyColumns[key];

// //                     return (
// //                       <th
// //                         key={key}
// //                         style={getStickyStyle(key)}
// //                         className={`
// //                           sticky top-0
// //                           box-border
// //                           overflow-hidden
// //                           whitespace-nowrap
// //                           border-b border-slate-600
// //                           bg-slate-800
// //                           px-2 py-2
// //                           text-white
// //                           ${config ? "production-sticky-cell" : ""}
// //                         `}
// //                       >

// //                         <button
// //                           type="button"
// //                           onClick={() => toggleSort(key)}
// //                           className="flex max-w-full items-center gap-1 overflow-hidden whitespace-nowrap font-semibold hover:text-orange-300"
// //                         >

// //                           <span className="overflow-hidden text-ellipsis">
// //                             {label}
// //                           </span>

// //                           {sortField === key &&
// //                             (sortDirection === "asc" ? (
// //                               <MdKeyboardArrowUp
// //                                 size={18}
// //                                 className="shrink-0"
// //                               />
// //                             ) : (
// //                               <MdKeyboardArrowDown
// //                                 size={18}
// //                                 className="shrink-0"
// //                               />
// //                             ))}

// //                         </button>

// //                       </th>
// //                     );
// //                   })}

// //                 </tr>

// //               </thead>

// //               {/* TABLE BODY */}

// //               <tbody>

// //                 {loading ? (
// //                   <tr>
// //                     <td
// //                       colSpan={columns.length + 1}
// //                       className="px-4 py-12 text-center text-slate-500"
// //                     >
// //                       <span className="inline-flex items-center gap-2">
// //                         <MdRefresh
// //                           size={20}
// //                           className="animate-spin"
// //                         />

// //                         Loading production records...
// //                       </span>
// //                     </td>
// //                   </tr>

// //                 ) : pageRows.length > 0 ? (

// //                   pageRows.map((row, index) => {

// //                     const rowNumber =
// //                       (safePage - 1) * pageSize + index + 1;

// //                     const stripe =
// //                       index % 2
// //                         ? "bg-slate-50"
// //                         : "bg-white";

// //                     return (
// //                       <tr
// //                         key={
// //                           row.productionreportid ??
// //                           `${row.jobcard ?? "job"}-${row.sku ?? "sku"}-${index}`
// //                         }
// //                         className="group transition hover:bg-orange-50"
// //                       >

// //                         {/* # COLUMN */}

// //                         <td
// //                           style={getIndexStyle()}
// //                           className={`
// //                             production-index-cell
// //                             box-border
// //                             overflow-hidden
// //                             border-b border-slate-200
// //                             px-2 py-2
// //                             text-slate-500
// //                             ${stripe}
// //                             group-hover:bg-orange-50
// //                           `}
// //                         >
// //                           {rowNumber}
// //                         </td>

// //                         {/* DATA COLUMNS */}

// //                         {columns.map(([key]) => {

// //                           const config = stickyColumns[key];

// //                           const value = getColumnValue(row, key);

// //                           return (
// //                             <td
// //                               key={key}
// //                               style={getStickyStyle(key)}
// //                               className={`
// //                                 box-border
// //                                 overflow-hidden
// //                                 text-ellipsis
// //                                 whitespace-nowrap
// //                                 border-b border-slate-200
// //                                 px-2 py-2
// //                                 text-slate-700
// //                                 ${config ? "production-sticky-cell" : ""}
// //                                 ${config ? stripe : ""}
// //                                 group-hover:bg-orange-50
// //                               `}
// //                               title={String(value ?? "")}
// //                             >

// //                               {key === "upperstorestatus" ? (

// //                                 Number(row[key]) === 1 ? (
// //                                   <MdCheckCircle
// //                                     size={22}
// //                                     className="mx-auto text-green-600"
// //                                     title="Completed"
// //                                   />
// //                                 ) : (
// //                                   <span className="text-slate-400">
// //                                     -
// //                                   </span>
// //                                 )

// //                               ) : (

// //                                 displayValue(value, key)

// //                               )}

// //                             </td>
// //                           );
// //                         })}

// //                       </tr>
// //                     );
// //                   })

// //                 ) : (

// //                   <tr>
// //                     <td
// //                       colSpan={columns.length + 1}
// //                       className="px-4 py-12 text-center text-slate-500"
// //                     >
// //                       {error
// //                         ? "Records load nahi ho sake. Error check karein."
// //                         : "No records found."}
// //                     </td>
// //                   </tr>

// //                 )}

// //               </tbody>

// //             </table>

// //           </div>

// //           {/* ================================================= */}
// //           {/* PAGINATION */}
// //           {/* ================================================= */}

// //           <div className="flex flex-col gap-3 border-t p-4 md:flex-row md:items-center md:justify-between">

// //             <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">

// //               <span>Rows per page</span>

// //               <select
// //                 value={pageSize}
// //                 onChange={(event) => {
// //                   setPageSize(Number(event.target.value));
// //                   setPage(1);
// //                 }}
// //                 className="rounded-lg border border-slate-300 bg-white px-3 py-2"
// //               >
// //                 {PAGE_SIZE_OPTIONS.map((size) => (
// //                   <option key={size} value={size}>
// //                     {size}
// //                   </option>
// //                 ))}
// //               </select>

// //               <span>
// //                 {filteredRows.length
// //                   ? `${(safePage - 1) * pageSize + 1}-${Math.min(
// //                     safePage * pageSize,
// //                     filteredRows.length
// //                   )} of ${filteredRows.length}`
// //                   : "0 records"}
// //               </span>

// //             </div>

// //             <div className="flex flex-wrap items-center gap-2">

// //               <button
// //                 type="button"
// //                 disabled={safePage <= 1}
// //                 onClick={() => setPage(1)}
// //                 className="rounded border px-3 py-2 disabled:opacity-40"
// //               >
// //                 First
// //               </button>

// //               <button
// //                 type="button"
// //                 disabled={safePage <= 1}
// //                 onClick={() =>
// //                   setPage((current) =>
// //                     Math.max(1, current - 1)
// //                   )
// //                 }
// //                 className="rounded border px-3 py-2 disabled:opacity-40"
// //               >
// //                 Previous
// //               </button>

// //               <span className="text-sm">
// //                 Page {safePage} / {totalPages}
// //               </span>

// //               <button
// //                 type="button"
// //                 disabled={safePage >= totalPages}
// //                 onClick={() =>
// //                   setPage((current) =>
// //                     Math.min(totalPages, current + 1)
// //                   )
// //                 }
// //                 className="rounded border px-3 py-2 disabled:opacity-40"
// //               >
// //                 Next
// //               </button>

// //               <button
// //                 type="button"
// //                 disabled={safePage >= totalPages}
// //                 onClick={() => setPage(totalPages)}
// //                 className="rounded border px-3 py-2 disabled:opacity-40"
// //               >
// //                 Last
// //               </button>

// //             </div>

// //           </div>

// //         </section>

// //       </div>
// //     </main>
// //   );
// // }