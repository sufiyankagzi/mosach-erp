import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-100 min-h-screen">

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="lg:ml-64">
        <Header setIsOpen={setIsOpen} />

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default MainLayout;