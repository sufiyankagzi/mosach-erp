import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdRefresh, MdDownload, MdSearch, MdFilterAlt } from "react-icons/md";
import { API_URL, getRowsFromResponse, getValue, numberValue, formatNumber, formatDate, dateKey, getStageStatus, uniqueValues, exportCsv } from "./ProductionReportUtils";

const CONFIG = {
  jobcard: { title: "Job Card Report", subtitle: "Job Card, Article, Colour and Size-wise production summary", stage: "store", quantityKey: "pair", quantityLabel: "Total Pairs" },
  cutting: { title: "Cutting Report", subtitle: "Cutting issued/processed quantity with completed and pending status", stage: "cutting", quantityKey: "cuttingpairqty", quantityLabel: "Cutting Pairs" },
  upper: { title: "Upper Report", subtitle: "Upper production quantity with completed and pending status", stage: "upper", quantityKey: "upperpairqty", quantityLabel: "Upper Pairs" },
  article: { title: "Article Production Report", subtitle: "Filter and analyse production by Article, Colour, Size and Job Card", stage: "store", quantityKey: "pair", quantityLabel: "Total Pairs" },
};

const Badge = ({ status }) => {
  const cls = status === "Completed" ? "bg-green-100 text-green-800" : status === "Pending" ? "bg-red-100 text-red-800" : status === "Partially Completed" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700";
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>{status}</span>;
};

const makeGroups = (rows) => {
  const map = new Map();
  rows.forEach((row) => {
    const values = {
      jobcard: String(getValue(row, "jobcard") || "-"), sku: String(getValue(row, "sku") || "-"),
      article: String(getValue(row, "article") || "-"), color: String(getValue(row, "color") || "-"),
      size: String(getValue(row, "size") || "-"),
    };
    const key = [values.jobcard, values.sku, values.article, values.color, values.size].join("¦");
    if (!map.has(key)) map.set(key, { ...values, records: 0, pair: 0, cuttingpairqty: 0, upperpairqty: 0, upperstorepairqty: 0, completed: 0, pending: 0, partial: 0, reportdate: getValue(row, "reportdate") });
    const item = map.get(key);
    item.records += 1;
    item.pair += numberValue(getValue(row, "pair"));
    item.cuttingpairqty += numberValue(getValue(row, "cuttingpairqty"));
    item.upperpairqty += numberValue(getValue(row, "upperpairqty"));
    item.upperstorepairqty += numberValue(getValue(row, "upperstorepairqty"));
    const status = getStageStatus(row, "store");
    if (status === "Completed") item.completed += 1;
    else if (status === "Pending") item.pending += 1;
    if (status === "Partially Completed") item.partial += 1;
  });
  return [...map.values()].sort((a, b) => String(a.jobcard).localeCompare(String(b.jobcard), undefined, { numeric: true }));
};

export default function ProductionDetailReport({ stage = "jobcard" }) {
  const config = CONFIG[stage] || CONFIG.jobcard;
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [jobcard, setJobcard] = useState("");
  const [article, setArticle] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      setRows(getRowsFromResponse(await response.json()));
    } catch (err) {
      setError(err.message || "Report load nahi ho paayi.");
      setRows([]);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => rows.filter((row) => {
    const text = ["jobcard", "sku", "article", "color", "size", "cuttingcontractor", "uppercontractor", "upperinsolecontractor"].map((key) => String(getValue(row, key) ?? "")).join(" ").toLowerCase();
    if (search.trim() && !text.includes(search.trim().toLowerCase())) return false;
    if (jobcard && !String(getValue(row, "jobcard") ?? "").toLowerCase().includes(jobcard.toLowerCase())) return false;
    if (article && String(getValue(row, "article") ?? "") !== article) return false;
    if (color && String(getValue(row, "color") ?? "") !== color) return false;
    if (size && String(getValue(row, "size") ?? "") !== size) return false;
    const date = dateKey(getValue(row, "reportdate"));
    if (fromDate && (!date || date < fromDate)) return false;
    if (toDate && (!date || date > toDate)) return false;
    if (statusFilter !== "all" && getStageStatus(row, config.stage) !== statusFilter) return false;
    return true;
  }), [rows, search, jobcard, article, color, size, fromDate, toDate, statusFilter, config.stage]);

  const displayRows = useMemo(() => stage === "jobcard" ? makeGroups(filtered) : filtered, [filtered, stage]);
  const qtyKey = config.quantityKey;
  const stats = useMemo(() => {
    const totalPairs = filtered.reduce((sum, row) => sum + numberValue(getValue(row, "pair")), 0);
    const quantity = filtered.reduce((sum, row) => sum + numberValue(getValue(row, qtyKey)), 0);
    const completed = filtered.filter((row) => getStageStatus(row, config.stage) === "Completed").length;
    const pending = filtered.filter((row) => getStageStatus(row, config.stage) === "Pending").length;
    const partial = filtered.filter((row) => getStageStatus(row, config.stage) === "Partially Completed").length;
    return { records: filtered.length, totalPairs, quantity, completed, pending, partial };
  }, [filtered, qtyKey, config.stage]);

  const reset = () => { setSearch(""); setJobcard(""); setArticle(""); setColor(""); setSize(""); setStatusFilter("all"); setFromDate(""); setToDate(""); };
  const exportRows = displayRows.map((row) => ({ ...row, reportdate: formatDate(getValue(row, "reportdate")) }));
  const columns = [
    { label: "Report Date", key: "reportdate", value: (r) => r.reportdate || formatDate(getValue(r, "reportdate")) },
    { label: "Job Card", key: "jobcard" }, { label: "SKU", key: "sku" }, { label: "Article", key: "article" },
    { label: "Colour", key: "color" }, { label: "Size", key: "size" }, { label: "Pair Qty", key: "pair" },
    { label: "Cutting Pair Qty", key: "cuttingpairqty" }, { label: "Upper Pair Qty", key: "upperpairqty" },
    { label: "Upper Store Pair Qty", key: "upperstorepairqty" },
    { label: "Status", value: (r) => stage === "jobcard" ? `${r.completed || 0} completed / ${r.pending || 0} pending` : getStageStatus(r, config.stage) },
  ];
  const selectClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500";
  const labelClass = "mb-1 block text-xs font-semibold text-slate-600";

  return <main className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6"><div className="mx-auto max-w-[1800px]">
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><button onClick={() => navigate("/dashboard")} className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"><MdArrowBack size={18}/> Dashboard</button><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{config.title}</h1><p className="mt-1 text-sm text-slate-500">{config.subtitle}</p></div><div className="flex gap-2"><button onClick={() => exportCsv(exportRows, columns, `${stage}-production-report.csv`)} disabled={!displayRows.length} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"><MdDownload size={18}/> Export CSV</button><button onClick={loadData} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"><MdRefresh size={18}/> Refresh</button></div></header>
    {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5"><div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Filtered Records</p><p className="mt-1 text-2xl font-bold">{formatNumber(stats.records)}</p></div><div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">Total Pair Qty</p><p className="mt-1 text-2xl font-bold">{formatNumber(stats.totalPairs)}</p></div><div className="rounded-xl border border-green-200 bg-green-50 p-4"><p className="text-xs text-green-700">Completed Records</p><p className="mt-1 text-2xl font-bold text-green-800">{formatNumber(stats.completed)}</p></div><div className="rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-xs text-red-700">Pending Records</p><p className="mt-1 text-2xl font-bold text-red-800">{formatNumber(stats.pending)}</p></div><div className="col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 lg:col-span-1"><p className="text-xs text-amber-700">Partially Completed</p><p className="mt-1 text-2xl font-bold text-amber-800">{formatNumber(stats.partial)}</p></div></section>
    <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="mb-4 flex items-center gap-2 font-bold text-slate-800"><MdFilterAlt size={21}/> Report Filters</div><div className="mb-3 relative"><MdSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Job Card, SKU, Article, Contractor..." className={`${selectClass} pl-10`}/></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"><div><label className={labelClass}>Job Card</label><input value={jobcard} onChange={(e) => setJobcard(e.target.value)} placeholder="Enter Job Card" className={selectClass}/></div><div><label className={labelClass}>Article</label><select value={article} onChange={(e) => setArticle(e.target.value)} className={selectClass}><option value="">All Articles</option>{uniqueValues(rows, "article").map((v) => <option key={v} value={v}>{v}</option>)}</select></div><div><label className={labelClass}>Colour</label><select value={color} onChange={(e) => setColor(e.target.value)} className={selectClass}><option value="">All Colours</option>{uniqueValues(rows, "color").map((v) => <option key={v} value={v}>{v}</option>)}</select></div><div><label className={labelClass}>Size</label><select value={size} onChange={(e) => setSize(e.target.value)} className={selectClass}><option value="">All Sizes</option>{uniqueValues(rows, "size").map((v) => <option key={v} value={v}>{v}</option>)}</select></div><div><label className={labelClass}>Status</label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}><option value="all">All Statuses</option><option value="Completed">Completed</option><option value="Pending">Pending</option><option value="Partially Completed">Partially Completed</option><option value="Unknown">Unknown</option></select></div><div><label className={labelClass}>From Date</label><input type="date" value={fromDate} max={toDate || undefined} onChange={(e) => setFromDate(e.target.value)} className={selectClass}/></div><div><label className={labelClass}>To Date</label><input type="date" value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} className={selectClass}/></div><div className="flex items-end"><button onClick={reset} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Reset Filters</button></div></div></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">{stage === "jobcard" ? "Job Card / Article Summary" : stage === "article" ? "Article, Colour & Size Details" : `${config.title} Details`}</h2><p className="mt-1 text-sm text-slate-500">Showing {displayRows.length} rows from {filtered.length} matching source records.</p></div><span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">{config.quantityLabel}: {formatNumber(stats.quantity)}</span></div><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="bg-slate-800 text-white"><tr>{["Report Date", "Job Card", "SKU", "Article", "Colour", "Size", "Pair Qty", "Cutting Qty", "Upper Qty", "Upper Store Qty", "Stage Status"].map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={11} className="px-4 py-12 text-center text-slate-500">Loading report...</td></tr> : displayRows.map((row, index) => {const status = stage === "jobcard" ? (row.pending > 0 && row.completed > 0 ? "Partially Completed" : row.pending > 0 ? "Pending" : row.completed > 0 ? "Completed" : "Unknown") : getStageStatus(row, config.stage); return <tr key={`${getValue(row, "jobcard")}-${getValue(row, "sku")}-${index}`} className="border-t border-slate-100 hover:bg-slate-50"><td className="whitespace-nowrap px-3 py-3">{formatDate(getValue(row, "reportdate"))}</td><td className="whitespace-nowrap px-3 py-3 font-bold text-blue-700">{getValue(row, "jobcard") || "-"}</td><td className="whitespace-nowrap px-3 py-3">{getValue(row, "sku") || "-"}</td><td className="px-3 py-3">{getValue(row, "article") || "-"}</td><td className="px-3 py-3">{getValue(row, "color") || "-"}</td><td className="px-3 py-3">{getValue(row, "size") || "-"}</td><td className="px-3 py-3">{formatNumber(getValue(row, "pair"))}</td><td className="px-3 py-3">{formatNumber(getValue(row, "cuttingpairqty"))}</td><td className="px-3 py-3">{formatNumber(getValue(row, "upperpairqty"))}</td><td className="px-3 py-3">{formatNumber(getValue(row, "upperstorepairqty"))}</td><td className="px-3 py-3"><Badge status={status}/></td></tr>})}{!loading && !displayRows.length && <tr><td colSpan={11} className="px-4 py-12 text-center text-slate-500">No records found. Try changing the filters.</td></tr>}</tbody></table></div></section>
    <p className="mt-4 text-xs text-slate-400">Important: Cutting/Upper status is calculated by comparing stage quantity against Pair Qty. Upper Store status comes from the saved upperstorestatus field. Please verify the quantity fields match your backend's business rules.</p>
  </div></main>;
}
