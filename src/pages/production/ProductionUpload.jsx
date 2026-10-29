import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  MdCloudUpload,
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
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// ======================================================
// DATABASE FIELD MAPPING
// ======================================================

const columns = [
  ["upperstorestatus", "Status"],
  ["jobcard", "Job Card"],
  ["sku", "SKU"],
  ["reportdate", "Report Date"],
  // ["article", "Article"],
  // ["colour", "Colour"],
  // ["size", "Size"],
  ["pair", "Pair"],
  // ["packing", "Packing"],
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

  // ["machineno", "Machine No."],
  // ["machineissuedate", "Machine Issue Date"],
  // ["machinepairqty", "Machine Pair Qty"],
  // ["firstpair", "1st Pair"],
  // ["secondpair", "2nd Pair"],
  // ["rejection", "Rejection"],
  // ["totalpair", "Total Pair"],
];

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const displayValue = (value, key = "") => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  // Date columns ko DD-MM-YYYY mein display karein
  if (key.toLowerCase().includes("date")) {
    const dateString =
      value instanceof Date
        ? value.toISOString().slice(0, 10)
        : String(value).slice(0, 10);

    const parts = dateString.split("-");

    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

  }

  return String(value);
};

const getDateValue = (value) => {
  if (!value) return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
};

const getErrorMessage = (error) => {
  const responseData = error.response?.data;

  if (responseData?.message) {
    const details = responseData.error;


    return details
      ? `${responseData.message} ${details}`
      : responseData.message;


  }

  if (error.code === "ECONNABORTED") {
    return "Request timeout ho gaya. Render server ko dobara try karein.";
  }

  if (!error.response) {
    return "Server se connection nahi ho raha. Internet aur Render API check karein.";
  }

  return error.message || "Unexpected error occurred.";
};

const getReportRows = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  if (Array.isArray(responseData?.rows)) {
    return responseData.rows;
  }

  if (Array.isArray(responseData?.data?.rows)) {
    return responseData.data.rows;
  }

  if (Array.isArray(responseData?.data?.records)) {
    return responseData.data.records;
  }

  if (Array.isArray(responseData?.records)) {
    return responseData.records;
  }

  return [];
};

const getUploadResult = (payload, fileName) => {
  const nestedData =
    payload?.data &&
      !Array.isArray(payload.data) &&
      typeof payload.data === "object"
      ? payload.data
      : {};

  return {
    ...payload,
    ...nestedData,
    fileName,
  };
};

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function ProductionUpload() {
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [result, setResult] = useState(null);
  const [rows, setRows] = useState([]);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [sortField, setSortField] = useState("jobcard");
  const [sortDirection, setSortDirection] = useState("asc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ====================================================
  // LOAD PRODUCTION REPORT
  // ====================================================

  const fetchReport = useCallback(async () => {
    setReportLoading(true);
    setError("");


    try {
      const response = await axios.get(API_BASE_URL, {
        timeout: 120000,
      });

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Production report load nahi hua."
        );
      }

      const reportRows = getReportRows(response.data);

      setRows(reportRows);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setReportLoading(false);
    }


  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // ====================================================
  // SELECT EXCEL FILE
  // ====================================================

  const handleFile = (event) => {
    const selected = event.target.files?.[0] || null;


    setFile(null);
    setError("");
    setMessage("");
    setResult(null);

    if (!selected) return;

    if (!/\.(xlsx|xls)$/i.test(selected.name)) {
      setError("Sirf .xlsx ya .xls Excel file select karein.");
      event.target.value = "";
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setError("Excel file ka size maximum 10 MB hona chahiye.");
      event.target.value = "";
      return;
    }

    setFile(selected);


  };

  // ====================================================
  // UPLOAD EXCEL
  // ====================================================

  const upload = async (event) => {
    event.preventDefault();


    if (!file) {
      setError("Pehle Excel file select karein.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_BASE_URL}/upload`,
        formData,
        {
          timeout: 120000,
        }
      );

      const payload = response.data;

      if (!payload || payload.success !== true) {
        throw new Error(
          payload?.message || "Production Excel upload failed."
        );
      }

      const uploadResult = getUploadResult(payload, file.name);

      setResult(uploadResult);

      setMessage(
        payload.message ||
        "Production Excel successfully upload ho gayi."
      );

      setFile(null);

      const input = document.getElementById("production-file");

      if (input) {
        input.value = "";
      }

      await fetchReport();

      setPage(1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }


  };

  // ====================================================
  // SEARCH, FILTER AND SORT
  // ====================================================

  const filteredRows = useMemo(() => {
    let list = [...rows];


    const query = search.trim().toLowerCase();

    if (query) {
      list = list.filter((row) =>
        columns.some(([key]) =>
          String(row[key] ?? "")
            .toLowerCase()
            .includes(query)
        )
      );
    }

    if (fromDate) {
      list = list.filter(
        (row) => getDateValue(row.reportdate) >= fromDate
      );
    }

    if (toDate) {
      list = list.filter(
        (row) => getDateValue(row.reportdate) <= toDate
      );
    }

    list.sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";

      const an = Number(av);
      const bn = Number(bv);

      const bothNumeric =
        av !== "" &&
        bv !== "" &&
        Number.isFinite(an) &&
        Number.isFinite(bn);

      let comparison;

      if (bothNumeric) {
        comparison = an - bn;
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

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((direction) =>
        direction === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // ====================================================
  // UPLOAD SUMMARY
  // ====================================================

  const summary = [
    {
      title: "Rows Read",
      value:
        result?.totalExcelRows ??
        result?.totalRowsRead ??
        result?.totalRows ??
        result?.rowsRead ??
        0,
      className: "bg-slate-100 text-slate-800",
    },
    {
      title: "Inserted",
      value: result?.insertedRows ?? 0,
      className: "bg-emerald-50 text-emerald-800",
    },
    {
      title: "Updated",
      value: result?.updatedRows ?? 0,
      className: "bg-blue-50 text-blue-800",
    },
    {
      title: "Unchanged",
      value: result?.unchangedRows ?? 0,
      className: "bg-violet-50 text-violet-800",
    },
    {
      title: "Skipped",
      value:
        (result?.skippedRows ?? 0) +
        (result?.invalidJobCardRows ?? 0),
      className: "bg-amber-50 text-amber-800",
    },
  ];

  // ====================================================
  // RENDER
  // ====================================================

  return (<main className="min-h-screen bg-slate-50 p-4 md:p-6"> <div className="mx-auto max-w-[1800px]">
    {/* HEADER */}


    <header className="mb-6">
      <h1 className="text-2xl font-bold text-slate-800">
        Production Excel Upload
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Upload Excel, save production records in MOSACH ERP,
        and review records loaded from the database.
      </p>
    </header>

    {/* UPLOAD SECTION */}

    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <form onSubmit={upload}>
        <label
          htmlFor="production-file"
          className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-orange-400 hover:bg-orange-50"
        >
          <MdCloudUpload
            size={44}
            className="mb-2 text-orange-500"
          />

          <span className="font-semibold text-slate-700">
            Excel file select karne ke liye click karein
          </span>

          <span className="mt-1 text-sm text-slate-500">
            XLS / XLSX · Maximum 10 MB
          </span>

          <input
            id="production-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            className="hidden"
          />
        </label>

        {file && (
          <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
            Selected: <strong>{file.name}</strong> (
            {(file.size / 1024).toFixed(1)} KB)
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            <MdError size={20} className="shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            <MdCheckCircle size={20} className="shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={!file || loading}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdCloudUpload size={21} />
            {loading ? "Uploading and saving..." : "Upload Excel"}
          </button>
        </div>
      </form>

      {/* UPLOAD RESULT SUMMARY */}

      {result && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Uploaded file: {result.fileName}
          </p>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {summary.map((item) => (
              <div
                key={item.title}
                className={`rounded-lg p-4 ${item.className}`}
              >
                <p className="text-sm">{item.title}</p>
                <p className="mt-1 text-2xl font-bold">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>

    {/* DATABASE REPORT */}

    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Production Records
          </h2>

          <p className="text-sm text-slate-500">
            Records loaded from the production report API.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
            {filteredRows.length} records
          </span>

          <button
            type="button"
            onClick={fetchReport}
            disabled={reportLoading}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <MdRefresh
              size={19}
              className={reportLoading ? "animate-spin" : ""}
            />
            {reportLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* FILTERS */}

      <div className="grid grid-cols-1 gap-3 border-b bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <MdSearch
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search all columns..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400"
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
      </div>

      {/* TABLE */}

      <div className="w-full overflow-auto relative">
        <table className="min-w-max border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              {/* # COLUMN */}
              <th className="md:sticky md:left-0 md:z-40 min-w-[55px] bg-slate-800 px-4 py-3">
                #
              </th>


              {columns.map(([key, label]) => (
                <th
                  key={key}
                  className={`whitespace-nowrap px-4 py-3 ${key === "upperstorestatus"
                      ? "md:sticky md:left-[55px] md:z-30 min-w-[80px] bg-slate-800"
                      : key === "jobcard"
                        ? "md:sticky md:left-[135px] md:z-30 min-w-[130px] bg-slate-800"
                        : key === "sku"
                          ? "md:sticky md:left-[265px] md:z-30 min-w-[130px] bg-slate-800"
                          : ""
                    }`}
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
              pageRows.map((row, index) => (
                <tr
                  key={
                    row.productionreportid ??
                    `${row.jobcard ?? "job"}-${row.sku ?? "sku"}-${index}`
                  }
                  className={`border-b border-slate-200 transition ${index % 2 ? "bg-slate-50" : "bg-white"
                    } hover:bg-orange-50`}
                >
                  {/* # COLUMN */}
                  <td
                    className={`md:sticky md:left-0 md:z-20 min-w-[55px] px-4 py-3 text-slate-500 ${index % 2 ? "bg-slate-50" : "bg-white"
                      }`}
                  >
                    {(safePage - 1) * pageSize + index + 1}
                  </td>


                  {columns.map(([key]) => (
                    <td
                      key={key}
                      className={`whitespace-nowrap px-4 py-3 ${key === "upperstorestatus"
                          ? `md:sticky md:left-[55px] md:z-20 min-w-[80px] text-center ${index % 2 ? "bg-slate-50" : "bg-white"
                          }`
                          : key === "jobcard"
                            ? `md:sticky md:left-[135px] md:z-20 min-w-[130px] font-semibold text-orange-700 ${index % 2 ? "bg-slate-50" : "bg-white"
                            }`
                            : key === "sku"
                              ? `md:sticky md:left-[265px] md:z-20 min-w-[130px] text-slate-700 ${index % 2 ? "bg-slate-50" : "bg-white"
                              }`
                              : key === "jobcard"
                                ? "font-semibold text-orange-700"
                                : "text-slate-700"
                        }`}
                    >
                      {/* STATUS ICON */}
                      {key === "upperstorestatus" ? (
                        Number(row[key]) === 1 ? (
                          <MdCheckCircle
                            size={22}
                            className="mx-auto text-green-600"
                            title="Completed"
                          />
                        ) : (
                          <span className="text-slate-400">-</span>
                        )
                      ) : key === "carton" &&
                        row[key] !== null &&
                        row[key] !== undefined &&
                        row[key] !== "" ? (
                        /* CARTON DECIMAL REMOVE */
                        Math.round(Number(row[key]))
                      ) : (
                        /* DATE FORMAT DD-MM-YYYY */
                        displayValue(row[key], key)
                      )}
                    </td>
                  ))}
                </tr>
              ))


            ) : (<tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-12 text-center text-slate-500"
              >
                {reportLoading
                  ? "Loading production records..."
                  : error
                    ? "Records load nahi ho sake. Upar error check karein."
                    : "No records found."} </td> </tr>
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
            className="rounded border px-3 py-2 disabled:opacity-40"
          >
            First
          </button>

          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((current) => current - 1)}
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
            onClick={() => setPage((current) => current + 1)}
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

    {/* IMPORT NOTES */}

    <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <strong>Import Notes:</strong>

      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Excel file format XLS/XLSX hona chahiye.</li>
        <li>Maximum file size 10 MB hai.</li>
        <li>
          Excel headings aur database field mapping backend controller
          ke according honi chahiye.
        </li>
        <li>
          Carton column Excel mein nahi hai; backend model iski value
          Pair ÷ 24 ke hisaab se calculate karta hai.
        </li>
      </ul>
    </div>
  </div>
  </main>


  );
}
