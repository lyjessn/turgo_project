import HeroSection from "../../components/homepage/HeroSection";
import PaketWisataSection from "../../components/homepage/PaketWisataSection";
import HomestaySection from "../../components/homepage/HomestaySection";
import TourGuideSection from "../../components/homepage/TourGuideSection";
import Footer from "../../components/footer/Footer";

import "./css/Homepage.css";

const Homepage = () => {
  return (
    <>
      <section className="hero-section page-edge">
        <div className="hero-wrapper">
          <HeroSection />
        </div>
      </section>

      <section>
        <div className="page-edge">
          <PaketWisataSection />
        </div>
      </section>

      <section>
        <div className="page-edge">
          <HomestaySection />
        </div>
      </section>

      <section>
        <div className="page-edge">
          <TourGuideSection />
        </div>
      </section>
    </>
  );
};


export default Homepage;
