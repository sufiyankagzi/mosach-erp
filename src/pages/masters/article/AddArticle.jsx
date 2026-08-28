import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { FaArrowLeft, FaTrash, FaImage } from "react-icons/fa";

import FormInput from "../../../components/form/FormInput";
import Button from "../../../components/Button";
import api from "../../../api/axios";


const AddArticle = () => {
  const IMAGE_BASE_URL = "https://mosach-erp-server.onrender.com";
  const articleNameInputRef = useRef(null);
  const categoryInputRef = useRef(null);
  const sizeGroupInputRef = useRef(null);
  const genderInputRef = useRef(null);
  const colorInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const { id } = useParams();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  // ========================================
  // MASTER DATA
  // ========================================

  const [categories, setCategories] = useState([]);
  const [sizeGroups, setSizeGroups] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [genders, setGenders] = useState([]);
  const [colors, setColors] = useState([]);


  // ========================================
  // FORM DATA
  // ========================================

  const [formData, setFormData] = useState({

    articleno: "",
    articlename: "",
    categoryid: "",
    sizegroupid: "",
    genderid: "",
    isactive: 1

  });


  // ========================================
  // SELECTED SIZES
  // ========================================

  const [selectedSizes, setSelectedSizes] = useState([]);


  // ========================================
  // SELECTED COLORS
  // ========================================

  const [selectedColors, setSelectedColors] = useState([]);


  // ========================================
  // IMAGES
  // ========================================

  const [images, setImages] = useState([]);


  // ========================================
  // EXISTING IMAGES
  // ========================================

  const [existingImages, setExistingImages] = useState([]);


  // ========================================
  // GET CATEGORIES
  // ========================================

  const getCategories = async () => {

    try {

      const res = await api.get("/category");

      setCategories(res.data);

    } catch (error) {

      console.error("GET CATEGORY ERROR:", error);

      Swal.fire(
        "Error",
        error.response?.data?.message ||
        "Unable to load categories.",
        "error"
      );

    }

  };


  // ========================================
  // GET SIZE GROUPS
  // ========================================

  const getSizeGroups = async () => {

    try {

      const res = await api.get("/sizegroup");

      setSizeGroups(res.data);

    } catch (error) {

      console.error("GET SIZE GROUP ERROR:", error);

      Swal.fire(
        "Error",
        error.response?.data?.message ||
        "Unable to load size groups.",
        "error"
      );

    }

  };


  // ========================================
  // GET SIZES
  // ========================================

  const getSizes = async (sizegroupid) => {

    if (!sizegroupid) {

      setSizes([]);
      setSelectedSizes([]);

      return;

    }

    try {

      const res = await api.get("/size");

      const filtered = res.data.filter(
        (item) =>
          Number(item.sizegroupid) ===
          Number(sizegroupid)
      );

      console.log(
        "FILTERED SIZES:",
        filtered
      );

      setSizes(filtered);

    } catch (error) {

      console.error(
        "GET SIZE ERROR:",
        error
      );

      Swal.fire(
        "Error",
        error.response?.data?.message ||
        "Unable to load sizes.",
        "error"
      );

    }

  };


  // ========================================
  // GET GENDERS
  // ========================================

  const getGenders = async () => {

    try {

      const res = await api.get("/gender");

      setGenders(res.data);

    } catch (error) {

      console.error(
        "GET GENDER ERROR:",
        error
      );

      Swal.fire(
        "Error",
        error.response?.data?.message ||
        "Unable to load genders.",
        "error"
      );

    }

  };


  // ========================================
  // GET COLORS
  // ========================================

  const getColors = async () => {

    try {

      const res = await api.get("/color");

      setColors(res.data);

    } catch (error) {

      console.error(
        "GET COLOR ERROR:",
        error
      );

      Swal.fire(
        "Error",
        error.response?.data?.message ||
        "Unable to load colors.",
        "error"
      );

    }

  };


  // ========================================
  // GET ARTICLE FOR EDIT
  // ========================================

  const getArticle = async () => {

    try {

      setLoading(true);

      const res = await api.get(
        `/article/getarticle/${id}`
      );

      const data = res.data;

      setFormData({

        articleno:
          data.articleno || "",

        articlename:
          data.articlename || "",

        categoryid:
          data.categoryid
            ? String(data.categoryid)
            : "",

        sizegroupid:
          data.sizegroupid
            ? String(data.sizegroupid)
            : "",

        genderid:
          data.genderid
            ? String(data.genderid)
            : "",

        isactive:
          data.isactive !== undefined
            ? Number(data.isactive)
            : 1

      });

      if (data.sizegroupid) {

        await getSizes(
          data.sizegroupid
        );

      }

    } catch (error) {

      console.error(
        "GET ARTICLE ERROR:",
        error
      );

      Swal.fire(
        "Error",
        error.response?.data?.message ||
        "Unable to load article.",
        "error"
      );

    } finally {

      setLoading(false);

    }

  };


  // ========================================
  // GET EXISTING VARIANTS
  // ========================================

  const getVariants = async () => {

    if (!id) return;

    try {

      const res = await api.get(
        `/article/getvariants/${id}`
      );

      console.log(
        "ARTICLE VARIANTS:",
        res.data
      );

      const variants = res.data;

      const sizeIds = [
        ...new Set(
          variants
            .map(item => item.sizeid)
            .filter(Boolean)
            .map(Number)
        )
      ];

      const colorIds = [
        ...new Set(
          variants
            .map(item => item.colorid)
            .filter(Boolean)
            .map(Number)
        )
      ];

      if (variants.length > 0) {

        setFormData(prev => ({
          ...prev,
          genderid:
            variants[0].genderid
              ? String(variants[0].genderid)
              : ""
        }));

      }

      setSelectedSizes(sizeIds);
      setSelectedColors(colorIds);

    } catch (error) {

      console.error(
        "GET VARIANTS ERROR:",
        error
      );

    }

  };


  // ========================================
  // GET EXISTING IMAGES
  // ========================================

  const getImages = async () => {
    
    if (!id) return;

    try {

      const res = await api.get(
        `/article/getimages/${id}`
      );

      console.log(
        "ARTICLE IMAGES:",
        res.data
      );

      setExistingImages(res.data);

    } catch (error) {

      console.error(
        "GET IMAGES ERROR:",
        error
      );

    }

  };


  // ========================================
  // LOAD DATA
  // ========================================

  useEffect(() => {

    getCategories();

    getSizeGroups();

    getGenders();

    getColors();

    if (id) {

      getArticle();
      getVariants();
      getImages();

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

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));


    // SIZE GROUP CHANGE

    if (name === "sizegroupid") {

      setSelectedSizes([]);

      getSizes(value);

    }

  };


  // ========================================
  // SIZE SELECT
  // ========================================

  const handleSizeChange = (sizeid) => {

    const numericId = Number(sizeid);

    setSelectedSizes(prev => {

      if (prev.includes(numericId)) {

        return prev.filter(
          id => id !== numericId
        );

      }

      return [
        ...prev,
        numericId
      ];

    });

  };


  // ========================================
  // COLOR SELECT
  // ========================================

  const handleColorChange = (colorid) => {

    const numericId = Number(colorid);

    setSelectedColors(prev => {

      if (prev.includes(numericId)) {

        return prev.filter(
          id => id !== numericId
        );

      }

      return [
        ...prev,
        numericId
      ];

    });

  };


  // ========================================
  // IMAGE SELECT
  // ========================================

  const handleImageChange = (e) => {

    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;


    const newImages = files.map(
      (file, index) => ({

        file,

        preview:
          URL.createObjectURL(file),

        isprimary:
          images.length === 0 &&
          index === 0

      })
    );


    setImages(prev => [
      ...prev,
      ...newImages
    ]);


    e.target.value = "";

  };


  // ========================================
  // REMOVE NEW IMAGE
  // ========================================

  const removeImage = (index) => {

    setImages(prev =>
      prev.filter(
        (_, i) => i !== index
      )
    );

  };


  // ========================================
  // SET PRIMARY IMAGE
  // ========================================

  const setPrimaryImage = (index) => {

    setImages(prev =>
      prev.map(
        (item, i) => ({
          ...item,
          isprimary: i === index
        })
      )
    );

  };


  // ========================================
  // DELETE EXISTING IMAGE
  // ========================================

  const deleteExistingImage = async (
    imageid
  ) => {

    const result =
      await Swal.fire({

        title:
          "Delete Image?",

        text:
          "This image will be deleted.",

        icon:
          "warning",

        showCancelButton:
          true,

        confirmButtonText:
          "Yes, Delete",

        cancelButtonText:
          "Cancel"

      });


    if (!result.isConfirmed)
      return;


    try {

      await api.delete(
        `/article/deleteimage/${imageid}`
      );


      setExistingImages(prev =>
        prev.filter(
          item =>
            item.imageid !== imageid
        )
      );


      Swal.fire({

        icon:
          "success",

        title:
          "Deleted!",

        text:
          "Image deleted successfully.",

        timer:
          1200,

        showConfirmButton:
          false

      });

    } catch (error) {

      Swal.fire(

        "Error",

        error.response?.data?.message ||
        "Unable to delete image.",

        "error"

      );

    }

  };


  // ========================================
  // VALIDATION
  // ========================================

  const validate = () => {

    if (
      !formData.articleno.trim()
    ) {

      Swal.fire(
        "Error",
        "Article No. is required",
        "error"
      );

      return false;

    }


    if (
      !formData.articlename.trim()
    ) {

      Swal.fire(
        "Error",
        "Article Name is required",
        "error"
      );

      return false;

    }


    if (!formData.categoryid) {

      Swal.fire(
        "Error",
        "Category is required",
        "error"
      );

      return false;

    }


    if (!formData.sizegroupid) {

      Swal.fire(
        "Error",
        "Size Group is required",
        "error"
      );

      return false;

    }


    if (!formData.genderid) {

      Swal.fire(
        "Error",
        "Gender is required",
        "error"
      );

      return false;

    }


    if (
      selectedSizes.length === 0
    ) {

      Swal.fire(
        "Error",
        "Please select at least one Size",
        "error"
      );

      return false;

    }


    if (
      selectedColors.length === 0
    ) {

      Swal.fire(
        "Error",
        "Please select at least one Color",
        "error"
      );

      return false;

    }


    return true;

  };


  // ========================================
  // CREATE VARIANTS
  // ========================================

  const createVariants = async (
    articleid
  ) => {

    if (
      selectedSizes.length === 0 ||
      selectedColors.length === 0
    ) {

      return;

    }


    const promises = [];


    selectedColors.forEach(
      colorid => {

        selectedSizes.forEach(
          sizeid => {

            promises.push(

              api.post(
                `/article/createvariant/${articleid}`,
                {
                  genderid:
                    Number(
                      formData.genderid
                    ),

                  colorid:
                    Number(colorid),

                  sizeid:
                    Number(sizeid)
                }
              )

            );

          }
        );

      }
    );


    await Promise.all(
      promises
    );

  };


  // ========================================
  // UPLOAD IMAGES
  // ========================================

  const uploadImages = async (
    articleid
  ) => {

    if (!images.length)
      return;


    for (
      let i = 0;
      i < images.length;
      i++
    ) {

      const image =
        images[i];


      const uploadData =
        new FormData();


      uploadData.append(
        "image",
        image.file
      );


      const uploadResponse =
        await api.post(
          "/article/uploadimage",
          uploadData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data"
            }
          }
        );


      const imageurl =
        uploadResponse.data.imageurl;


      await api.post(
        `/article/createimage/${articleid}`,
        {

          imageurl,

          isprimary:
            image.isprimary
              ? 1
              : 0,

          sortorder:
            i + 1

        }
      );

    }

  };


  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async () => {

    if (!validate())
      return;


    try {

      setLoading(true);


      const payload = {

        articleno:
          formData.articleno.trim(),

        articlename:
          formData.articlename.trim(),

        categoryid:
          Number(
            formData.categoryid
          ),

        sizegroupid:
          Number(
            formData.sizegroupid
          ),

        isactive:
          Number(
            formData.isactive
          )

      };


      let articleid;


      // ========================================
      // UPDATE
      // ========================================

      if (isEdit) {

        await api.put(
          `/article/updatearticle/${id}`,
          payload
        );


        articleid =
          Number(id);


        // Existing variants delete
        await api.delete(
          `/article/deletevariants/${id}`
        );


        // Recreate variants
        await createVariants(
          articleid
        );


        // Upload new images
        await uploadImages(
          articleid
        );


        await Swal.fire(
          "Success",
          "Article Updated Successfully",
          "success"
        );

      }


      // ========================================
      // CREATE
      // ========================================

      else {

        const res =
          await api.post(
            "/article/createarticle",
            payload
          );


        articleid =
          res.data.articleid;


        // Create variants
        await createVariants(
          articleid
        );


        // Upload images
        await uploadImages(
          articleid
        );


        await Swal.fire(
          "Success",
          "Article Added Successfully",
          "success"
        );

      }


      navigate(
        "/masters/article"
      );


    } catch (error) {

      console.error(
        "ARTICLE SAVE ERROR:",
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
  // VARIANT COUNT
  // ========================================

  const variantCount =
    selectedSizes.length *
    selectedColors.length;


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

            Article Master

          </h1>

          <p className="text-slate-500 mt-1 text-sm sm:text-base">

            {isEdit
              ? "Edit Article"
              : "Add New Article"}

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
          GENERAL INFORMATION
      ======================================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="border-b px-4 sm:px-6 py-4 bg-[#0A4B57]">

          <h2 className="text-lg font-semibold text-white">

            General Information

          </h2>

        </div>


        <div className="p-4 sm:p-6">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">


            {/* ARTICLE NO */}

            <FormInput

              label="Article No."

              name="articleno"

              value={
                formData.articleno
              }

              onChange={
                handleChange
              }

              required

              onLastEnter={() =>
                articleNameInputRef.current?.focus()
              }

            />


            {/* ARTICLE NAME */}

            <FormInput

              label="Article Name"

              ref={
                articleNameInputRef
              }

              name="articlename"

              value={
                formData.articlename
              }

              onChange={
                handleChange
              }

              required

              onLastEnter={() =>
                categoryInputRef.current?.focus()
              }

            />


            {/* CATEGORY */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-1">

                Category
                <span className="text-red-500 ml-1">
                  *
                </span>

              </label>


              <select

                ref={
                  categoryInputRef
                }

                name="categoryid"

                value={
                  formData.categoryid
                }

                onChange={
                  handleChange
                }

                disabled={
                  loading
                }

                onKeyDown={(e) => {

                  if (
                    e.key === "Enter"
                  ) {

                    e.preventDefault();

                    sizeGroupInputRef.current?.focus();

                  }

                }}

                className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"

              >

                <option value="">
                  Select Category
                </option>


                {categories.map(
                  item => (

                    <option
                      key={
                        item.categoryid
                      }
                      value={
                        item.categoryid
                      }
                    >

                      {
                        item.category
                      }

                    </option>

                  )
                )}

              </select>

            </div>


            {/* SIZE GROUP */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-1">

                Size Group
                <span className="text-red-500 ml-1">
                  *
                </span>

              </label>


              <select

                ref={
                  sizeGroupInputRef
                }

                name="sizegroupid"

                value={
                  formData.sizegroupid
                }

                onChange={
                  handleChange
                }

                disabled={
                  loading
                }

                onKeyDown={(e) => {

                  if (
                    e.key === "Enter"
                  ) {

                    e.preventDefault();

                    genderInputRef.current?.focus();

                  }

                }}

                className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"

              >

                <option value="">
                  Select Size Group
                </option>


                {sizeGroups.map(
                  item => (

                    <option

                      key={
                        item.sizegroupid
                      }

                      value={
                        item.sizegroupid
                      }

                    >

                      {
                        item.sizegroup
                      }

                    </option>

                  )
                )}

              </select>

            </div>


            {/* GENDER */}

            <div>

              <label className="block text-sm font-medium text-slate-700 mb-1">

                Gender
                <span className="text-red-500 ml-1">
                  *
                </span>

              </label>


              <select

                ref={
                  genderInputRef
                }

                name="genderid"

                value={
                  formData.genderid
                }

                onChange={
                  handleChange
                }

                disabled={
                  loading
                }

                className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"

              >

                <option value="">
                  Select Gender
                </option>


                {genders.map(
                  item => (

                    <option

                      key={
                        item.genderid
                      }

                      value={
                        item.genderid
                      }

                    >

                      {
                        item.gender
                      }

                    </option>

                  )
                )}

              </select>

            </div>


            {/* STATUS */}

            {isEdit && (

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1">

                  Status

                </label>


                <select

                  name="isactive"

                  value={
                    formData.isactive
                  }

                  onChange={
                    handleChange
                  }

                  disabled={
                    loading
                  }

                  className="w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"

                >

                  <option value={1}>
                    Active
                  </option>

                  <option value={0}>
                    Inactive
                  </option>

                </select>

              </div>

            )}

          </div>

        </div>

      </div>


      {/* ========================================
          SIZES
      ======================================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="border-b px-4 sm:px-6 py-4 bg-[#0A4B57]">

          <h2 className="text-lg font-semibold text-white">

            Select Sizes

          </h2>

        </div>


        <div className="p-4 sm:p-6">

          {sizes.length === 0 ? (

            <p className="text-sm text-slate-500">

              Select a Size Group to load sizes.

            </p>

          ) : (

            <div className="flex flex-wrap gap-3">

              {sizes.map(
                item => {

                  const checked =
                    selectedSizes.includes(
                      Number(
                        item.sizeid
                      )
                    );

                  return (

                    <label

                      key={
                        item.sizeid
                      }

                      className={`
                        cursor-pointer
                        border
                        rounded-lg
                        px-4
                        py-2
                        transition
                        ${
                          checked
                            ? "bg-[#0A4B57] text-white border-[#0A4B57]"
                            : "bg-white text-slate-700 hover:bg-gray-50"
                        }
                      `}

                    >

                      <input

                        type="checkbox"

                        className="hidden"

                        checked={
                          checked
                        }

                        onChange={() =>
                          handleSizeChange(
                            item.sizeid
                          )
                        }

                      />

                      {item.size}

                    </label>

                  );

                }
              )}

            </div>

          )}

        </div>

      </div>


      {/* ========================================
          COLORS
      ======================================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="border-b px-4 sm:px-6 py-4 bg-[#0A4B57]">

          <h2 className="text-lg font-semibold text-white">

            Select Colors

          </h2>

        </div>


        <div className="p-4 sm:p-6">

          {colors.length === 0 ? (

            <p className="text-sm text-slate-500">

              No colors available.

            </p>

          ) : (

            <div className="flex flex-wrap gap-3">

              {colors.map(
                item => {

                  const checked =
                    selectedColors.includes(
                      Number(
                        item.colorid
                      )
                    );

                  return (

                    <label

                      key={
                        item.colorid
                      }

                      className={`
                        cursor-pointer
                        border
                        rounded-lg
                        px-4
                        py-2
                        transition
                        ${
                          checked
                            ? "bg-[#0A4B57] text-white border-[#0A4B57]"
                            : "bg-white text-slate-700 hover:bg-gray-50"
                        }
                      `}

                    >

                      <input

                        type="checkbox"

                        className="hidden"

                        checked={
                          checked
                        }

                        onChange={() =>
                          handleColorChange(
                            item.colorid
                          )
                        }

                      />

                      {item.color}

                    </label>

                  );

                }
              )}

            </div>

          )}

        </div>

      </div>


      {/* ========================================
          VARIANT SUMMARY
      ======================================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="border-b px-4 sm:px-6 py-4 bg-[#0A4B57]">

          <h2 className="text-lg font-semibold text-white">

            Variant Summary

          </h2>

        </div>


        <div className="p-4 sm:p-6">

          <div className="flex flex-wrap gap-4">

            <div className="bg-slate-100 rounded-lg px-5 py-3">

              <span className="text-sm text-slate-500">
                Selected Sizes
              </span>

              <div className="text-xl font-bold text-slate-800">
                {selectedSizes.length}
              </div>

            </div>


            <div className="bg-slate-100 rounded-lg px-5 py-3">

              <span className="text-sm text-slate-500">
                Selected Colors
              </span>

              <div className="text-xl font-bold text-slate-800">
                {selectedColors.length}
              </div>

            </div>


            <div className="bg-orange-50 rounded-lg px-5 py-3">

              <span className="text-sm text-orange-600">
                Total Variants
              </span>

              <div className="text-xl font-bold text-orange-600">
                {variantCount}
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ========================================
          IMAGES
      ======================================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="border-b px-4 sm:px-6 py-4 bg-[#0A4B57]">

          <h2 className="text-lg font-semibold text-white">

            Article Images

          </h2>

        </div>


        <div className="p-4 sm:p-6">


          {/* ADD IMAGE */}

          <div className="mb-5">

            <input

              ref={
                fileInputRef
              }

              type="file"

              accept="image/*"

              multiple

              onChange={
                handleImageChange
              }

              className="hidden"

            />


            <button

              type="button"

              onClick={() =>
                fileInputRef.current?.click()
              }

              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF7A1A] text-white rounded-lg hover:bg-orange-600 transition"

            >

              <FaImage />

              Add Images

            </button>

          </div>


          {/* EXISTING IMAGES */}

          {existingImages.length >
            0 && (

              <div className="mb-6">

                <h3 className="font-semibold text-slate-700 mb-3">

                  Existing Images

                </h3>


                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">

                  {existingImages.map(
                    item => (

                      <div
                        key={
                          item.imageid
                        }
                        className="relative border rounded-lg overflow-hidden"
                      >

                        {/* <img

                          src={
                            item.imageurl
                          }

                          alt="Article"

                          className="w-full h-32 object-cover"

                        /> */}

                        <img
  src={`https://mosach-erp-server.onrender.com${item.imageurl}`}
  alt="Article"
  className="w-full h-32 object-cover"
  onLoad={() => {
    console.log("IMAGE LOADED:", item.imageurl);
  }}
  onError={(e) => {
    console.error(
      "IMAGE LOAD ERROR:",
      `https://mosach-erp-server.onrender.com${item.imageurl}`
    );
  }}
/>


                        {Number(
                          item.isprimary
                        ) === 1 && (

                          <span className="absolute top-2 left-2 bg-[#0A4B57] text-white text-xs px-2 py-1 rounded">

                            Primary

                          </span>

                        )}


                        <button

                          type="button"

                          onClick={() =>
                            deleteExistingImage(
                              item.imageid
                            )
                          }

                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"

                        >

                          <FaTrash
                            size={12}
                          />

                        </button>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


          {/* NEW IMAGES */}

          {images.length >
            0 && (

              <div>

                <h3 className="font-semibold text-slate-700 mb-3">

                  New Images

                </h3>


                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">

                  {images.map(
                    (item, index) => (

                      <div
                        key={index}
                        className="relative border rounded-lg overflow-hidden"
                      >

                        <img

                          src={
                            item.preview
                          }

                          alt="Preview"

                          className="w-full h-32 object-cover"

                        />


                        {item.isprimary && (

                          <span className="absolute top-2 left-2 bg-[#0A4B57] text-white text-xs px-2 py-1 rounded">

                            Primary

                          </span>

                        )}


                        {!item.isprimary && (

                          <button

                            type="button"

                            onClick={() =>
                              setPrimaryImage(
                                index
                              )
                            }

                            className="absolute bottom-2 left-2 bg-white text-slate-700 text-xs px-2 py-1 rounded shadow"

                          >

                            Make Primary

                          </button>

                        )}


                        <button

                          type="button"

                          onClick={() =>
                            removeImage(
                              index
                            )
                          }

                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"

                        >

                          <FaTrash
                            size={12}
                          />

                        </button>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}


          {existingImages.length === 0 &&
            images.length === 0 && (

              <div className="border-2 border-dashed rounded-xl p-8 text-center text-slate-400">

                <FaImage
                  className="mx-auto mb-2"
                  size={30}
                />

                <p>
                  No images selected
                </p>

              </div>

            )}

        </div>

      </div>
      


      {/* ========================================
          BUTTONS
      ======================================== */}

      <div className="bg-white rounded-xl shadow border-t p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-end gap-3">

        <button

          type="button"

          onClick={() =>
            navigate(-1)
          }

          disabled={
            loading
          }

          className="w-full sm:w-40 py-2.5 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"

        >

          Cancel

        </button>


        <button

          type="button"

          onClick={
            handleSubmit
          }

          disabled={
            loading
          }

          className="w-full sm:w-44 py-2.5 bg-[#FF7A1A] text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"

        >

          {loading

            ? "Please Wait..."

            : isEdit

              ? "Update Article"

              : "Save Article"

          }

        </button>

      </div>

    </div>

  );

};


export default AddArticle;