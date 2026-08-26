import { useEffect, useState } from "react";
import api from "../../../api/axios";
import SizeGroupTable from "./SizeGroupTable";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";

const SizeGroup = () => {
  const navigate = useNavigate();

  const [sizegroup, setSizeGroup] = useState([]);
  const [search, setSearch] = useState("");

  // ========================================
  // GET SIZE GROUP
  // ========================================
  const getSizeGroup = async () => {
    try {
      const res = await api.get("/sizegroup");

      console.log("Size Group API Response:", res.data);

      setSizeGroup(res.data);
    } catch (error) {
      console.log("Get Size Group Error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Unable to load size group.",
      });
    }
  };

  // ========================================
  // DELETE SIZE GROUP
  // ========================================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Size Group?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      console.log("Deleting ID:", id);

      const res = await api.delete(`/sizegroup/${id}`);

      console.log("Delete API Response:", res.data);

      // Refresh Size Group
      await getSizeGroup();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Size group deleted successfully.",
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
          "Unable to delete size group.",
      });
    }
  };

  // ========================================
  // SEARCH
  // ========================================
  const filteredSizeGroup = sizegroup.filter((sizegroup) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return (
      sizegroup.sizegroup?.toLowerCase().includes(keyword)
    );
  });

  // ========================================
  // LOAD SIZE GROUP
  // ========================================
  useEffect(() => {
    getSizeGroup();
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
            Size Group
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Size Group Details
          </p>
        </div>

        {/* Add Size Group Button */}
        <Button
          variant="warning"
          onClick={() => navigate("/masters/sizegroup/add")}
          className="w-full sm:w-auto"
        >
          + Add Size Group
        </Button>
        
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search Size Group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Size Group Table */}
      <SizeGroupTable
        sizegroup={filteredSizeGroup}
        search={search}
        onDelete={handleDelete}
      />
    </>
  );
};

export default SizeGroup;