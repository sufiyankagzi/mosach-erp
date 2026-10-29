
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

const API_BASE_URL =
  "https://mosach-erp-server.onrender.com/api/production-report";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const columns = [
  ["upperstorestatus", "Status"],
  ["jobcard", "Job Card"],
  ["sku", "SKU"],
  ["reportdate", "Report Date"],
  ["pair", "Pair"],
  ["carton", "Carton"],
  ["cuttingreceiveddate", "Cutting Received Date"],
  ["cuttingcontractor", "Cutting Contractor"],
  ["uppercontractor", "Upper Contractor"],
  ["upperissuedate", "Upper Issue Date"],
  ["upperreceiveddate", "Upper Received Date"],
  ["upperreceivedpair", "Upper Received Pair"],
  ["upperinsolecontractor", "Upper/Insole Contractor"],
  ["upperinsoleissueddate", "Upper/Insole Issued Date"],
  ["upperstorereceiveddate", "Upper Store Received Date"],
  ["upperstorepairqty", "Upper Store Pair Qty"],
];

const getReportRows = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.data?.rows)) return data.data.rows;
  if (Array.isArray(data?.data?.records)) return data.data.records;

  return [];
};

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

const displayValue = (value, key = "") => {
  if (value === null || value === undefined || value === "") {
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
    return Number.isFinite(number) ? Math.round(number) : value;
  }

  return String(value);
};

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

  // =====================================================
  // LOAD REPORT DATA FROM API
  // =====================================================
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
          responseData.message || "Production report load nahi hui."
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

  // =====================================================
  // SEARCH, DATE FILTER AND SORT
  // =====================================================
  const filteredRows = useMemo(() => {
    let list = [...rows];

    const query = search.trim().toLowerCase();

    if (query) {
      list = list.filter((row) =>
        columns.some(([key]) =>
          String(row?.[key] ?? "")
            .toLowerCase()
            .includes(query)
        )
      );
    }

    if (fromDate) {
      list = list.filter((row) => {
        const date = getDateValue(row.reportdate);
        return date && date >= fromDate;
      });
    }

    if (toDate) {
      list = list.filter((row) => {
        const date = getDateValue(row.reportdate);
        return date && date <= toDate;
      });
    }

    list.sort((a, b) => {
      const av = a?.[sortField] ?? "";
      const bv = b?.[sortField] ?? "";

      let comparison;

      if (
        av !== "" &&
        bv !== "" &&
        Number.isFinite(Number(av)) &&
        Number.isFinite(Number(bv))
      ) {
        comparison = Number(av) - Number(bv);
      } else {
        comparison = String(av).localeCompare(String(bv), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortDirection === "asc" ? comparison : -comparison;
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

  useEffect(() => {
    setPage(1);
  }, [search, fromDate, toDate, pageSize]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / pageSize)
  );

  const safePage = Math.min(page, totalPages);

  const pageRows = filteredRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

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

  const resetFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setSortField("jobcard");
    setSortDirection("asc");
    setPage(1);
  };

  // =====================================================
  // GRID
  // =====================================================
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
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
            <span className="break-words">{error}</span>
          </div>
        )}

        {/* TABLE GRID */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="relative w-full max-w-full overflow-auto overscroll-x-contain">
            <table className="min-w-max border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-50 min-w-[55px] border-b border-slate-600 bg-slate-800 px-4 py-3 text-white">
                    #
                  </th>

                  {columns.map(([key, label]) => {
                    const stickyClass =
                      key === "upperstorestatus"
                        ? "md:sticky md:left-[55px] md:z-40 min-w-[80px] bg-slate-800"
                        : key === "jobcard"
                          ? "md:sticky md:left-[135px] md:z-40 min-w-[130px] bg-slate-800"
                          : key === "sku"
                            ? "md:sticky md:left-[265px] md:z-40 min-w-[130px] bg-slate-800"
                            : "";

                    return (
                      <th
                        key={key}
                        className={`sticky top-0 whitespace-nowrap border-b border-slate-600 bg-slate-800 px-4 py-3 text-white ${stickyClass}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(key)}
                          className="flex items-center gap-1 font-semibold hover:text-orange-300"
                        >
                          {label}

                          {sortField === key &&
                            (sortDirection === "asc" ? (
                              <MdKeyboardArrowUp size={18} />
                            ) : (
                              <MdKeyboardArrowDown size={18} />
                            ))}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      <span className="inline-flex items-center gap-2">
                        <MdRefresh size={20} className="animate-spin" />
                        Loading production records...
                      </span>
                    </td>
                  </tr>
                ) : pageRows.length > 0 ? (
                  pageRows.map((row, index) => {
                    const rowNumber =
                      (safePage - 1) * pageSize + index + 1;

                    const stripe =
                      index % 2 ? "bg-slate-50" : "bg-white";

                    return (
                      <tr
                        key={
                          row.productionreportid ??
                          `${row.jobcard ?? "job"}-${row.sku ?? "sku"}-${index}`
                        }
                        className="transition hover:bg-orange-50"
                      >
                        <td
                          className={`sticky left-0 z-20 min-w-[55px] border-b border-slate-200 px-4 py-3 text-slate-500 ${stripe}`}
                        >
                          {rowNumber}
                        </td>

                        {columns.map(([key]) => {
                          const stickyClass =
                            key === "upperstorestatus"
                              ? `md:sticky md:left-[55px] md:z-20 min-w-[80px] text-center ${stripe}`
                              : key === "jobcard"
                                ? `md:sticky md:left-[135px] md:z-20 min-w-[130px] font-semibold text-orange-700 ${stripe}`
                                : key === "sku"
                                  ? `md:sticky md:left-[265px] md:z-20 min-w-[130px] text-slate-700 ${stripe}`
                                  : "text-slate-700";

                          return (
                            <td
                              key={key}
                              className={`whitespace-nowrap border-b border-slate-200 px-4 py-3 ${stickyClass}`}
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
                                displayValue(row[key], key)
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

          {/* PAGINATION */}
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
                  setPage((current) => Math.max(1, current - 1))
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

