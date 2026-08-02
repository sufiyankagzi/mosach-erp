import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const companyData = [
  {
    id: 1,
    companyName: "MOSACH INTERNATIONAL PVT. LTD.",
    gst: "24ABCDE1234A1Z5",
    mobile: "9879361093",
    city: "Bahadurgarh, Haryana.",
    status: "Active",
  },
  {
    id: 2,
    companyName: "MOSACH FOOTWEAR",
    gst: "24ABCDE1234A1Z5",
    mobile: "9106405440",
    city: "Bahadurgarh, Haryana.",
    status: "Active",
  },
];

const CompanyTable = ({ search }) => {
  const navigate = useNavigate();

  const filtered = companyData.filter((item) =>
    item.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      {/* Mobile Scroll */}
      <div className="overflow-x-auto">

        <table className="min-w-[900px] w-full">

          <thead className="bg-[#0A4B57] text-white">

            <tr>
              <th className="p-3 text-center">#</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">GST</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">City</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>

          </thead>

          <tbody>

            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-gray-500"
                >
                  No Company Found
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  <td className="p-3 text-center">
                    {index + 1}
                  </td>

                  <td className="p-3 font-medium whitespace-nowrap">
                    {item.companyName}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    {item.gst}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    {item.mobile}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    {item.city}
                  </td>

                  <td className="p-3 text-center">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      {item.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() =>
                          navigate(`/masters/company/edit/${item.id}`)
                        }
                        className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition"
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition"
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

export default CompanyTable;