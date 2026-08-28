import { useEffect, useState } from "react";
import api from "../../../api/axios";
import OrderTable from "./OrderTable";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";

const Order = () => {
  const navigate = useNavigate();

  const [order, setOrder] = useState([]);
  const [search, setSearch] = useState("");

  // ========================================
  // GET ORDER
  // ========================================
 const getOrder = async () => {
  try {
    const res = await api.get("/order");

    console.log("Order API Response:", res.data);
    console.log("Order Data:", res.data?.data);

    setOrder(Array.isArray(res.data?.data) ? res.data.data : []);

  } catch (error) {
    console.log("Get Order Error:", error);

    Swal.fire({
      icon: "error",
      title: "Failed",
      text:
        error.response?.data?.message ||
        "Unable to load order.",
    });

    setOrder([]);
  }
};

  // ========================================
  // DELETE ORDER
  // ========================================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Order?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      console.log("Deleting ID:", id);

      const res = await api.delete(`/order/${id}`);

      console.log("Delete API Response:", res.data);

      // Refresh order
      await getOrder();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Order deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.log("Delete Error:", err);

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text:
          err.response?.data?.message ||
          err.message ||
          "Unable to delete order.",
      });
    }
  };

  // ========================================
  // SEARCH
  // ========================================
const filteredOrder = order.filter((item) => {
  const keyword = search.trim().toLowerCase();

  if (!keyword) return true;

  return (
    String(item.orderid || "").toLowerCase().includes(keyword) ||
    String(item.orderno || "").toLowerCase().includes(keyword) ||
    String(item.orderdate || "").toLowerCase().includes(keyword) ||
    String(item.salesperson || "").toLowerCase().includes(keyword) ||
    String(item.totalqty || "").toLowerCase().includes(keyword)
  );
});

  // ========================================
  // LOAD ORDER
  // ========================================
  useEffect(() => {
    getOrder();
  }, []);

  // ========================================
  // UI
  // ========================================
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
        {/* Left Content */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
           Order
          </h1>

          <p className="text-slate-500 mt-0.5  text-sm sm:text-base">
            Order Details
          </p>
        </div>

        {/* Add Order Button */}
        <Button
          variant="warning"
          onClick={() => navigate("/production/order/add")}
          className="w-full sm:w-auto"
        >
          + Add Order
        </Button>
        
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search Order No. / Date / Sales Person..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg pl-10 pr-4 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Order Table */}
      <OrderTable
        order={filteredOrder}
        search={search}
        onDelete={handleDelete}
      />
    </>
  );
};

export default Order;