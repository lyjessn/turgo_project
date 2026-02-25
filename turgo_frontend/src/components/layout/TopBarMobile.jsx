import { FiMenu } from "react-icons/fi";
import logoTurgo from "../../assets/logo-turgo.png";
import "./TopBarMobile.css";

const TopBarMobile = ({ onMenuClick }) => {
  return (
    <div className="topbar-mobile">
      <button className="menu-btn" onClick={onMenuClick}>
        <FiMenu />
      </button>

      <img src={logoTurgo} alt="Turgo" className="logo" />
    </div>
  );
};

export default TopBarMobile;
