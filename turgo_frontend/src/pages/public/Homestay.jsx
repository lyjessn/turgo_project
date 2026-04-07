import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./css/Catalog.css";
import "../../components/homepage/paketwisatasection.css";
import { FiMapPin, FiSearch } from "react-icons/fi";
import { BiMoney } from "react-icons/bi";
import { getAllHomestay, getAvailableHomestay } from "../../api/apiHomestay";

const Homestay = () => {
    const [homestays, setHomestays] = useState([]);
    const [available, setAvailable] = useState([]);
    const [search, setSearch] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
        const res = await getAllHomestay();
        setHomestays(res.data || []);
        } catch (err) {
        console.error(err);
        }
    };

    useEffect(() => {
        if (!checkIn || !checkOut) {
        setAvailable([]);
        return;
        }
        fetchAvailable(checkIn, checkOut);
    }, [checkIn, checkOut]);


    const fetchAvailable = async (inDate, outDate) => {
        try {
        const data = await getAvailableHomestay(
            inDate,
            outDate
        );
        setAvailable(data || []);
        } catch (err) {
        console.error(err);
        setAvailable([]);
        }
    };

    const dataToShow = useMemo(() => {
        let data =
        checkIn && checkOut
            ? available
            : homestays;

        if (search) {
        data = data.filter((h) =>
            h.nama.toLowerCase().includes(search.toLowerCase())
        );
        }
        return data;
    }, [homestays, available, checkIn, checkOut, search]);

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    const minDateString = minDate.toISOString().split("T")[0];

    return (
        <div className="catalog-container">

            <div className="catalog-header">
                <h1>Homestay</h1>
                <p>Temukan tempat tinggal terbaik sesuai jadwalmu!</p>
            </div>

            <div className="catalog-filter-row">
                <div className="date-range-filter">
                    <div className="date-field">
                        <span className="date-label">Check-in</span>
                        <input
                            type="date"
                            min={minDateString}
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                        />
                    </div>

                    <span className="date-separator">|</span>

                    <div className="date-field">
                        <span className="date-label">Check-out</span>
                        <input
                            type="date"
                            min={checkIn || minDateString}
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                        />
                    </div>
                </div>
                <div className="catalog-search-wrapper">
                    <FiSearch className="catalog-search-icon" />
                    <input
                        className="catalog-search"
                        placeholder="Cari Homestay..."
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
                    : checkIn || checkOut
                    ? "Tidak ada homestay tersedia di tanggal ini"
                    : "Belum ada homestay tersedia"}
                </p>
                ) : (
                    dataToShow.map((homestay) => (
                        <div
                            key={homestay.id}
                            className="paket-card-small"
                            style={{
                            backgroundImage:
                                `url(http://127.0.0.1:8000/storage/${homestay.url_thumbnail})`,
                            }}
                        >
                            <div className="paket-kecil-content">
                                <div className="paket-title-row">
                                    <h4> {homestay.nama} </h4>
                                    <span className="paket-kecil-rating">
                                    ⭐ {Number(homestay.ratings_avg_bintang ?? 0).toFixed(1)}
                                    </span>
                                </div>

                                <div className="paket-kecil-meta">
                                    <FiMapPin />
                                    {" "}
                                    {homestay.lokasi}
                                </div>

                                <div className="paket-kecil-meta">
                                    <BiMoney />
                                    {" "}
                                    Rp{" "}
                                    {Number(
                                        homestay.kamars_min_harga_per_malam
                                    ).toLocaleString("id-ID")}

                                    {homestay.kamars_min_harga_per_malam !==
                                        homestay.kamars_max_harga_per_malam &&
                                        ` - Rp ${Number(
                                        homestay.kamars_max_harga_per_malam
                                        ).toLocaleString("id-ID")}`
                                    }
                                </div>
                                <button className="paket-kecil-detail-btn"
                                    onClick={() =>
                                        navigate(`/homestay/${homestay.id}`, {
                                            state: { checkIn, checkOut }
                                        })
                                    }
                                > Lihat Detail </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Homestay;
