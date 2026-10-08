import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaArrowLeft,
  FaCheck,
  FaImage,
  FaPlus,
  FaSave,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

import FormInput from "../../../components/form/FormInput";
import api from "../../../api/axios";

const IMAGE_BASE_URL = "https://mosach-erp-server.onrender.com";

/* =========================================================
   RESPONSE HELPERS
========================================================= */

const getArrayData = (response) => {
  if (!response?.data) return [];

  if (Array.isArray(response.data.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.data.result)) {
    return response.data.result;
  }

  if (Array.isArray(response.data.rows)) {
    return response.data.rows;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

/* =========================================================
   MASTER HELPERS
========================================================= */

const getCategoryId = (item) =>
  Number(
    item?.categoryid ??
      item?.categoryId ??
      item?.id ??
      0
  );

const getCategoryName = (item) =>
  item?.categoryname ??
  item?.categoryName ??
  item?.name ??
  item?.category ??
  "";

const getSizeGroupId = (item) =>
  Number(
    item?.sizegroupid ??
      item?.sizeGroupId ??
      item?.size_group_id ??
      item?.groupid ??
      item?.groupId ??
      item?.id ??
      0
  );

const getSizeGroupName = (item) =>
  item?.sizegroup ??
  item?.sizegroupname ??
  item?.sizeGroup ??
  item?.sizeGroupName ??
  item?.name ??
  "";

const getGenderId = (item) =>
  Number(
    item?.genderid ??
      item?.genderId ??
      item?.id ??
      0
  );

const getGenderName = (item) =>
  item?.gender ??
  item?.gendername ??
  item?.genderName ??
  item?.name ??
  "";

const getColorId = (item) =>
  Number(
    item?.colorid ??
      item?.colorId ??
      item?.id ??
      0
  );

const getColorName = (item) =>
  item?.color ??
  item?.colorname ??
  item?.colorName ??
  item?.name ??
  "";

/* =========================================================
   COMPONENT
========================================================= */

const AddArticle = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  /* =======================================================
     FORM
  ======================================================= */

  const [formData, setFormData] = useState({
    articleno: "",
    articlename: "",
    categoryid: "",
    isactive: 1,
  });

  /* =======================================================
     MASTER DATA
  ======================================================= */

  const [categories, setCategories] = useState([]);
  const [sizeGroups, setSizeGroups] = useState([]);
  const [genders, setGenders] = useState([]);
  const [colors, setColors] = useState([]);

  /* =======================================================
     SELECTED DATA
  ======================================================= */

  const [selectedSizeGroups, setSelectedSizeGroups] = useState(
    []
  );

  const [selectedGenders, setSelectedGenders] = useState([]);

  const [selectedColors, setSelectedColors] = useState([]);

  /* =======================================================
     IMAGES
  ======================================================= */

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  /* =======================================================
     UI
  ======================================================= */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =======================================================
     LOAD MASTER DATA

     NO SIZE API
  ======================================================= */

  useEffect(() => {
    const loadMasters = async () => {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          api.get("/category"),
          api.get("/sizegroup"),
          api.get("/gender"),
          api.get("/color"),
        ]);

        const [categoryResult, sizeGroupResult, genderResult, colorResult] =
          results;

        if (categoryResult.status === "fulfilled") {
          setCategories(
            getArrayData(categoryResult.value)
          );
        } else {
          console.error(
            "Category API Error:",
            categoryResult.reason
          );
        }

        if (sizeGroupResult.status === "fulfilled") {
          setSizeGroups(
            getArrayData(sizeGroupResult.value)
          );
        } else {
          console.error(
            "Size Group API Error:",
            sizeGroupResult.reason
          );
        }

        if (genderResult.status === "fulfilled") {
          setGenders(
            getArrayData(genderResult.value)
          );
        } else {
          console.error(
            "Gender API Error:",
            genderResult.reason
          );
        }

        if (colorResult.status === "fulfilled") {
          setColors(
            getArrayData(colorResult.value)
          );
        } else {
          console.error(
            "Color API Error:",
            colorResult.reason
          );
        }
      } catch (error) {
        console.error("Master loading error:", error);

        await Swal.fire({
          icon: "error",
          title: "Unable to Load",
          text: "Master data could not be loaded.",
          confirmButtonColor: "#0A4B57",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMasters();
  }, []);

  /* =======================================================
     LOAD EDIT ARTICLE
  ======================================================= */

  useEffect(() => {
    if (!isEdit) return;

    const loadArticle = async () => {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          api.get(`/article/getarticle/${id}`),
          api.get(`/article/getsizegroups/${id}`),
          api.get(`/article/getvariants/${id}`),
          api.get(`/article/getimages/${id}`),
        ]);

        const [
          articleResult,
          sizeGroupResult,
          variantResult,
          imageResult,
        ] = results;

        /* -----------------------------------------------
           ARTICLE
        ------------------------------------------------ */

        if (articleResult.status === "fulfilled") {
          const response = articleResult.value;

          const article =
            response?.data?.data ??
            response?.data?.result ??
            response?.data?.article ??
            response?.data;

          if (article) {
            setFormData({
              articleno:
                article?.articleno ??
                article?.articleNo ??
                "",
              articlename:
                article?.articlename ??
                article?.articleName ??
                "",
              categoryid:
                article?.categoryid ??
                article?.categoryId ??
                "",
              isactive:
                article?.isactive ??
                article?.isActive ??
                1,
            });
          }
        }

        /* -----------------------------------------------
           SIZE GROUP
        ------------------------------------------------ */

        if (sizeGroupResult.status === "fulfilled") {
          const data = getArrayData(
            sizeGroupResult.value
          );

          const ids = data
            .map((item) => getSizeGroupId(item))
            .filter((value) => value > 0);

          setSelectedSizeGroups(
            [...new Set(ids)]
          );
        }

        /* -----------------------------------------------
           VARIANTS

           Gender + Color + Size Group
           NO SIZE
        ------------------------------------------------ */

        if (variantResult.status === "fulfilled") {
          const data = getArrayData(
            variantResult.value
          );

          const genderIds = data
            .map((item) =>
              Number(
                item?.genderid ??
                  item?.genderId ??
                  item?.gender?.genderid ??
                  item?.gender?.genderId ??
                  0
              )
            )
            .filter((value) => value > 0);

          const colorIds = data
            .map((item) =>
              Number(
                item?.colorid ??
                  item?.colorId ??
                  item?.color?.colorid ??
                  item?.color?.colorId ??
                  0
              )
            )
            .filter((value) => value > 0);

          const sizeGroupIds = data
            .map((item) =>
              Number(
                item?.sizegroupid ??
                  item?.sizeGroupId ??
                  item?.size_group_id ??
                  item?.sizegroup?.sizegroupid ??
                  item?.sizegroup?.sizeGroupId ??
                  0
              )
            )
            .filter((value) => value > 0);

          if (genderIds.length) {
            setSelectedGenders(
              [...new Set(genderIds)]
            );
          }

          if (colorIds.length) {
            setSelectedColors(
              [...new Set(colorIds)]
            );
          }

          if (sizeGroupIds.length) {
            setSelectedSizeGroups(
              [...new Set(sizeGroupIds)]
            );
          }
        }

        /* -----------------------------------------------
           IMAGES
        ------------------------------------------------ */

        if (imageResult.status === "fulfilled") {
          setExistingImages(
            getArrayData(imageResult.value)
          );
        }
      } catch (error) {
        console.error(
          "Load article error:",
          error
        );

        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Unable to load article.",
          confirmButtonColor: "#0A4B57",
        });
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id, isEdit]);

  /* =======================================================
     VARIANT COUNT

     Gender × Color × Size Group
  ======================================================= */

  const variantRows = useMemo(() => {
    const rows = [];

    selectedGenders.forEach((genderid) => {
      selectedColors.forEach((colorid) => {
        selectedSizeGroups.forEach(
          (sizegroupid) => {
            rows.push({
              genderid: Number(genderid),
              colorid: Number(colorid),
              sizegroupid: Number(sizegroupid),
            });
          }
        );
      });
    });

    return rows;
  }, [
    selectedGenders,
    selectedColors,
    selectedSizeGroups,
  ]);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================================================
     TOGGLE
  ======================================================= */

  const toggleValue = (
    setter,
    value
  ) => {
    const numberValue = Number(value);

    setter((prev) =>
      prev.includes(numberValue)
        ? prev.filter(
            (item) => item !== numberValue
          )
        : [...prev, numberValue]
    );
  };

  /* =======================================================
     IMAGE SELECT
  ======================================================= */

  const handleImageChange = (e) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) return;

    const validFiles = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "warning",
          title: "Invalid File",
          text: `${file.name} is not an image.`,
          confirmButtonColor: "#0A4B57",
        });

        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "Image Too Large",
          text: `${file.name} is larger than 5 MB.`,
          confirmButtonColor: "#0A4B57",
        });

        continue;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setImages((prev) => [
      ...prev,
      ...validFiles,
    ]);

    e.target.value = "";
  };

  /* =======================================================
     REMOVE NEW IMAGE
  ======================================================= */

  const removeImage = (index) => {
    setImages((prev) => {
      const item = prev[index];

      if (item?.preview) {
        URL.revokeObjectURL(
          item.preview
        );
      }

      return prev.filter(
        (_, i) => i !== index
      );
    });
  };

  /* =======================================================
     PRIMARY IMAGE
  ======================================================= */

  const setPrimaryImage = (index) => {
    setImages((prev) => {
      if (index === 0) return prev;

      const selected = prev[index];

      return [
        selected,
        ...prev.filter(
          (_, i) => i !== index
        ),
      ];
    });
  };

  /* =======================================================
     EXISTING IMAGE URL
  ======================================================= */

  const getExistingImageUrl = (item) => {
    const imageUrl =
      item?.imageurl ??
      item?.imageUrl ??
      item?.filepath ??
      item?.path ??
      item?.url ??
      "";

    if (!imageUrl) return "";

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      return imageUrl;
    }

    return `${IMAGE_BASE_URL}${imageUrl}`;
  };

  /* =======================================================
     DELETE EXISTING IMAGE
  ======================================================= */

  const deleteExistingImage = async (
    imageid
  ) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Image?",
      text: "This image will be permanently deleted.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(
        `/article/deleteimage/${imageid}`
      );

      setExistingImages((prev) =>
        prev.filter(
          (item) =>
            Number(
              item?.imageid ??
                item?.imageId ??
                item?.id
            ) !== Number(imageid)
        )
      );

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Image deleted successfully.",
        timer: 1300,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        "Delete image error:",
        error
      );

      await Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text:
          error?.response?.data?.message ??
          "Unable to delete image.",
        confirmButtonColor: "#0A4B57",
      });
    }
  };

  /* =======================================================
     CREATE VARIANTS

     IMPORTANT:
     NO SIZEID
  ======================================================= */

  const createVariants = async (
    articleid
  ) => {
    if (!variantRows.length) {
      return;
    }

    for (const variant of variantRows) {
      await api.post(
        `/article/createvariant/${articleid}`,
        {
          genderid: Number(
            variant.genderid
          ),
          colorid: Number(
            variant.colorid
          ),
          sizegroupid: Number(
            variant.sizegroupid
          ),
        }
      );
    }
  };

  /* =======================================================
     UPLOAD IMAGES
  ======================================================= */

  const uploadImages = async (
    articleid
  ) => {
    if (!images.length) {
      return;
    }

    for (
      let index = 0;
      index < images.length;
      index++
    ) {
      const image = images[index];

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
                "multipart/form-data",
            },
          }
        );

      const responseData =
        uploadResponse?.data;

      const uploaded =
        responseData?.data ??
        responseData?.result ??
        responseData;

      const imagePath =
        uploaded?.imageurl ??
        uploaded?.imageUrl ??
        uploaded?.path ??
        uploaded?.filename ??
        responseData?.imageurl ??
        responseData?.imageUrl ??
        responseData?.path ??
        responseData?.filename;

      if (!imagePath) {
        throw new Error(
          "Image upload path was not returned by server."
        );
      }

      await api.post(
        `/article/createimage/${articleid}`,
        {
          imageurl: imagePath,
          isprimary:
            index === 0 &&
            existingImages.length === 0
              ? 1
              : 0,
        }
      );
    }
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = () => {
    if (!formData.articleno.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Article No Required",
        text: "Please enter Article No.",
        confirmButtonColor: "#0A4B57",
      });

      return false;
    }

    if (!formData.articlename.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Article Name Required",
        text: "Please enter Article Name.",
        confirmButtonColor: "#0A4B57",
      });

      return false;
    }

    if (!formData.categoryid) {
      Swal.fire({
        icon: "warning",
        title: "Category Required",
        text: "Please select Category.",
        confirmButtonColor: "#0A4B57",
      });

      return false;
    }

    if (!selectedSizeGroups.length) {
      Swal.fire({
        icon: "warning",
        title: "Size Group Required",
        text: "Please select at least one Size Group.",
        confirmButtonColor: "#0A4B57",
      });

      return false;
    }

    if (!selectedGenders.length) {
      Swal.fire({
        icon: "warning",
        title: "Gender Required",
        text: "Please select at least one Gender.",
        confirmButtonColor: "#0A4B57",
      });

      return false;
    }

    if (!selectedColors.length) {
      Swal.fire({
        icon: "warning",
        title: "Color Required",
        text: "Please select at least one Color.",
        confirmButtonColor: "#0A4B57",
      });

      return false;
    }

    return true;
  };

  /* =======================================================
     SAVE ARTICLE
  ======================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        articleno:
          formData.articleno.trim(),

        articlename:
          formData.articlename.trim(),

        categoryid:
          Number(formData.categoryid),

        sizegroupids:
          selectedSizeGroups.map(
            Number
          ),

        isactive:
          Number(formData.isactive),
      };

      let articleid = id;

      /* ===================================================
         EDIT
      =================================================== */

      if (isEdit) {
        await api.put(
          `/article/updatearticle/${id}`,
          payload
        );

        /*
         * Existing variants remove
         */
        await api.delete(
          `/article/deletevariants/${id}`
        );

        /*
         * New variants
         */
        await createVariants(id);

        /*
         * New images
         */
        await uploadImages(id);

        /*
         * IMPORTANT:
         * Success alert only after all operations succeed.
         */
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Article updated successfully.",
          confirmButtonText: "OK",
          confirmButtonColor: "#0A4B57",
        });

        navigate("/masters/article");

        return;
      }

      /* ===================================================
         CREATE
      =================================================== */

      const articleResponse =
        await api.post(
          "/article/createarticle",
          payload
        );

      const responseData =
        articleResponse?.data;

      articleid =
        responseData?.articleid ??
        responseData?.data?.articleid ??
        responseData?.result?.articleid;

      if (!articleid) {
        console.error(
          "Create Article Response:",
          responseData
        );

        throw new Error(
          "Article was saved but Article ID was not returned by server."
        );
      }

      /*
       * Create variants
       */
      await createVariants(
        articleid
      );

      /*
       * Upload images
       */
      await uploadImages(
        articleid
      );

      /*
       * SUCCESS
       *
       * Green success icon
       */
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Article saved successfully.",
        confirmButtonText: "OK",
        confirmButtonColor: "#0A4B57",
      });

      navigate("/masters/article");
    } catch (error) {
      console.error(
        "SAVE ARTICLE ERROR:",
        error
      );

      const serverMessage =
        error?.response?.data?.message ??
        error?.response?.data?.error;

      /*
       * If backend returned an error AFTER article
       * creation, show actual error instead of falsely
       * showing success.
       */
      await Swal.fire({
        icon: "error",
        title: "Save Failed",
        text:
          serverMessage ??
          error?.message ??
          "Unable to save article.",
        confirmButtonColor: "#0A4B57",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     CLEANUP PREVIEW URLS
  ======================================================= */

  useEffect(() => {
    return () => {
      images.forEach((item) => {
        if (item?.preview) {
          URL.revokeObjectURL(
            item.preview
          );
        }
      });
    };
  }, [images]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-slate-200 border-t-[#0A4B57] animate-spin" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading Article...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-5 lg:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5">
          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/masters/article"
                  )
                }
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
              >
                <FaArrowLeft />
              </button>

              <div className="w-10 h-10 rounded-xl bg-[#0A4B57] text-white flex items-center justify-center font-bold text-lg">
                A
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#0A4B57]">
                  {isEdit
                    ? "Edit Article"
                    : "Add Article"}
                </h1>

                <p className="text-xs sm:text-sm text-slate-500">
                  Article Master
                </p>
              </div>

            </div>

            <span className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-orange-50 text-[#EF8535] text-xs font-bold">
              ARTICLE MASTER
            </span>

          </div>

          <div className="h-1 bg-gradient-to-r from-[#0A4B57] to-[#EF8535]" />
        </div>

        <form onSubmit={handleSubmit}>

          {/* GENERAL */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-5">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                General Information
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Enter basic article details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              <FormInput
                label="Article No"
                name="articleno"
                value={
                  formData.articleno
                }
                onChange={
                  handleChange
                }
                placeholder="A101"
                required
              />

              <FormInput
                label="Article Name"
                name="articlename"
                value={
                  formData.articlename
                }
                onChange={
                  handleChange
                }
                placeholder="Enter article name"
                required
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Category
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <select
                  name="categoryid"
                  value={
                    formData.categoryid
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full h-[42px] rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#0A4B57] focus:ring-2 focus:ring-[#0A4B57]/10"
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (item) => {
                      const categoryid =
                        getCategoryId(
                          item
                        );

                      return (
                        <option
                          key={
                            categoryid
                          }
                          value={
                            categoryid
                          }
                        >
                          {getCategoryName(
                            item
                          )}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
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
                  className="w-full h-[42px] rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#0A4B57]"
                >
                  <option value={1}>
                    Active
                  </option>

                  <option value={0}>
                    Inactive
                  </option>
                </select>
              </div>

            </div>
          </div>

          {/* SIZE GROUP */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-5">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                Size Group
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Select Size Group for this article
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">

              {sizeGroups.map(
                (item) => {
                  const sizegroupid =
                    getSizeGroupId(
                      item
                    );

                  const selected =
                    selectedSizeGroups.includes(
                      sizegroupid
                    );

                  return (
                    <button
                      key={
                        sizegroupid
                      }
                      type="button"
                      onClick={() =>
                        toggleValue(
                          setSelectedSizeGroups,
                          sizegroupid
                        )
                      }
                      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-2 transition ${
                        selected
                          ? "bg-[#0A4B57] border-[#0A4B57] text-white shadow-md"
                          : "bg-white border-slate-300 text-slate-700 hover:border-[#0A4B57] hover:text-[#0A4B57]"
                      }`}
                    >
                      {selected && (
                        <FaCheck size={11} />
                      )}

                      {getSizeGroupName(
                        item
                      )}
                    </button>
                  );
                }
              )}

            </div>

            {selectedSizeGroups.length >
              0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">

                <div className="text-[11px] font-bold text-slate-400 mb-2">
                  SELECTED
                </div>

                <div className="flex flex-wrap gap-2">

                  {selectedSizeGroups.map(
                    (groupId) => {
                      const group =
                        sizeGroups.find(
                          (item) =>
                            getSizeGroupId(
                              item
                            ) ===
                            Number(
                              groupId
                            )
                        );

                      return (
                        <span
                          key={
                            groupId
                          }
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-100 text-[#EF8535] text-xs font-semibold"
                        >
                          {group
                            ? getSizeGroupName(
                                group
                              )
                            : `Group ${groupId}`}

                          <button
                            type="button"
                            onClick={() =>
                              toggleValue(
                                setSelectedSizeGroups,
                                groupId
                              )
                            }
                            className="hover:text-red-600"
                          >
                            <FaTimes size={10} />
                          </button>
                        </span>
                      );
                    }
                  )}

                </div>
              </div>
            )}

          </div>

          {/* GENDER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-5">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                Gender
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Select applicable Gender
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">

              {genders.map(
                (item) => {
                  const genderid =
                    getGenderId(
                      item
                    );

                  const selected =
                    selectedGenders.includes(
                      genderid
                    );

                  return (
                    <button
                      key={
                        genderid
                      }
                      type="button"
                      onClick={() =>
                        toggleValue(
                          setSelectedGenders,
                          genderid
                        )
                      }
                      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-2 transition ${
                        selected
                          ? "bg-[#0A4B57] border-[#0A4B57] text-white shadow-md"
                          : "bg-white border-slate-300 text-slate-700 hover:border-[#0A4B57] hover:text-[#0A4B57]"
                      }`}
                    >
                      {selected && (
                        <FaCheck size={11} />
                      )}

                      {getGenderName(
                        item
                      )}
                    </button>
                  );
                }
              )}

            </div>
          </div>

          {/* COLORS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-5">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                Colors
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Select applicable Colors
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">

              {colors.map(
                (item) => {
                  const colorid =
                    getColorId(
                      item
                    );

                  const selected =
                    selectedColors.includes(
                      colorid
                    );

                  return (
                    <button
                      key={
                        colorid
                      }
                      type="button"
                      onClick={() =>
                        toggleValue(
                          setSelectedColors,
                          colorid
                        )
                      }
                      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-2 transition ${
                        selected
                          ? "bg-[#EF8535] border-[#EF8535] text-white shadow-md"
                          : "bg-white border-slate-300 text-slate-700 hover:border-[#EF8535] hover:text-[#EF8535]"
                      }`}
                    >
                      {selected && (
                        <FaCheck size={11} />
                      )}

                      {getColorName(
                        item
                      )}
                    </button>
                  );
                }
              )}

            </div>
          </div>

          {/* VARIANT SUMMARY */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-5">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Variant Summary
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Gender × Color × Size Group
                </p>
              </div>

              <div className="px-4 py-2 rounded-xl bg-[#0A4B57] text-white">
                <div className="text-[10px] uppercase opacity-70">
                  Total Variants
                </div>

                <div className="text-xl font-bold">
                  {
                    variantRows.length
                  }
                </div>
              </div>

            </div>

            {variantRows.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">

                {variantRows.map(
                  (
                    variant,
                    index
                  ) => {
                    const gender =
                      genders.find(
                        (item) =>
                          getGenderId(
                            item
                          ) ===
                          variant.genderid
                      );

                    const color =
                      colors.find(
                        (item) =>
                          getColorId(
                            item
                          ) ===
                          variant.colorid
                      );

                    const group =
                      sizeGroups.find(
                        (item) =>
                          getSizeGroupId(
                            item
                          ) ===
                          variant.sizegroupid
                      );

                    return (
                      <div
                        key={`${variant.genderid}-${variant.colorid}-${variant.sizegroupid}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="text-[10px] font-bold text-slate-400">
                            #{index + 1}
                          </span>

                          <FaCheck
                            size={11}
                            className="text-green-500"
                          />
                        </div>

                        <div className="space-y-1.5">

                          <div className="flex justify-between gap-2">
                            <span className="text-xs text-slate-500">
                              Gender
                            </span>

                            <b className="text-xs text-slate-800">
                              {gender
                                ? getGenderName(
                                    gender
                                  )
                                : "-"}
                            </b>
                          </div>

                          <div className="flex justify-between gap-2">
                            <span className="text-xs text-slate-500">
                              Color
                            </span>

                            <b className="text-xs text-slate-800">
                              {color
                                ? getColorName(
                                    color
                                  )
                                : "-"}
                            </b>
                          </div>

                          <div className="flex justify-between gap-2">
                            <span className="text-xs text-slate-500">
                              Size Group
                            </span>

                            <b className="text-xs text-slate-800">
                              {group
                                ? getSizeGroupName(
                                    group
                                  )
                                : "-"}
                            </b>
                          </div>

                        </div>
                      </div>
                    );
                  }
                )}

              </div>
            ) : (
              <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center text-sm text-slate-500">
                Select Gender, Color and Size Group
                to generate variants.
              </div>
            )}

          </div>

          {/* IMAGES */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-5">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Article Images
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Add product images
                </p>
              </div>

              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A4B57] hover:bg-[#083c45] text-white text-sm font-semibold cursor-pointer transition">
                <FaPlus size={11} />
                Add Images

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={
                    handleImageChange
                  }
                />
              </label>

            </div>

            {/* EXISTING */}
            {existingImages.length > 0 && (
              <div className="mb-6">

                <div className="text-[11px] font-bold text-slate-400 mb-3">
                  EXISTING IMAGES
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">

                  {existingImages.map(
                    (
                      item,
                      index
                    ) => {
                      const imageid =
                        item?.imageid ??
                        item?.imageId ??
                        item?.id ??
                        index;

                      const imageUrl =
                        getExistingImageUrl(
                          item
                        );

                      const primary =
                        Number(
                          item?.isprimary ??
                            item?.isPrimary ??
                            0
                        ) === 1;

                      return (
                        <div
                          key={
                            imageid
                          }
                          className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group"
                        >

                          {imageUrl ? (
                            <img
                              src={
                                imageUrl
                              }
                              alt="Article"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                              <FaImage
                                size={30}
                              />
                            </div>
                          )}

                          {primary && (
                            <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-[#0A4B57] text-white text-[9px] font-bold">
                              PRIMARY
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              deleteExistingImage(
                                imageid
                              )
                            }
                            className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            <FaTrash
                              size={11}
                            />
                          </button>

                        </div>
                      );
                    }
                  )}

                </div>
              </div>
            )}

            {/* NEW */}
            {images.length > 0 && (
              <div>

                <div className="text-[11px] font-bold text-slate-400 mb-3">
                  NEW IMAGES
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">

                  {images.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={`${item.file.name}-${index}`}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 group"
                      >

                        <img
                          src={
                            item.preview
                          }
                          alt={
                            item.file.name
                          }
                          className="w-full h-full object-cover"
                        />

                        {index === 0 && (
                          <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-[#0A4B57] text-white text-[9px] font-bold">
                            PRIMARY
                          </span>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">

                          {index !== 0 && (
                            <button
                              type="button"
                              title="Set Primary"
                              onClick={() =>
                                setPrimaryImage(
                                  index
                                )
                              }
                              className="w-9 h-9 rounded-lg bg-white text-[#0A4B57] flex items-center justify-center"
                            >
                              <FaCheck
                                size={12}
                              />
                            </button>
                          )}

                          <button
                            type="button"
                            title="Remove"
                            onClick={() =>
                              removeImage(
                                index
                              )
                            }
                            className="w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center"
                          >
                            <FaTrash
                              size={11}
                            />
                          </button>

                        </div>

                      </div>
                    )
                  )}

                </div>
              </div>
            )}

            {!existingImages.length &&
              !images.length && (
                <div className="border border-dashed border-slate-300 rounded-xl p-10 text-center">
                  <FaImage
                    size={35}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    No images added
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    JPG, PNG or WEBP • Maximum 5 MB
                  </p>
                </div>
              )}

          </div>

          {/* ACTIONS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  navigate(
                    "/masters/article"
                  )
                }
                className="h-11 px-6 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="h-11 px-7 rounded-xl bg-[#0A4B57] hover:bg-[#083c45] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave size={13} />
                    {isEdit
                      ? "Update Article"
                      : "Save Article"}
                  </>
                )}
              </button>

            </div>

          </div>

        </form>
      </div>
    </div>
  );
};

export default AddArticle;