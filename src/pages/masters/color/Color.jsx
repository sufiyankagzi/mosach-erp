import { useEffect, useState } from "react";
import api from "../../../api/axios";
import ColorTable from "./ColorTable";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";

const Color = () => {
  const navigate = useNavigate();

  const [color, setColor] = useState([]);
  const [search, setSearch] = useState("");

  // ========================================
  // GET COLORS
  // ========================================
  const getColor = async () => {
    try {
      const res = await api.get("/color");

      console.log("Color API Response:", res.data);

      setColor(res.data);
    } catch (error) {
      console.log("Get Color Error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Unable to load color.",
      });
    }
  };

  // ========================================
  // DELETE COLOR
  // ========================================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Color?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      console.log("Deleting ID:", id);

      const res = await api.delete(`/color/${id}`);

      console.log("Delete API Response:", res.data);

      // Refresh color
      await getColor();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Color deleted successfully.",
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
          "Unable to delete color.",
      });
    }
  };

  // ========================================
  // SEARCH
  // ========================================
  const filteredColor = color.filter((color) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return (
      color.color?.toLowerCase().includes(keyword)
    );
  });

  // ========================================
  // LOAD COLOR
  // ========================================
  useEffect(() => {
    getColor();
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
           Color
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Color Details
          </p>
        </div>

        {/* Add Color Button */}
        <Button
          variant="warning"
          onClick={() => navigate("/masters/color/add")}
          className="w-full sm:w-auto"
        >
          + Add Color
        </Button>
        
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search Color..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Color Table */}
      <ColorTable
        color={filteredColor}
        search={search}
        onDelete={handleDelete}
      />
    </>
  );
};

export default Color;