import Sidebar from "../components/sidebar/Sidebar";
import TopBarMobile from "../components/layout/TopBarMobile";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="dashboard-content">
        <TopBarMobile
          onMenuClick={() => setIsMobileOpen(true)}
        />

        <Outlet />

      </div>
    </div>
  );
};

export default DashboardLayout;