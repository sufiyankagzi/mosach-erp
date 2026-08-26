import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SizeTable = ({ size, onDelete }) => {

  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <div className="overflow-x-auto">

        <table className="min-w-[900px] w-full">

          <thead className="bg-[#0A4B57] text-white">

            <tr>

              <th className="p-3 text-center">
                #
              </th>

              <th className="p-3 text-left">
                Size Group
              </th>

              <th className="p-3 text-center">
                Size
              </th>

              <th className="p-3 text-center">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {!size || size.length === 0 ? (

              <tr>

                <td
                  colSpan={4}
                  className="text-center py-10 text-gray-500"
                >
                  No Size Found
                </td>

              </tr>

            ) : (

              size.map((item, index) => (

                <tr
                  key={item.sizeid}
                  className="border-b hover:bg-slate-50 transition"
                >

                  {/* # */}

                  <td className="p-3 text-center">
                    {index + 1}
                  </td>


                  {/* SIZE GROUP */}

                  <td className="p-3 font-medium whitespace-nowrap">
                    {item.sizegroup}
                  </td>


                  {/* SIZE */}

                  <td className="p-3 text-center font-medium">
                    {item.size}
                  </td>


                  {/* ACTION */}

                  <td className="p-3">

                    <div className="flex justify-center gap-2">

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/masters/size/edit/${item.sizeid}`
                          )
                        }
                        className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center"
                      >
                        <FaEdit />
                      </button>


                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          onDelete(item.sizeid)
                        }
                        className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center"
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

export default SizeTable;