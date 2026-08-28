import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OrderTable = ({ order, onDelete }) => {

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
                Order No.
              </th>

              <th className="p-3 text-center">
                Order Date
              </th>

               <th className="p-3 text-center">
                Sales Person
              </th>

               <th className="p-3 text-center">
                Total Qty.
              </th>

               <th className="p-3 text-center">
                Status
              </th>

              <th className="p-3 text-center">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {!order || order.length === 0 ? (

              <tr>

                <td
                  colSpan={4}
                  className="text-center py-10 text-gray-500"
                >
                  No Order Found
                </td>

              </tr>

            ) : (

              order.map((item, index) => (

                <tr
                  key={item.orderid}
                  className="border-b hover:bg-slate-50 transition"
                >

                  {/* # */}

                  <td className="p-3 text-center">
                    {index + 1}
                  </td>


                  {/* ORDER NO */}

                  <td className="p-3 font-medium whitespace-nowrap">
                    {item.orderno}
                  </td>


                  {/* ORDER DATE */}

                 <td className="p-3 text-center font-medium">
  {item.orderdate
    ? new Date(item.orderdate).toLocaleDateString("en-GB")
    : ""}
</td>

                  <td className="p-3 text-center font-medium">
                    {item.salesperson}
                  </td>

                  <td className="p-3 text-center font-medium">
                    {item.totalqty}
                  </td>


                  {/* ACTION */}

                  <td className="p-3">

                    <div className="flex justify-center gap-2">

                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/production/order/edit/${item.orderid}`
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
                          onDelete(item.orderid)
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

export default OrderTable;