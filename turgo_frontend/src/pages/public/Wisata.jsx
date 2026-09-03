import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/baseUrl";
import "./css/Catalog.css";
import "../../components/homepage/paketwisatasection.css";
import { FiClock, FiMapPin, FiCalendar, FiSearch } from "react-icons/fi";
import { BiMoney } from "react-icons/bi";
import { getAllPaketWisata, getAvailablePaketWisata } from "../../api/apiPaketWisata";

const Wisata = () => {
  const [pakets, setPakets] = useState([]);
  const [kategori, setKategori] = useState("");
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
      const res = await getAllPaketWisata();
      setPakets(res.data || []);
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

  const kategoriList = useMemo(() => {
    const source = pakets || [];
    const unique = [...new Set(source.map(p => p.kategori_paket))];
    return unique;
  }, [pakets]);

  const dataToShow = useMemo(() => {
    let data = tanggal ? available : pakets;

    if (search) {
      data = data.filter(p =>
        p.nama.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (kategori) {
      data = data.filter(p => p.kategori_paket === kategori);
    }

    return data;
  }, [pakets, available, tanggal, search, kategori]);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateString = minDate.toISOString().split("T")[0];

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1>Paket Wisata</h1>
        <div className="paket-subheader">
          <p>Temukan opsi terbaik untuk jadwalmu!</p>
          <button
            className="paket-custom-btn"
            onClick={() => navigate("/paket-wisata/custom")}
          >
            custom paket
          </button>
        </div>
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

        <select
          className="catalog-filter"
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {kategoriList.map((k, i) => (
            <option key={i} value={k}>
              {k}
            </option>
          ))}
        </select>

        <div className="catalog-search-wrapper">
            <FiSearch className="catalog-search-icon" />
            <input
              className="catalog-search"
              placeholder="Cari paket wisata..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </div>

      </div>

      <div className="catalog-grid">
        {dataToShow.length === 0 ? (
          <p className="empty-state">
            {tanggal
              ? "Tidak ada paket tersedia di tanggal ini"
              : "Belum ada paket wisata tersedia"}
          </p>
        ) : (
          dataToShow.map((paket) => (
            <div
              key={paket.id}
              className="paket-card-small"
              style={{
                backgroundImage: `url(${BASE_URL}/storage/${paket.url_thumbnail})`,
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
          ))
        )}
      </div>
    </div>
  );
};

export default Wisata;
