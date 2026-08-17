import { useEffect, useState } from "react";
import api from "../../../api/axios";
import SalesPersonTable from "./SalesPersonTable";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";

const SalesPerson = () => {
  const navigate = useNavigate();

  const [salesperson, setSalesPerson] = useState([]);
  const [search, setSearch] = useState("");

  // ========================================
  // GET SALES PERSON
  // ========================================
  const getSalesPersons = async () => {
    try {
      const res = await api.get("/salesperson");

      console.log("Sales Person API Response:", res.data);

      setSalesPerson(res.data);
    } catch (error) {
      console.log("Get Sales Person Error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Unable to load sales person.",
      });
    }
  };

  // ========================================
  // DELETE SALES PERSON
  // ========================================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Sales Person?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      console.log("Deleting ID:", id);

      const res = await api.delete(`/salesperson/${id}`);

      console.log("Delete API Response:", res.data);

      // Refresh sales person
      await getSalesPersons();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Sales person deleted successfully.",
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
          "Unable to delete sales person.",
      });
    }
  };

  // ========================================
  // SEARCH
  // ========================================
  const filteredSalesPerson = salesperson.filter((salesperson) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return (
      salesperson.salesperson?.toLowerCase().includes(keyword) ||
      salesperson.mobileno?.toString().includes(search.trim())
    );
  });

  // ========================================
  // LOAD SALES PERSON
  // ========================================
  useEffect(() => {
    getSalesPersons();
  }, []);

  // ========================================
  // UI
  // ========================================
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        {/* Left Content */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Sales Person Master
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Sales Person Details
          </p>
        </div>

        {/* Add Sales Person Button */}
        <Button
          variant="warning"
          onClick={() => navigate("/masters/salesperson/add")}
          className="w-full sm:w-auto"
        >
          + Add Sales Person
        </Button>
        
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search Sales Person / Mobile No. ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Sales Person Table */}
      <SalesPersonTable
        salesperson={filteredSalesPerson}
        search={search}
        onDelete={handleDelete}
      />
    </>
  );
};

export default SalesPerson;