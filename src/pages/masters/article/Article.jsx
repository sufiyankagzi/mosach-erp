
import { useEffect, useState } from "react";
import api from "../../../api/axios";
import ArticleTable from "./ArticleTable";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";

const Article = () => {

  const navigate = useNavigate();

  const [article, setArticle] = useState([]);
  const [search, setSearch] = useState("");


  // ========================================
  // GET ARTICLE
  // ========================================

  const getArticle = async () => {

    try {

      const res = await api.get("/article/getallarticles");

      console.log("Article API Response:", res.data);

      setArticle(res.data);

    } catch (error) {

      console.log("Get Article Error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error.response?.data?.message ||
          "Unable to load article.",
      });

    }

  };


  // ========================================
  // DELETE ARTICLE
  // ========================================

  const handleDelete = async (id) => {

    const result = await Swal.fire({
      title: "Delete Article?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });


    if (!result.isConfirmed) return;


    try {

      console.log("Deleting ID:", id);


      const res = await api.delete(
        `/article/deletearticle/${id}`
      );


      console.log("Delete API Response:", res.data);


      // Refresh article
      await getArticle();


      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Article deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });


    } catch (err) {

      console.log("Delete Error:", err);


      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text:
          err.response?.data?.message ||
          err.message ||
          "Unable to delete article.",
      });

    }

  };


// ========================================
// SEARCH
// ========================================

const filteredArticle = article.filter((item) => {

  const keyword = search
    .trim()
    .toLowerCase();

  // Empty search = show all
  if (keyword === "") {
    return true;
  }

  const articleNo = String(item.articleno ?? "")
    .trim()
    .toLowerCase();

  const articleName = String(item.articlename ?? "")
    .trim()
    .toLowerCase();

  const category = String(item.category ?? "")
    .trim()
    .toLowerCase();

  const categoryId = String(item.categoryid ?? "")
    .trim()
    .toLowerCase();

  const sizeGroup = String(item.sizegroup ?? "")
    .trim()
    .toLowerCase();

  const sizeGroupId = String(item.sizegroupid ?? "")
    .trim()
    .toLowerCase();


  const match =
    articleNo.includes(keyword) ||
    articleName.includes(keyword) ||
    category.includes(keyword) ||
    categoryId.includes(keyword) ||
    sizeGroup.includes(keyword) ||
    sizeGroupId.includes(keyword);


  console.log({
    keyword,
    articleNo,
    articleName,
    category,
    categoryId,
    sizeGroup,
    sizeGroupId,
    match
  });


  return match;
});





<input
  type="text"
  placeholder="Search Article..."
  value={search}
  onChange={(e) => {
    const value = e.target.value;

    console.log("SEARCH VALUE:", value);

    setSearch(value);
  }}
  className="w-full border rounded-lg pl-10 pr-4 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>



  // ========================================
  // LOAD ARTICLE
  // ========================================

  useEffect(() => {

    getArticle();

  }, []);


  // ========================================
  // UI
  // ========================================

  return (
    <>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">

        {/* LEFT CONTENT */}

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Article
          </h1>

          <p className="text-slate-500 mt-0.5 text-sm sm:text-base">
            Article Details
          </p>

        </div>


        {/* ADD ARTICLE BUTTON */}

        <Button
          variant="warning"
          onClick={() =>
            navigate("/masters/article/add")
          }
          className="w-full sm:w-auto"
        >
          + Add Article
        </Button>

      </div>

{/* 
      {/* SEARCH */}

      <div className="relative mb-4">

        <FiSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search Article..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg pl-10 pr-4 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

      </div>


      {/* ARTICLE TABLE */}

      <ArticleTable
        article={filteredArticle}
        onDelete={handleDelete}
      />

    </>
  );
};


export default Article;

