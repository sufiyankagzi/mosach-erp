import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCloudUploadAlt } from "react-icons/fa";
import Button from "../../../components/Button";

const AddCompany = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Company Master
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Add New Company
          </p>
        </div>

        <Button
          variant="warning"
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto justify-center"
        >
          <FaArrowLeft />
          Back
        </Button>

      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        {/* General Information */}
        <div className="border-b px-4 sm:px-6 py-4 bg-[#0A4B57]">
          <h2 className="text-lg font-semibold text-white">
            General Information
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <Input label="Company Code *" />
            <Input label="Company Name *" />
            <Input label="GST No" />
            <Input label="PAN No" />
            <Input label="Financial Year" />
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-y px-4 sm:px-6 py-4 bg-[#0A4B57]">
          <h2 className="text-lg font-semibold text-white">
            Contact Information
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <Input label="Mobile" />
            <Input label="Phone" />
            <Input label="Email" />
            <Input label="Website" />
            <Input label="Contact Person" />
          </div>
        </div>
                {/* Address Information */}
        <div className="border-y px-4 sm:px-6 py-4 bg-[#0A4B57]">
          <h2 className="text-lg font-semibold text-white">
            Address Information
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-5">

            <TextArea label="Address Line 1" />
            <TextArea label="Address Line 2" />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <Input label="City" />
              <Input label="State" />
              <Input label="Country" />
              <Input label="Pincode" />
            </div>

          </div>
        </div>

        {/* Branding */}
        <div className="border-y px-4 sm:px-6 py-4 bg-[#0A4B57]">
          <h2 className="text-lg font-semibold text-white">
            Branding
          </h2>
        </div>

        <div className="p-4 sm:p-6">

          <label className="border-2 border-dashed rounded-xl h-40 sm:h-44 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition">

            <FaCloudUploadAlt
              size={45}
              className="text-gray-400"
            />

            <p className="mt-3 text-center text-gray-500 px-2">
              Upload Company Logo
            </p>

            <input
              type="file"
              hidden
            />

          </label>

        </div>

        {/* Settings */}
        <div className="border-y px-4 sm:px-6 py-4 bg-[#0A4B57]">
          <h2 className="text-lg font-semibold text-white">
            Settings
          </h2>
        </div>

        <div className="p-4 sm:p-6">

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4"
            />

            <span>Active Company</span>
          </label>

        </div>

        {/* Footer */}
        <div className="border-t p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-end gap-3">

          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-40 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            className="w-full sm:w-44 py-2.5 bg-[#FF7A1A] text-white rounded-lg hover:bg-orange-600 transition"
          >
            Save Company
          </button>

        </div>

      </div>

    </div>
  );
};

const Input = ({ label }) => (
  <div>
    <label className="block text-sm font-medium mb-1 text-slate-700">
      {label}
    </label>

    <input
      type="text"
      className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#0A4B57] focus:border-transparent"
    />
  </div>
);

const Select = ({ label }) => (
  <div>
    <label className="block text-sm font-medium mb-1 text-slate-700">
      {label}
    </label>

    <select
      className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#0A4B57] focus:border-transparent"
    >
      <option>Select</option>
    </select>
  </div>
);

const TextArea = ({ label }) => (
  <div>
    <label className="block text-sm font-medium mb-1 text-slate-700">
      {label}
    </label>

    <textarea
      rows={3}
      className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A4B57] focus:border-transparent"
    />
  </div>
);

export default AddCompany;