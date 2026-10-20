import { useMemo, useState } from "react";
import axios from "axios";

import {
    MdCloudUpload,
    MdDescription,
    MdCheckCircle,
    MdError,
    MdSearch,
    MdFilterList,
    MdRefresh,
    MdKeyboardArrowUp,
    MdKeyboardArrowDown,
    MdFirstPage,
    MdLastPage
} from "react-icons/md";

const API_URL =
    "https://mosach-erp-server.onrender.com/api/production-report";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const ProductionUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    // Grid states
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

    // ==================================================
    // FILE SELECTION
    // ==================================================

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];

        setFile(null);
        setMessage("");
        setResult(null);
        setError("");

        if (!selectedFile) return;

        if (!/\.(xlsx|xls)$/i.test(selectedFile.name)) {
            setError(
                "Please select a valid Excel file (.xlsx or .xls)."
            );

            event.target.value = "";
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError("File size must not exceed 10 MB.");

            event.target.value = "";
            return;
        }

        setFile(selectedFile);
    };

    // ==================================================
    // RESET GRID FILTERS
    // ==================================================

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

    // ==================================================
    // UPLOAD EXCEL
    // ==================================================

    const handleUpload = async (event) => {
        event.preventDefault();

        if (!file) {
            setError("Please select an Excel file first.");
            return;
        }

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const formData = new FormData();

            formData.append("file", file);

            const response = await axios.post(
                `${API_URL}/upload`,
                formData
            );

            const uploadData = response.data.data;

            setMessage(
                response.data.message ||
                "Excel uploaded successfully."
            );

            setResult(uploadData);

            // Reset grid filters after a new upload
            resetFilters();

            setFile(null);

            event.target.reset();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Excel upload failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // GET UPLOADED ROWS
    // ==================================================

    const uploadedRows = useMemo(() => {
        return Array.isArray(result?.uploadedRows)
            ? result.uploadedRows
            : [];
    }, [result]);

    // ==================================================
    // GET FILTER DROPDOWN OPTIONS
    // ==================================================

    const articleOptions = useMemo(() => {
        return [
            ...new Set(
                uploadedRows
                    .map((row) => row.article)
                    .filter((value) => value !== null &&
                        value !== undefined &&
                        String(value).trim() !== "")
                    .map(String)
            )
        ].sort((a, b) => a.localeCompare(b));
    }, [uploadedRows]);

    const colourOptions = useMemo(() => {
        return [
            ...new Set(
                uploadedRows
                    .map((row) => row.colour)
                    .filter((value) => value !== null &&
                        value !== undefined &&
                        String(value).trim() !== "")
                    .map(String)
            )
        ].sort((a, b) => a.localeCompare(b));
    }, [uploadedRows]);

    const sizeOptions = useMemo(() => {
        return [
            ...new Set(
                uploadedRows
                    .map((row) => row.size)
                    .filter((value) => value !== null &&
                        value !== undefined &&
                        String(value).trim() !== "")
                    .map(String)
            )
        ].sort((a, b) => a.localeCompare(b));
    }, [uploadedRows]);

    // ==================================================
    // FILTER GRID DATA
    // ==================================================

    const filteredRows = useMemo(() => {
        let rows = [...uploadedRows];

        const normalizedSearch = search.trim().toLowerCase();

        if (normalizedSearch) {
            rows = rows.filter((row) => {
                const searchableValues = [
                    row.jobcard,
                    row.sku,
                    row.article,
                    row.colour,
                    row.size,
                    row.machineno,
                    row.cuttingcontractor,
                    row.uppercontractor,
                    row.upperinsolecontractor,
                    row.upperstorestatus
                ];

                return searchableValues.some((value) =>
                    String(value ?? "")
                        .toLowerCase()
                        .includes(normalizedSearch)
                );
            });
        }

        if (filterJobcard.trim()) {
            rows = rows.filter((row) =>
                String(row.jobcard ?? "")
                    .toLowerCase()
                    .includes(filterJobcard.trim().toLowerCase())
            );
        }

        if (filterArticle) {
            rows = rows.filter(
                (row) => String(row.article ?? "") === filterArticle
            );
        }

        if (filterColour) {
            rows = rows.filter(
                (row) => String(row.colour ?? "") === filterColour
            );
        }

        if (filterSize) {
            rows = rows.filter(
                (row) => String(row.size ?? "") === filterSize
            );
        }

        if (fromDate) {
            rows = rows.filter((row) => {
                const date = String(row.reportdate ?? "").slice(0, 10);
                return date && date >= fromDate;
            });
        }

        if (toDate) {
            rows = rows.filter((row) => {
                const date = String(row.reportdate ?? "").slice(0, 10);
                return date && date <= toDate;
            });
        }

        // Sorting
        rows.sort((a, b) => {
            const valueA = a[sortField];
            const valueB = b[sortField];

            let comparison = 0;

            if (
                valueA === null ||
                valueA === undefined ||
                valueA === ""
            ) {
                comparison = -1;
            } else if (
                valueB === null ||
                valueB === undefined ||
                valueB === ""
            ) {
                comparison = 1;
            } else if (
                typeof valueA === "number" &&
                typeof valueB === "number"
            ) {
                comparison = valueA - valueB;
            } else {
                comparison = String(valueA).localeCompare(
                    String(valueB),
                    undefined,
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                );
            }

            return sortDirection === "asc"
                ? comparison
                : -comparison;
        });

        return rows;
    }, [
        uploadedRows,
        search,
        filterJobcard,
        filterArticle,
        filterColour,
        filterSize,
        fromDate,
        toDate,
        sortField,
        sortDirection
    ]);

    // ==================================================
    // PAGINATION
    // ==================================================

    const totalRows = filteredRows.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalRows / pageSize)
    );

    const safeCurrentPage = Math.min(
        currentPage,
        totalPages
    );

    const startIndex =
        totalRows === 0
            ? 0
            : (safeCurrentPage - 1) * pageSize;

    const endIndex = Math.min(
        startIndex + pageSize,
        totalRows
    );

    const paginatedRows = filteredRows.slice(
        startIndex,
        endIndex
    );

    // ==================================================
    // SORT HANDLER
    // ==================================================

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection((previous) =>
                previous === "asc" ? "desc" : "asc"
            );
        } else {
            setSortField(field);
            setSortDirection("asc");
        }

        setCurrentPage(1);
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) {
            return null;
        }

        return sortDirection === "asc"
            ? <MdKeyboardArrowUp size={18} />
            : <MdKeyboardArrowDown size={18} />;
    };

    // ==================================================
    // SUMMARY CARDS
    // ==================================================

    const summaryCards = [
        {
            title: "Rows Read",
            value: result?.totalRowsRead ?? 0,
            cardClass: "bg-slate-50",
            titleClass: "text-slate-500",
            valueClass: "text-slate-800"
        },
        {
            title: "Inserted Rows",
            value: result?.insertedRows ?? 0,
            cardClass: "bg-emerald-50",
            titleClass: "text-emerald-700",
            valueClass: "text-emerald-800"
        },
        {
            title: "Updated Rows",
            value: result?.updatedRows ?? 0,
            cardClass: "bg-blue-50",
            titleClass: "text-blue-700",
            valueClass: "text-blue-800"
        },
        {
            title: "Unchanged Rows",
            value: result?.unchangedRows ?? 0,
            cardClass: "bg-violet-50",
            titleClass: "text-violet-700",
            valueClass: "text-violet-800"
        },
        {
            title: "Skipped Rows",
            value: result?.skippedRows ?? 0,
            cardClass: "bg-amber-50",
            titleClass: "text-amber-700",
            valueClass: "text-amber-800"
        }
    ];

    // ==================================================
    // TABLE COLUMNS
    // ==================================================

    const columns = [
        {
            key: "jobcard",
            label: "Job Card No."
        },
        {
            key: "sku",
            label: "SKU"
        },
        {
            key: "reportdate",
            label: "Report Date"
        },
        {
            key: "article",
            label: "Article"
        },
        {
            key: "colour",
            label: "Colour"
        },
        {
            key: "size",
            label: "Size"
        },
        {
            key: "pair",
            label: "Pair"
        },
        {
            key: "cuttingreceiveddate",
            label: "Cutting Received Date"
        },
        {
            key: "cuttingcontractor",
            label: "Cutting Contractor"
        },
        {
            key: "uppercontractor",
            label: "Upper Contractor"
        },
        {
            key: "upperissuedate",
            label: "Upper Issue Date"
        },
        {
            key: "upperreceiveddate",
            label: "Upper Received Date"
        },
        {
            key: "upperreceivedpair",
            label: "Upper Received Pair"
        },
        {
            key: "upperinsolecontractor",
            label: "Upper/Insole Contractor"
        },
        {
            key: "upperinsoleissueddate",
            label: "Upper/Insole Issued Date"
        },
        {
            key: "upperstorereceiveddate",
            label: "Upper Store Received Date"
        },
        {
            key: "upperstorepairqty",
            label: "Upper Store Pair Qty"
        },
        {
            key: "upperstorestatus",
            label: "Upper Store Status"
        },
        {
            key: "machineno",
            label: "Machine No."
        },
        {
            key: "machineissuedate",
            label: "Machine Issue Date"
        },
        {
            key: "machinepairqty",
            label: "Machine Pair Qty"
        },
        {
            key: "firstpair",
            label: "1st Pair"
        },
        {
            key: "secondpair",
            label: "2nd Pair"
        },
        {
            key: "rejection",
            label: "Rejection"
        },
        {
            key: "totalpair",
            label: "Total Pair"
        }
    ];

    // ==================================================
    // RENDER
    // ==================================================

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mx-auto max-w-[1800px]">

                {/* PAGE HEADER */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Production Excel Upload
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Upload production Excel and view imported
                        records with filters in MOSACH ERP.
                    </p>
                </div>

                {/* UPLOAD CARD */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">

                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-lg bg-orange-100 p-3">
                            <MdCloudUpload
                                size={28}
                                className="text-orange-600"
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">
                                Import Production Data
                            </h2>

                            <p className="text-sm text-slate-500">
                                Supported formats: XLSX, XLS · Maximum 10 MB
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleUpload}>

                        {/* FILE SELECTOR */}
                        <label
                            htmlFor="productionExcel"
                            className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-orange-400 hover:bg-orange-50"
                        >
                            <MdCloudUpload
                                size={48}
                                className="mb-3 text-orange-500"
                            />

                            <span className="font-semibold text-slate-700">
                                Click to select production Excel
                            </span>

                            <span className="mt-2 text-sm text-slate-500">
                                Choose an .xlsx or .xls file
                            </span>

                            <input
                                id="productionExcel"
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>

                        {/* SELECTED FILE */}
                        {file && (
                            <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 p-4">
                                <MdDescription
                                    size={30}
                                    className="shrink-0 text-emerald-600"
                                />

                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-slate-700">
                                        {file.name}
                                    </p>

                                    <p className="text-sm text-slate-500">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null);

                                        const input =
                                            document.getElementById(
                                                "productionExcel"
                                            );

                                        if (input) {
                                            input.value = "";
                                        }
                                    }}
                                    className="text-sm font-medium text-red-600 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        {/* ERROR MESSAGE */}
                        {error && (
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                <MdError
                                    size={20}
                                    className="shrink-0"
                                />

                                <span>{error}</span>
                            </div>
                        )}

                        {/* SUCCESS MESSAGE */}
                        {message && (
                            <div className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                                <MdCheckCircle
                                    size={20}
                                    className="shrink-0"
                                />

                                <span>{message}</span>
                            </div>
                        )}

                        {/* UPLOAD SUMMARY */}
                        {result && (
                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {summaryCards.map((card) => (
                                    <div
                                        key={card.title}
                                        className={`rounded-lg p-4 ${card.cardClass}`}
                                    >
                                        <p className={`text-sm ${card.titleClass}`}>
                                            {card.title}
                                        </p>

                                        <p className={`mt-1 text-2xl font-bold ${card.valueClass}`}>
                                            {card.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* UPLOAD BUTTON */}
                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={!file || loading}
                                className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <MdCloudUpload size={22} />

                                {loading
                                    ? "Uploading..."
                                    : "Upload Excel"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* ==================================================
                    UPLOADED DATA GRID
                ================================================== */}

                {result && (
                    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                        {/* GRID HEADER */}
                        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    Uploaded Production Records
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    File: {result.fileName || "Excel file"}
                                </p>
                            </div>

                            <div className="rounded-lg bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
                                Showing {totalRows} of {uploadedRows.length} records
                            </div>
                        </div>

                        {/* FILTERS */}
                        <div className="space-y-4 border-b border-slate-200 bg-slate-50 p-5">

                            <div className="flex items-center gap-2 font-semibold text-slate-700">
                                <MdFilterList size={22} />
                                Filter Production Data
                            </div>

                            {/* SEARCH */}
                            <div className="relative">
                                <MdSearch
                                    size={22}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search Job Card, SKU, Article, Colour, Size, Machine..."
                                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                />
                            </div>

                            {/* FILTER GRID */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        Job Card No.
                                    </label>

                                    <input
                                        type="text"
                                        value={filterJobcard}
                                        onChange={(event) => {
                                            setFilterJobcard(event.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Enter Job Card"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        Article
                                    </label>

                                    <select
                                        value={filterArticle}
                                        onChange={(event) => {
                                            setFilterArticle(event.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                                    >
                                        <option value="">All Articles</option>

                                        {articleOptions.map((article) => (
                                            <option key={article} value={article}>
                                                {article}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        Colour
                                    </label>

                                    <select
                                        value={filterColour}
                                        onChange={(event) => {
                                            setFilterColour(event.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                                    >
                                        <option value="">All Colours</option>

                                        {colourOptions.map((colour) => (
                                            <option key={colour} value={colour}>
                                                {colour}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        Size
                                    </label>

                                    <select
                                        value={filterSize}
                                        onChange={(event) => {
                                            setFilterSize(event.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                                    >
                                        <option value="">All Sizes</option>

                                        {sizeOptions.map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        From Date
                                    </label>

                                    <input
                                        type="date"
                                        value={fromDate}
                                        max={toDate || undefined}
                                        onChange={(event) => {
                                            setFromDate(event.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                                        To Date
                                    </label>

                                    <input
                                        type="date"
                                        value={toDate}
                                        min={fromDate || undefined}
                                        onChange={(event) => {
                                            setToDate(event.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                                    />
                                </div>
                            </div>

                            {/* FILTER ACTIONS */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-slate-500">
                                    Filtered records:{" "}
                                    <strong className="text-slate-700">
                                        {totalRows}
                                    </strong>
                                </p>

                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    <MdRefresh size={19} />
                                    Reset Filters
                                </button>
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="w-full overflow-x-auto">
                            <table className="min-w-max border-collapse text-left text-sm">

                                <thead className="bg-slate-800 text-white">
                                    <tr>
                                        <th className="whitespace-nowrap px-4 py-3 text-center">
                                            #
                                        </th>

                                        {columns.map((column) => (
                                            <th
                                                key={column.key}
                                                className="whitespace-nowrap px-4 py-3"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSort(column.key)
                                                    }
                                                    className="flex items-center gap-1 font-semibold hover:text-orange-300"
                                                >
                                                    {column.label}

                                                    <SortIcon field={column.key} />
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginatedRows.length > 0 ? (
                                        paginatedRows.map((row, index) => (
                                            <tr
                                                key={`${row.jobcard}-${index}`}
                                                className={`border-b border-slate-200 transition hover:bg-orange-50 ${
                                                    index % 2 === 0
                                                        ? "bg-white"
                                                        : "bg-slate-50"
                                                }`}
                                            >
                                                <td className="px-4 py-3 text-center text-slate-500">
                                                    {startIndex + index + 1}
                                                </td>

                                                {columns.map((column) => {
                                                    const value = row[column.key];

                                                    return (
                                                        <td
                                                            key={column.key}
                                                            className={`whitespace-nowrap px-4 py-3 ${
                                                                column.key === "jobcard"
                                                                    ? "font-semibold text-orange-700"
                                                                    : "text-slate-700"
                                                            }`}
                                                        >
                                                            {value === null ||
                                                            value === undefined ||
                                                            value === ""
                                                                ? "-"
                                                                : String(value).slice(0, 100)}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={columns.length + 1}
                                                className="px-4 py-12 text-center"
                                            >
                                                <MdSearch
                                                    size={38}
                                                    className="mx-auto mb-2 text-slate-300"
                                                />

                                                <p className="font-semibold text-slate-600">
                                                    No records found
                                                </p>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    Try changing your search or filters.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="flex flex-col gap-4 border-t border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">

                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                <span>Rows per page:</span>

                                <select
                                    value={pageSize}
                                    onChange={(event) => {
                                        setPageSize(Number(event.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-orange-400"
                                >
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>

                                <span className="ml-2">
                                    {totalRows === 0
                                        ? "0 records"
                                        : `${startIndex + 1}-${endIndex} of ${totalRows}`}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">

                                <button
                                    type="button"
                                    disabled={safeCurrentPage <= 1}
                                    onClick={() => setCurrentPage(1)}
                                    title="First Page"
                                    className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <MdFirstPage size={21} />
                                </button>

                                <button
                                    type="button"
                                    disabled={safeCurrentPage <= 1}
                                    onClick={() =>
                                        setCurrentPage((page) => page - 1)
                                    }
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <span className="whitespace-nowrap px-2 text-sm font-semibold text-slate-700">
                                    Page {safeCurrentPage} of {totalPages}
                                </span>

                                <button
                                    type="button"
                                    disabled={safeCurrentPage >= totalPages}
                                    onClick={() =>
                                        setCurrentPage((page) => page + 1)
                                    }
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>

                                <button
                                    type="button"
                                    disabled={safeCurrentPage >= totalPages}
                                    onClick={() =>
                                        setCurrentPage(totalPages)
                                    }
                                    title="Last Page"
                                    className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <MdLastPage size={21} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* IMPORTANT NOTE */}
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <strong>Important:</strong>{" "}
                    Excel upload se pehle ensure karein ki file ke
                    column headings aur data sahi hain. Backend fixed
                    Excel column positions use karta hai. Grid mein
                    latest uploaded Excel ki rows dikhengi.
                </div>

            </div>
        </div>
    );
};

export default ProductionUpload;