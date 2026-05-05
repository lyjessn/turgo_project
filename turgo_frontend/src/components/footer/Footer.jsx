import { FiPhone, FiMapPin } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import logoTurgo from "../../assets/logo-turgo.png";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-col footer-brand">
          <img
            src={logoTurgo}
            alt="Desa Wisata Turgo"
            className="footer-logo"
          />
          <div className="footer-brand-text">
            <p>Desa</p>
            <p>Wisata</p>
            <p>Turgo</p>
          </div>
        </div>
        <div className="footer-col">

          <div className="footer-item">
            <FiPhone />
            <span>0823-1351-5092</span>
          </div>

          <div className="footer-item">
            <FaInstagram />
            <span>@desawisataturgo</span>
          </div>

          <div className="footer-item">
            <FaTiktok />
            <span>@TourGo2025</span>
          </div>
        </div>

        <div className="footer-col">

          <div className="footer-item location">
            <FiMapPin />
            <span>
              Dusun Turgo, Desa Purwobinangun, Kec. Pakem, Ngepring,
              Purwobinangun, Sleman, Kabupaten Sleman,
              Daerah Istimewa Yogyakarta 55582, Indonesia
            </span>
          </div>
        </div>

      </div>

    </footer>
  );
};

export default Footer;
