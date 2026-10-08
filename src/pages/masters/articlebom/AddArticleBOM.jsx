import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaArrowLeft,
  FaSave,
  FaCheck,
} from "react-icons/fa";

import FormInput from "../../../components/form/FormInput";
import api from "../../../api/axios";

/* =========================================================
   RESPONSE HELPER
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
   ARTICLE HELPERS
========================================================= */

const getArticleId = (item) =>
  Number(
    item?.articleid ??
      item?.articleId ??
      item?.id ??
      0
  );

const getArticleNo = (item) =>
  item?.articleno ??
  item?.articleNo ??
  "";

const getArticleName = (item) =>
  item?.articlename ??
  item?.articleName ??
  item?.name ??
  "";

/* =========================================================
   CATEGORY HELPERS
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
  item?.category ??
  item?.name ??
  "";

/* =========================================================
   COLOR HELPERS
========================================================= */

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
   SIZE GROUP HELPERS
========================================================= */

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

/* =========================================================
   MATERIAL HELPERS
========================================================= */

const getMaterialId = (item) =>
  Number(
    item?.materialid ??
      item?.materialId ??
      item?.id ??
      0
  );

const getMaterialName = (item) =>
  item?.materialname ??
  item?.materialName ??
  item?.material ??
  item?.name ??
  "";

/* =========================================================
   MATERIAL FIELDS
========================================================= */

const MATERIAL_FIELDS = [
  {
    id: "upperrexineid",
    avg: "upperrexineavg",
    label: "Upper Rexine",
  },
  {
    id: "insolerexineid",
    avg: "insolerexineavg",
    label: "Insole Rexine",
  },
  {
    id: "epdmid",
    avg: "epdmavg",
    label: "EPDM",
  },
  {
    id: "liningid",
    avg: "liningavg",
    label: "Lining",
  },
  {
    id: "componentsid",
    avg: "componentsavg",
    label: "Components",
  },
  {
    id: "other1id",
    avg: "other1avg",
    label: "Other 1",
  },
  {
    id: "other2id",
    avg: "other2avg",
    label: "Other 2",
  },
  {
    id: "other3id",
    avg: "other3avg",
    label: "Other 3",
  },
  {
    id: "other4id",
    avg: "other4avg",
    label: "Other 4",
  },
  {
    id: "other5id",
    avg: "other5avg",
    label: "Other 5",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const AddArticleBOM = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  /* =======================================================
     FORM
  ======================================================= */

  const [formData, setFormData] = useState({
    articleid: "",
    categoryid: "",
    colorid: "",
    sizegroupid: "",

    upperrexineid: "",
    upperrexineavg: "",

    insolerexineid: "",
    insolerexineavg: "",

    epdmid: "",
    epdmavg: "",

    liningid: "",
    liningavg: "",

    componentsid: "",
    componentsavg: "",

    other1id: "",
    other1avg: "",

    other2id: "",
    other2avg: "",

    other3id: "",
    other3avg: "",

    other4id: "",
    other4avg: "",

    other5id: "",
    other5avg: "",
  });

  /* =======================================================
     MASTER DATA
  ======================================================= */

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizeGroups, setSizeGroups] = useState([]);
  const [materials, setMaterials] = useState([]);

  /* =======================================================
     UI
  ======================================================= */

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =======================================================
     LOAD MASTERS
  ======================================================= */

  useEffect(() => {
    const loadMasters = async () => {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          api.get("/article/getallarticles"),
          api.get("/category"),
          api.get("/color"),
          api.get("/sizegroup"),
          api.get("/material"),
        ]);

        const [
          articleResult,
          categoryResult,
          colorResult,
          sizeGroupResult,
          materialResult,
        ] = results;

        if (articleResult.status === "fulfilled") {
          setArticles(
            getArrayData(articleResult.value)
          );
        } else {
          console.error(
            "Article API Error:",
            articleResult.reason
          );
        }

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

        if (materialResult.status === "fulfilled") {
          setMaterials(
            getArrayData(materialResult.value)
          );
        } else {
          console.error(
            "Material API Error:",
            materialResult.reason
          );
        }
      } catch (error) {
        console.error(
          "Master loading error:",
          error
        );

        Swal.fire({
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
     LOAD BOM FOR EDIT
  ======================================================= */

  useEffect(() => {
    if (!isEdit) return;

    const loadBOM = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          `/articlebom/${id}`
        );

        const data =
          response?.data?.data ??
          response?.data?.result ??
          response?.data?.articlebom ??
          response?.data;

        if (!data) {
          throw new Error(
            "Article BOM data not found."
          );
        }

        setFormData({
          articleid:
            data?.articleid ?? "",

          categoryid:
            data?.categoryid ?? "",

          colorid:
            data?.colorid ?? "",

          sizegroupid:
            data?.sizegroupid ?? "",

          upperrexineid:
            data?.upperrexineid ?? "",

          upperrexineavg:
            data?.upperrexineavg ?? "",

          insolerexineid:
            data?.insolerexineid ?? "",

          insolerexineavg:
            data?.insolerexineavg ?? "",

          epdmid:
            data?.epdmid ?? "",

          epdmavg:
            data?.epdmavg ?? "",

          liningid:
            data?.liningid ?? "",

          liningavg:
            data?.liningavg ?? "",

          componentsid:
            data?.componentsid ?? "",

          componentsavg:
            data?.componentsavg ?? "",

          other1id:
            data?.other1id ?? "",

          other1avg:
            data?.other1avg ?? "",

          other2id:
            data?.other2id ?? "",

          other2avg:
            data?.other2avg ?? "",

          other3id:
            data?.other3id ?? "",

          other3avg:
            data?.other3avg ?? "",

          other4id:
            data?.other4id ?? "",

          other4avg:
            data?.other4avg ?? "",

          other5id:
            data?.other5id ?? "",

          other5avg:
            data?.other5avg ?? "",
        });
      } catch (error) {
        console.error(
          "Load BOM error:",
          error
        );

        await Swal.fire({
          icon: "error",
          title: "Error",
          text:
            error?.response?.data?.message ??
            "Unable to load Article BOM.",
          confirmButtonColor: "#0A4B57",
        });

        navigate("/masters/articlebom");
      } finally {
        setLoading(false);
      }
    };

    loadBOM();
  }, [id, isEdit, navigate]);

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
     ARTICLE CHANGE
  ======================================================= */

  const handleArticleChange = (e) => {
    const articleid = Number(e.target.value);

    const article = articles.find(
      (item) =>
        getArticleId(item) === articleid
    );

    setFormData((prev) => ({
      ...prev,
      articleid:
        articleid || "",
      categoryid:
        article?.categoryid ??
        article?.categoryId ??
        "",
    }));
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = () => {
    if (!formData.articleid) {
      Swal.fire({
        icon: "warning",
        title: "Article Required",
        text: "Please select Article.",
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

    if (!formData.colorid) {
      Swal.fire({
        icon: "warning",
        title: "Color Required",
        text: "Please select Color.",
        confirmButtonColor: "#0A4B57",
      });

      return false;
    }

    if (!formData.sizegroupid) {
      Swal.fire({
        icon: "warning",
        title: "Size Group Required",
        text: "Please select Size Group.",
        confirmButtonColor: "#0A4B57",
      });

      return false;
    }

    return true;
  };

  /* =======================================================
     SAVE BOM
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
        articleid:
          Number(formData.articleid),

        categoryid:
          Number(formData.categoryid),

        colorid:
          Number(formData.colorid),

        sizegroupid:
          Number(formData.sizegroupid),

        upperrexineid:
          formData.upperrexineid
            ? Number(formData.upperrexineid)
            : null,

        upperrexineavg:
          formData.upperrexineavg !== ""
            ? Number(formData.upperrexineavg)
            : null,

        insolerexineid:
          formData.insolerexineid
            ? Number(formData.insolerexineid)
            : null,

        insolerexineavg:
          formData.insolerexineavg !== ""
            ? Number(formData.insolerexineavg)
            : null,

        epdmid:
          formData.epdmid
            ? Number(formData.epdmid)
            : null,

        epdmavg:
          formData.epdmavg !== ""
            ? Number(formData.epdmavg)
            : null,

        liningid:
          formData.liningid
            ? Number(formData.liningid)
            : null,

        liningavg:
          formData.liningavg !== ""
            ? Number(formData.liningavg)
            : null,

        componentsid:
          formData.componentsid
            ? Number(formData.componentsid)
            : null,

        componentsavg:
          formData.componentsavg !== ""
            ? Number(formData.componentsavg)
            : null,

        other1id:
          formData.other1id
            ? Number(formData.other1id)
            : null,

        other1avg:
          formData.other1avg !== ""
            ? Number(formData.other1avg)
            : null,

        other2id:
          formData.other2id
            ? Number(formData.other2id)
            : null,

        other2avg:
          formData.other2avg !== ""
            ? Number(formData.other2avg)
            : null,

        other3id:
          formData.other3id
            ? Number(formData.other3id)
            : null,

        other3avg:
          formData.other3avg !== ""
            ? Number(formData.other3avg)
            : null,

        other4id:
          formData.other4id
            ? Number(formData.other4id)
            : null,

        other4avg:
          formData.other4avg !== ""
            ? Number(formData.other4avg)
            : null,

        other5id:
          formData.other5id
            ? Number(formData.other5id)
            : null,

        other5avg:
          formData.other5avg !== ""
            ? Number(formData.other5avg)
            : null,
      };

      if (isEdit) {
        await api.put(
          `/articlebom/${id}`,
          payload
        );

        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Article BOM updated successfully.",
          confirmButtonColor: "#0A4B57",
        });
      } else {
        await api.post(
          "/articlebom",
          payload
        );

        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Article BOM saved successfully.",
          confirmButtonColor: "#0A4B57",
        });
      }

      navigate("/masters/articlebom");
    } catch (error) {
      console.error(
        "SAVE ARTICLE BOM ERROR:",
        error
      );

      const serverMessage =
        error?.response?.data?.message ??
        error?.response?.data?.error;

      await Swal.fire({
        icon: "error",
        title: "Save Failed",
        text:
          serverMessage ??
          error?.message ??
          "Unable to save Article BOM.",
        confirmButtonColor: "#0A4B57",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     MATERIAL SELECT
  ======================================================= */

  const renderMaterialField = ({
    id,
    avg,
    label,
  }) => {
    return (
      <div
        key={id}
        className="bg-slate-50 border border-slate-200 rounded-xl p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* MATERIAL */}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {label}
            </label>

            <select
              name={id}
              value={formData[id]}
              onChange={handleChange}
              className="w-full h-[42px] rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#0A4B57] focus:ring-2 focus:ring-[#0A4B57]/10"
            >
              <option value="">
                Select {label}
              </option>

              {materials.map((item) => {
                const materialid =
                  getMaterialId(item);

                return (
                  <option
                    key={materialid}
                    value={materialid}
                  >
                    {getMaterialName(item)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* AVG */}

          <FormInput
            label="Average"
            name={avg}
            type="number"
            step="0.0001"
            min="0"
            value={formData[avg]}
            onChange={handleChange}
            placeholder="0.0000"
          />

        </div>
      </div>
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="w-12 h-12 mx-auto rounded-full border-4 border-slate-200 border-t-[#0A4B57] animate-spin" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading Article BOM...
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

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5">

          <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/masters/articlebom"
                  )
                }
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition"
              >
                <FaArrowLeft />
              </button>

              <div className="w-10 h-10 rounded-xl bg-[#0A4B57] text-white flex items-center justify-center font-bold text-lg">
                B
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#0A4B57]">
                  {isEdit
                    ? "Edit Article BOM"
                    : "Add Article BOM"}
                </h1>

                <p className="text-xs sm:text-sm text-slate-500">
                  Article Bill of Material
                </p>
              </div>

            </div>

            <span className="self-start sm:self-auto px-3 py-1.5 rounded-full bg-orange-50 text-[#EF8535] text-xs font-bold">
              ARTICLE BOM
            </span>

          </div>

          <div className="h-1 bg-gradient-to-r from-[#0A4B57] to-[#EF8535]" />

        </div>

        <form onSubmit={handleSubmit}>

          {/* =================================================
              ARTICLE DETAILS
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-5">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                Article Details
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Select article and BOM configuration
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* ARTICLE */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Article
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <select
                  name="articleid"
                  value={formData.articleid}
                  onChange={handleArticleChange}
                  className="w-full h-[42px] rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#0A4B57] focus:ring-2 focus:ring-[#0A4B57]/10"
                >
                  <option value="">
                    Select Article
                  </option>

                  {articles.map((item) => {
                    const articleid =
                      getArticleId(item);

                    return (
                      <option
                        key={articleid}
                        value={articleid}
                      >
                        {getArticleNo(item)} -{" "}
                        {getArticleName(item)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* CATEGORY */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Category
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <select
                  name="categoryid"
                  value={formData.categoryid}
                  onChange={handleChange}
                  className="w-full h-[42px] rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#0A4B57] focus:ring-2 focus:ring-[#0A4B57]/10"
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map((item) => {
                    const categoryid =
                      getCategoryId(item);

                    return (
                      <option
                        key={categoryid}
                        value={categoryid}
                      >
                        {getCategoryName(item)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* COLOR */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Color
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <select
                  name="colorid"
                  value={formData.colorid}
                  onChange={handleChange}
                  className="w-full h-[42px] rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#EF8535] focus:ring-2 focus:ring-[#EF8535]/10"
                >
                  <option value="">
                    Select Color
                  </option>

                  {colors.map((item) => {
                    const colorid =
                      getColorId(item);

                    return (
                      <option
                        key={colorid}
                        value={colorid}
                      >
                        {getColorName(item)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* SIZE GROUP */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Size Group
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </label>

                <select
                  name="sizegroupid"
                  value={formData.sizegroupid}
                  onChange={handleChange}
                  className="w-full h-[42px] rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#0A4B57] focus:ring-2 focus:ring-[#0A4B57]/10"
                >
                  <option value="">
                    Select Size Group
                  </option>

                  {sizeGroups.map((item) => {
                    const sizegroupid =
                      getSizeGroupId(item);

                    return (
                      <option
                        key={sizegroupid}
                        value={sizegroupid}
                      >
                        {getSizeGroupName(item)}
                      </option>
                    );
                  })}
                </select>
              </div>

            </div>
          </div>

          {/* =================================================
              MATERIAL BOM
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-5">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Material BOM
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Select material and enter average consumption
                </p>
              </div>

              <div className="px-4 py-2 rounded-xl bg-[#0A4B57] text-white">
                <div className="text-[10px] uppercase opacity-70">
                  Material Fields
                </div>

                <div className="text-xl font-bold">
                  10
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {MATERIAL_FIELDS.map(
                renderMaterialField
              )}

            </div>

          </div>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-5">

            <h2 className="text-lg font-bold text-slate-800">
              BOM Summary
            </h2>

            <p className="text-xs text-slate-500 mt-1 mb-5">
              Selected materials for this article
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">

              {MATERIAL_FIELDS.map(
                ({ id, avg, label }) => {

                  const material = materials.find(
                    (item) =>
                      getMaterialId(item) ===
                      Number(formData[id])
                  );

                  if (!formData[id]) {
                    return null;
                  }

                  return (
                    <div
                      key={id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >

                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        {label}
                      </div>

                      <div className="mt-1 text-sm font-bold text-slate-800">
                        {material
                          ? getMaterialName(material)
                          : "-"}
                      </div>

                      <div className="mt-2 flex justify-between">

                        <span className="text-xs text-slate-500">
                          Average
                        </span>

                        <span className="text-xs font-bold text-[#0A4B57]">
                          {formData[avg] || "0"}
                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  navigate(
                    "/masters/articlebom"
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
                      ? "Update BOM"
                      : "Save BOM"}
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

export default AddArticleBOM;