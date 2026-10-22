import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  MdSearch,
  MdFilterList,
  MdRefresh,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdFirstPage,
  MdLastPage,
  MdErrorOutline,
  MdAssessment,
} from "react-icons/md";

const API_URL = "https://mosach-erp-server.onrender.com/api/production-report";
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const columns = [
  { key: "jobcard", label: "Job Card No." },
  { key: "sku", label: "SKU" },
  { key: "reportdate", label: "Report Date" },
  { key: "article", label: "Article" },
  { key: "colour", label: "Colour" },
  { key: "size", label: "Size" },
  { key: "pair", label: "Pair" },
  { key: "cuttingreceiveddate", label: "Cutting Received Date" },
  { key: "cuttingcontractor", label: "Cutting Contractor" },
  { key: "uppercontractor", label: "Upper Contractor" },
  { key: "upperissuedate", label: "Upper Issue Date" },
  { key: "upperreceiveddate", label: "Upper Received Date" },
  { key: "upperreceivedpair", label: "Upper Received Pair" },
  { key: "upperinsolecontractor", label: "Upper/Insole Contractor" },
  { key: "upperinsoleissueddate", label: "Upper/Insole Issued Date" },
  { key: "upperstorereceiveddate", label: "Upper Store Received Date" },
  { key: "upperstorepairqty", label: "Upper Store Pair Qty" },
  { key: "upperstorestatus", label: "Upper Store Status" },
  { key: "machineno", label: "Machine No." },
  { key: "machineissuedate", label: "Machine Issue Date" },
  { key: "machinepairqty", label: "Machine Pair Qty" },
  { key: "firstpair", label: "1st Pair" },
  { key: "secondpair", label: "2nd Pair" },
  { key: "rejection", label: "Rejection" },
  { key: "totalpair", label: "Total Pair" },
];

const getRowsFromResponse = (responseData) => {
  // Supports common response shapes without tying the component to one wrapper.
  const candidates = [
    responseData?.data?.rows,
    responseData?.data?.uploadedRows,
    responseData?.data?.records,
    responseData?.rows,
    responseData?.uploadedRows,
    responseData?.records,
    responseData?.data,
    responseData,
  ];

  return candidates.find(Array.isArray) || [];
};

const getDateOnly = (value) => {
  if (!value) return "";
  const text = String(value);
  // Handles ISO date strings and common SQL date strings.
  const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ProductionReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterJobcard, setFilterJobcard] = useState("");
  const [filterArticle, setFilterArticle] = useState("");
  const [filterColour, setFilterColour] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [sortField, setSortField] = useState("jobcard");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // This page reads the saved production report records from the backend.
      // Expected endpoint: GET /api/production-report
      const response = await axios.get(API_URL);
      setRows(getRowsFromResponse(response.data));
    } catch (err) {
      setRows([]);
      setError(
        err.response?.data?.message ||
          "Production report load nahi ho paayi. Backend par GET /api/production-report endpoint check karein."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const articleOptions = useMemo(
    () =>
      [...new Set(rows.map((row) => row.article).filter((v) => v != null && String(v).trim()).map(String))]
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })),
    [rows]
  );

  const colourOptions = useMemo(
    () =>
      [...new Set(rows.map((row) => row.colour).filter((v) => v != null && String(v).trim()).map(String))]
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })),
    [rows]
  );

  const sizeOptions = useMemo(
    () =>
      [...new Set(rows.map((row) => row.size).filter((v) => v != null && String(v).trim()).map(String))]
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })),
    [rows]
  );

  const resetFilters = () => {
    setSearch("");
    setFilterJobcard("");
    setFilterArticle("");
    setFilterColour("");
    setFilterSize("");
    setFromDate("");
    setToDate("");
    setSortField("jobcard");
    setSortDirection("asc");
    setCurrentPage(1);
  };

  const filteredRows = useMemo(() => {
    let result = [...rows];
    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((row) =>
        [
          row.jobcard,
          row.sku,
          row.article,
          row.colour,
          row.size,
          row.machineno,
          row.cuttingcontractor,
          row.uppercontractor,
          row.upperinsolecontractor,
          row.upperstorestatus,
        ].some((value) => String(value ?? "").toLowerCase().includes(query))
      );
    }

    if (filterJobcard.trim()) {
      const jobcardQuery = filterJobcard.trim().toLowerCase();
      result = result.filter((row) =>
        String(row.jobcard ?? "").toLowerCase().includes(jobcardQuery)
      );
    }

    if (filterArticle) result = result.filter((row) => String(row.article ?? "") === filterArticle);
    if (filterColour) result = result.filter((row) => String(row.colour ?? "") === filterColour);
    if (filterSize) result = result.filter((row) => String(row.size ?? "") === filterSize);

    if (fromDate) {
      result = result.filter((row) => {
        const date = getDateOnly(row.reportdate);
        return date && date >= fromDate;
      });
    }

    if (toDate) {
      result = result.filter((row) => {
        const date = getDateOnly(row.reportdate);
        return date && date <= toDate;
      });
    }

    result.sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];
      let comparison = 0;

      if (valueA == null || valueA === "") comparison = valueB == null || valueB === "" ? 0 : -1;
      else if (valueB == null || valueB === "") comparison = 1;
      else if (typeof valueA === "number" && typeof valueB === "number") comparison = valueA - valueB;
      else {
        comparison = String(valueA).localeCompare(String(valueB), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    rows,
    search,
    filterJobcard,
    filterArticle,
    filterColour,
    filterSize,
    fromDate,
    toDate,
    sortField,
    sortDirection,
  ]);

  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = totalRows === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRows);
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <MdKeyboardArrowUp size={18} />
    ) : (
      <MdKeyboardArrowDown size={18} />
    );
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MdAssessment className="text-orange-500" size={28} />
              <h1 className="text-2xl font-bold text-slate-800">Production Report</h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              View, search, filter, sort and paginate saved MOSACH production records.
            </p>
          </div>
          <button
            type="button"
            onClick={loadReport}
            disabled={loading}
            className="flex items-center justify-center gap-2 self-start rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60 sm:self-auto"
          >
            <MdRefresh size={19} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading..." : "Refresh Report"}
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Records</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{rows.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Filtered Records</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">{totalRows}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Current Page</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">
              {safeCurrentPage} <span className="text-base font-medium text-slate-400">/ {totalPages}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <MdErrorOutline size={21} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load production report</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Production Records Grid</h2>
              <p className="mt-1 text-sm text-slate-500">
                Showing {totalRows === 0 ? 0 : startIndex + 1}–{endIndex} of {totalRows} matching records
              </p>
            </div>
            <span className="self-start rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
              {rows.length} total records
            </span>
          </div>

          <div className="space-y-4 border-b border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 font-semibold text-slate-700">
              <MdFilterList size={22} />
              Filter Production Data
            </div>

            <div className="relative">
              <MdSearch size={22} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Job Card, SKU, Article, Colour, Size, Machine, Contractor..."
                className={`${inputClass} py-3 pl-10`}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Job Card No.</label>
                <input
                  value={filterJobcard}
                  onChange={(event) => {
                    setFilterJobcard(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Enter Job Card"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Article</label>
                <select value={filterArticle} onChange={(event) => { setFilterArticle(event.target.value); setCurrentPage(1); }} className={inputClass}>
                  <option value="">All Articles</option>
                  {articleOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Colour</label>
                <select value={filterColour} onChange={(event) => { setFilterColour(event.target.value); setCurrentPage(1); }} className={inputClass}>
                  <option value="">All Colours</option>
                  {colourOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Size</label>
                <select value={filterSize} onChange={(event) => { setFilterSize(event.target.value); setCurrentPage(1); }} className={inputClass}>
                  <option value="">All Sizes</option>
                  {sizeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">From Date</label>
                <input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => { setFromDate(event.target.value); setCurrentPage(1); }} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">To Date</label>
                <input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => { setToDate(event.target.value); setCurrentPage(1); }} className={inputClass} />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Filtered records: <strong className="text-slate-700">{totalRows}</strong>
              </p>
              <button type="button" onClick={resetFilters} className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                <MdRefresh size={19} />
                Reset Filters
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="min-w-max border-collapse text-left text-sm">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-center">#</th>
                  {columns.map((column) => (
                    <th key={column.key} className="whitespace-nowrap px-4 py-3">
                      <button type="button" onClick={() => handleSort(column.key)} className="flex items-center gap-1 font-semibold hover:text-orange-300">
                        {column.label}
                        <SortIcon field={column.key} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={columns.length + 1} className="px-4 py-12 text-center text-slate-500">Loading production records...</td></tr>
                ) : paginatedRows.length ? (
                  paginatedRows.map((row, index) => (
                    <tr key={row.id ?? `${row.jobcard ?? "row"}-${startIndex + index}`} className={`border-b border-slate-200 transition hover:bg-orange-50 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                      <td className="px-4 py-3 text-center text-slate-500">{startIndex + index + 1}</td>
                      {columns.map((column) => {
                        const value = row[column.key];
                        return (
                          <td key={column.key} className={`whitespace-nowrap px-4 py-3 ${column.key === "jobcard" ? "font-semibold text-orange-700" : "text-slate-700"}`}>
                            {value == null || value === "" ? "-" : String(value).slice(0, 100)}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-4 py-12 text-center">
                      <MdSearch size={38} className="mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">No records found</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {rows.length === 0 ? "No production data was returned by the API." : "Try changing your search or filters."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span>Rows per page:</span>
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-orange-400">
                {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
              <span className="ml-2">{totalRows === 0 ? "0 records" : `${startIndex + 1}-${endIndex} of ${totalRows}`}</span>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage(1)} title="First Page" className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">
                <MdFirstPage size={21} />
              </button>
              <button type="button" disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage((page) => page - 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              <span className="whitespace-nowrap px-2 text-sm font-semibold text-slate-700">Page {safeCurrentPage} of {totalPages}</span>
              <button type="button" disabled={safeCurrentPage >= totalPages} onClick={() => setCurrentPage((page) => page + 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
              <button type="button" disabled={safeCurrentPage >= totalPages} onClick={() => setCurrentPage(totalPages)} title="Last Page" className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">
                <MdLastPage size={21} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
