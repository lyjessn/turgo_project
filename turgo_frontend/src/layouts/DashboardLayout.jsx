import Sidebar from "../components/sidebar/Sidebar";
import TopBarMobile from "../components/layout/TopBarMobile";
import { useState } from "react";

const DashboardLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="dashboard-content">
        <TopBarMobile onMenuClick={() => setIsMobileOpen(true)} />
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
