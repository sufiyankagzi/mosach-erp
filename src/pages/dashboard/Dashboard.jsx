import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  MdRefresh,
  MdSearch,
  MdInventory2,
  MdCheckCircle,
  MdPendingActions,
  MdLayers,
} from "react-icons/md";

// ======================================================
// API CONFIGURATION
// ======================================================

const API_BASE_URL =
  "https://mosach-erp-server.onrender.com/api/production-report";

// ======================================================
// HELPER FUNCTIONS
// ======================================================

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
};

const getPacking = (row) => {
  const packing = toNumber(row.packing);

  return packing > 0 ? packing : 24;
};

const getRowsFromResponse = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.records)) return data.records;

  return [];
};

// ======================================================
// MAIN DASHBOARD
// ======================================================

export default function Dashboard() {
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // ====================================================
  // INDEPENDENT PAGINATION STATES
  // ====================================================

  const [receivedPage, setReceivedPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);

  const [receivedPageSize, setReceivedPageSize] = useState(10);
  const [pendingPageSize, setPendingPageSize] = useState(10);

  // ====================================================
  // LOAD PRODUCTION REPORT DATA
  // ====================================================

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_BASE_URL, {
        timeout: 120000,
      });

      const data = getRowsFromResponse(response);

      setRows(data);

      setReceivedPage(1);
      setPendingPage(1);
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

  // ====================================================
  // SEARCH CHANGE - RESET BOTH PAGES
  // ====================================================

  useEffect(() => {
    setReceivedPage(1);
    setPendingPage(1);
  }, [search]);

  // ====================================================
  // 1. UPPER STORE RECEIVED SUMMARY
  //
  // Condition: upperstorepairqty > 0
  // Group by SKU
  // Total Pair / Packing = Carton
  // ====================================================

  const skuSummary = useMemo(() => {
    const grouped = {};

    rows.forEach((row) => {
      const sku = String(row.sku || "").trim();

      if (!sku) return;

      const pair = toNumber(row.upperstorepairqty);

      // Only positive received pair records
      if (pair <= 0) return;

      if (!grouped[sku]) {
        grouped[sku] = {
          sku,
          records: 0,
          totalUpperStorePair: 0,
          packing: getPacking(row),
        };
      }

      grouped[sku].records += 1;

      grouped[sku].totalUpperStorePair += pair;

      // Use latest valid packing value encountered
      if (toNumber(row.packing) > 0) {
        grouped[sku].packing = toNumber(row.packing);
      }
    });

    return Object.values(grouped)
      .map((item) => {
        const totalUpperStoreCarton = Math.round(
          item.totalUpperStorePair / item.packing
        );

        return {
          ...item,
          totalUpperStoreCarton,
        };
      })
      .filter(
        (item) =>
          item.totalUpperStorePair > 0 &&
          item.totalUpperStoreCarton > 0
      )
      .sort((a, b) => a.sku.localeCompare(b.sku));
  }, [rows]);

  // ====================================================
  // FIRST SUMMARY SEARCH FILTER
  // ====================================================

  const filteredSkuSummary = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return skuSummary;

    return skuSummary.filter((item) =>
      item.sku.toLowerCase().includes(value)
    );
  }, [skuSummary, search]);

  // ====================================================
  // FIRST SUMMARY TOTALS
  // ====================================================

  const totalReceivedPair = useMemo(() => {
    return filteredSkuSummary.reduce(
      (total, item) => total + item.totalUpperStorePair,
      0
    );
  }, [filteredSkuSummary]);

  const totalReceivedCarton = useMemo(() => {
    return filteredSkuSummary.reduce(
      (total, item) => total + item.totalUpperStoreCarton,
      0
    );
  }, [filteredSkuSummary]);

  // ====================================================
  // 2. PENDING UPPER STORE SUMMARY
  //
  // Condition: upperstorepairqty = 0
  // Group by SKU
  // Sum original database carton field
  // ====================================================

  const zeroPairSummary = useMemo(() => {
    const grouped = {};

    rows.forEach((row) => {
      const sku = String(row.sku || "").trim();

      if (!sku) return;

      const pairValue = row.upperstorepairqty;

      // Ignore blank/null pair values
      if (
        pairValue === null ||
        pairValue === undefined ||
        String(pairValue).trim() === ""
      ) {
        return;
      }

      // Only exactly zero pair records
      if (toNumber(pairValue) !== 0) return;

      // Original database carton value
      const carton = toNumber(row.carton);

      if (!grouped[sku]) {
        grouped[sku] = {
          sku,
          records: 0,
          totalCarton: 0,
        };
      }

      grouped[sku].records += 1;
      grouped[sku].totalCarton += carton;
    });

    return Object.values(grouped)
      .filter((item) => item.totalCarton > 0)
      .sort((a, b) => a.sku.localeCompare(b.sku));
  }, [rows]);

  // ====================================================
  // SECOND SUMMARY SEARCH FILTER
  // ====================================================

  const filteredZeroPairSummary = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return zeroPairSummary;

    return zeroPairSummary.filter((item) =>
      item.sku.toLowerCase().includes(value)
    );
  }, [zeroPairSummary, search]);

  // ====================================================
  // SECOND SUMMARY TOTAL
  // ====================================================

  const zeroPairCartonTotal = useMemo(() => {
    return filteredZeroPairSummary.reduce(
      (total, item) => total + item.totalCarton,
      0
    );
  }, [filteredZeroPairSummary]);

  // ====================================================
  // PAGINATION SAFETY
  // ====================================================

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredSkuSummary.length / receivedPageSize)
    );

    if (receivedPage > totalPages) {
      setReceivedPage(totalPages);
    }
  }, [filteredSkuSummary, receivedPage, receivedPageSize]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredZeroPairSummary.length / pendingPageSize)
    );

    if (pendingPage > totalPages) {
      setPendingPage(totalPages);
    }
  }, [filteredZeroPairSummary, pendingPage, pendingPageSize]);

  // ====================================================
  // SUMMARY CARD COMPONENT
  // ====================================================

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

  // ====================================================
  // COMMON SUMMARY TABLE WITH PAGINATION
  // ====================================================

  const SummaryTable = ({
    title,
    subtitle,
    data,
    type,
    total,
    pairTotal = 0,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
  }) => {
    const isReceived = type === "received";

    const totalPages = Math.max(
      1,
      Math.ceil(data.length / pageSize)
    );

    const startIndex = (currentPage - 1) * pageSize;

    const paginatedData = data.slice(
      startIndex,
      startIndex + pageSize
    );

    const handlePageSizeChange = (e) => {
      setPageSize(Number(e.target.value));
      setCurrentPage(1);
    };

    const goToPage = (page) => {
      setCurrentPage(
        Math.max(1, Math.min(page, totalPages))
      );
    };

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        {/* TEAL TABLE HEADING */}

        <div className="px-5 py-4 bg-[#0A4B57] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold">
              {title}
            </h2>

            <p className="text-xs text-white/80 mt-1">
              {subtitle}
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/15 text-white w-fit">
            {data.length} SKU
          </span>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">

            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-5 py-3 font-semibold">
                  #
                </th>

                <th className="px-5 py-3 font-semibold">
                  SKU
                </th>

                {/* <th className="px-5 py-3 font-semibold text-center">
                  Records
                </th> */}

                {/* {isReceived && (
                  <>
                    <th className="px-5 py-3 font-semibold text-right">
                      Received Pair
                    </th>

                    <th className="px-5 py-3 font-semibold text-center">
                      Packing
                    </th>
                  </>
                )} */}

                <th className="px-5 py-3 font-semibold text-right">
                  {isReceived
                    ? "Received Carton"
                    : "Carton"}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    Loading data...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
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

                    {/* <td className="px-5 py-3 text-center text-gray-600">
                      {formatNumber(item.records)}
                    </td> */}
{/* 
                    {isReceived && (
                      <>
                        <td className="px-5 py-3 text-right font-semibold text-gray-800">
                          {formatNumber(
                            item.totalUpperStorePair
                          )}
                        </td>

                        <td className="px-5 py-3 text-center text-gray-600">
                          {formatNumber(item.packing)}
                        </td>
                      </>
                    )} */}

                    <td
                      className={`px-5 py-3 text-right font-bold ${
                        isReceived
                          ? "text-green-700"
                          : "text-orange-700"
                      }`}
                    >
                      {formatNumber(
                        isReceived
                          ? item.totalUpperStoreCarton
                          : item.totalCarton
                      )}
                    </td>
                  </tr>
                ))
              )}

            </tbody>

            {/* GRAND TOTAL */}

            {!loading && data.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td
                    colSpan={2}
                    className="px-5 py-4 font-bold text-gray-800"
                  >
                    GRAND TOTAL
                  </td>

                  {/* {isReceived && (
                    <>
                      <td className="px-5 py-4 text-right font-bold text-gray-800">
                        {formatNumber(pairTotal)}
                      </td>

                      <td></td>
                    </>
                  )} */}

                  <td
                    className={`px-5 py-4 text-right font-bold ${
                      isReceived
                        ? "text-green-700"
                        : "text-orange-700"
                    }`}
                  >
                    {formatNumber(total)}
                  </td>
                </tr>
              </tfoot>
            )}

          </table>
        </div>

        {/* PAGINATION */}

        {!loading && data.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* ROWS PER PAGE */}

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-600">
              <span>Rows per page:</span>

              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:border-[#0A4B57]"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <span className="text-gray-500">
                {startIndex + 1}-
                {Math.min(
                  startIndex + pageSize,
                  data.length
                )}{" "}
                of {data.length}
              </span>
            </div>

            {/* PAGE BUTTONS */}

            <div className="flex items-center gap-1 flex-wrap justify-center">

              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                First
              </button>

              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Prev
              </button>

              <span className="px-3 py-2 bg-[#0A4B57] text-white rounded-md text-sm font-semibold">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>

              <button
                type="button"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Last
              </button>

            </div>
          </div>
        )}

      </div>
    );
  };

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* PAGE HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0A4B57]">
              Production Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              SKU wise Upper Store received and pending carton summary
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

        {/* ERROR MESSAGE */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* SEARCH */}

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">

          <div className="relative max-w-md">

            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU..."
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#0A4B57] focus:ring-1 focus:ring-[#0A4B57]"
            />

          </div>
        </div>

        {/* ============================================= */}
        {/* FIRST SUMMARY */}
        {/* ============================================= */}

        <div>

          <div className="flex items-center gap-2 mb-4">
            <MdCheckCircle className="text-green-600 text-xl" />

            <h2 className="font-bold text-[#0A4B57] text-lg">
              Upper Store Received Summary
            </h2>
          </div>

          {/* FIRST SUMMARY CARDS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <SummaryCard
              title="Total SKU"
              value={filteredSkuSummary.length}
              subtitle="Received SKU"
              icon={MdInventory2}
              color="text-[#0A4B57]"
              bg="bg-teal-50"
            />

            <SummaryCard
              title="Total Received Pair"
              value={totalReceivedPair}
              subtitle="Upper Store Received Pair"
              icon={MdLayers}
              color="text-green-600"
              bg="bg-green-50"
            />

            <SummaryCard
              title="Total Received Carton"
              value={totalReceivedCarton}
              subtitle="Pair divided by Packing"
              icon={MdCheckCircle}
              color="text-orange-600"
              bg="bg-orange-50"
            />

          </div>
        </div>

        {/* FIRST GRID */}

        <SummaryTable
          title="Upper Store Received - SKU Wise"
          subtitle="Only records where Upper Store Received Pair is greater than zero"
          data={filteredSkuSummary}
          type="received"
          total={totalReceivedCarton}
          pairTotal={totalReceivedPair}
          currentPage={receivedPage}
          setCurrentPage={setReceivedPage}
          pageSize={receivedPageSize}
          setPageSize={setReceivedPageSize}
        />

        {/* ============================================= */}
        {/* SECOND SUMMARY */}
        {/* ============================================= */}

        <div>

          <div className="flex items-center gap-2 mb-4">
            <MdPendingActions className="text-orange-600 text-xl" />

            <h2 className="font-bold text-[#0A4B57] text-lg">
              Inline Upper Store Summary
            </h2>
          </div>

          {/* SECOND SUMMARY CARDS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <SummaryCard
              title="Pending SKU"
              value={filteredZeroPairSummary.length}
              subtitle="SKU with zero received pair"
              icon={MdInventory2}
              color="text-orange-600"
              bg="bg-orange-50"
            />

            <SummaryCard
              title="Pending Carton"
              value={zeroPairCartonTotal}
              subtitle="Original Carton field total"
              icon={MdPendingActions}
              color="text-red-600"
              bg="bg-red-50"
            />

          </div>
        </div>

        {/* SECOND GRID */}

        <SummaryTable
          title="Zero Received Pair - SKU Wise"
          subtitle="Only records where Upper Store Received Pair is exactly zero. Original database Carton is used."
          data={filteredZeroPairSummary}
          type="pending"
          total={zeroPairCartonTotal}
          currentPage={pendingPage}
          setCurrentPage={setPendingPage}
          pageSize={pendingPageSize}
          setPageSize={setPendingPageSize}
        />

        {/* FOOTER */}

        <div className="text-center text-xs text-gray-400 py-2">
          MOSACH ERP · Production Dashboard
        </div>

      </div>
    </div>
  );
}