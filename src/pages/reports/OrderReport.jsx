
import { useState } from "react";
import OrderReportTable from "./OrderReportTable";
import Button from "../../components/Button";
import Swal from "sweetalert2";
import api from "../../api/axios";

const OrderReport = () => {

  // ========================================
  // STATES
  // ========================================

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);


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


      const response = await api.get("/order/report", {

        params: {
          fromDate: fromDate,
          toDate: toDate,
        },

      });


      console.log(
        "Order Report Response:",
        response.data
      );


      // ----------------------------------------
      // GET ACTUAL REPORT DATA
      // ----------------------------------------

      const reportData = Array.isArray(response.data?.data)
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


      // Clear old data if API fails
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


          {/* FROM DATE */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
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


          {/* TO DATE */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
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


          {/* GENERATE BUTTON */}

          <div className="flex items-end">

            <Button
              variant="warning"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full md:w-auto"
            >

              {loading
                ? "Generating..."
                : "Generate Report"
              }

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

