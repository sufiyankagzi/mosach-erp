import { useEffect, useState } from "react";
import api from "../../../api/axios";
// import MaterialTable from "./MaterialTable";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";
import MaterialTable from "./MaterialTable";

const Material = () => {
  const navigate = useNavigate();

  const [material, setMaterial] = useState([]);
  const [search, setSearch] = useState("");

  // ========================================
  // GET MATERIAL
  // ========================================
  const getMaterials = async () => {
    try {
      const res = await api.get("/material");

      console.log("Material API Response:", res.data);

      setMaterial(res.data);
    } catch (error) {
      console.log("Get Material Error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Unable to load material.",
      });
    }
  };

  // ========================================
  // DELETE MATERIAL
  // ========================================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Material?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      console.log("Deleting ID:", id);

      const res = await api.delete(`/material/${id}`);

      console.log("Delete API Response:", res.data);

      // Refresh material
      await getMaterial();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Material deleted successfully.",
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
          "Unable to delete material.",
      });
    }
  };

  // ========================================
  // SEARCH
  // ========================================
  const filteredMaterial = material.filter((material) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return (
      material.material?.toLowerCase().includes(keyword)
    );
  });

  // ========================================
  // LOAD MATERIAL
  // ========================================
  useEffect(() => {
    getMaterials();
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
           Material
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Material Details
          </p>
        </div>

        {/* Add Material Button */}
        <Button
          variant="warning"
          onClick={() => navigate("/masters/material/add")}
          className="w-full sm:w-auto"
        >
          + Add Material
        </Button>
        
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search Material..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Material Table */}
      <MaterialTable
        material={filteredMaterial}
        search={search}
        onDelete={handleDelete}
      />
    </>
  );
};

export default Material;