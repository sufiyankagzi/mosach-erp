import { useState } from "react";
import axios from "axios";

import {
MdCloudUpload,
MdDescription,
MdCheckCircle,
MdError
} from "react-icons/md";

const API_URL =
"https://mosach-erp-server.onrender.com/api/production-report";

const ProductionUpload = () => {
const [file, setFile] = useState(null);
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [result, setResult] = useState(null);
const [error, setError] = useState("");


const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setFile(null);
    setMessage("");
    setResult(null);
    setError("");

    if (!selectedFile) return;

    if (!/\.(xlsx|xls)$/i.test(selectedFile.name)) {
        setError("Please select a valid Excel file (.xlsx or .xls).");
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

const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
        setError("Please select an Excel file first.");
        return;
    }

    setLoading(true);
    setMessage("");
    setResult(null);
    setError("");

    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
            `${API_URL}/upload`,
            formData
        );

        setMessage(
            response.data.message ||
            "Excel uploaded successfully."
        );

        setResult(response.data.data);
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
        title: "Skipped Rows",
        value: result?.skippedRows ?? 0,
        cardClass: "bg-amber-50",
        titleClass: "text-amber-700",
        valueClass: "text-amber-800"
    }
];

return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-5xl">

            {/* PAGE HEADER */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Production Excel Upload
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Upload your production Excel file to import
                    records into MOSACH ERP.
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
                                    const input = document.getElementById(
                                        "productionExcel"
                                    );

                                    if (input) input.value = "";
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
                            <MdError size={20} className="shrink-0" />
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
                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

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

            {/* IMPORTANT NOTE */}
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <strong>Important:</strong>{" "}
                Excel upload se pehle ensure karein ki file ke column
                headings aur data sahi hain. Backend abhi fixed Excel
                column positions use karta hai.
            </div>

        </div>
    </div>
);
};

export default ProductionUpload;
