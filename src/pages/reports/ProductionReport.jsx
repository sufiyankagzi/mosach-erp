import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  MdCheckCircle,
  MdError,
  MdRefresh,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdSearch,
} from "react-icons/md";

// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL =
  "https://mosach-erp-server.onrender.com/api/production-report";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ======================================================
// DATABASE FIELD MAPPING
// ======================================================

const columns = [
  ["upperstorestatus", "Status"],
  ["reportdate", "Report Date"],
  ["jobcard", "Job Card"],
  ["sku", "SKU"],
  ["pair", "Pair"],
  ["carton", "Carton"],
  ["cuttingreceiveddate", "Cutting Rec. Date"],
  ["cuttingcontractor", "Cutting Contractor"],
  ["uppercontractor", "Upper Contractor"],
  ["upperissuedate", "Upper Iss. Date"],
  ["upperreceiveddate", "Upper Rec. Date"],
  // ["upperreceivedpair", "Upper Rec. Pair"],
  ["upperreceivedctn", "Upper Rec. CTN"],
  ["upperinsolecontractor", "Upper/Insole Contractor"],
  ["upperinsoleissueddate", "Upper/Insole Iss. Date"],
  ["upperstorereceiveddate", "Upper Store Rec. Date"],
  // ["upperstorepairqty", "Upper Store Pair Qty"],
  ["upperstorectn", "Upper Store CTN"],
];

// ======================================================
// STICKY COLUMN WIDTH CONFIGURATION
// ======================================================

const INDEX_COLUMN_WIDTH = 48;

const STICKY_COLUMN_WIDTHS = {
  upperstorestatus: 65,
  reportdate: 105,
  jobcard: 110,
  sku: 180,
  pair: 75,
  carton: 75,
};

// Automatically calculate left positions.

const stickyColumns = (() => {
  let currentLeft = INDEX_COLUMN_WIDTH;

  return Object.fromEntries(
    Object.entries(STICKY_COLUMN_WIDTHS).map(
      ([key, width]) => {
        const config = {
          left: currentLeft,
          width,
        };

        currentLeft += width;

        return [key, config];
      }
    )
  );
})();

// ======================================================
// REPORT ROWS
// ======================================================

const getReportRows = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.data?.rows)) return data.data.rows;
  if (Array.isArray(data?.data?.records)) return data.data.records;

  return [];
};

// ======================================================
// DATE FORMAT
// ======================================================

const getDateValue = (value) => {
  if (!value) return "";

  const text = String(value).slice(0, 10);

  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) return text;

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return "";

  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");
};

// ======================================================
// CTN CONVERSION WITH ROUNDING
// ======================================================

const getRoundedCTN = (pairQty, packing) => {
  if (
    pairQty === null ||
    pairQty === undefined ||
    pairQty === ""
  ) {
    return "";
  }

  const pairs = Number(pairQty);

  const packingQty = Number.parseFloat(packing) || 24;

  if (!Number.isFinite(pairs) || packingQty <= 0) {
    return "";
  }

  return Math.round(pairs / packingQty);
};

// ======================================================
// GET COLUMN VALUE
// ======================================================

const getColumnValue = (row, key) => {
  // Upper Received CTN
  if (key === "upperreceivedctn") {
    return getRoundedCTN(
      row?.upperreceivedpair,
      row?.packing
    );
  }

  // Upper Store CTN
  if (key === "upperstorectn") {
    return getRoundedCTN(
      row?.upperstorepairqty,
      row?.packing
    );
  }

  return row?.[key] ?? "";
};

// ======================================================
// DISPLAY VALUE
// ======================================================

const displayValue = (value, key = "") => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  if (key.toLowerCase().includes("date")) {
    const date = getDateValue(value);

    if (date) {
      const [year, month, day] = date.split("-");
      return `${day}-${month}-${year}`;
    }
  }

  if (key === "carton") {
    const number = Number(value);

    return Number.isFinite(number)
      ? Math.round(number)
      : value;
  }

  return String(value);
};

// ======================================================
// STICKY COLUMN INLINE STYLE
// ======================================================

const getStickyStyle = (key) => {
  const config = stickyColumns[key];

  if (!config) return undefined;

  return {
    "--sticky-left": `${config.left}px`,

    width: `${config.width}px`,
    minWidth: `${config.width}px`,
    maxWidth: `${config.width}px`,

    boxSizing: "border-box",
  };
};

// ======================================================
// INDEX COLUMN STYLE
// ======================================================

const getIndexStyle = () => ({
  width: `${INDEX_COLUMN_WIDTH}px`,
  minWidth: `${INDEX_COLUMN_WIDTH}px`,
  maxWidth: `${INDEX_COLUMN_WIDTH}px`,
  boxSizing: "border-box",
});

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

  // ====================================================
  // LOAD REPORT DATA
  // ====================================================

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_BASE_URL, {
        timeout: 120000,
      });

      const responseData = response.data;

      if (responseData?.success === false) {
        throw new Error(
          responseData.message ||
            "Production report load nahi hui."
        );
      }

      const reportRows = getReportRows(responseData);

      setRows(reportRows);
      setPage(1);
    } catch (err) {
      console.error(
        "Production report API error:",
        err.response?.data || err
      );

      setRows([]);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Production report load nahi hui."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // ====================================================
  // SEARCH, DATE FILTER AND SORT
  // ====================================================

  const filteredRows = useMemo(() => {
    let list = [...rows];

    const query = search.trim().toLowerCase();

    // SEARCH
    if (query) {
      list = list.filter((row) =>
        columns.some(([key]) =>
          String(getColumnValue(row, key))
            .toLowerCase()
            .includes(query)
        )
      );
    }

    // FROM DATE
    if (fromDate) {
      list = list.filter((row) => {
        const date = getDateValue(row.reportdate);
        return date && date >= fromDate;
      });
    }

    // TO DATE
    if (toDate) {
      list = list.filter((row) => {
        const date = getDateValue(row.reportdate);
        return date && date <= toDate;
      });
    }

    // SORT
    list.sort((a, b) => {
      const av = getColumnValue(a, sortField);
      const bv = getColumnValue(b, sortField);

      let comparison;

      if (
        av !== "" &&
        bv !== "" &&
        Number.isFinite(Number(av)) &&
        Number.isFinite(Number(bv))
      ) {
        comparison = Number(av) - Number(bv);
      } else {
        comparison = String(av).localeCompare(
          String(bv),
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

    return list;
  }, [
    rows,
    search,
    fromDate,
    toDate,
    sortField,
    sortDirection,
  ]);

  // ====================================================
  // RESET PAGE ON FILTER CHANGE
  // ====================================================

  useEffect(() => {
    setPage(1);
  }, [search, fromDate, toDate, pageSize]);

  // ====================================================
  // PAGINATION
  // ====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / pageSize)
  );

  const safePage = Math.min(page, totalPages);

  const pageRows = filteredRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // ====================================================
  // SORT HANDLER
  // ====================================================

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    setPage(1);
  };

  // ====================================================
  // RESET FILTERS
  // ====================================================

  const resetFilters = () => {
    setSearch("");

    setFromDate("");
    setToDate("");

    setSortField("jobcard");
    setSortDirection("asc");

    setPage(1);
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* RESPONSIVE STICKY CSS */}

      <style>{`
        @media (min-width: 768px) {

          .production-report-grid .production-index-cell {
            position: sticky;
            left: 0;
          }

          .production-report-grid thead .production-index-cell {
            z-index: 70;
          }

          .production-report-grid tbody .production-index-cell {
            z-index: 40;
          }

          .production-report-grid .production-sticky-cell {
            position: sticky;
            left: var(--sticky-left);
          }

          .production-report-grid thead .production-sticky-cell {
            z-index: 50;
          }

          .production-report-grid tbody .production-sticky-cell {
            z-index: 20;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1800px]">

        {/* HEADER */}

        <header className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Production Report
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Production records loaded from MOSACH ERP database.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdRefresh
              size={19}
              className={loading ? "animate-spin" : ""}
            />

            {loading ? "Loading..." : "Refresh"}
          </button>

        </header>

        {/* FILTERS */}

        <section className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">

          <div className="relative">
            <MdSearch
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search all columns..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400"
            />
          </div>

          <label className="text-xs font-semibold text-slate-600">
            From Date

            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(event) => setFromDate(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
            />
          </label>

          <label className="text-xs font-semibold text-slate-600">
            To Date

            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) => setToDate(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
            />
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <MdRefresh size={19} />
            Reset Filters
          </button>

        </section>

        {/* SUMMARY */}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">

          <span className="rounded-lg bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
            {filteredRows.length} records
          </span>

          <span className="text-sm text-slate-500">
            Page {safePage} of {totalPages}
          </span>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <MdError size={20} className="shrink-0" />

            <span className="break-words">
              {error}
            </span>
          </div>
        )}

        {/* ================================================= */}
        {/* TABLE GRID */}
        {/* ================================================= */}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="production-report-grid relative w-full max-w-full overflow-auto overscroll-x-contain">

            <table
              className="border-separate border-spacing-0 text-left text-sm"
              style={{
                width: "max-content",
                minWidth: "100%",
                tableLayout: "fixed",
              }}
            >

              {/* COLUMN WIDTHS */}

              <colgroup>

                <col
                  style={{
                    width: `${INDEX_COLUMN_WIDTH}px`,
                  }}
                />

                {columns.map(([key]) => (
                  <col
                    key={key}
                    style={{
                      width: `${STICKY_COLUMN_WIDTHS[key] ?? 170}px`,
                    }}
                  />
                ))}

              </colgroup>

              {/* TABLE HEADER */}

              <thead>

                <tr>

                  {/* # COLUMN */}

                  <th
                    style={getIndexStyle()}
                    className="production-index-cell sticky top-0 box-border overflow-hidden border-b border-slate-600 bg-slate-800 px-2 py-2 text-white"
                  >
                    #
                  </th>

                  {columns.map(([key, label]) => {

                    const config = stickyColumns[key];

                    return (
                      <th
                        key={key}
                        style={getStickyStyle(key)}
                        className={`
                          sticky top-0
                          box-border
                          overflow-hidden
                          whitespace-nowrap
                          border-b border-slate-600
                          bg-slate-800
                          px-2 py-2
                          text-white
                          ${config ? "production-sticky-cell" : ""}
                        `}
                      >

                        <button
                          type="button"
                          onClick={() => toggleSort(key)}
                          className="flex max-w-full items-center gap-1 overflow-hidden whitespace-nowrap font-semibold hover:text-orange-300"
                        >

                          <span className="overflow-hidden text-ellipsis">
                            {label}
                          </span>

                          {sortField === key &&
                            (sortDirection === "asc" ? (
                              <MdKeyboardArrowUp
                                size={18}
                                className="shrink-0"
                              />
                            ) : (
                              <MdKeyboardArrowDown
                                size={18}
                                className="shrink-0"
                              />
                            ))}

                        </button>

                      </th>
                    );
                  })}

                </tr>

              </thead>

              {/* TABLE BODY */}

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      <span className="inline-flex items-center gap-2">
                        <MdRefresh
                          size={20}
                          className="animate-spin"
                        />

                        Loading production records...
                      </span>
                    </td>
                  </tr>

                ) : pageRows.length > 0 ? (

                  pageRows.map((row, index) => {

                    const rowNumber =
                      (safePage - 1) * pageSize + index + 1;

                    const stripe =
                      index % 2
                        ? "bg-slate-50"
                        : "bg-white";

                    return (
                      <tr
                        key={
                          row.productionreportid ??
                          `${row.jobcard ?? "job"}-${row.sku ?? "sku"}-${index}`
                        }
                        className="group transition hover:bg-orange-50"
                      >

                        {/* # COLUMN */}

                        <td
                          style={getIndexStyle()}
                          className={`
                            production-index-cell
                            box-border
                            overflow-hidden
                            border-b border-slate-200
                            px-2 py-2
                            text-slate-500
                            ${stripe}
                            group-hover:bg-orange-50
                          `}
                        >
                          {rowNumber}
                        </td>

                        {/* DATA COLUMNS */}

                        {columns.map(([key]) => {

                          const config = stickyColumns[key];

                          const value = getColumnValue(row, key);

                          return (
                            <td
                              key={key}
                              style={getStickyStyle(key)}
                              className={`
                                box-border
                                overflow-hidden
                                text-ellipsis
                                whitespace-nowrap
                                border-b border-slate-200
                                px-2 py-2
                                text-slate-700
                                ${config ? "production-sticky-cell" : ""}
                                ${config ? stripe : ""}
                                group-hover:bg-orange-50
                              `}
                              title={String(value ?? "")}
                            >

                              {key === "upperstorestatus" ? (

                                Number(row[key]) === 1 ? (
                                  <MdCheckCircle
                                    size={22}
                                    className="mx-auto text-green-600"
                                    title="Completed"
                                  />
                                ) : (
                                  <span className="text-slate-400">
                                    -
                                  </span>
                                )

                              ) : (

                                displayValue(value, key)

                              )}

                            </td>
                          );
                        })}

                      </tr>
                    );
                  })

                ) : (

                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      {error
                        ? "Records load nahi ho sake. Error check karein."
                        : "No records found."}
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* ================================================= */}
          {/* PAGINATION */}
          {/* ================================================= */}

          <div className="flex flex-col gap-3 border-t p-4 md:flex-row md:items-center md:justify-between">

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">

              <span>Rows per page</span>

              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <span>
                {filteredRows.length
                  ? `${(safePage - 1) * pageSize + 1}-${Math.min(
                      safePage * pageSize,
                      filteredRows.length
                    )} of ${filteredRows.length}`
                  : "0 records"}
              </span>

            </div>

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage(1)}
                className="rounded border px-3 py-2 disabled:opacity-40"
              >
                First
              </button>

              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                className="rounded border px-3 py-2 disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm">
                Page {safePage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1)
                  )
                }
                className="rounded border px-3 py-2 disabled:opacity-40"
              >
                Next
              </button>

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage(totalPages)}
                className="rounded border px-3 py-2 disabled:opacity-40"
              >
                Last
              </button>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}