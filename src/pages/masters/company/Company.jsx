import { useEffect, useState } from "react";
import api from "../../../api/axios";
import CompanyTable from "./CompanyTable";
import Button from "../../../components/Button";
import {  useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Company = () => {
  

  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
const handleDelete = async (id) => {
  console.log("Delete Clicked", id);

  const result = await Swal.fire({
    title: "Delete Company?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel",
  });

  // Pehle check karo user ne confirm kiya ya nahi
  if (!result.isConfirmed) return;

  try {
    console.log("Deleting ID:", id);

    const res = await api.delete(`/company/${id}`);

    console.log("API Response:", res.data);

    getCompanies();

    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Company deleted successfully.",
      timer: 1500,
      showConfirmButton: false,
    });

  } catch (err) {
    console.log("Delete Error:", err);

    Swal.fire({
      icon: "error",
      title: "Delete Failed",
      text: err.response?.data?.message || err.message,
    });
  }
};

const filteredCompanies = companies.filter((company) => {
  const keyword = search.trim().toLowerCase();

  return (
    company.companyname?.toLowerCase().includes(keyword) ||
    company.gstno?.toLowerCase().includes(keyword) ||
    company.mobileno?.includes(search.trim())
  );
});

  const getCompanies = async () => {
const res = await api.get("/company");
    try {

      const res = await api.get("/company");
console.log(res.data);
      setCompanies(res.data);

    } catch (error) {

      console.log(error);

    }

  };


  useEffect(() => {

    getCompanies();

  }, []);





console.log("handleDelete =", handleDelete);

return (
  <>

    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">


      {/* Left Content */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Company Master
        </h1>

        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Company Details-Sufiyan
        </p>
      </div>



      {/* Right Button */}
      <Button
        variant="warning"
        onClick={() => navigate("/masters/company/add")}
        className="w-full sm:w-auto"
      >
        + Add Company
      </Button>


    </div>



    {/* Search */}
    <div className="mb-6">

      <input
        type="text"
        placeholder="Search by Company Name / Mobile / GSTIN"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
          border
          p-2
          rounded-lg
          w-full
          sm:w-96
          text-left
          focus:outline-none
          focus:ring-2
          focus:ring-[#0A4B57]
        "
      />

    </div>



    <CompanyTable
      companies={filteredCompanies}
      search={search}
      onDelete={handleDelete}
    />


  </>
);

};


export default Company;