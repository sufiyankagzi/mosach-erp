
import {
  MdDashboard,
  MdCategory,
  MdFactory,
  MdAssessment,
  MdLogout,
  MdCloudUpload,
  MdPeople,
  MdInventory,
} from "react-icons/md";

import {
  FaUserTie,
  FaBoxes,
  FaPalette,
  FaRuler,
  FaBuilding,
  FaCodeBranch,
  FaTags,
} from "react-icons/fa";

const menuData = [
  // Dashboard
  {
    name: "Dashboard",
    icon: MdDashboard,
    path: "/dashboard",
  },

  // Masters
  {
    name: "Masters",
    icon: MdCategory,
    submenu: [
      {
        name: "Users",
        icon: FaUserTie,
        path: "/masters/users",
      },
      // {
      //   name: "Company",
      //   icon: FaBuilding,
      //   path: "/masters/company",
      // },
      // {
      //   name: "Sales Person",
      //   icon: FaCodeBranch,
      //   path: "/masters/salesperson",
      // },
      // {
      //   name: "Category",
      //   icon: FaBoxes,
      //   path: "/masters/category",
      // },
      // {
      //   name: "Color",
      //   icon: FaPalette,
      //   path: "/masters/color",
      // },
      // {
      //   name: "Size Group",
      //   icon: FaRuler,
      //   path: "/masters/sizegroup",
      // },
      // {
      //   name: "Size",
      //   icon: FaRuler,
      //   path: "/masters/size",
      // },
      // {
      //   name: "Article",
      //   icon: MdInventory,
      //   path: "/masters/article",
      // },
      // {
      //   name: "Material",
      //   icon: FaTags,
      //   path: "/masters/material",
      // },
    ],
  },

  // Uploads
  {
    name: "Uploads",
    icon: MdCloudUpload,
    submenu: [
      {
        name: "Production Upload",
        icon: MdFactory,
        path: "/production/productionupload",
      },
    ],
  },

  // Reports
  {
    name: "Reports",
    icon: MdAssessment,
    submenu: [
      {
        name: "Production Report",
        icon: MdFactory,
        path: "/reports/production/productionreport",
      },
    ],
  },

  // Logout
  {
    name: "Logout",
    icon: MdLogout,
    action: "logout",
  },
];

export default menuData;

