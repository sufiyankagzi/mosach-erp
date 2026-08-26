import { useEffect, useState } from "react";
import api from "../../../api/axios";
import SizeTable from "./SizeTable";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";

const Size = () => {

  const navigate = useNavigate();

  const [size, setSize] = useState([]);
  const [search, setSearch] = useState("");


  // ========================================
  // GET ALL SIZE
  // ========================================
  const getSize = async () => {

    try {

      const res = await api.get("/size");

      console.log(
        "Size API Response:",
        res.data
      );

      setSize(res.data);

    } catch (error) {

      console.log(
        "Get Size Error:",
        error
      );

      setSize([]);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Unable to load size.",
      });

    }

  };


  // ========================================
  // DELETE SIZE
  // ========================================
  const handleDelete = async (id) => {

    const result = await Swal.fire({

      title: "Delete Size?",

      text: "This action cannot be undone!",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Yes, Delete",

      cancelButtonText: "Cancel",

    });


    if (!result.isConfirmed) return;


    try {

      console.log(
        "Deleting Size ID:",
        id
      );


      const res = await api.delete(
        `/size/${id}`
      );


      console.log(
        "Delete API Response:",
        res.data
      );


      // Refresh ALL Size
      await getSize();


      Swal.fire({

        icon: "success",

        title: "Deleted!",

        text: "Size deleted successfully.",

        timer: 1500,

        showConfirmButton: false,

      });


    } catch (err) {

      console.log(
        "Delete Error:",
        err
      );


      Swal.fire({

        icon: "error",

        title: "Delete Failed",

        text:
          err.response?.data?.message ||
          err.message ||
          "Unable to delete size.",

      });

    }

  };


  // ========================================
  // SEARCH
  // ========================================
  const filteredSize = size.filter((item) => {

    const keyword =
      search.trim().toLowerCase();


    if (!keyword) return true;


    return (

      item.size
        ?.toString()
        .toLowerCase()
        .includes(keyword)

      ||

      item.sizegroup
        ?.toString()
        .toLowerCase()
        .includes(keyword)

    );

  });


  // ========================================
  // LOAD SIZE
  // ========================================
  useEffect(() => {

    getSize();

  }, []);


  // ========================================
  // UI
  // ========================================
  return (
    <>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">

        {/* LEFT CONTENT */}

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Size
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Size Details
          </p>

        </div>


        {/* ADD SIZE BUTTON */}

        <Button
          variant="warning"
          onClick={() =>
            navigate("/masters/size/add")
          }
          className="w-full sm:w-auto"
        >
          + Add Size
        </Button>

      </div>


      {/* SEARCH */}

      <div className="relative mb-4">

        <FiSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search Size or Size Group..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>


      {/* SIZE TABLE */}

      <SizeTable
        size={filteredSize}
        onDelete={handleDelete}
      />

    </>
  );

};

export default Size;