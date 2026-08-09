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
        name: "Branch",
        icon: FaCodeBranch,
        path: "/masters/branch",
      },
      
      {
        name: "Supplier",
        icon: FaUsers,
        path: "/masters/supplier",
      },
     
      {
        name: "Customer",
        icon: FaUsers,
        path: "/masters/customer",
      },
      {
        name: "Brand",
        icon: FaTags,
        path: "/masters/brand",
      },
      {
        name: "Category",
        icon: FaBoxes,
        path: "/masters/category",
      },
      {
        name: "Group",
        icon: FaBoxes,
        path: "/masters/group",
      },
      {
        name: "Color",
        icon: FaPalette,
        path: "/masters/color",
      },
      {
        name: "Size",
        icon: FaRuler,
        path: "/masters/size",
      },
      {
        name: "Item Master",
        icon: FaBoxes,
        path: "/masters/itemmaster",
      },
    ],
  },

  {
    name: "Purchase",
    icon: MdShoppingCart,
    submenu: [],
  },

  {
    name: "Sales",
    icon: MdPointOfSale,
    submenu: [],
  },

  {
    name: "Inventory",
    icon: MdInventory,
    submenu: [],
  },

  {
    name: "Production",
    icon: MdFactory,
    submenu: [],
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