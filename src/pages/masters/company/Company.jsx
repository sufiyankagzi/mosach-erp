import { useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CompanyTable from "./CompanyTable";
import Button from "../../../components/Button";

const Company = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Company Master
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Manage Company Details
          </p>
        </div>

        <Button
          variant="warning"
          icon={<FaPlus />}
          onClick={() => navigate("/masters/company/add")}
          className="w-full sm:w-auto justify-center"
        >
          Add Company
        </Button>

      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-4">

        <div className="relative w-full sm:w-80">

          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search Company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]"
          />

        </div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <CompanyTable search={search} />
      </div>

    </div>
  );
};

export default Company;