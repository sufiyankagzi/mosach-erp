import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  MdRefresh,
  MdSearch,
  MdInventory2,
  MdInventory,
  MdAssessment,
} from "react-icons/md";

// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL =
  "https://mosach-erp-server.onrender.com/api/production-report";

// ======================================================
// GET API ROWS
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
// NUMBER FORMAT
// ======================================================

const formatNumber = (value) => {
  const number = Number(value) || 0;

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
};

// ======================================================
// DASHBOARD COMPONENT
// ======================================================

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // ====================================================
  // LOAD DATA
  // ====================================================

  const fetchDashboardData = useCallback(async () => {
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
            "Dashboard data load nahi ho saka."
        );
      }

      setRows(getReportRows(responseData));
    } catch (err) {
      console.error(
        "Dashboard API error:",
        err.response?.data || err
      );

      setRows([]);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Dashboard data load nahi ho saka."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ====================================================
  // SKU WISE GROUPING
  // ====================================================

  const skuSummary = useMemo(() => {
    const grouped = rows.reduce((acc, row) => {
      const sku =
        String(row?.sku || "").trim() || "";

      // Empty SKU skip
      if (!sku) return acc;

      const upperStorePair =
        Number(row?.upperstorepairqty) || 0;

      const packing =
        Number.parseFloat(row?.packing) || 24;

      if (!acc[sku]) {
        acc[sku] = {
          sku,
          totalUpperStorePair: 0,
          packing,
          records: 0,
        };
      }

      // Same SKU ka Pair total
      acc[sku].totalUpperStorePair += upperStorePair;

      // Valid packing update
      if (packing > 0) {
        acc[sku].packing = packing;
      }

      acc[sku].records += 1;

      return acc;
    }, {});

    return Object.values(grouped)
      .map((item) => {
        const totalUpperStoreCarton =
          item.packing > 0
            ? Math.round(
                item.totalUpperStorePair / item.packing
              )
            : 0;

        return {
          ...item,
          totalUpperStoreCarton,
        };
      })

      // ================================================
      // IMPORTANT: 0 PAIR / 0 CARTON HIDE
      // ================================================

      .filter(
        (item) =>
          item.totalUpperStorePair > 0 &&
          item.totalUpperStoreCarton > 0
      )

      // SKU SORT
      .sort((a, b) =>
        a.sku.localeCompare(b.sku, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
  }, [rows]);

  // ====================================================
  // SEARCH FILTER
  // ====================================================

  const filteredSummary = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return skuSummary;

    return skuSummary.filter((item) =>
      item.sku.toLowerCase().includes(query)
    );
  }, [skuSummary, search]);

  // ====================================================
  // DASHBOARD TOTALS
  // ====================================================

  const totalUpperStorePair = useMemo(() => {
    return filteredSummary.reduce(
      (total, item) =>
        total + item.totalUpperStorePair,
      0
    );
  }, [filteredSummary]);

  const totalUpperStoreCarton = useMemo(() => {
    return filteredSummary.reduce(
      (total, item) =>
        total + item.totalUpperStoreCarton,
      0
    );
  }, [filteredSummary]);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px]">

        {/* HEADER */}

        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
              Production Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              SKU wise Upper Store Received summary.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0A4B57] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdRefresh
              size={20}
              className={loading ? "animate-spin" : ""}
            />

            {loading ? "Loading..." : "Refresh Data"}
          </button>
        </header>

        {/* SUMMARY CARDS */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* TOTAL SKU */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active SKU
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {formatNumber(filteredSummary.length)}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Zero quantity excluded
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 p-3 text-[#EF8535]">
                <MdInventory2 size={30} />
              </div>
            </div>
          </div>

          {/* TOTAL PAIR */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Upper Store Received Pair
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {formatNumber(totalUpperStorePair)}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  SKU grouped total
                </p>
              </div>

              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <MdInventory size={30} />
              </div>
            </div>
          </div>

          {/* TOTAL CARTON */}

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-700">
                  Upper Store Received Carton
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#EF8535]">
                  {formatNumber(totalUpperStoreCarton)}
                </h2>

                <p className="mt-1 text-xs text-orange-600">
                  Grand total carton
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 text-[#EF8535] shadow-sm">
                <MdAssessment size={30} />
              </div>
            </div>
          </div>

        </section>

        {/* SEARCH */}

        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative max-w-md">
            <MdSearch
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search SKU..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-400"
            />
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SKU SUMMARY GRID */}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-3 bg-[#0A4B57] px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-white">
                SKU Wise Upper Store Summary
              </h2>

              <p className="mt-1 text-sm text-slate-200">
                Only SKU with received quantity is shown.
              </p>
            </div>

            <span className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white">
              {filteredSummary.length} SKU
            </span>
          </div>

          <div className="max-h-[600px] overflow-auto">

            <table className="w-full min-w-[800px] border-collapse text-left text-sm">

              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-100">

                  <th className="border-b border-slate-200 px-5 py-3">
                    #
                  </th>

                  <th className="border-b border-slate-200 px-5 py-3">
                    SKU
                  </th>

                  <th className="border-b border-slate-200 px-5 py-3 text-center">
                    Records
                  </th>

                  <th className="border-b border-slate-200 px-5 py-3 text-right">
                    Received Pair
                  </th>

                  <th className="border-b border-slate-200 px-5 py-3 text-center">
                    Packing
                  </th>

                  <th className="border-b border-slate-200 px-5 py-3 text-right">
                    Received Carton
                  </th>

                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      Loading dashboard data...
                    </td>
                  </tr>
                ) : filteredSummary.length > 0 ? (

                  filteredSummary.map((item, index) => (
                    <tr
                      key={item.sku}
                      className="transition hover:bg-orange-50"
                    >
                      <td className="border-b border-slate-100 px-5 py-3 text-slate-500">
                        {index + 1}
                      </td>

                      <td className="border-b border-slate-100 px-5 py-3 font-semibold text-slate-800">
                        {item.sku}
                      </td>

                      <td className="border-b border-slate-100 px-5 py-3 text-center">
                        {formatNumber(item.records)}
                      </td>

                      <td className="border-b border-slate-100 px-5 py-3 text-right font-semibold">
                        {formatNumber(item.totalUpperStorePair)}
                      </td>

                      <td className="border-b border-slate-100 px-5 py-3 text-center">
                        {formatNumber(item.packing)}
                      </td>

                      <td className="border-b border-slate-100 px-5 py-3 text-right text-base font-bold text-green-700">
                        {formatNumber(item.totalUpperStoreCarton)}
                      </td>
                    </tr>
                  ))

                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      {error
                        ? "Dashboard data load nahi ho saka."
                        : "No received SKU records found."}
                    </td>
                  </tr>
                )}

              </tbody>

              {/* GRAND TOTAL */}

              {filteredSummary.length > 0 && !loading && (
                <tfoot>
                  <tr className="bg-orange-50">

                    <td
                      colSpan={3}
                      className="border-t border-orange-200 px-5 py-4 text-right font-bold text-slate-800"
                    >
                      Grand Total
                    </td>

                    <td className="border-t border-orange-200 px-5 py-4 text-right font-bold">
                      {formatNumber(totalUpperStorePair)}
                    </td>

                    <td className="border-t border-orange-200 px-5 py-4 text-center">
                      -
                    </td>

                    <td className="border-t border-orange-200 px-5 py-4 text-right text-lg font-bold text-[#EF8535]">
                      {formatNumber(totalUpperStoreCarton)}
                    </td>

                  </tr>
                </tfoot>
              )}

            </table>

          </div>
        </section>

      </div>
    </main>
  );
}