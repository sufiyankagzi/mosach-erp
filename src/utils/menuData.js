import {
  MdDashboard,
  MdCategory,
  MdShoppingCart,
  MdPointOfSale,
  MdInventory,
  MdFactory,
  MdAssessment,
  MdSettings,MdLogout ,
} from "react-icons/md";


import {
  FaBuilding,
  FaCodeBranch,
  FaUserTie,
  FaUsers,
  FaTags,
  FaPalette,
  FaRuler,
  FaBoxes,
} from "react-icons/fa";

const menuData = [
  {
    name: "Dashboard",
    icon: MdDashboard,
    path: "/dashboard",
  },

  {
    name: "Masters",
    icon: MdCategory,

    submenu: [
      {
        name: "Company",
        icon: FaBuilding,
        path: "/masters/company",
      },
       {
        name: "Users",
        icon: FaUserTie,
        path: "/masters/users",
      },
      {
        name: "Sales Person",
        icon: FaCodeBranch,
        path: "/masters/salesperson",
      },
      {
        name: "Gender",
        icon: FaCodeBranch,
        path: "/masters/gender",
      },
       {
        name: "Category",
        icon: FaBoxes,
        path: "/masters/category",
      },
      
     
      {
        name: "Color",
        icon: FaPalette,
        path: "/masters/color",
      },
      {
        name: "Size Group",
        icon: FaRuler,
        path: "/masters/sizegroup",
      },
      {
        name: "Size",
        icon: FaRuler,
        path: "/masters/size",
      },
      {
        name: "Article",
        icon: FaBoxes,
        path: "/masters/article",
      },
    ],
  },

  {
    name: "Vouchers",
    icon: MdFactory,
    submenu: [
      {
        name:"Order",
        icon: MdFactory,
        path:"/voucher/order"
      }
    ],
  },

  {
    name: "Reports",
    icon: MdAssessment,
    submenu: [],
  },

  {
    name: "Settings",
    icon: MdSettings,
    submenu: [],
  },

  {
    name: "Logout",
    icon: MdLogout ,
    action: "logout",
  },
];

export default menuData;