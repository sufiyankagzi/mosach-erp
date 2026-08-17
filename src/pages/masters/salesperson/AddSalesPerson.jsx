import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";

import FormInput from "../../../components/form/FormInput";
import FormCheckbox from "../../../components/form/FormCheckbox";
import Button from "../../../components/Button";
import api from "../../../api/axios";

const AddSalesPerson = () => {
  console.log("🔥🔥🔥 ADD SALES PERSON COMPONENT");

  const navigate = useNavigate();
    
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    salesperson: "",
    mobileno: "",
    isactive: 1,
  });

  // =========================
  // GET SALES PERSON FOR EDIT
  // =========================
  useEffect(() => {
    if (id) {
      getSalesPerson();
    }
  }, [id]);

  const getSalesPerson = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/salesperson/${id}`);

      setFormData({
        salesperson: res.data.salesperson || "",
        mobileno: res.data.mobileno || "",
        isactive: res.data.isactive ?? 1,
      });
    } catch (error) {
      console.error("GET SALES PERSON ERROR:", error);

      Swal.fire(
        "Error",
        error.response?.data?.message ||
          "Unable to load sales person.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
            ? 1
            : 0
          : value,
    }));
  };

  // =========================
  // VALIDATION
  // =========================
  const validate = () => {
    if (!formData.salesperson.trim()) {
      Swal.fire(
        "Error",
        "Sales person name is required",
        "error"
      );
      return false;
    }

    

    if (!formData.mobileno.trim()) {
      Swal.fire(
        "Error",
        "Sales person mobile no. is required",
        "error"
      );
      return false;
    }

    return true;
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // Only send required fields
      const payload = {
        salesperson: formData.salesperson.trim(),
        mobileno: formData.mobileno.trim(),
        isactive: formData.isactive,
      };

      if (isEdit) {
        // =========================
        // UPDATE
        // =========================
        await api.put(
          `/salesperson/${id}`,
          payload
        );

        await Swal.fire(
          "Success",
          "Sales Person Updated Successfully",
          "success"
        );
      } else {
        // =========================
        // CREATE
        // =========================
        await api.post(
          "/salesperson",
          payload
        );

        await Swal.fire(
          "Success",
          "Sales Person Added Successfully",
          "success"
        );
      }

      navigate("/masters/salesperson");

    } catch (error) {
      console.error(
        "SALES PERSON SAVE ERROR:",
        error
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "DATA:",
        error.response?.data
      );

      Swal.fire(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="space-y-6">

      {/* =========================
          HEADER
      ========================= */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Sales Person Master
          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            {isEdit
              ? "Edit Sales Person"
              : "Add New Sales Person"}
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

      {/* =========================
          MAIN CARD
      ========================= */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        {/* =========================
            GENERAL INFORMATION
        ========================= */}
        <div className="border-b px-4 sm:px-6 py-4 bg-[#0A4B57]">
          <h2 className="text-lg font-semibold text-white">
            General Information
          </h2>
        </div>

        <div className="p-4 sm:p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {/* SALES PERSON NAME */}
            <FormInput
              label="Sales Person Name"
              name="salesperson"
              value={formData.salesperson}
              onChange={handleChange}
              required
              next="mobileno"
            />


          </div>

        </div>


        <div className="p-4 sm:p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {/* MOBILE */}
            <FormInput
              label="Mobile No."
              name="mobileno"
              value={formData.mobileno}
              onChange={handleChange}
              required
              next="isactive"
            />

           

          </div>

        </div>

        {/* =========================
            STATUS
        ========================= */}
        <div className="p-4 sm:p-6">

          <FormCheckbox
            label="Active Sales Person"
            name="isactive"
            checked={Boolean(formData.isactive)}
            onChange={handleChange}
            onLastEnter={handleSubmit}
          />

        </div>

        {/* =========================
            BUTTONS
        ========================= */}
        <div className="border-t p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-end gap-3">

          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="w-full sm:w-40 py-2.5 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
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
              ? "Update Sales Person"
              : "Save Sales Person"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default AddSalesPerson;