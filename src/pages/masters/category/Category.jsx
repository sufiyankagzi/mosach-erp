import { useEffect, useState } from "react";
import api from "../../../api/axios";
import CategoryTable from "./CategoryTable";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";

const Category = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState([]);
  const [search, setSearch] = useState("");

  // ========================================
  // GET CATEGORY
  // ========================================
  const getCategory = async () => {
    try {
      const res = await api.get("/category");

      console.log("Category API Response:", res.data);

      setCategory(res.data);
    } catch (error) {
      console.log("Get Category Error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Unable to load category.",
      });
    }
  };

  // ========================================
  // DELETE CATEGORY
  // ========================================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Category?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      console.log("Deleting ID:", id);

      const res = await api.delete(`/category/${id}`);

      console.log("Delete API Response:", res.data);

      // Refresh category
      await getCategory();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Category deleted successfully.",
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
          "Unable to delete category.",
      });
    }
  };

  // ========================================
  // SEARCH
  // ========================================
  const filteredCategory = category.filter((category) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return (
      category.category?.toLowerCase().includes(keyword)
    );
  });

  // ========================================
  // LOAD CATEGORY
  // ========================================
  useEffect(() => {
    getCategory();
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
           Category
          </h1>

          <p className="text-slate-500 mt-0.5  text-sm sm:text-base">
            Category Details
          </p>
        </div>

        {/* Add Category Button */}
        <Button
          variant="warning"
          onClick={() => navigate("/masters/category/add")}
          className="w-full sm:w-auto"
        >
          + Add Category
        </Button>
        
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search Category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg pl-10 pr-4 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Table */}
      <CategoryTable
        category={filteredCategory}
        search={search}
        onDelete={handleDelete}
      />
    </>
  );
};

export default Category;