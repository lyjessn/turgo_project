import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Catalog.css";
import "../../components/homepage/paketwisatasection.css";
import { FiUsers, FiCalendar, FiGlobe, FiStar } from "react-icons/fi";
import { BiMoney } from "react-icons/bi";
import { getAllTourGuide, getAvailableTourGuide } from "../../api/apiTourGuide";

const TourGuide = () => {
  const [guides, setGuides] = useState([]);
  const [available, setAvailable] = useState([]);
  const [search, setSearch] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getAllTourGuide();
      setGuides(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!tanggal) {
      setAvailable([]);
      return;
    }

    fetchAvailable(tanggal);
  }, [tanggal]);

  const fetchAvailable = async (tgl) => {
    try {
      const data = await getAvailableTourGuide(tgl);
      setAvailable(data || []);
    } catch (err) {
      console.error(err);
      setAvailable([]);
    }
  };

  const dataToShow = useMemo(() => {
    let data = tanggal ? available : guides;

    if (search) {
      data = data.filter((g) =>
        (g.user?.nama_lengkap || "").toLowerCase().includes(search.toLowerCase()) ||
        (g.bahasa || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    return data;
  }, [guides, available, tanggal, search]);

  return (
    <div className="catalog-container">

      <div className="catalog-header">
        <h1>Tour Guide</h1>
        <p>Temukan tour guide terbaik sesuai jadwalmu!</p>
      </div>

      <div className="catalog-filter-row">

        <div className="date-filter">
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className={showPicker ? "show" : ""}
          />

          <div
            className="date-toggle"
            onClick={() => setShowPicker(!showPicker)}
          >
            <span>{tanggal || "Pilih Tanggal"}</span>

            <div className="date-icon">
              <FiCalendar />
            </div>
          </div>
        </div>

        <input
          className="catalog-search"
          placeholder="Cari tour guide..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <div className="catalog-grid">

        {dataToShow.map((guide) => (

          <div
            key={guide.id}
            className="paket-card-small"
            style={{
              backgroundImage: `url(http://127.0.0.1:8000/storage/${guide.foto_profil})`,
            }}
          >

            <div className="paket-kecil-content">
              <div className="paket-title-row">
                <h4>{guide.user?.nama_lengkap}</h4>
                <span className="catalog-pill">
                  <FiUsers /> {guide.kapasitas_min}-{guide.kapasitas_max} org
                </span>
              </div>

              <div className="paket-kecil-meta">
                <BiMoney /> Rp{" "}
                {Number(guide.harga_per_hari).toLocaleString("id-ID")} / hari
              </div>
              <div className="paket-kecil-meta">
                <FiGlobe /> {guide.bahasa}
              </div>
              <div className="paket-kecil-meta">
                <FiStar /> {guide.spesialisasi}
              </div>
              <button className="paket-kecil-detail-btn"
                onClick={() =>
                  navigate(`/tour-guide/${guide.id}`, {
                    state: { tanggal }
                  })
                }
              >
                Lihat Detail
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default TourGuide;
