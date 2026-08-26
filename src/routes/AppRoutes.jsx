
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/auth/Login";

import Dashboard from "../pages/dashboard/Dashboard";
import Masters from "../pages/masters/Masters";
import Purchase from "../pages/purchase/Purchase";
import Sales from "../pages/sales/Sales";
import Inventory from "../pages/inventory/Inventory";
import Production from "../pages/production/Production";
import Reports from "../pages/reports/Reports";
import Settings from "../pages/settings/Settings";

import Company from "../pages/masters/company/Company";
import AddCompany from "../pages/masters/company/AddCompany";
import Users from "../pages/masters/user/Users"
import AddUser from "../pages/masters/user/AddUser";
import SalesPerson from "../pages/masters/salesperson/SalesPerson";
import AddSalesPerson from "../pages/masters/salesperson/AddSalesPerson"
import Gender from "../pages/masters/gender/Gender";
import AddGender from "../pages/masters/gender/AddGender";
import Category from "../pages/masters/category/Category";
import AddCategory from "../pages/masters/category/AddCategory";
import Color from "../pages/masters/color/Color";
import AddColor from "../pages/masters/color/AddColor";
import SizeGroup from "../pages/masters/sizegroup/SizeGroup";
import AddSizeGroup from "../pages/masters/sizegroup/AddSizeGroup";
import Size from "../pages/masters/size/Size";
import AddSize from "../pages/masters/size/AddSize";



const AppRoutes = () => {

    return (
        <Routes>
            {/* =========================
                LOGIN
            ========================= */}
            <Route path="/login"element={<Login />}/>
            {/* =========================
                DEFAULT
            ========================= */}
            <Route path="/"element={<Navigate to="/login" replace />}/>
            {/* =========================
                PROTECTED ERP ROUTES
            ========================= */}
            <Route element={<ProtectedRoute />}>
                {/* MAIN ERP LAYOUT */}
                <Route element={<MainLayout />}>
                    <Route path="/dashboard"element={<Dashboard />}/>
                    <Route path="/masters"element={<Masters />}/>
                    <Route path="/purchase"element={<Purchase />}/>
                    <Route path="/sales"element={<Sales />}/>
                    <Route path="/inventory" element={<Inventory />}/>
                    <Route path="/production"element={<Production />}/>
                    <Route path="/reports" element={<Reports />}/>
                    <Route path="/settings" element={<Settings />}/>
                    <Route path="/masters/company" element={<Company />}/>
                    <Route path="/masters/company/add" element={<AddCompany />}/>
                    <Route path="/masters/company/edit/:id"element={<AddCompany />}/>
                    {/* USERS */}
                    <Route path="/masters/users" element={<Users/>}/>
                    <Route path="/masters/users/add" element={<AddUser />}/>
                    <Route path="/masters/users/edit/:id"element={<AddUser />}/>
                    {/* SALES PERSON */}
                    <Route path="/masters/salesperson" element={<SalesPerson/>}/>
                    <Route path="/masters/salesperson/add" element={<AddSalesPerson />}/>
                    <Route path="/masters/salesperson/edit/:id"element={<AddSalesPerson />}/>

                    {/* SALES PERSON */}
                    <Route path="/masters/gender" element={<Gender/>}/>
                    <Route path="/masters/gender/add" element={<AddGender />}/>
                    <Route path="/masters/gender/edit/:id"element={<AddGender />}/>

                    {/* SALES CATEGORY */}
                    <Route path="/masters/category" element={<Category/>}/>
                    <Route path="/masters/category/add" element={<AddCategory />}/>
                    <Route path="/masters/category/edit/:id"element={<AddCategory />}/>

                    {/* COLOR */}
                    <Route path="/masters/color" element={<Color/>}/>
                    <Route path="/masters/color/add" element={<AddColor />}/>
                    <Route path="/masters/color/edit/:id"element={<AddColor />}/>

                    {/* SIZE GROUP */}
                    <Route path="/masters/sizegroup" element={<SizeGroup/>}/>
                    <Route path="/masters/sizegroup/add" element={<AddSizeGroup />}/>
                    <Route path="/masters/sizegroup/edit/:id"element={<AddSizeGroup />}/>

                    {/* SIZE */}
                    <Route path="/masters/size" element={<Size/>}/>
                    <Route path="/masters/size/add" element={<AddSize />}/>
                    <Route path="/masters/size/edit/:id"element={<AddSize />}/>

                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;

