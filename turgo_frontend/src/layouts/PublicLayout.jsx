import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import PublicNavbar from "../components/navbar/PublicNavbar";
import { redirectByRole } from "../auth/redirectByRole";
import Footer from "../components/footer/Footer";

const PublicLayout = () => {
  const location = useLocation();
  const isOverlayPage = ["/", "/budaya", "/kuliner"].includes(location.pathname);
  const navigate = useNavigate();
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      navigate(redirectByRole(role), { replace: true });
    }
  }, [location.pathname]);

  return (
    <>
      <PublicNavbar variant={isOverlayPage ? "overlay" : "solid"} />
      <Outlet />
      <Footer />
    </>
  );
};

export default PublicLayout;
