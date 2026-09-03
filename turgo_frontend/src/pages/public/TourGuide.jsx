import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/baseUrl";
import "./css/Catalog.css";
import "../../components/homepage/paketwisatasection.css";
import { FiUsers, FiCalendar, FiGlobe, FiStar, FiSearch } from "react-icons/fi";
import { BiMoney } from "react-icons/bi";
import { getAllTourGuide, getAvailableTourGuide } from "../../api/apiTourGuide";

const TourGuide = () => {
  const [guides, setGuides] = useState([]);
  const [available, setAvailable] = useState([]);
  const [search, setSearch] = useState("");
  const [tanggal, setTanggal] = useState("");
  const inputRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getAllTourGuide();
      setGuides(res || []);
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

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateString = minDate.toISOString().split("T")[0];

  return (
    <div className="catalog-container">

      <div className="catalog-header">
        <h1>Tour Guide</h1>
        <p>Temukan tour guide terbaik sesuai jadwalmu!</p>
      </div>

      <div className="catalog-filter-row">

        <div className="date-filter">
          <input
            ref={inputRef}
            type="date"
            min={minDateString}
            value={tanggal}
            onChange={(e) => {
              setTanggal(e.target.value);
              e.target.blur();
            }}
          />

          <div
            className="date-toggle"
            onClick={() => inputRef.current?.showPicker()}
          >
            <span>{tanggal ? tanggal : "Pilih Tanggal"}</span>

            <div className="date-icon">
              <FiCalendar />
            </div>
          </div>
        </div>

        <div className="catalog-search-wrapper">
          <FiSearch className="catalog-search-icon" />
          <input
            className="catalog-search"
            placeholder="Cari tour guide..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </div>

      <div className="catalog-grid">
        {dataToShow.length === 0 ? (
          <p className="empty-state">
            {search
            ? `Tidak ditemukan hasil untuk "${search}"`
            : tanggal
            ? "Tidak ada guide tersedia di tanggal ini"
            : "Belum ada tour guide tersedia"}
          </p>
        ) : (
          dataToShow.map((guide) => (
            <div
              key={guide.id}
              className="paket-card-small"
              style={{
                backgroundImage: `url(${BASE_URL}/storage/${guide.foto_profil})`,
              }}
            >

              <div className="paket-kecil-content">
                <div className="paket-title-row">
                  <h4>{guide.user?.nama_lengkap}</h4>
                    <span className="paket-kecil-rating">
                      ⭐ {Number(guide.ratings_avg_bintang ?? 0).toFixed(1)}
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

          ))
        )}

      </div>

    </div>
  );
};

export default TourGuide;
