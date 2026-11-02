import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  MdRefresh,
  MdSearch,
  MdCheckCircle,
  MdPendingActions,
  MdLayers,
} from "react-icons/md";

const API_BASE_URL =
  "https://mosach-erp-server.onrender.com/api/production-report";

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

const getRowsFromResponse = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.records)) return data.records;

  return [];
};

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_BASE_URL, {
        timeout: 120000,
      });

      setRows(getRowsFromResponse(response));
      setCurrentPage(1);
    } catch (err) {
      console.error("Dashboard API Error:", err);

      setRows([]);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load production report."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  // =====================================================
  // SINGLE SKU-WISE SUMMARY
  // =====================================================

  const skuSummary = useMemo(() => {
    const grouped = {};

    rows.forEach((row) => {
      const sku = String(row.sku || "").trim();

      if (!sku) return;

      const rawPair = row.upperstorepairqty;

      const isBlankPair =
        rawPair === null ||
        rawPair === undefined ||
        String(rawPair).trim() === "";

      const pair = isBlankPair ? 0 : toNumber(rawPair);

      if (!grouped[sku]) {
        grouped[sku] = {
          sku,
          receivedPair: 0,
          receivedPacking: 24,
          pendingCarton: 0,
        };
      }

      // Received Pair > 0
      if (!isBlankPair && pair > 0) {
        grouped[sku].receivedPair += pair;

        const packing = toNumber(row.packing);

        if (packing > 0) {
          grouped[sku].receivedPacking = packing;
        }
      }

      // Received Pair = 0
      else if (!isBlankPair && pair === 0) {
        grouped[sku].pendingCarton += toNumber(row.carton);
      }
    });

    return Object.values(grouped)
      .map((item) => ({
        ...item,

        receivedCarton: Math.round(
          item.receivedPair /
            (item.receivedPacking > 0
              ? item.receivedPacking
              : 24)
        ),
      }))
      .filter(
        (item) =>
          item.receivedPair > 0 || item.pendingCarton > 0
      )
      .sort((a, b) => a.sku.localeCompare(b.sku));
  }, [rows]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredSummary = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return skuSummary;

    return skuSummary.filter((item) =>
      item.sku.toLowerCase().includes(value)
    );
  }, [skuSummary, search]);

  // =====================================================
  // GRAND TOTAL
  // =====================================================

  const totals = useMemo(
    () =>
      filteredSummary.reduce(
        (acc, item) => ({
          receivedPair:
            acc.receivedPair + item.receivedPair,

          receivedCarton:
            acc.receivedCarton + item.receivedCarton,

          pendingCarton:
            acc.pendingCarton + item.pendingCarton,
        }),
        {
          receivedPair: 0,
          receivedCarton: 0,
          pendingCarton: 0,
        }
      ),
    [filteredSummary]
  );

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSummary.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * pageSize;

  const pageRows = filteredSummary.slice(
    startIndex,
    startIndex + pageSize
  );

  // =====================================================
  // SUMMARY CARD
  // =====================================================

  const SummaryCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    bg,
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            {formatNumber(value)}
          </h2>

          <p className="text-xs text-gray-400 mt-1">
            {subtitle}
          </p>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}
        >
          <Icon className={`text-2xl ${color}`} />
        </div>
      </div>
    </div>
  );

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0A4B57]">
              Production Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              SKU Wise Upper Store Received and Pending Summary
            </p>
          </div>

          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-[#0A4B57] hover:bg-[#083c45] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            <MdRefresh
              className={`text-lg ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <SummaryCard
            title="Total Received Pair"
            value={totals.receivedPair}
            subtitle="Upper Store Received Pair"
            icon={MdLayers}
            color="text-green-600"
            bg="bg-green-50"
          />

          <SummaryCard
            title="Total Received Carton"
            value={totals.receivedCarton}
            subtitle="Received Pair divided by Packing"
            icon={MdCheckCircle}
            color="text-green-700"
            bg="bg-green-50"
          />

          <SummaryCard
            title="Pending Carton"
            value={totals.pendingCarton}
            subtitle="Original Carton where received pair is zero"
            icon={MdPendingActions}
            color="text-orange-600"
            bg="bg-orange-50"
          />

        </div>

        {/* SINGLE GRID */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

          {/* GRID HEADER */}

          <div className="px-5 py-4 bg-[#0A4B57] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                SKU Wise Upper Store Summary
              </h2>

              <p className="text-xs text-white/80 mt-1">
                Received Pair and Pending Carton — Both in One Grid
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/15 w-fit">
              {filteredSummary.length} SKU
            </span>
          </div>

          {/* SEARCH AND PAGE SIZE */}

          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div className="relative max-w-md w-full">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search SKU..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#0A4B57] focus:ring-1 focus:ring-[#0A4B57]"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Rows per page:</span>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-2 py-2 outline-none focus:border-[#0A4B57]"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[760px]">

              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 font-semibold">
                    #
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    SKU
                  </th>

                  <th className="px-5 py-3 font-semibold text-right">
                    Received Pair
                  </th>

                  {/* <th className="px-5 py-3 font-semibold text-right">
                    Received Carton
                  </th> */}

                  <th className="px-5 py-3 font-semibold text-right">
                    Pending Carton
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      Loading data...
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-gray-400"
                    >
                      No records found
                    </td>
                  </tr>
                ) : (
                  pageRows.map((item, index) => (
                    <tr
                      key={item.sku}
                      className="hover:bg-teal-50/40 transition-colors"
                    >
                      <td className="px-5 py-3 text-gray-500">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-5 py-3 font-semibold text-[#0A4B57]">
                        {item.sku}
                      </td>

                      {/* <td className="px-5 py-3 text-right font-semibold text-gray-800">
                        {formatNumber(item.receivedPair)}
                      </td> */}

                      <td className="px-5 py-3 text-right font-bold text-green-700">
                        {formatNumber(item.receivedCarton)}
                      </td>

                      <td className="px-5 py-3 text-right font-bold text-orange-700">
                        {formatNumber(item.pendingCarton)}
                      </td>
                    </tr>
                  ))
                )}

              </tbody>

              {/* GRAND TOTAL */}

              {!loading && filteredSummary.length > 0 && (
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td
                      colSpan={2}
                      className="px-5 py-4 font-bold text-gray-800"
                    >
                      GRAND TOTAL
                    </td>

                    {/* <td className="px-5 py-4 text-right font-bold text-gray-800">
                      {formatNumber(totals.receivedPair)}
                    </td> */}

                    <td className="px-5 py-4 text-right font-bold text-green-700">
                      {formatNumber(totals.receivedCarton)}
                    </td>

                    <td className="px-5 py-4 text-right font-bold text-orange-700">
                      {formatNumber(totals.pendingCarton)}
                    </td>
                  </tr>
                </tfoot>
              )}

            </table>
          </div>

          {/* PAGINATION */}

          {!loading && filteredSummary.length > 0 && (
            <div className="px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">

              <span className="text-sm text-gray-500">
                {startIndex + 1}-
                {Math.min(
                  startIndex + pageSize,
                  filteredSummary.length
                )}{" "}
                of {filteredSummary.length}
              </span>

              <div className="flex items-center gap-1 flex-wrap justify-center">

                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={safePage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-40"
                >
                  First
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={safePage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-40"
                >
                  Prev
                </button>

                <span className="px-3 py-2 bg-[#0A4B57] text-white rounded-md text-sm font-semibold">
                  {safePage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
                  disabled={safePage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-40"
                >
                  Next
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safePage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-40"
                >
                  Last
                </button>

              </div>
            </div>
          )}

        </div>

        <div className="text-center text-xs text-gray-400 py-2">
          MOSACH ERP · Production Dashboard
        </div>

      </div>
    </div>
  );
}