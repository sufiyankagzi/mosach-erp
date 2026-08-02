import { useEffect, useState } from "react";

const CompanyModal = ({ open, onClose, editingCompany }) => {
  const initialState = {
    companyName: "",
    companyCode: "",
    gstNo: "",
    panNo: "",
    mobile: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    status: "Active",
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (editingCompany) {
      setFormData({
        ...initialState,
        ...editingCompany,
      });
    } else {
      setFormData(initialState);
    }
  }, [editingCompany]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log(formData);

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-2">

      <div className="bg-white rounded-xl shadow-xl w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto">

        {/* Header */}

        <div className="bg-[#0A4B57] text-white px-6 py-2 rounded-t-xl flex justify-between items-center">

          <h2 className="text-xl font-semibold">
            {editingCompany ? "Edit Company" : "Add Company"}
          </h2>

          <button
            onClick={onClose}
            className="text-3xl hover:text-red-300"
          >
            ×
          </button>

        </div>

        {/* Body */}

        <div className="p-6 ">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            <div className=" py-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
  Company Name *
</label>

<input
  className="w-full h-10 border border-gray-300 rounded-md px-3 focus:ring-2 focus:ring-[#0A4B57] focus:outline-none"
/>
            </div>

            <div>
              <label>Company Code *</label>

              <input
                name="companyCode"
                value={formData.companyCode}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label>GST No</label>

              <input
                name="gstNo"
                value={formData.gstNo}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label>PAN No</label>

              <input
                name="panNo"
                value={formData.panNo}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label>Mobile</label>

              <input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label>Phone</label>

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label>Email</label>

              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label>Website</label>

              <input
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div className="col-span-full">
              <label>Address</label>

              <textarea
                rows="1"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label>City</label>

              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label>State</label>

              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label>Country</label>

              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label>Pincode</label>

              <input
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>

            <div>
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

          </div>

          <div className="flex justify-end gap-3 mt-8">

            <button
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#FF7A1A] text-white rounded-lg hover:bg-orange-600"
            >
              Save
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CompanyModal;