
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


const AppRoutes = () => {

    return (
        <Routes>

            {/* =========================
                LOGIN
            ========================= */}
            <Route
                path="/login"
                element={<Login />}
            />


            {/* =========================
                DEFAULT
            ========================= */}
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />


            {/* =========================
                PROTECTED ERP ROUTES
            ========================= */}

            <Route element={<ProtectedRoute />}>

                {/* MAIN ERP LAYOUT */}
                <Route element={<MainLayout />}>

                    {/* DASHBOARD */}
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    {/* MASTERS */}
                    <Route
                        path="/masters"
                        element={<Masters />}
                    />

                    {/* PURCHASE */}
                    <Route
                        path="/purchase"
                        element={<Purchase />}
                    />

                    {/* SALES */}
                    <Route
                        path="/sales"
                        element={<Sales />}
                    />

                    {/* INVENTORY */}
                    <Route
                        path="/inventory"
                        element={<Inventory />}
                    />

                    {/* PRODUCTION */}
                    <Route
                        path="/production"
                        element={<Production />}
                    />

                    {/* REPORTS */}
                    <Route
                        path="/reports"
                        element={<Reports />}
                    />

                    {/* SETTINGS */}
                    <Route
                        path="/settings"
                        element={<Settings />}
                    />


                    {/* =========================
                        COMPANY
                    ========================= */}

                    <Route
                        path="/masters/company"
                        element={<Company />}
                    />

                    <Route
                        path="/masters/company/add"
                        element={<AddCompany />}
                    />

                    <Route
                        path="/masters/company/edit/:id"
                        element={<AddCompany />}
                    />

                </Route>

            </Route>

        </Routes>
    );
};

export default AppRoutes;

