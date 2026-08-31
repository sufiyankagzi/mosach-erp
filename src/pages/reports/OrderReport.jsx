import { useState } from "react";
import OrderReportTable from "./OrderReportTable";
import Button from "../../components/Button";
import Swal from "sweetalert2";
import api from "../../api/axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OrderReport = () => {
  const today = new Date().toISOString().split("T")[0];

  // ========================================
  // STATES
  // ========================================

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);

  // ========================================
  // GENERATE PDF
  // ========================================

  const handlePDF = () => {
    if (!orders || orders.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Data",
        text: "Please generate the report first.",
      });

      return;
    }

    const doc = new jsPDF("landscape", "mm", "a4");

    // ========================================
    // COMPANY LOGO
    // ========================================

    // Orange rounded logo box
    doc.setFillColor(239, 133, 53);

    doc.roundedRect(
      15, // X
      9,  // Y
      10, // Width
      10, // Height
      3,  // Radius
      3,
      "F"
    );

    // M inside logo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);

    doc.text(
      "M",
      20,
      16,
      {
        align: "center",
      }
    );

    // ========================================
    // MOSACH ERP
    // ========================================

    // MOSACH
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(10, 75, 87);

    doc.text(
      "MOSACH",
      27,
      14
    );

    // ERP
    doc.setTextColor(239, 133, 53);

    doc.text(
      "ERP",
      51,
      14
    );

    // ========================================
    // ENTERPRISE MANAGEMENT
    // ========================================

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);

    doc.text(
      "ENTERPRISE MANAGEMENT",
      27,
      18
    );

    // ========================================
    // REPORT TITLE
    // ========================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);

    doc.text(
      "ORDER REPORT",
      148.5,
      15,
      {
        align: "center",
      }
    );

    // ========================================
    // DATE RANGE
    // ========================================

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
      `From Date : ${fromDate}    To Date : ${toDate}`,
      148.5,
      21,
      {
        align: "center",
      }
    );

    // ========================================
    // REPORT SUBTITLE
    // ========================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    doc.text(
      "Order Detail Report (Date Wise)",
      148.5,
      27,
      {
        align: "center",
      }
    );

    // ========================================
    // TABLE DATA
    // ========================================

    const tableData = orders.map((item, index) => [
      index + 1,

      item.orderno || "-",

      item.orderdate
        ? new Date(item.orderdate).toLocaleDateString("en-IN")
        : "-",

      item.salesperson || "-",

      item.articleno || "-",

      item.articlename || "-",

      item.color || "-",

      item.sizegroup || "-",

      item.size || "-",

      Math.round(Number(item.qty || 0)),
    ]);

    // ========================================
    // TOTAL QTY
    // ========================================

    const totalQty = orders.reduce(
      (total, item) =>
        total + Math.round(Number(item.qty || 0)),
      0
    );

    // ========================================
    // TABLE
    // ========================================

    autoTable(doc, {
      startY: 33,

      // --------------------------------------
      // HEADER
      // --------------------------------------

      head: [[
        "#",
        "Order No.",
        "Date",
        "Sales Person",
        "Article No.",
        "Article Name",
        "Color",
        "Size Group",
        "Size",
        "Qty",
      ]],

      // --------------------------------------
      // BODY
      // --------------------------------------

      body: tableData,

      // --------------------------------------
      // THEME
      // --------------------------------------

      theme: "grid",

      // --------------------------------------
      // HEADER STYLE
      // --------------------------------------

      headStyles: {
        fillColor: [10, 75, 87],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      },

      // --------------------------------------
      // BODY STYLE
      // --------------------------------------

      styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: "start",
        valign: "middle",
      },

      // --------------------------------------
      // COLUMN WIDTH
      // --------------------------------------

      columnStyles: {
        0: {
          cellWidth: 8,
          halign: "center",
        },

        1: {
          cellWidth: 25,
        },

        2: {
          cellWidth: 22,
        },

        3: {
          cellWidth: 80,
        },

        4: {
          cellWidth: 22,
        },

        5: {
          cellWidth: 35,
        },

        6: {
          cellWidth: 25,
        },

        7: {
          cellWidth: 22,
        },

        8: {
          cellWidth: 15,
        },

        9: {
          cellWidth: 15,
          halign: "right",
        },
      },

      // --------------------------------------
      // FOOTER / TOTAL
      // --------------------------------------

      foot: [[
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Total Qty",
        "",
        totalQty,
      ]],

      footStyles: {
        fontStyle: "bold",
        halign: "right",
      },
    });

    // ========================================
    // SAVE PDF
    // ========================================

    doc.save(
      `Order_Report_${fromDate}_to_${toDate}.pdf`
    );
  };

  // ========================================
  // GENERATE REPORT
  // ========================================

  const handleGenerate = async () => {

    // ----------------------------------------
    // DATE VALIDATION
    // ----------------------------------------

    if (!fromDate || !toDate) {
      Swal.fire({
        icon: "warning",
        title: "Select Date",
        text: "Please select From Date and To Date.",
      });

      return;
    }

    // ----------------------------------------
    // INVALID DATE
    // ----------------------------------------

    if (fromDate > toDate) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Date",
        text: "From Date cannot be greater than To Date.",
      });

      return;
    }

    console.log("From Date:", fromDate);
    console.log("To Date:", toDate);

    // ----------------------------------------
    // API CALL
    // ----------------------------------------

    try {
      setLoading(true);

      const response = await api.get(
        "/order/report",
        {
          params: {
            fromDate: fromDate,
            toDate: toDate,
          },
        }
      );

      console.log(
        "Order Report Response:",
        response.data
      );

      // ----------------------------------------
      // GET REPORT DATA
      // ----------------------------------------

      const reportData = Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : [];

      // ----------------------------------------
      // SET ORDERS
      // ----------------------------------------

      setOrders(reportData);

      // ----------------------------------------
      // NO DATA
      // ----------------------------------------

      if (reportData.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Orders Found",
          text: "No orders found for the selected date range.",
        });
      }

    } catch (error) {

      console.error(
        "Order Report Error:",
        error
      );

      console.error(
        "Server Response:",
        error.response?.data
      );

      // Clear old data
      setOrders([]);

      Swal.fire({
        icon: "error",
        title: "Report Error",
        text:
          error.response?.data?.message ||
          "Unable to generate order report.",
      });

    } finally {

      setLoading(false);

    }
  };

  // ========================================
  // UI
  // ========================================

  return (
    <>

      {/* ========================================
          PAGE HEADER
      ======================================== */}

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Order Report
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Date Wise Order Details
          </p>

        </div>

      </div>


      {/* ========================================
          DATE FILTER
      ======================================== */}

      <div className="bg-white rounded-xl shadow p-5 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* --------------------------------------
              FROM DATE
          -------------------------------------- */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
              className="
                w-full
                border
                rounded-lg
                px-3
                py-2
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

          </div>


          {/* --------------------------------------
              TO DATE
          -------------------------------------- */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(e.target.value)
              }
              className="
                w-full
                border
                rounded-lg
                px-3
                py-2
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

          </div>


          {/* --------------------------------------
              BUTTONS
          -------------------------------------- */}

          <div className="flex items-end gap-2">

            <Button
              variant="warning"
              onClick={handleGenerate}
              disabled={loading}
              className="w-45"
            >
              {loading
                ? "Generating..."
                : "Generate Report"}
            </Button>

            <Button
              onClick={handlePDF}
              disabled={
                loading ||
                orders.length === 0
              }
              className="bg-[#0A4B57] w-45"
            >
              PDF
            </Button>

          </div>

        </div>

      </div>


      {/* ========================================
          ORDER REPORT TABLE
      ======================================== */}

      <OrderReportTable
        orders={orders}
      />

    </>
  );
};

export default OrderReport;