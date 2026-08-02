import { useEffect, useState } from "react";
import api from "../../../api/axios";
import CompanyTable from "./CompanyTable";
import Button from "../../../components/Button";
import {  useNavigate } from "react-router-dom";
const Company = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const getCompanies = async () => {

    try {

      const res = await api.get("/company");

      setCompanies(res.data);

    } catch (error) {

      console.log(error);

    }

  };


  useEffect(() => {

    getCompanies();

  }, []);



  const deleteCompany = async (id) => {

    try {

      await api.delete(`/company/${id}`);

      getCompanies();

    } catch (error) {

      console.log(error);

    }

  };



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
        placeholder="Search Company..."
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
      companies={companies}
      search={search}
      onDelete={deleteCompany}
    />


  </>
);

};


export default Company;