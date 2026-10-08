import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
// import api from "../../api"; // apna api path

const MaterialTable = ({ material,  onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <div className="overflow-x-auto">

        <table className="min-w-[900px] w-full">

          <thead className="bg-[#0A4B57] text-white">

            <tr>
              <th className="p-3 text-center">#</th>
              <th className="p-3 text-left">Material</th>
              <th className="p-3 text-center">Action</th>
            </tr>

          </thead>


          <tbody>

          {
            !material || material.length === 0 ?

            (
              <tr>
                <td
                colSpan={7}
                className="text-center py-10 text-gray-500"
                >
                  No Material Found
                </td>
              </tr>
            )

            :

            material.map((item,index)=>(

              <tr
              key={item.materialid}
              className="border-b hover:bg-slate-50 transition"
              >

                <td className="p-3 text-center">
                  {index+1}
                </td>


                <td className="p-3 font-medium whitespace-nowrap">
                  {item.material}
                </td>

                

                


                <td className="p-3">

                  <div className="flex justify-center gap-2">


                    <button
                    onClick={()=>
                      navigate(`/masters/material/edit/${item.materialid}`)
                    }
                    className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center"
                    >
                      <FaEdit/>
                    </button>



                    <button
  type="button"
  onClick={() => {
    console.log("Button Clicked");
    onDelete(item.materialid);
  }}
  className="w-9 h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center"
>
  <FaTrash />
</button>


                  </div>

                </td>


              </tr>

            ))

          }


          </tbody>

        </table>

      </div>

    </div>
  );
};


export default MaterialTable;