import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="hero-section">
      <div
        className="hero-bg"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470')",
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
