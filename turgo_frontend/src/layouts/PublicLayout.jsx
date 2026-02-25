import { Outlet, useLocation } from "react-router-dom";
import PublicNavbar from "../components/navbar/PublicNavbar";
import Footer from "../components/footer/Footer";

const PublicLayout = () => {
  const location = useLocation();

  const isOverlayPage = ["/", "/budaya", "/kuliner"].includes(location.pathname);

  return (
    <>
      <PublicNavbar variant={isOverlayPage ? "overlay" : "solid"} />
      <Outlet />
      <Footer />
    </>
  );
};

export default PublicLayout;
