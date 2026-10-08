
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ArticleBOMTable = ({ articlebom, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <div className="overflow-x-auto">

        <table className="min-w-[1800px] w-full">

          {/* ================= HEADER ================= */}

          <thead className="bg-[#0A4B57] text-white">

            <tr>

              <th className="p-3 text-center">
                #
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
                Color
              </th>

              <th className="p-3 text-left">
                Size Group
              </th>

              <th className="p-3 text-left">
                Upper Rexine
              </th>

              <th className="p-3 text-center">
                Avg
              </th>

              <th className="p-3 text-left">
                Insole Rexine
              </th>

              <th className="p-3 text-center">
                Avg
              </th>

              <th className="p-3 text-left">
                EPDM
              </th>

              <th className="p-3 text-center">
                Avg
              </th>

              <th className="p-3 text-left">
                Lining
              </th>

              <th className="p-3 text-center">
                Avg
              </th>

              <th className="p-3 text-left">
                Components
              </th>

              <th className="p-3 text-center">
                Avg
              </th>

              <th className="p-3 text-center">
                Action
              </th>

            </tr>

          </thead>


          {/* ================= BODY ================= */}

          <tbody>

            {!articlebom || articlebom.length === 0 ? (

              <tr>

                <td
                  colSpan={17}
                  className="text-center py-8 text-gray-500"
                >
                  No Article BOM Found
                </td>

              </tr>

            ) : (

              articlebom.map((item, index) => (

                <tr
                  key={item.articlebomid}
                  className="border-b hover:bg-slate-50 transition"
                >

                  {/* ================= NUMBER ================= */}

                  <td className="p-3 text-center">
                    {index + 1}
                  </td>


                  {/* ================= ARTICLE NO ================= */}

                  <td className="p-3 font-medium whitespace-nowrap">
                    {item.articleno || "-"}
                  </td>


                  {/* ================= ARTICLE NAME ================= */}

                  <td className="p-3 font-medium whitespace-nowrap">
                    {item.articlename || "-"}
                  </td>


                  {/* ================= CATEGORY ================= */}

                  <td className="p-3 whitespace-nowrap">
                    {item.category || item.categoryname || "-"}
                  </td>


                  {/* ================= COLOR ================= */}

                  <td className="p-3 whitespace-nowrap">
                    {item.color || item.colorname || "-"}
                  </td>


                  {/* ================= SIZE GROUP ================= */}

                  <td className="p-3 whitespace-nowrap">
                    {item.sizegroup || item.sizegroupname || "-"}
                  </td>


                  {/* ================= UPPER REXINE ================= */}

                  <td className="p-3 whitespace-nowrap">
                    {item.upperrexine || item.upperrexinename || "-"}
                  </td>

                  <td className="p-3 text-center whitespace-nowrap">
                    {item.upperrexineavg ?? "-"}
                  </td>


                  {/* ================= INSOLE REXINE ================= */}

                  <td className="p-3 whitespace-nowrap">
                    {item.insolerexine || item.insolerexinename || "-"}
                  </td>

                  <td className="p-3 text-center whitespace-nowrap">
                    {item.insolerexineavg ?? "-"}
                  </td>


                  {/* ================= EPDM ================= */}

                  <td className="p-3 whitespace-nowrap">
                    {item.epdm || item.epdmname || "-"}
                  </td>

                  <td className="p-3 text-center whitespace-nowrap">
                    {item.epdmavg ?? "-"}
                  </td>


                  {/* ================= LINING ================= */}

                  <td className="p-3 whitespace-nowrap">
                    {item.lining || item.liningname || "-"}
                  </td>

                  <td className="p-3 text-center whitespace-nowrap">
                    {item.liningavg ?? "-"}
                  </td>


                  {/* ================= COMPONENTS ================= */}

                  <td className="p-3 whitespace-nowrap">
                    {item.components || item.componentsname || "-"}
                  </td>

                  <td className="p-3 text-center whitespace-nowrap">
                    {item.componentsavg ?? "-"}
                  </td>


                  {/* ================= ACTION ================= */}

                  <td className="p-2">

                    <div className="flex justify-center gap-2">

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/masters/articlebom/edit/${item.articlebomid}`
                          )
                        }
                        className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition"
                        title="Edit Article BOM"
                      >
                        <FaEdit />
                      </button>


                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() => {
                          onDelete(item.articlebomid);
                        }}
                        className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition"
                        title="Delete Article BOM"
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

export default ArticleBOMTable;
