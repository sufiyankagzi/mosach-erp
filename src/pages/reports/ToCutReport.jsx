import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  MdRefresh,
  MdSearch,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdFilterList,
} from "react-icons/md";

const API_BASE_URL =
  "https://mosach-erp-server.onrender.com/api/tocut-report";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const columns = [
  ["sku", "SKU"],
  ["tocut", "To Cut"],
  ["article", "Article"],
  ["colour", "Colour"],
  ["size", "Size"],
];

const getRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
  return [];
};

const toNumber = (value) => {
  const parsed = Number(String(value ?? 0).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatTotal = (value) =>
  value.toLocaleString("en-IN", { maximumFractionDigits: 2 });

const getErrorMessage = (error) => {
  const data = error.response?.data;

  if (data?.message) {
    return data.error ? `${data.message} ${data.error}` : data.message;
  }

  if (error.code === "ECONNABORTED") {
    return "Request timeout ho gaya. Dobara try karein.";
  }

  if (!error.response) {
    return "Server se connection nahi ho raha. Internet aur Render API check karein.";
  }

  return error.message || "Records load nahi ho sake.";
};

export default function ToCutReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    sku: "",
    article: "",
    colour: "",
    size: "",
  });

  const [sortField, setSortField] = useState("sku");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_BASE_URL, {
        timeout: 120000,
      });

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "To Cut report load nahi hua."
        );
      }

      setRows(getRows(response.data));
    } catch (err) {
      setRows([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const filteredRows = useMemo(() => {
    const result = rows.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        const query = value.trim().toLowerCase();
        if (!query) return true;

        return String(row[key] ?? "")
          .toLowerCase()
          .includes(query);
      });
    });

    result.sort((a, b) => {
      const first = a[sortField] ?? "";
      const second = b[sortField] ?? "";
      const firstNumber = Number(first);
      const secondNumber = Number(second);

      const isNumeric =
        first !== "" &&
        second !== "" &&
        Number.isFinite(firstNumber) &&
        Number.isFinite(secondNumber);

      const comparison = isNumeric
        ? firstNumber - secondNumber
        : String(first).localeCompare(String(second), undefined, {
            numeric: true,
            sensitivity: "base",
          });

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [rows, filters, sortField, sortDirection]);

  // All database records ka total; filters se affect nahi hota.
  const allRecordsTotal = useMemo(
    () => rows.reduce((sum, row) => sum + toNumber(row.tocut), 0),
    [rows]
  );

  // Sirf current filters se match hone wale records ka total.
  const filteredRecordsTotal = useMemo(
    () => filteredRows.reduce((sum, row) => sum + toNumber(row.tocut), 0),
    [filteredRows]
  );

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRows.length / pageSize)
  );
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      sku: "",
      article: "",
      colour: "",
      size: "",
    });
    setSortField("sku");
    setSortDirection("asc");
    setPage(1);
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1800px]">
        {/* Page Header */}
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              To Cut Report
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              To Cut database records dekhein aur SKU, Article, Colour
              aur Size ke hisaab se filter karein.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchReport}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdRefresh
              size={20}
              className={loading ? "animate-spin" : ""}
            />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </header>

        {/* Filters */}
        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MdFilterList size={21} className="text-orange-500" />
              <h2 className="font-bold text-slate-800">Filter Records</h2>
            </div>

            <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700">
              {filteredRows.length} / {rows.length} Records
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label
                htmlFor="filter-sku"
                className="mb-1.5 block text-sm font-medium text-slate-600"
              >
                SKU
              </label>
              <div className="relative">
                <MdSearch
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="filter-sku"
                  type="text"
                  value={filters.sku}
                  onChange={(event) =>
                    updateFilter("sku", event.target.value)
                  }
                  placeholder="Search SKU..."
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="filter-article"
                className="mb-1.5 block text-sm font-medium text-slate-600"
              >
                Article
              </label>
              <input
                id="filter-article"
                type="text"
                value={filters.article}
                onChange={(event) =>
                  updateFilter("article", event.target.value)
                }
                placeholder="Search Article..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label
                htmlFor="filter-colour"
                className="mb-1.5 block text-sm font-medium text-slate-600"
              >
                Colour
              </label>
              <input
                id="filter-colour"
                type="text"
                value={filters.colour}
                onChange={(event) =>
                  updateFilter("colour", event.target.value)
                }
                placeholder="Search Colour..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label
                htmlFor="filter-size"
                className="mb-1.5 block text-sm font-medium text-slate-600"
              >
                Size
              </label>
              <input
                id="filter-size"
                type="text"
                value={filters.size}
                onChange={(event) =>
                  updateFilter("size", event.target.value)
                }
                placeholder="Search Size..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <MdRefresh size={18} />
              Clear Filters
            </button>
          </div>
        </section>

        {/* To Cut Totals */}
        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-orange-700">
              ALL RECORDS TOTAL TO CUT
            </p>
            <p className="mt-2 text-3xl font-extrabold text-orange-800">
              {formatTotal(allRecordsTotal)}
            </p>
            <p className="mt-1 text-xs text-orange-700">
              {rows.length.toLocaleString("en-IN")} database records · Total pairs
            </p>
          </div>

          <div className="rounded-xl border border-teal-200 bg-teal-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-teal-700">
              FILTERED RECORDS TOTAL TO CUT
            </p>
            <p className="mt-2 text-3xl font-extrabold text-teal-800">
              {formatTotal(filteredRecordsTotal)}
            </p>
            <p className="mt-1 text-xs text-teal-700">
              {filteredRows.length.toLocaleString("en-IN")} matching records · Total pairs
            </p>
          </div>
        </section>

        {/* Records Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
            <div>
              <h2 className="font-bold text-slate-800">
                To Cut Records
              </h2>
              <p className="text-xs text-slate-500">
                Column heading par click karke sorting karein.
              </p>
            </div>
            <span className="text-sm text-slate-500">
              {filteredRows.length} matching records
            </span>
          </div>

          {error && (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-30 w-14 min-w-14 border-b border-slate-600 bg-slate-800 px-3 py-3 text-white">
                    #
                  </th>

                  {columns.map(([key, label]) => (
                    <th
                      key={key}
                      className="sticky top-0 whitespace-nowrap border-b border-slate-600 bg-slate-800 px-4 py-3 text-white"
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
                  ))}
                </tr>
              </thead>

              <tbody>
                {pageRows.length > 0 ? (
                  pageRows.map((row, index) => {
                    const stripe =
                      index % 2 === 0 ? "bg-white" : "bg-slate-50";

                    return (
                      <tr
                        key={row.tocutreportid ?? row.sku ?? index}
                        className="group hover:bg-orange-50"
                      >
                        <td
                          className={`sticky left-0 z-10 w-14 min-w-14 border-b border-slate-200 px-3 py-3 text-slate-500 ${stripe} group-hover:bg-orange-50`}
                        >
                          {(safePage - 1) * pageSize + index + 1}
                        </td>

                        {columns.map(([key]) => (
                          <td
                            key={key}
                            className={`whitespace-nowrap border-b border-slate-200 px-4 py-3 ${
                              key === "sku"
                                ? "font-semibold text-orange-700"
                                : key === "tocut"
                                ? "font-semibold text-slate-800"
                                : "text-slate-700"
                            }`}
                          >
                            {row[key] === null ||
                            row[key] === undefined ||
                            row[key] === ""
                              ? "-"
                              : row[key]}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      {loading
                        ? "Loading To Cut records..."
                        : error
                        ? "Records load nahi ho sake."
                        : rows.length
                        ? "Filter ke matching records nahi mile."
                        : "No records found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={(event) =>
                  setPageSize(Number(event.target.value))
                }
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
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40"
              >
                First
              </button>
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <span className="px-1 text-sm text-slate-600">
                Page {safePage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage(totalPages)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40"
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
