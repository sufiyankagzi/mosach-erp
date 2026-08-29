import React from "react";

const OrderReportTable = ({ orders }) => {

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <div className="overflow-x-auto">

        <table className="min-w-[1200px] w-full">

          {/* TABLE HEADER */}
          <thead className="bg-[#0A4B57] text-white">

            <tr>

              <th className="p-3 text-center">
                #
              </th>

              <th className="p-3 text-left">
                Order No.
              </th>

              <th className="p-3 text-left">
                Date
              </th>

              <th className="p-3 text-left">
                Sales Person
              </th>

              <th className="p-3 text-left">
                Article No.
              </th>

              <th className="p-3 text-left">
                Article Name
              </th>

              <th className="p-3 text-left">
                Color
              </th>

              <th className="p-3 text-left">
                Size Group
              </th>

              <th className="p-3 text-center">
                Size
              </th>

              <th className="p-3 text-center">
                Qty
              </th>

            </tr>

          </thead>


          {/* TABLE BODY */}
          <tbody>

            {!orders || orders.length === 0 ? (

              <tr>

                <td
                  colSpan={10}
                  className="text-center py-10 text-gray-500"
                >
                  No Order Found
                </td>

              </tr>

            ) : (

              orders.map((item, index) => (

                <tr
                  key={item.orderdetailid || item.orderid || index}
                  className="border-b hover:bg-slate-50 transition"
                >

                  {/* # */}
                  <td className="p-3 text-center">
                    {index + 1}
                  </td>


                  {/* ORDER NO */}
                  <td className="p-3 font-medium whitespace-nowrap">
                    {item.orderno || "-"}
                  </td>


                  {/* DATE */}
                  <td className="p-3 whitespace-nowrap">
                    {item.orderdate
                      ? new Date(item.orderdate).toLocaleDateString("en-IN")
                      : "-"}
                  </td>


                  {/* SALES PERSON */}
                  <td className="p-3 whitespace-nowrap">
                    {item.salesperson || "-"}
                  </td>


                  {/* ARTICLE NO */}
                  <td className="p-3 whitespace-nowrap">
                    {item.articleno || "-"}
                  </td>


                  {/* ARTICLE NAME */}
                  <td className="p-3 whitespace-nowrap font-medium">
                    {item.articlename || "-"}
                  </td>


                  {/* COLOR */}
                  <td className="p-3 whitespace-nowrap">
                    {item.color || "-"}
                  </td>


                  {/* SIZE GROUP */}
                  <td className="p-3 whitespace-nowrap">
                    {item.sizegroup || "-"}
                  </td>


                  {/* SIZE */}
                  <td className="p-3 text-center whitespace-nowrap">
                    {item.size || "-"}
                  </td>


                  {/* QTY */}
                  <td className="p-3 text-center font-medium">
                    {item.qty || 0}
                  </td>

                </tr>

              ))

            )}

          </tbody>


          {/* TOTAL */}
          {orders && orders.length > 0 && (

            <tfoot className="bg-slate-100">

              <tr>

                <td
                  colSpan={9}
                  className="p-3 text-right font-semibold"
                >
                  Total Qty
                </td>

                <td className="p-3 text-center font-semibold">
                  {orders.reduce(
                    (total, item) =>
                      total + Number(item.qty || 0),
                    0
                  )}
                </td>

              </tr>

            </tfoot>

          )}

        </table>

      </div>

    </div>
  );
};

export default OrderReportTable;