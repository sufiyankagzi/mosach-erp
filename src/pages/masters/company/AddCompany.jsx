import FormInput from "../../../components/form/FormInput";
import FormCheckbox from "../../../components/form/FormCheckbox";
import FormTextarea from "../../../components/form/FormTextarea";
import FormSelect from "../../../components/form/FormSelect";
import FormUpload from "../../../components/form/FormUpload"
import { FaArrowLeft, FaCloudUploadAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import Button from "../../../components/Button";
import { validateEmail, validateGST, validatePAN, validateMobile, } from "../../../utils/validators";
const AddCompany = () => {
  const [logo, setLogo] = useState(null);
const [preview, setPreview] = useState("");
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    companycode: "",
    companyname: "",
    gstno: "",
    panno: "",
    mobileno: "",
    whatsappno: "",
    email: "",
    website: "",
    contactperson: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    logo: "",
    isactive: 1,
  });
  const handleLogoChange = (e) => {

  const file = e.target.files[0];

  if (!file) return;

  setLogo(file);

  setPreview(URL.createObjectURL(file));

};

const removeLogo = () => {

  setLogo(null);

  setPreview("");

};
  useEffect(() => {
    if (id) {
      getCompany();
    }
  }, [id]);

  const getCompany = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/company/${id}`);
      setFormData(res.data);
    }
    catch (error) {
      console.log(error);
      Swal.fire(
        "Error",
        "Unable to load company.",
        "error"
      );
    }
    finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? checked ? 1 : 0
        : value
    }));
  };

  const handleSubmit = async () => {
    
    if (!validate()) return;
    try {
      setLoading(true);
      if (isEdit) {
        await api.put(
          `/company/${id}`,
          formData
        );
        Swal.fire(
          "Success",
          "Company Updated Successfully",
          "success"
        );
      }
      else {
        await api.post(
          "/company",
          formData
        );
        Swal.fire(
          "Success",
          "Company Added Successfully",
          "success"
        );
      }
      navigate("/masters/company");
    }
    catch (error) {
      console.log(error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Something went wrong",
        "error"
      );
    }
    finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const validate = () => {

    if (!formData.companycode.trim()) {
      Swal.fire("Error", "Company Code is required", "error");
      return false;
    }

    if (!formData.companyname.trim()) {
      Swal.fire("Error", "Company Name is required", "error");
      return false;
    }

    if (formData.gstno && !validateGST(formData.gstno.toUpperCase())) {
      Swal.fire("Error", "Invalid GST Number", "error");
      return false;
    }

    if (formData.panno && !validatePAN(formData.panno.toUpperCase())) {
      Swal.fire("Error", "Invalid PAN Number", "error");
      return false;
    }

    if (formData.email && !validateEmail(formData.email)) {
      Swal.fire("Error", "Invalid Email", "error");
      return false;
    }

    if (formData.mobileno && !validateMobile(formData.mobileno)) {
      Swal.fire("Error", "Invalid Mobile Number", "error");
      return false;
    }

    return true;
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Company Master
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            {isEdit ? "Edit Company" : "Add New Company"}
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

      
        <div className="bg-white rounded-xl shadow overflow-hidden">

          <div className="border-b px-4 sm:px-6 py-4 bg-[#0A4B57]">
            <h2 className="text-lg font-semibold text-white">
              General Information
            </h2>
          </div>

          <div className="p-4 sm:p-6">

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <FormInput
                label="Company Code "
                name="companycode"
                value={formData.companycode}
                onChange={handleChange}
                required
                next="companyname"
              />
             
              <FormInput
                label="Company Name "
                name="companyname"
                value={formData.companyname}
                onChange={handleChange}
                required
                next="gstno"
              />
             
             <FormInput
                label="GST No"
                name="gstno"
                value={formData.gstno}
                onChange={handleChange}
                required
                next="panno"
              />
              <FormInput
                label="PAN No"
                name="panno"
                value={formData.panno}
                onChange={handleChange}
                required
                next="mobileno"
              />
              

            </div>

          </div>
          <div className="border-y px-4 sm:px-6 py-4 bg-[#0A4B57]">
            <h2 className="text-lg font-semibold text-white">
              Contact Information
            </h2>
          </div>

          <div className="p-4 sm:p-6">

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <FormInput
                label="Mobile"
                name="mobileno"
                value={formData.mobileno}
                onChange={handleChange}
                required
                next="whatsappno"
              />

              <FormInput
                label="WhatsApp"
                name="whatsappno"
                value={formData.whatsappno}
                onChange={handleChange}
                required
                next="email"
              />

              <FormInput
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                next="website"
              />

              <FormInput
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                next="contactperson"
              />

              <FormInput
                label="Contact Person"
                name="contactperson"
                value={formData.contactperson}
                onChange={handleChange}
                next="address1"
              />

              

            </div>

          </div>
          <div className="border-y px-4 sm:px-6 py-4 bg-[#0A4B57]">
            <h2 className="text-lg font-semibold text-white">
              Address Information
            </h2>
          </div>

          <div className="p-4 sm:p-6">

            <div className="space-y-5">

              <FormTextarea
    label="Address Line 1"
    name="address1"
    value={formData.address1}
    onChange={handleChange}
    next="address2"
/>

<FormTextarea
    label="Address Line 2"
    name="address2"
    value={formData.address2}
    onChange={handleChange}
    next="city"
/>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                <FormInput
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                next="state"
              />

               <FormInput
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                next="country"
              />

              <FormSelect
    label="Country"
    name="country"
    value={formData.country}
    onChange={handleChange}
    options={[
        { value: "India", label: "India" },
        { value: "USA", label: "USA" },
        { value: "Dubai", label: "Dubai" },
    ]}
    next="pincode"
/>
                
                
              <FormInput
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                next="isactive"
              />
               
              </div>

            </div>

          </div>
          <div className="border-y px-4 sm:px-6 py-4 bg-[#0A4B57]">

            <h2 className="text-lg font-semibold text-white">
              Settings
            </h2>

          </div>

          <div className="p-4 sm:p-6">
<FormUpload
    label="Company Logo"
    name="logo"
    file={logo}
    preview={preview}
    onChange={handleLogoChange}
    onRemove={removeLogo}
    onLastEnter={handleSubmit}
/>
            <label className="flex items-center gap-3">
              <FormCheckbox
  label="Active Company"
  name="isactive"
  checked={formData.isactive}
  onChange={handleChange}
  onLastEnter={handleSubmit}
/>
             


            </label>

          </div>
          <div className="border-t p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-end gap-3">

            <button
            type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-40 py-2.5 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-44 py-2.5 bg-[#FF7A1A] text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Please Wait..."
                : isEdit
                  ? "Update Company"
                  : "Save Company"}
            </button>

          </div>

        </div>
        
    </div>

    // <div className="space-y-6">

    //   {/* Header */}
    //   <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

    //     <div>
    //       <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
    //         Company Master
    //       </h1>

    //       <p className="text-slate-500 mt-1 text-sm sm:text-base">
    //         Add New Company
    //       </p>
    //     </div>

    //     <Button
    //       variant="warning"
    //       onClick={() => navigate(-1)}
    //       className="w-full sm:w-auto justify-center"
    //     >
    //       <FaArrowLeft />
    //       Back
    //     </Button>

    //   </div>

    //   {/* Card */}
    //   <div className="bg-white rounded-xl shadow overflow-hidden">

    //     {/* General Information */}
    //     <div className="border-b px-4 sm:px-6 py-4 bg-[#0A4B57]">
    //       <h2 className="text-lg font-semibold text-white">
    //         General Information
    //       </h2>
    //     </div>

    //     <div className="p-4 sm:p-6">
    //       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    //         <Input label="Company Code *" />
    //         <Input label="Company Name *" />
    //         <Input label="GST No" />
    //         <Input label="PAN No" />
    //       </div>
    //     </div>

    //     {/* Contact Information */}
    //     <div className="border-y px-4 sm:px-6 py-4 bg-[#0A4B57]">
    //       <h2 className="text-lg font-semibold text-white">
    //         Contact Information
    //       </h2>
    //     </div>

    //     <div className="p-4 sm:p-6">
    //       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    //         <Input label="Mobile" />
    //         <Input label="Phone" />
    //         <Input label="Email" />
    //         <Input label="Website" />
    //         <Input label="Contact Person" />
    //       </div>
    //     </div>
    //     {/* Address Information */}
    //     <div className="border-y px-4 sm:px-6 py-4 bg-[#0A4B57]">
    //       <h2 className="text-lg font-semibold text-white">
    //         Address Information
    //       </h2>
    //     </div>

    //     <div className="p-4 sm:p-6">
    //       <div className="space-y-5">

    //         <TextArea label="Address Line 1" />
    //         <TextArea label="Address Line 2" />

    //         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
    //           <Input label="City" />
    //           <Input label="State" />
    //           <Input label="Country" />
    //           <Input label="Pincode" />
    //         </div>

    //       </div>
    //     </div>

    //     {/* Branding */}
    //     <div className="border-y px-4 sm:px-6 py-4 bg-[#0A4B57]">
    //       <h2 className="text-lg font-semibold text-white">
    //         Branding
    //       </h2>
    //     </div>

    //     <div className="p-4 sm:p-6">

    //       <label className="border-2 border-dashed rounded-xl h-40 sm:h-44 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition">

    //         <FaCloudUploadAlt
    //           size={45}
    //           className="text-gray-400"
    //         />

    //         <p className="mt-3 text-center text-gray-500 px-2">
    //           Upload Company Logo
    //         </p>

    //         <input
    //           type="file"
    //           hidden
    //         />

    //       </label>

    //     </div>

    //     {/* Settings */}
    //     <div className="border-y px-4 sm:px-6 py-4 bg-[#0A4B57]">
    //       <h2 className="text-lg font-semibold text-white">
    //         Settings
    //       </h2>
    //     </div>

    //     <div className="p-4 sm:p-6">

    //       <label className="flex items-center gap-3">
    //         <input
    //           type="checkbox"
    //           defaultChecked
    //           className="w-4 h-4"
    //         />

    //         <span>Active Company</span>
    //       </label>

    //     </div>

    //     {/* Footer */}
    //     <div className="border-t p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-end gap-3">

    //       <button
    //         onClick={() => navigate(-1)}
    //         className="w-full sm:w-40 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
    //       >
    //         Cancel
    //       </button>

    //       <button
    //         className="w-full sm:w-44 py-2.5 bg-[#FF7A1A] text-white rounded-lg hover:bg-orange-600 transition"
    //       >
    //         Save Company
    //       </button>

    //     </div>

    //   </div>

    // </div>
  );
};



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

const TextArea = ({
  label,
  name,
  value,
  onChange,
}) => (
  <div>
    <label className="block text-sm font-medium mb-1 text-slate-700">
      {label}
    </label>

    <textarea
      rows={3}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#0A4B57] focus:border-transparent"
    />
  </div>
);

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
}) => (
  <div>
    <label className="block text-sm font-medium mb-1 text-slate-700">
      {label}
    </label>

    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full h-11 border border-gray-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-[#0A4B57]"
    />
  </div>
);

export default AddCompany;