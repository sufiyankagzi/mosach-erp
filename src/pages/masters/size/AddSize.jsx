import { useEffect, useState,useRef   } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";

import FormInput from "../../../components/form/FormInput";
import Button from "../../../components/Button";
import api from "../../../api/axios";

const AddSize = () => {
    const sizeInputRef = useRef(null);
  const navigate = useNavigate();

  const { id } = useParams();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [sizeGroups, setSizeGroups] = useState([]);

  const [formData, setFormData] = useState({
    sizegroupid: "",
    size: ""
  });


  // ========================================
  // GET SIZE GROUP
  // ========================================

  const getSizeGroups = async () => {

    try {

      const res = await api.get("/sizegroup");

      console.log(
        "SIZE GROUP API RESPONSE:",
        res.data
      );

      setSizeGroups(res.data);

    } catch (error) {

      console.error(
        "GET SIZE GROUP ERROR:",
        error
      );

      Swal.fire(
        "Error",
        error.response?.data?.message ||
          "Unable to load size groups.",
        "error"
      );

    }

  };


  // ========================================
  // GET SIZE FOR EDIT
  // ========================================

  const getSize = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        `/size/${id}`
      );

      console.log(
        "GET SIZE RESPONSE:",
        res.data
      );

      setFormData({

        sizegroupid:
          res.data.sizegroupid
            ? String(res.data.sizegroupid)
            : "",

        size:
          res.data.size || ""

      });

    } catch (error) {

      console.error(
        "GET SIZE ERROR:",
        error
      );

      Swal.fire(
        "Error",
        error.response?.data?.message ||
          "Unable to load size.",
        "error"
      );

    } finally {

      setLoading(false);

    }

  };


  // ========================================
  // LOAD DATA
  // ========================================

  useEffect(() => {

    getSizeGroups();

    if (id) {
      getSize();
    }

  }, [id]);


  // ========================================
  // HANDLE INPUT
  // ========================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

  };


  // ========================================
  // VALIDATION
  // ========================================

  const validate = () => {

    if (!formData.sizegroupid) {

      Swal.fire(
        "Error",
        "Size Group is required",
        "error"
      );

      return false;

    }


    if (!formData.size.toString().trim()) {

      Swal.fire(
        "Error",
        "Size is required",
        "error"
      );

      return false;

    }


    return true;

  };


  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async () => {

    if (!validate()) return;


    try {

      setLoading(true);


      // ========================================
      // PAYLOAD
      // ========================================

      const payload = {

        sizegroupid:
          Number(formData.sizegroupid),

        size:
          formData.size.toString().trim()

      };


      console.log(
        "SIZE SAVE PAYLOAD:",
        payload
      );


      // ========================================
      // UPDATE
      // ========================================

      if (isEdit) {

        await api.put(
          `/size/${id}`,
          payload
        );

        await Swal.fire(
          "Success",
          "Size Updated Successfully",
          "success"
        );

      }


      // ========================================
      // CREATE
      // ========================================

      else {

        await api.post(
          "/size",
          payload
        );

        await Swal.fire(
          "Success",
          "Size Added Successfully",
          "success"
        );

      }


      navigate("/masters/size");

    } catch (error) {

      console.error(
        "SIZE SAVE ERROR:",
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


  // ========================================
  // UI
  // ========================================

  return (

    <div className="space-y-6">


      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">

            Size Master

          </h1>


          <p className="text-slate-500 mt-1 text-sm sm:text-base">

            {isEdit
              ? "Edit Size"
              : "Add New Size"}

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


      {/* ========================================
          MAIN CARD
      ======================================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">


        {/* ========================================
            GENERAL INFORMATION
        ======================================== */}

        <div className="border-b px-4 sm:px-6 py-4 bg-[#0A4B57]">

          <h2 className="text-lg font-semibold text-white">

            General Information

          </h2>

        </div>


        <div className="p-4 sm:p-6">


          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">


            {/* ========================================
                SIZE GROUP
            ======================================== */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-1">

                Size Group
                <span className="text-red-500 ml-1">
                  *
                </span>

              </label>


              <select
  name="sizegroupid"
  value={formData.sizegroupid}
  onChange={handleChange}
  disabled={loading}
  onKeyDown={(e) => {

    if (e.key === "Enter") {

      e.preventDefault();

      sizeInputRef.current?.focus();

    }

  }}
  className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
>

                <option value="">
                  Select Size Group
                </option>


                {sizeGroups.map((item) => (

                  <option
                    key={item.sizegroupid}
                    value={item.sizegroupid}
                  >

                    {item.sizegroup}

                  </option>

                ))}

              </select>

            </div>


            {/* ========================================
                SIZE
            ======================================== */}

            <FormInput

              label="Size"
                ref={sizeInputRef}
              name="size"

              value={formData.size}

              onChange={handleChange}

              required

              onLastEnter={handleSubmit}

            />


          </div>

        </div>


        {/* ========================================
            BUTTONS
        ======================================== */}

        <div className="border-t p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-end gap-3">


          {/* CANCEL */}

          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="w-full sm:w-40 py-2.5 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >

            Cancel

          </button>


          {/* SAVE / UPDATE */}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-44 py-2.5 bg-[#FF7A1A] text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {loading

              ? "Please Wait..."

              : isEdit

              ? "Update Size"

              : "Save Size"

            }

          </button>


        </div>

      </div>

    </div>

  );

};


export default AddSize;