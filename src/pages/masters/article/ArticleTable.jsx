
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ArticleTable = ({ article, onDelete }) => {
  const navigate = useNavigate();

  const IMAGE_BASE_URL = "https://mosach-erp-server.onrender.com";

  const getImageUrl = (imageurl) => {
    if (!imageurl) return null;

    return imageurl.startsWith("http")
      ? imageurl
      : `${IMAGE_BASE_URL}${imageurl}`;
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <div className="overflow-x-auto">

        <table className="min-w-[1000px] w-full">

          {/* ================= HEADER ================= */}

          <thead className="bg-[#0A4B57] text-white">

            <tr>

              <th className="p-3 text-center">
                #
              </th>

              <th className="p-3 text-left">
                Image
              </th>

              <th className="p-3 text-left">
                Article No.
              </th>

              <th className="p-3 text-left">
                Article Name
              </th>

              <th className="p-3 text-left">
                Category
              </th>

              <th className="p-3 text-left">
                Size Groups
              </th>

              <th className="p-3 text-center">
                Active
              </th>

              <th className="p-3 text-center">
                Action
              </th>

            </tr>

          </thead>


          {/* ================= BODY ================= */}

          <tbody>

            {!article || article.length === 0 ? (

              <tr>

                <td
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  No Article Found
                </td>

              </tr>

            ) : (

              article.map((item, index) => (

                <tr
                  key={item.articleid}
                  className="border-b hover:bg-slate-50 transition"
                >

                  {/* ================= NUMBER ================= */}

                  <td className="p-3 text-center">
                    {index + 1}
                  </td>


                  {/* ================= IMAGE ================= */}

                  <td className="p-2">

                    <div className="flex justify-center">

                      {item.imageurl ? (

                        <img
                          src={getImageUrl(item.imageurl)}
                          alt={item.articlename}
                          className="w-14 h-14 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />

                      ) : (

                        <div className="w-14 h-14 rounded-lg border bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                          No Image
                        </div>

                      )}

                    </div>

                  </td>


                  {/* ================= ARTICLE NO ================= */}

                  <td className="p-3 font-medium whitespace-nowrap">
                    {item.articleno}
                  </td>


                  {/* ================= ARTICLE NAME ================= */}

                  <td className="p-3 font-medium whitespace-nowrap">
                    {item.articlename}
                  </td>


                  {/* ================= CATEGORY ================= */}

                  <td className="p-3 font-medium whitespace-nowrap">
                    {item.category || "-"}
                  </td>


                  {/* ================= SIZE GROUPS ================= */}

                  <td className="p-3">

                    <div className="flex flex-wrap gap-1.5">

                      {item.sizegroups ? (

                        item.sizegroups
                          .split(",")
                          .map((group, groupIndex) => (

                            <span
                              key={groupIndex}
                              className="inline-flex items-center bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            >
                              {group.trim()}
                            </span>

                          ))

                      ) : (

                        <span className="text-gray-400 text-sm">
                          No Size Group
                        </span>

                      )}

                    </div>

                  </td>


                  {/* ================= ACTIVE ================= */}

                  <td className="p-3 text-center">

                    {Number(item.isactive) === 1 ? (

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>

                    ) : (

                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                        Inactive
                      </span>

                    )}

                  </td>


                  {/* ================= ACTION ================= */}

                  <td className="p-2">

                    <div className="flex justify-center gap-2">

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/masters/article/edit/${item.articleid}`
                          )
                        }
                        className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition"
                        title="Edit Article"
                      >
                        <FaEdit />
                      </button>


                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() => {
                          onDelete(item.articleid);
                        }}
                        className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition"
                        title="Delete Article"
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default ArticleTable;
