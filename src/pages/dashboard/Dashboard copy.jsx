
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  MdRefresh,
  MdInventory2,
  MdCheckCircle,
  MdPendingActions,
  MdContentCut,
  MdLayers,
  MdArrowForward,
  MdSearch,
  MdAssignment,
  MdTrendingUp,
  MdCalendarMonth,
  MdFactory,
  MdDashboard,
  MdOutlineAssessment,
  MdShoppingBag,
  MdFilterList,
  MdKeyboardArrowRight,
} from "react-icons/md";

import {
  API_URL,
  getRowsFromResponse,
  getValue,
  numberValue,
  formatNumber,
  dateKey,
  getStageStatus,
} from "./ProductionReportUtils";

// ==========================================
// MOSACH ORANGE THEME
// ==========================================

const THEME = {
  orange: "#FF7A1A",
  orangeDark: "#E9680B",
  orangeLight: "#FFF1E6",
  teal: "#0A4B57",
  background: "#F7F8FA",
};

// ==========================================
// SECTION HEADING
// ==========================================

const SectionHeading = ({ title, subtitle, badge }) => (
  <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-base font-medium tracking-tight text-slate-700 sm:text-lg">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-sm font-normal text-slate-500">
          {subtitle}
        </p>
      )}
    </div>

    {badge && (
      <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-normal text-orange-700">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A1A]" />
        {badge}
      </span>
    )}
  </div>
);

// ==========================================
// SUMMARY CARD
// ==========================================

const SummaryCard = ({
  title,
  value,
  note,
  icon: Icon,
  accent = "orange",
}) => {
  const accents = {
    orange: "bg-orange-50 text-[#FF7A1A]",
    teal: "bg-slate-100 text-[#0A4B57]",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-600",
  };

  const numberColors = {
    orange: "text-[#E9680B]",
    teal: "text-[#0A4B57]",
    green: "text-emerald-700",
    red: "text-rose-600",
  };

  const borderColors = {
    orange: "before:bg-[#FF7A1A]",
    teal: "before:bg-[#0A4B57]",
    green: "before:bg-emerald-500",
    red: "before:bg-rose-500",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 transition-colors duration-200 before:absolute before:left-0 before:top-0 before:h-[3px] before:w-full ${borderColors[accent] || borderColors.orange} hover:border-orange-200`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-normal text-slate-500">
            {title}
          </p>

          <h3
            className={`mt-3 text-2xl font-medium tracking-tight sm:text-3xl ${numberColors[accent] || numberColors.orange
              }`}
          >
            {formatNumber(value)}
          </h3>

          {note && (
            <p className="mt-2 text-xs font-normal leading-5 text-slate-400">
              {note}
            </p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accents[accent] || accents.orange
            }`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// REPORT CARD
// ==========================================

const ReportCard = ({
  title,
  desc,
  value,
  unit,
  icon: Icon,
  accent = "orange",
  path,
  onClick,
}) => {
  const accents = {
    orange: "bg-orange-50 text-[#FF7A1A]",
    teal: "bg-slate-100 text-[#0A4B57]",
  };

  const valueColors = {
    orange: "text-[#E9680B]",
    teal: "text-[#0A4B57]",
  };

  return (
    <button
      type="button"
      onClick={() => onClick(path)}
      className="group relative w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 text-left transition-colors duration-200 before:absolute before:left-0 before:top-0 before:h-[3px] before:w-0 before:bg-[#FF7A1A] before:transition-all before:duration-200 hover:border-orange-200 hover:bg-orange-50/20 hover:before:w-full"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors group-hover:bg-orange-100 group-hover:text-[#E9680B] ${accents[accent] || accents.orange
            }`}
        >
          <Icon size={21} />
        </div>

        <MdArrowForward
          size={19}
          className="text-slate-300 transition-colors group-hover:text-[#FF7A1A]"
        />
      </div>

      <h3 className="mt-4 text-sm font-medium text-slate-700 transition-colors group-hover:text-[#C95C0A]">
        {title}
      </h3>

      <p className="mt-1 min-h-10 text-sm font-normal leading-5 text-slate-500">
        {desc}
      </p>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p
          className={`text-xl font-medium ${valueColors[accent] || valueColors.orange
            }`}
        >
          {formatNumber(value)}
        </p>

        <p className="mt-1 text-xs font-normal text-slate-400">
          {unit}
        </p>
      </div>
    </button>
  );
};

// ==========================================
// STATUS BADGE
// ==========================================

const StatusBadge = ({ value, type }) => {
  const completed = type === "completed";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-normal ${completed
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-orange-100 bg-orange-50 text-orange-700"
        }`}
    >
      {completed ? (
        <MdCheckCircle size={14} />
      ) : (
        <MdPendingActions size={14} />
      )}

      {formatNumber(value)}
    </span>
  );
};

// ==========================================
// MAIN DASHBOARD
// ==========================================

const Dashboard = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [range, setRange] = useState("month");
  const [search, setSearch] = useState("");

  // ========================================
  // LOAD PRODUCTION DATA
  // ========================================

  const loadData = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const result = getRowsFromResponse(data);

      setRows(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(
        err.message || "Production data load nahi ho paya."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ========================================
  // FILTER DATA
  // ========================================

  const filteredRows = useMemo(() => {
    const now = new Date();
    const today = dateKey(now);

    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    const yesterday = dateKey(yesterdayDate);
    const month = today.slice(0, 7);

    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 6);

    const weekStart = dateKey(cutoff);
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      const date = dateKey(getValue(row, "reportdate"));

      if (range === "today" && date !== today) {
        return false;
      }

      if (range === "yesterday" && date !== yesterday) {
        return false;
      }

      if (
        range === "week" &&
        (!date || date < weekStart || date > today)
      ) {
        return false;
      }

      if (
        range === "month" &&
        (!date || !date.startsWith(month))
      ) {
        return false;
      }

      if (
        query &&
        !["jobcard", "sku", "article", "color", "size"].some(
          (key) =>
            String(getValue(row, key) ?? "")
              .toLowerCase()
              .includes(query)
        )
      ) {
        return false;
      }

      return true;
    });
  }, [rows, range, search]);

  // ========================================
  // PRODUCTION STATISTICS
  // ========================================

  const stats = useMemo(() => {
    const sum = (key) =>
      filteredRows.reduce(
        (total, row) =>
          total + numberValue(getValue(row, key)),
        0
      );

    const countStatus = (stage, status) =>
      filteredRows.filter(
        (row) => getStageStatus(row, stage) === status
      ).length;

    const jobCards = new Set(
      filteredRows
        .map((row) =>
          String(getValue(row, "jobcard") || "").trim()
        )
        .filter(Boolean)
    );

    return {
      records: filteredRows.length,
      jobCards: jobCards.size,
      pairs: sum("pair"),
      cutting: sum("cuttingpairqty"),
      upper: sum("upperpairqty"),
      store: sum("upperstorepairqty"),

      cuttingCompleted: countStatus("cutting", "Completed"),
      cuttingPending: countStatus("cutting", "Pending"),

      upperCompleted: countStatus("upper", "Completed"),
      upperPending: countStatus("upper", "Pending"),

      storeCompleted: countStatus("store", "Completed"),
      storePending: countStatus("store", "Pending"),
    };
  }, [filteredRows]);

  // ========================================
  // JOB CARD SUMMARY
  // ========================================

  const jobSummary = useMemo(() => {
    const groups = new Map();

    filteredRows.forEach((row) => {
      const job = String(
        getValue(row, "jobcard") || "No Job Card"
      );

      if (!groups.has(job)) {
        groups.set(job, {
          jobcard: job,
          records: 0,
          pairs: 0,
          cutting: 0,
          upper: 0,
          store: 0,
          completed: 0,
          pending: 0,
        });
      }

      const item = groups.get(job);

      item.records += 1;
      item.pairs += numberValue(getValue(row, "pair"));
      item.cutting += numberValue(
        getValue(row, "cuttingpairqty")
      );
      item.upper += numberValue(
        getValue(row, "upperpairqty")
      );
      item.store += numberValue(
        getValue(row, "upperstorepairqty")
      );

      const status = getStageStatus(row, "store");

      if (status === "Completed") {
        item.completed += 1;
      } else if (status === "Pending") {
        item.pending += 1;
      }
    });

    return [...groups.values()]
      .sort((a, b) => b.pairs - a.pairs)
      .slice(0, 8);
  }, [filteredRows]);

  // ========================================
  // REPORT CARDS
  // ========================================

  const detailSections = [
    {
      title: "Job Card Summary",
      desc: "Job Card-wise production and status analysis.",
      path: "/job-card-report",
      icon: MdAssignment,
      value: stats.jobCards,
      unit: "Job Cards",
      accent: "teal",
    },
    {
      title: "Cutting Summary",
      desc: "Cutting quantities and pending production work.",
      path: "/cutting-report",
      icon: MdContentCut,
      value: stats.cutting,
      unit: "Cutting Pairs",
      accent: "orange",
    },
    {
      title: "Upper Summary",
      desc: "Upper production quantities and completion status.",
      path: "/upper-report",
      icon: MdLayers,
      value: stats.upper,
      unit: "Upper Pairs",
      accent: "teal",
    },
    {
      title: "Article Production",
      desc: "Article, colour, size and SKU-wise production details.",
      path: "/article-production-report",
      icon: MdInventory2,
      value: stats.records,
      unit: "Records",
      accent: "orange",
    },
  ];

  // ========================================
  // RENDER
  // ========================================

  return (
    <main
      className="min-h-screen p-3 sm:p-5 lg:p-7"
      style={{ backgroundColor: THEME.background }}
    >
      <div className="mx-auto max-w-[1800px]">

        {/* HEADER */}

        <header className="relative mb-5 overflow-hidden rounded-xl border border-teal-700/30 bg-gradient-to-r from-[#123F43] to-[#1B6868] px-4 py-4 shadow-md sm:px-5 sm:py-5">

          {/* Subtle Background Accent */}

          <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-orange-400/10 blur-2xl" />
          <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#FF7A1A]" />

          <div className="relative z-10">

            
            {/* Breadcrumb */}
            <div className="mb-3 flex items-center gap-2 text-[11px] font-medium sm:mb-3.5 sm:text-xs">
              <MdDashboard size={15} className="shrink-0 text-orange-400" />
              <span className="text-teal-100">MOSACH ERP</span>
              <span className="text-teal-300/60">/</span>
              <span className="font-semibold text-orange-300">Production</span>
            </div>

            {/* Title + Button */}
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-300/20 bg-orange-400/15 sm:h-11 sm:w-11">
                  <MdFactory size={23} className="text-orange-300" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-lg font-bold leading-tight tracking-tight text-white sm:text-xl md:text-2xl">
                    Production Dashboard
                  </h1>

                  <p className="mt-1 text-xs leading-5 text-teal-100/75 sm:text-sm">
                    Job Cards, Cutting, Upper aur Upper Store production overview.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#FF7A1A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E9680B] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <MdRefresh
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh Data"}
              </button>

            </div>

            {/* Compact Stats */}
            <div className="mt-4 flex flex-wrap gap-2">

              <div className="inline-flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2">
                <MdFactory size={17} className="shrink-0 text-orange-300" />
                <span className="text-xs font-medium text-teal-50">
                  Production Overview
                </span>
              </div>

              <div className="inline-flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-3 py-2">
                <MdTrendingUp size={17} className="shrink-0 text-orange-300" />
                <span className="text-xs w-full font-medium text-teal-50">
                  Records:
                  <strong className="ml-1 font-bold text-orange-300">
                    {formatNumber(stats.records)}
                  </strong>
                </span>
              </div>

            </div>


          </div>
        </header>


        {/* FILTER BAR */}

        <section className="mb-7 rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF7A1A]">
                <MdFilterList size={22} />
              </span>

              <div>
                <h2 className="text-sm font-medium text-slate-700">
                  Dashboard Filters
                </h2>

                <p className="mt-1 text-xs font-normal text-slate-500">
                  Date range select karein ya records search karein.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <MdCalendarMonth
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF7A1A]"
                  size={19}
                />

                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm font-normal text-slate-600 outline-none transition focus:border-[#FF7A1A] focus:ring-2 focus:ring-orange-100 sm:w-44"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">This Month</option>
                  <option value="all">All Records</option>
                </select>
              </div>

              <div className="relative">
                <MdSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF7A1A]"
                  size={20}
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Job Card, SKU, Article..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-normal text-slate-600 outline-none transition placeholder:text-slate-400 focus:border-[#FF7A1A] focus:ring-2 focus:ring-orange-100 sm:w-80"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-rose-200 bg-white p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-medium">
                Unable to load production data:
              </span>{" "}
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadData()}
              className="rounded-lg border border-rose-200 px-4 py-2 font-normal transition hover:bg-rose-50"
            >
              Try Again
            </button>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-16 text-center">
            <MdRefresh
              size={34}
              className="mx-auto animate-spin text-[#FF7A1A]"
            />

            <p className="mt-4 text-sm font-normal text-slate-500">
              Loading production dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* PRODUCTION OVERVIEW */}

            <section className="mb-8">
              <SectionHeading
                title="Production Overview"
                subtitle="Key production indicators at a glance."
                badge={`${formatNumber(stats.records)} Records`}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  title="Total Job Cards"
                  value={stats.jobCards}
                  note="Unique Job Cards"
                  icon={MdAssignment}
                  accent="teal"
                />

                <SummaryCard
                  title="Total Production Pairs"
                  value={stats.pairs}
                  note="Total pair quantity"
                  icon={MdInventory2}
                  accent="orange"
                />

                <SummaryCard
                  title="Upper Store Completed"
                  value={stats.storeCompleted}
                  note="Completed records"
                  icon={MdCheckCircle}
                  accent="green"
                />

                <SummaryCard
                  title="Upper Store Pending"
                  value={stats.storePending}
                  note="Pending records"
                  icon={MdPendingActions}
                  accent="red"
                />
              </div>
            </section>

            {/* STAGE-WISE PRODUCTION */}

            <section className="mb-8">
              <SectionHeading
                title="Stage-wise Production"
                subtitle="Production quantities and workflow progress."
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SummaryCard
                  title="Cutting Pair Qty"
                  value={stats.cutting}
                  note={`${stats.cuttingCompleted} completed · ${stats.cuttingPending} pending records`}
                  icon={MdContentCut}
                  accent="orange"
                />

                <SummaryCard
                  title="Upper Pair Qty"
                  value={stats.upper}
                  note={`${stats.upperCompleted} completed · ${stats.upperPending} pending records`}
                  icon={MdLayers}
                  accent="teal"
                />

                <SummaryCard
                  title="Upper Store Pair Qty"
                  value={stats.store}
                  note="Quantity received in Upper Store"
                  icon={MdShoppingBag}
                  accent="green"
                />
              </div>
            </section>

            {/* DETAILED REPORTS */}

            <section className="mb-8">
              <SectionHeading
                title="Detailed Reports"
                subtitle="Open a report to explore production details and quantities."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {detailSections.map((item) => (
                  <ReportCard
                    key={item.path}
                    {...item}
                    onClick={navigate}
                  />
                ))}
              </div>
            </section>

            {/* JOB CARD TABLE */}

            <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF7A1A]">
                    <MdOutlineAssessment size={22} />
                  </span>

                  <div>
                    <h2 className="text-base font-medium text-slate-700 sm:text-lg">
                      Job Card-wise Summary
                    </h2>

                    <p className="mt-1 text-sm font-normal text-slate-500">
                      Top 8 Job Cards by total pair quantity.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/job-card-report")}
                  className="inline-flex items-center justify-center gap-1.5 self-start rounded-lg border border-orange-200 bg-white px-3.5 py-2.5 text-sm font-normal text-[#D85F08] transition-colors hover:bg-orange-50 sm:self-center"
                >
                  View Full Report
                  <MdKeyboardArrowRight size={19} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-orange-50/70 text-xs text-slate-600">
                    <tr>
                      {[
                        "Job Card",
                        "Records",
                        "Total Pairs",
                        "Cutting Pairs",
                        "Upper Pairs",
                        "Upper Store Pairs",
                        "Completed",
                        "Pending",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="whitespace-nowrap border-b border-orange-100 px-4 py-3.5 font-medium"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {jobSummary.map((item, index) => (
                      <tr
                        key={item.jobcard}
                        className="transition-colors hover:bg-orange-50/40"
                      >
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-xs font-normal text-[#E9680B]">
                              {index + 1}
                            </span>

                            <span className="font-medium text-[#0A4B57]">
                              {item.jobcard}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 font-normal text-slate-600">
                          {formatNumber(item.records)}
                        </td>

                        <td className="px-4 py-4 font-medium text-[#E9680B]">
                          {formatNumber(item.pairs)}
                        </td>

                        <td className="px-4 py-4 font-normal text-slate-600">
                          {formatNumber(item.cutting)}
                        </td>

                        <td className="px-4 py-4 font-normal text-slate-600">
                          {formatNumber(item.upper)}
                        </td>

                        <td className="px-4 py-4 font-normal text-slate-600">
                          {formatNumber(item.store)}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge
                            value={item.completed}
                            type="completed"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge
                            value={item.pending}
                            type="pending"
                          />
                        </td>
                      </tr>
                    ))}

                    {!jobSummary.length && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-14 text-center"
                        >
                          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-[#FF7A1A]">
                            <MdSearch size={23} />
                          </div>

                          <p className="mt-3 text-sm font-medium text-slate-600">
                            No production records found
                          </p>

                          <p className="mt-1 text-sm font-normal text-slate-400">
                            Try changing the date filter or search text.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 text-xs font-normal text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {jobSummary.length} of top 8 Job Card groups.
                </span>

                <span>MOSACH Production Dashboard</span>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default Dashboard;

