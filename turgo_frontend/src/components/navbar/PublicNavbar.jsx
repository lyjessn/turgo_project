import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../auth/useAuth";
import logoTurgo from "../../assets/logo-turgo.png";
import "./publicNavbar.css";

const PublicNavbar = ({ variant = "solid" }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleNavigate = (path) => {
        navigate(path);
        setOpen(false);
    };

    useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth > 768) {
        setOpen(false);
        }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            <nav className={`public-navbar ${variant === "overlay" ? "overlay" : ""}`}>
                <div className="public-navbar-logo" onClick={() => navigate("/")}>
                    <img src={logoTurgo} alt="Desa Wisata Turgo" />
                </div>

                <div className="public-navbar-menu">
                    <span onClick={() => navigate("/")}>Beranda</span>
                    <span onClick={() => navigate("/wisata")}>Wisata</span>
                    <span onClick={() => navigate("/tour-guide")}>Tour Guide</span>
                    <span onClick={() => navigate("/homestay")}>Homestay</span>
                    <span onClick={() => navigate("/budaya")}>Budaya</span>
                    <span onClick={() => navigate("/kuliner")}>Kuliner</span>
                </div>

                {open && (
                    <div className="mobile-menu">

                        <span onClick={() => handleNavigate("/")}>Beranda</span>
                        <span onClick={() => handleNavigate("/wisata")}>Wisata</span>
                        <span onClick={() => handleNavigate("/tour-guide")}>Tour Guide</span>
                        <span onClick={() => handleNavigate("/homestay")}>Homestay</span>
                        <span onClick={() => handleNavigate("/budaya")}>Budaya</span>
                        <span onClick={() => handleNavigate("/kuliner")}>Kuliner</span>

                        <div className="mobile-divider" />

                        {!user ? (
                        <span onClick={() => handleNavigate("/login")}>
                            Masuk / Daftar
                        </span>
                        ) : (
                        <>
                            <span onClick={() => handleNavigate("/profile")}>
                            Profil
                            </span>
                            <span className="logout"
                                onClick={() => setShowLogoutModal(true)}
                            >
                                Logout
                            </span>
                        </>
                        )}
                    </div>
                )}

                <div className="public-navbar-user">
                    <div className="desktop-only">
                        {!user ? (
                        <button
                            className="login-btn"
                            onClick={() => navigate("/login")}
                        >
                            Masuk / Daftar
                        </button>
                        ) : (
                        <div className="user-dropdown">
                            <span className="user-icon" style={{color:"white"}}>👤</span>
                            <div className="dropdown-menu">
                                <span onClick={() => navigate("/profile")}>Profil</span>
                                <span className="logout"
                                    onClick={() => setShowLogoutModal(true)}
                                >
                                    Logout
                                </span>
                            </div>
                        </div>
                        )}
                    </div>

                    <div
                        className="mobile-only mobile-menu-icon"
                        onClick={() => setOpen(!open)}
                    >
                        ☰
                    </div>
                </div>

            </nav>
            {showLogoutModal && (
                <div className="logout-modal-overlay">
                    <div className="logout-modal">
                        <h3>Konfirmasi Logout</h3>
                        <p>Apakah Anda yakin ingin logout?</p>

                        <div className="logout-modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowLogoutModal(false)}
                            >
                                Batal
                            </button>

                            <button
                                className="btn-danger"
                                onClick={() => {
                                    logout();
                                    setShowLogoutModal(false);
                                    navigate("/");
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PublicNavbar;
