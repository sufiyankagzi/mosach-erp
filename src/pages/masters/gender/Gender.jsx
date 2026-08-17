import { useEffect, useState } from "react";
import api from "../../../api/axios";
import GenderTable from "./GenderTable";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";

const Gender = () => {
  const navigate = useNavigate();

  const [gender, setGender] = useState([]);
  const [search, setSearch] = useState("");

  // ========================================
  // GET GENDERS
  // ========================================
  const getGenders = async () => {
    try {
      const res = await api.get("/gender");

      console.log("Gender API Response:", res.data);

      setGender(res.data);
    } catch (error) {
      console.log("Get Gender Error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Unable to load gender.",
      });
    }
  };

  // ========================================
  // DELETE GENDER
  // ========================================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Gender?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      console.log("Deleting ID:", id);

      const res = await api.delete(`/gender/${id}`);

      console.log("Delete API Response:", res.data);

      // Refresh gender
      await getGenders();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Gender deleted successfully.",
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
          "Unable to delete gender.",
      });
    }
  };

  // ========================================
  // SEARCH
  // ========================================
  const filteredGender = gender.filter((gender) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return (
      gender.gender?.toLowerCase().includes(keyword)
    );
  });

  // ========================================
  // LOAD GENDERS
  // ========================================
  useEffect(() => {
    getGenders();
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
           Gender
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Gender Details
          </p>
        </div>

        {/* Add Gender Button */}
        <Button
          variant="warning"
          onClick={() => navigate("/masters/gender/add")}
          className="w-full sm:w-auto"
        >
          + Add Gender
        </Button>
        
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search Gender..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Gender Table */}
      <GenderTable
        gender={filteredGender}
        search={search}
        onDelete={handleDelete}
      />
    </>
  );
};

export default Gender;