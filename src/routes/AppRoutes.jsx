import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layout/MainLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import Masters from "../pages/masters/Masters";
import Purchase from "../pages/purchase/Purchase";
import Sales from "../pages/sales/Sales";
import Inventory from "../pages/inventory/Inventory";
import Production from "../pages/production/Production";
import Reports from "../pages/reports/Reports";
import Settings from "../pages/settings/Settings";
import Company from "../pages/masters/company/Company"
import AddCompany from "../pages/masters/company/AddCompany";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/masters" element={<Masters />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/production" element={<Production />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/masters/company/company"  element={<Company/>}/>
        <Route path="/masters/company" element={<Company />} />
        <Route path="/masters/company/add" element={<AddCompany />} />
        <Route path="/masters/company/edit/:id" element={<AddCompany />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;