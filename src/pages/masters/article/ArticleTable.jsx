import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ArticleTable = ({ article,  onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <div className="overflow-x-auto">

        <table className="min-w-[900px] w-full">

          <thead className="bg-[#0A4B57] text-white">

            <tr>
              <th className="p-3 text-center">#</th>
              <th className="p-3 text-left">Article No.</th>
              <th className="p-3 text-left">Article Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Size Group</th>
              <th className="p-3 text-left">Active</th>
              <th className="p-3 text-center">Action</th>
            </tr>

          </thead>


          <tbody>

          {
            !article || article.length === 0 ?

            (
              <tr>
                <td
                colSpan={7}
                className="text-center py-5 text-gray-500"
                >
                  No Article Found
                </td>
              </tr>
            )

            :

            article.map((item,index)=>(

              <tr
              key={item.articleid}
              className="border-b hover:bg-slate-50 transition"
              >

                <td className="p-3 text-center">
                  {index+1}
                </td>


                <td className="p-3 font-medium whitespace-nowrap">
                  {item.articleno}
                </td>
                <td className="p-3 font-medium whitespace-nowrap">
                  {item.articlename}
                </td>
                <td className="p-3 font-medium whitespace-nowrap">
                  {item.category}
                </td>
                <td className="p-3 font-medium whitespace-nowrap">
                  {item.sizegroup}
                </td>

                <td className="p-3 text-center">

                  {
                    item.isactive === 1 ?

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      Active
                    </span>

                    :

                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                      Inactive
                    </span>
                  }

                </td>

                

                


                <td className="p-1">

                  <div className="flex justify-center gap-2">


                    <button
                    onClick={()=>
                      navigate(`/masters/article/edit/${item.articleid}`)
                    }
                    className="w-9 h-9 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center"
                    >
                      <FaEdit/>
                    </button>



                    <button
  type="button"
  onClick={() => {
    console.log("Button Clicked");
    onDelete(item.articleid);
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


export default ArticleTable;