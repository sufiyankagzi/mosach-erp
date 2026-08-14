import { useEffect, useState } from "react";
import api from "../../../api/axios";
import UserTable from "./UserTable";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";

const Users = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // ========================================
  // GET USERS
  // ========================================
  const getUsers = async () => {
    try {
      const res = await api.get("/users");

      console.log("Users API Response:", res.data);

      setUsers(res.data);
    } catch (error) {
      console.log("Get Users Error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Unable to load users.",
      });
    }
  };

  // ========================================
  // DELETE USER
  // ========================================
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      console.log("Deleting ID:", id);

      const res = await api.delete(`/users/${id}`);

      console.log("Delete API Response:", res.data);

      // Refresh users
      await getUsers();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "User deleted successfully.",
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
          "Unable to delete user.",
      });
    }
  };

  // ========================================
  // SEARCH
  // ========================================
  const filteredUsers = users.filter((user) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return (
      user.username?.toLowerCase().includes(keyword) ||
      user.gstno?.toLowerCase().includes(keyword) ||
      user.mobileno?.toString().includes(search.trim())
    );
  });

  // ========================================
  // LOAD USERS
  // ========================================
  useEffect(() => {
    getUsers();
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
            User Master
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            User Details
          </p>
        </div>

        {/* Add User Button */}
        <Button
          variant="warning"
          onClick={() => navigate("/masters/users/add")}
          className="w-full sm:w-auto"
        >
          + Add User
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search Users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        search={search}
        onDelete={handleDelete}
      />
    </>
  );
};

export default Users;