import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    MdRefresh,
    MdInventory2,
    MdCheckCircle,
    MdPendingActions,
    MdTrendingUp,
    MdSearch,
    MdArrowForward,
    MdCalendarMonth,
} from "react-icons/md";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

import { useNavigate } from "react-router-dom";

const API_URL =
    "https://mosach-erp-server.onrender.com/api/production-report";

const GREEN = "#16A34A";
const RED = "#DC2626";
const BLUE = "#2563EB";

const getValue = (row, key) => {
    if (row?.[key] !== undefined) return row[key];

    const foundKey = Object.keys(row || {}).find(
        (item) => item.toLowerCase() === key.toLowerCase()
    );

    return foundKey ? row[foundKey] : "";
};

const getStatus = (value) => {
    const status = String(value ?? "").trim().toLowerCase();

    if (["1", "true", "completed", "complete"].includes(status)) {
        return "Completed";
    }

    if (["0", "false", "pending"].includes(status)) {
        return "Pending";
    }

    return "Unknown";
};

const getDateKey = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    });

const Dashboard = () => {
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [dateRange, setDateRange] = useState("month");
    const [search, setSearch] = useState("");

    const fetchData = useCallback(async (refresh = false) => {
        try {
            refresh ? setRefreshing(true) : setLoading(true);
            setError("");

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();

            const rows = Array.isArray(result)
                ? result
                : Array.isArray(result.data)
                  ? result.data
                  : Array.isArray(result.records)
                    ? result.records
                    : [];

            setData(rows);
        } catch (err) {
            console.error("Dashboard API error:", err);
            setError(
                err.message ||
                    "Production data load nahi ho paya."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredData = useMemo(() => {
        const now = new Date();

        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        if (dateRange === "yesterday") {
            start.setDate(start.getDate() - 1);
        } else if (dateRange === "week") {
            start.setDate(start.getDate() - 6);
        } else if (dateRange === "month") {
            start.setDate(1);
        }

        const end = new Date(now);
        end.setHours(23, 59, 59, 999);

        if (dateRange === "yesterday") {
            end.setTime(start.getTime());
            end.setHours(23, 59, 59, 999);
        }

        return data.filter((row) => {
            const rawDate = getValue(row, "reportdate");
            const date = rawDate ? new Date(rawDate) : null;

            if (dateRange !== "all") {
                if (!date || Number.isNaN(date.getTime())) return false;

                if (dateRange === "yesterday") {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);

                    if (getDateKey(date) !== getDateKey(yesterday)) {
                        return false;
                    }
                } else if (date < start || date > end) {
                    return false;
                }
            }

            if (search.trim()) {
                const query = search.trim().toLowerCase();

                const searchable = [
                    getValue(row, "jobcard"),
                    getValue(row, "sku"),
                    getValue(row, "article"),
                    getValue(row, "color"),
                    getStatus(getValue(row, "upperstorestatus")),
                ]
                    .join(" ")
                    .toLowerCase();

                if (!searchable.includes(query)) return false;
            }

            return true;
        });
    }, [data, dateRange, search]);

    const stats = useMemo(() => {
        const completed = filteredData.filter(
            (row) =>
                getStatus(getValue(row, "upperstorestatus")) ===
                "Completed"
        ).length;

        const pending = filteredData.filter(
            (row) =>
                getStatus(getValue(row, "upperstorestatus")) ===
                "Pending"
        ).length;

        const totalPairs = filteredData.reduce(
            (sum, row) => sum + (Number(getValue(row, "pair")) || 0),
            0
        );

        const cuttingPairs = filteredData.reduce(
            (sum, row) =>
                sum + (Number(getValue(row, "cuttingpairqty")) || 0),
            0
        );

        const upperPairs = filteredData.reduce(
            (sum, row) =>
                sum + (Number(getValue(row, "upperpairqty")) || 0),
            0
        );

        const upperStorePairs = filteredData.reduce(
            (sum, row) =>
                sum +
                (Number(getValue(row, "upperstorepairqty")) || 0),
            0
        );

        const jobCards = new Set(
            filteredData
                .map((row) => getValue(row, "jobcard"))
                .filter((value) => value !== "" && value != null)
                .map(String)
        );

        return {
            total: filteredData.length,
            completed,
            pending,
            totalPairs,
            cuttingPairs,
            upperPairs,
            upperStorePairs,
            jobCards: jobCards.size,
            completion:
                filteredData.length > 0
                    ? Math.round(
                          (completed / filteredData.length) * 100
                      )
                    : 0,
        };
    }, [filteredData]);

    const statusChart = [
        { name: "Completed", value: stats.completed, color: GREEN },
        { name: "Pending", value: stats.pending, color: RED },
    ].filter((item) => item.value > 0);

    const dailyChart = useMemo(() => {
        const groups = {};

        filteredData.forEach((row) => {
            const dateKey = getDateKey(getValue(row, "reportdate"));

            if (!dateKey) return;

            if (!groups[dateKey]) {
                groups[dateKey] = {
                    date: dateKey,
                    pairs: 0,
                    records: 0,
                };
            }

            groups[dateKey].pairs +=
                Number(getValue(row, "pair")) || 0;

            groups[dateKey].records += 1;
        });

        return Object.values(groups)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-14)
            .map((item) => ({
                ...item,
                label: new Date(
                    `${item.date}T00:00:00`
                ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                }),
            }));
    }, [filteredData]);

    const jobCardChart = useMemo(() => {
        const groups = {};

        filteredData.forEach((row) => {
            const jobCard =
                getValue(row, "jobcard") || "No Job Card";

            if (!groups[jobCard]) {
                groups[jobCard] = {
                    jobCard: String(jobCard),
                    pairs: 0,
                    completed: 0,
                    pending: 0,
                };
            }

            groups[jobCard].pairs +=
                Number(getValue(row, "pair")) || 0;

            const status = getStatus(
                getValue(row, "upperstorestatus")
            );

            if (status === "Completed") {
                groups[jobCard].completed += 1;
            } else if (status === "Pending") {
                groups[jobCard].pending += 1;
            }
        });

        return Object.values(groups)
            .sort((a, b) => b.pairs - a.pairs)
            .slice(0, 8);
    }, [filteredData]);

    const recentRecords = useMemo(() => {
        return [...filteredData]
            .sort((a, b) => {
                const dateA = new Date(
                    getValue(a, "reportdate") || 0
                ).getTime();

                const dateB = new Date(
                    getValue(b, "reportdate") || 0
                ).getTime();

                return dateB - dateA;
            })
            .slice(0, 8);
    }, [filteredData]);

    const cardData = [
        {
            title: "Total Records",
            value: stats.total,
            icon: MdInventory2,
            color: "blue",
            description: "Production entries",
        },
        {
            title: "Total Pairs",
            value: stats.totalPairs,
            icon: MdTrendingUp,
            color: "purple",
            description: "Total pair quantity",
        },
        {
            title: "Completed",
            value: stats.completed,
            icon: MdCheckCircle,
            color: "green",
            description: "Upper store completed",
        },
        {
            title: "Pending",
            value: stats.pending,
            icon: MdPendingActions,
            color: "red",
            description: "Awaiting completion",
        },
    ];

    const cardColors = {
        blue: "bg-blue-50 text-blue-700",
        purple: "bg-purple-50 text-purple-700",
        green: "bg-green-50 text-green-700",
        red: "bg-red-50 text-red-700",
    };

    return (
        <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
            <div className="mx-auto max-w-[1800px]">
                {/* Header */}
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-blue-700">
                            MOSACH ERP
                        </p>

                        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                            Welcome to MOSACH ERP
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Confidence Begins With MOSACH
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => fetchData(true)}
                            disabled={refreshing}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                        >
                            <MdRefresh
                                size={20}
                                className={
                                    refreshing ? "animate-spin" : ""
                                }
                            />
                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/production-report")
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                        >
                            Full Production Report
                            <MdArrowForward size={18} />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                        <MdCalendarMonth size={22} />
                        Dashboard Filters
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <select
                            value={dateRange}
                            onChange={(event) =>
                                setDateRange(event.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">This Month</option>
                            <option value="all">All Records</option>
                        </select>

                        <div className="relative">
                            <MdSearch
                                size={20}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search Job Card, SKU..."
                                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 sm:w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <p className="font-semibold">
                            Production data load nahi ho paya.
                        </p>
                        <p className="mt-1">{error}</p>
                        <button
                            type="button"
                            onClick={() => fetchData()}
                            className="mt-2 font-semibold underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex min-h-64 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
                            <p className="mt-3 text-sm text-slate-500">
                                Loading dashboard...
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {cardData.map((card) => {
                                const Icon = card.icon;

                                return (
                                    <div
                                        key={card.title}
                                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">
                                                    {card.title}
                                                </p>

                                                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                                                    {formatNumber(
                                                        card.value
                                                    )}
                                                </h2>

                                                <p className="mt-2 text-xs text-slate-500">
                                                    {card.description}
                                                </p>
                                            </div>

                                            <div
                                                className={`rounded-xl p-3 ${cardColors[card.color]}`}
                                            >
                                                <Icon size={27} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quantity Summary */}
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {[
                                {
                                    title: "Cutting Pair Qty",
                                    value: stats.cuttingPairs,
                                    color: "text-orange-700",
                                },
                                {
                                    title: "Upper Pair Qty",
                                    value: stats.upperPairs,
                                    color: "text-indigo-700",
                                },
                                {
                                    title: "Upper Store Pair Qty",
                                    value: stats.upperStorePairs,
                                    color: "text-teal-700",
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                    <p className="text-sm text-slate-500">
                                        {item.title}
                                    </p>
                                    <p
                                        className={`mt-2 text-2xl font-bold ${item.color}`}
                                    >
                                        {formatNumber(item.value)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Completion Progress */}
                        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-bold text-slate-800">
                                        Production Completion
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Based on record status
                                    </p>
                                </div>

                                <span className="text-2xl font-bold text-green-700">
                                    {stats.completion}%
                                </span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-green-600 transition-all duration-500"
                                    style={{
                                        width: `${stats.completion}%`,
                                    }}
                                />
                            </div>

                            <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
                                <span className="font-medium text-green-700">
                                    Completed: {stats.completed}
                                </span>

                                <span className="font-medium text-red-700">
                                    Pending: {stats.pending}
                                </span>

                                <span className="text-slate-500">
                                    Job Cards: {stats.jobCards}
                                </span>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2 sm:p-5">
                                <div className="mb-5">
                                    <h2 className="font-bold text-slate-800">
                                        Daily Production
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Pair quantity by report date
                                    </p>
                                </div>

                                <div className="h-[300px]">
                                    {dailyChart.length ? (
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={dailyChart}
                                                margin={{
                                                    top: 5,
                                                    right: 10,
                                                    left: 0,
                                                    bottom: 5,
                                                }}
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                />

                                                <XAxis
                                                    dataKey="label"
                                                    tick={{
                                                        fontSize: 12,
                                                    }}
                                                />

                                                <YAxis
                                                    tick={{
                                                        fontSize: 12,
                                                    }}
                                                />

                                                <Tooltip />

                                                <Bar
                                                    dataKey="pairs"
                                                    name="Pairs"
                                                    fill={BLUE}
                                                    radius={[
                                                        5,
                                                        5,
                                                        0,
                                                        0,
                                                    ]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                            No production data for this period
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                <div className="mb-2">
                                    <h2 className="font-bold text-slate-800">
                                        Production Status
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Completed vs Pending records
                                    </p>
                                </div>

                                <div className="h-[300px]">
                                    {statusChart.length ? (
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={statusChart}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="45%"
                                                    innerRadius={65}
                                                    outerRadius={95}
                                                    paddingAngle={4}
                                                    label
                                                >
                                                    {statusChart.map(
                                                        (entry) => (
                                                            <Cell
                                                                key={entry.name}
                                                                fill={entry.color}
                                                            />
                                                        )
                                                    )}
                                                </Pie>

                                                <Tooltip />

                                                <Legend
                                                    verticalAlign="bottom"
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                            No status data available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Job Card Chart */}
                        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-5">
                                <h2 className="font-bold text-slate-800">
                                    Job Card-wise Production
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Top 8 Job Cards by pair quantity
                                </p>
                            </div>

                            <div className="h-[320px]">
                                {jobCardChart.length ? (
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={jobCardChart}
                                            margin={{
                                                top: 5,
                                                right: 15,
                                                left: 0,
                                                bottom: 25,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                            />

                                            <XAxis
                                                dataKey="jobCard"
                                                interval={0}
                                                angle={-20}
                                                textAnchor="end"
                                                tick={{
                                                    fontSize: 11,
                                                }}
                                            />

                                            <YAxis />

                                            <Tooltip />

                                            <Legend />

                                            <Bar
                                                dataKey="pairs"
                                                name="Pairs"
                                                fill={BLUE}
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                        No Job Card data available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Records */}
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
                                <div>
                                    <h2 className="font-bold text-slate-800">
                                        Recent Production Records
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Latest production entries
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/production-report")
                                    }
                                    className="inline-flex items-center gap-1 self-start text-sm font-semibold text-blue-700 hover:text-blue-900 sm:self-auto"
                                >
                                    View Full Report
                                    <MdArrowForward size={18} />
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[750px] text-left text-sm">
                                    <thead className="bg-slate-100">
                                        <tr>
                                            {[
                                                "Report Date",
                                                "Job Card",
                                                "SKU",
                                                "Article",
                                                "Pair",
                                                "Upper Store Qty",
                                                "Status",
                                            ].map((heading) => (
                                                <th
                                                    key={heading}
                                                    className="whitespace-nowrap px-4 py-3 font-semibold text-slate-600"
                                                >
                                                    {heading}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {recentRecords.map(
                                            (row, index) => {
                                                const status = getStatus(
                                                    getValue(
                                                        row,
                                                        "upperstorestatus"
                                                    )
                                                );

                                                return (
                                                    <tr
                                                        key={
                                                            row.id ??
                                                            `${getValue(row, "jobcard")}-${index}`
                                                        }
                                                        className="border-t border-slate-100 hover:bg-slate-50"
                                                    >
                                                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                                            {formatDate(
                                                                getValue(
                                                                    row,
                                                                    "reportdate"
                                                                )
                                                            )}
                                                        </td>

                                                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-orange-700">
                                                            {getValue(
                                                                row,
                                                                "jobcard"
                                                            ) || "-"}
                                                        </td>

                                                        <td className="whitespace-nowrap px-4 py-3">
                                                            {getValue(
                                                                row,
                                                                "sku"
                                                            ) || "-"}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {getValue(
                                                                row,
                                                                "article"
                                                            ) || "-"}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {formatNumber(
                                                                getValue(
                                                                    row,
                                                                    "pair"
                                                                )
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            {formatNumber(
                                                                getValue(
                                                                    row,
                                                                    "upperstorepairqty"
                                                                )
                                                            )}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <span
                                                                className="inline-block rounded-md px-3 py-1 font-bold"
                                                                style={{
                                                                    backgroundColor:
                                                                        status ===
                                                                        "Completed"
                                                                            ? "#DCFCE7"
                                                                            : status ===
                                                                                "Pending"
                                                                              ? "#FEE2E2"
                                                                              : "#F1F5F9",
                                                                    color:
                                                                        status ===
                                                                        "Completed"
                                                                            ? "#166534"
                                                                            : status ===
                                                                                "Pending"
                                                                              ? "#991B1B"
                                                                              : "#475569",
                                                                }}
                                                            >
                                                                {status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}

                                        {recentRecords.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-4 py-10 text-center text-slate-500"
                                                >
                                                    No production records found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

