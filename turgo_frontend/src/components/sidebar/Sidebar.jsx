import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import MenuConfig from "./MenuConfig";
import logoTurgo from "../../assets/logo-turgo.png";
import "./Sidebar.css";

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user, logout } = useAuth();
  const menus = MenuConfig[role] || [];

  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (label) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  const isChildActive = (menu) => {
    if (!menu.children) return false;

    return menu.children.some((child) => {
      const path = child.path;
      return (
        location.pathname === path ||
        location.pathname.startsWith(path + "/")
      );
    });
  };

  useEffect(() => {
    const activeParent = menus.find((menu) => {
      if (!menu.children) return false;

      return menu.children.some((child) => {
        const path = child.path;
        return (
          location.pathname === path ||
          location.pathname.startsWith(path + "/")
        );
      });
    });

    if (activeParent) {
      setOpenMenu(activeParent.label);
    }
  }, [location.pathname, menus]);

  return (
    <>
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <img src={logoTurgo} alt="Turgo" />
          <span className="role">{role}</span>
        </div>

        <div className="sidebar-menu">
          {menus.map((menu, idx) => {
            const Icon = menu.icon;

            if (menu.children) {
              return (
                <div key={idx}>
                  <div
                    className={`sidebar-item ${
                      isChildActive(menu) ? "active-parent" : ""
                    }`}
                    onClick={() => toggleMenu(menu.label)}
                  >
                    {Icon && <Icon className="icon" />}
                    <span>{menu.label}</span>
                    <span className="chevron">
                      {openMenu === menu.label ? "▾" : "▸"}
                    </span>
                  </div>

                  {openMenu === menu.label &&
                    menu.children.map((child, cIdx) => {
                      const ChildIcon = child.icon;

                      return (
                        <div
                          key={cIdx}
                          className={`sidebar-subitem ${
                            location.pathname === child.path ? "active" : ""
                          }`}
                          onClick={() => {
                            navigate(child.path);
                            setIsMobileOpen(false);
                          }}
                        >
                          {ChildIcon && <ChildIcon className="icon" />}
                          <span>{child.label}</span>
                        </div>
                      );
                    })}
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`sidebar-item ${
                  location.pathname === menu.path ? "active" : ""
                }`}
                onClick={() => {
                  navigate(menu.path);
                  setIsMobileOpen(false);
                }}
              >
                {Icon && <Icon className="icon" />}
                <span>{menu.label}</span>
              </div>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">👤</div>
            <div>
              <div className="name">{user?.nama_lengkap}</div>
              <div className="role-text">{role}</div>
            </div>
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
