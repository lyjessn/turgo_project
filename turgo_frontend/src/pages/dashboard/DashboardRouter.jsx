import { useAuth } from "../../auth/useAuth";

import DashboardAdminOwner from "./DashboardAdminOwner";
import DashboardMitra from "./DashboardMitra";
import DashboardUmkm from "./DashboardUmkm";

const DashboardRouter = () => {

  const { role } = useAuth();
  console.log(role);

  if (role === "admin" || role === "owner") {
    return <DashboardAdminOwner />;
  }

  if (
    role === "homestay" ||
    role === "tour_guide" ||
    role === "pelaku_wisata"
  ) {
    return <DashboardMitra />;
  }

  if (role === "umkm") {
    return <DashboardUmkm />;
  }

  return <div>Dashboard tidak tersedia</div>;
};

export default DashboardRouter;