import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/iconTurgo.jpg";
import "./HeroSection.css";

const HeroSection = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  console.log("user", user);

  return (
    <div className="hero-section">
      <div
        className="hero-bg"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />

      <div className="hero-overlay" />

      <div className="hero-content">
        <h1>
          Desa Wisata Turgo
          <br />
          <span>Sugeng Rawuh</span>
        </h1>

        <p className="hero-subtitle">
          ketika alam dan budaya menyatu <br />
          ke dalam sebuah kehidupan yang sederhana
        </p>

        {!user && (
          <button
            className="hero-cta"
            onClick={() => navigate("/login")}
          >
            Masuk / Daftar
          </button>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
