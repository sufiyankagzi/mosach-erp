
import { useEffect, useState } from "react";
import api from "../../../api/axios";
import ArticleBOMTable from "./ArticleBOMTable";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";

const ArticleBOM = () => {

  const navigate = useNavigate();

  const [articlebom, setArticleBom] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);


  // ========================================
  // GET ALL ARTICLE BOM
  // ========================================

  const getArticleBom = async () => {

    try {

      setLoading(true);

      const res = await api.get("/articlebom");

      console.log("Article BOM API Response:", res.data);

      setArticleBom(res.data);

    } catch (error) {

      console.log("Get Article BOM Error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Unable to load Article BOM.",
      });

    } finally {

      setLoading(false);

    }

  };


  // ========================================
  // DELETE ARTICLE BOM
  // ========================================

  const handleDelete = async (id) => {

    const result = await Swal.fire({

      title: "Delete Article BOM?",

      text: "This action cannot be undone!",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Yes, Delete",

      cancelButtonText: "Cancel",

    });


    if (!result.isConfirmed) return;


    try {

      console.log("Deleting Article BOM ID:", id);


      const res = await api.delete(
        `/articlebom/${id}`
      );


      console.log(
        "Delete Article BOM Response:",
        res.data
      );


      await getArticleBom();


      Swal.fire({

        icon: "success",

        title: "Deleted!",

        text: "Article BOM deleted successfully.",

        timer: 1500,

        showConfirmButton: false,

      });


    } catch (err) {

      console.log(
        "Delete Article BOM Error:",
        err
      );


      Swal.fire({

        icon: "error",

        title: "Delete Failed",

        text:
          err.response?.data?.message ||
          err.message ||
          "Unable to delete Article BOM.",

      });

    }

  };


  // ========================================
  // SEARCH
  // ========================================

  const filteredArticleBom = articlebom.filter((item) => {

    const keyword = search
      .trim()
      .toLowerCase();


    // Empty search = show all

    if (keyword === "") {
      return true;
    }


    const articleNo = String(
      item.articleno ?? ""
    )
      .trim()
      .toLowerCase();


    const articleName = String(
      item.articlename ?? ""
    )
      .trim()
      .toLowerCase();


    const category = String(
      item.category ??
      item.categoryname ??
      ""
    )
      .trim()
      .toLowerCase();


    const color = String(
      item.color ??
      item.colorname ??
      ""
    )
      .trim()
      .toLowerCase();


    const sizeGroup = String(
      item.sizegroup ??
      item.sizegroupname ??
      ""
    )
      .trim()
      .toLowerCase();


    const upperRexine = String(
      item.upperrexine ??
      item.upperrexinename ??
      ""
    )
      .trim()
      .toLowerCase();


    const insoleRexine = String(
      item.insolerexine ??
      item.insolerexinename ??
      ""
    )
      .trim()
      .toLowerCase();


    const epdm = String(
      item.epdm ??
      item.epdmname ??
      ""
    )
      .trim()
      .toLowerCase();


    const lining = String(
      item.lining ??
      item.liningname ??
      ""
    )
      .trim()
      .toLowerCase();


    const components = String(
      item.components ??
      item.componentsname ??
      ""
    )
      .trim()
      .toLowerCase();


    const match =

      articleNo.includes(keyword) ||

      articleName.includes(keyword) ||

      category.includes(keyword) ||

      color.includes(keyword) ||

      sizeGroup.includes(keyword) ||

      upperRexine.includes(keyword) ||

      insoleRexine.includes(keyword) ||

      epdm.includes(keyword) ||

      lining.includes(keyword) ||

      components.includes(keyword);


    return match;

  });


  // ========================================
  // LOAD ARTICLE BOM
  // ========================================

  useEffect(() => {

    getArticleBom();

  }, []);


  // ========================================
  // UI
  // ========================================

  return (

    <>

      {/* ========================================
          HEADER
      ======================================== */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          justify-between
          items-start
          gap-4
          mb-3
        "
      >

        {/* LEFT CONTENT */}

        <div>

          <h1
            className="
              text-2xl
              sm:text-3xl
              font-bold
              text-slate-800
            "
          >
            Article BOM
          </h1>


          <p
            className="
              text-slate-500
              mt-0.5
              text-sm
              sm:text-base
            "
          >
            Article Bill of Material
          </p>

        </div>


        {/* ADD ARTICLE BOM BUTTON */}

        <Button
          variant="warning"
          onClick={() =>
            navigate("/masters/articlebom/add")
          }
          className="w-full sm:w-auto"
        >
          + Add Article BOM
        </Button>

      </div>


      {/* ========================================
          SEARCH
      ======================================== */}

      <div className="relative mb-4">

        <FiSearch
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-gray-400
          "
        />


        <input
          type="text"
          placeholder="Search Article BOM..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="
            w-full
            border
            rounded-lg
            pl-10
            pr-4
            py-2
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        />

      </div>


      {/* ========================================
          LOADING
      ======================================== */}

      {loading ? (

        <div
          className="
            bg-white
            rounded-xl
            shadow
            py-10
            text-center
            text-gray-500
          "
        >
          Loading Article BOM...
        </div>

      ) : (

        /* ========================================
           ARTICLE BOM TABLE
        ======================================== */

        <ArticleBOMTable
          articlebom={filteredArticleBom}
          onDelete={handleDelete}
        />

      )}

    </>

  );

};


export default ArticleBOM;

