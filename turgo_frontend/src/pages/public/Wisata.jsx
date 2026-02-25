import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Catalog.css";
import "../../components/homepage/paketwisatasection.css";
import { FiClock, FiMapPin, FiCalendar } from "react-icons/fi";
import { BiMoney } from "react-icons/bi";
import { getAllPaketWisata, getAvailablePaketWisata } from "../../api/apiPaketWisata";

const Wisata = () => {
  const [pakets, setPakets] = useState([]);
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
      const res = await getAllPaketWisata();
      setPakets(res.data.data || []);
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
      const data = await getAvailablePaketWisata(tgl);
      setAvailable(data || []);
    } catch (err) {
      console.error(err);
      setAvailable([]);
    }
  };

  const dataToShow = useMemo(() => {
    let data = tanggal ? available : pakets;

    if (search) {
      data = data.filter((p) =>
        p.nama.toLowerCase().includes(search.toLowerCase())
      );
    }

    return data;
  }, [pakets, available, tanggal, search]);

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1>Paket Wisata</h1>
        <p>Temukan opsi terbaik untuk jadwalmu!</p>
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
            <span>{tanggal ? tanggal : "Pilih Tanggal"}</span>

            <div className="date-icon">
              <FiCalendar />
            </div>
          </div>
        </div>

        <input
          className="catalog-search"
          placeholder="Cari paket wisata..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="catalog-grid">
        {dataToShow.map((paket) => (
          <div
            key={paket.id}
            className="paket-card-small"
            style={{
              backgroundImage: `url(http://127.0.0.1:8000/storage/${paket.url_thumbnail})`,
            }}
          >
            <div className="paket-kecil-content">
              <div className="catalog-pill-row">
                  <span className="catalog-pill">
                      {paket.kategori_paket}
                  </span>
                  <span className="catalog-pill">
                      {paket.durasi}
                  </span>
              </div>
              <div className="paket-title-row">
                <h4>{paket.nama}</h4>
                <span className="paket-kecil-rating">
                  ⭐ {Number(paket.ratings_avg_bintang ?? 0).toFixed(1)} (
                  {paket.ratings_count ?? 0})
                </span>
              </div>

              <div className="paket-kecil-meta">
                <BiMoney /> Rp{" "}
                {Number(paket.harga || 0).toLocaleString("id-ID")}
              </div>

              <div className="paket-kecil-meta">
                <FiMapPin /> {paket.lokasi}
              </div>

              <button
                className="paket-kecil-detail-btn"
                onClick={() =>
                  navigate(`/paket-wisata/${paket.id}`, {
                    state: { tanggal }
                  })
                }
              >
                Pilih Paket
              </button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wisata;
