import { useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { BASE_URL } from "../../utils/baseUrl";
import { useAuth } from "../../auth/useAuth";
import { FiWifi, FiClock, FiCalendar } from "react-icons/fi";
import { FaBed, FaBath, FaSmoking, FaPaw } from "react-icons/fa";
import { createBooking } from "../../api/apiBooking";
import { getAvailableKamar } from "../../api/apiKamar";
import "./css/Detail.css";

const KamarDetail = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const kamar = location.state?.kamar;
  const homestay = location.state?.homestay;
  const checkIn = location.state?.checkIn;
  const checkOut = location.state?.checkOut;
  const [isAvailable, setIsAvailable] = useState(true);

  if (!kamar || !homestay) return <div className="detail-container">Tidak ditemukan</div>;

  useEffect(() => {
    if (!checkIn || !checkOut) return;
    checkAvailability();
  }, [checkIn, checkOut]);

  const checkAvailability = async () => {
    try {
      const data = await getAvailableKamar({
        check_in: checkIn,
        check_out: checkOut
      });

      console.log("AVAILABLE KAMAR:", data);

      const tersedia = data.some(k => k.id === kamar.id);

      setIsAvailable(tersedia);
    } catch (err) {
      console.error(err);
      setIsAvailable(false);
    }
  };

  const jumlahMalam = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  const total = Number(kamar.harga_per_malam) * jumlahMalam;

  const handleBooking = async () => {
    if (!checkIn || !checkOut) {
      alert("Pilih tanggal terlebih dahulu");
      return;
    }

    if (!user) {
      navigate("/login", {
        state: {
          redirectTo: `/homestay/${homestay.id}/kamar/${kamar.id}`,
          kamar,
          homestay,
          checkIn,
          checkOut
        }
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("homestay_id", homestay.id);
      formData.append("kamar_id", kamar.id);
      formData.append("tanggal_mulai", checkIn);
      formData.append("tanggal_selesai", checkOut);

      const booking = await createBooking(formData);

      navigate(`/pembayaran/${booking.id}`);

    } catch (err) {
      alert(err.message || "Gagal membuat booking");
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateString = minDate.toISOString().split("T")[0];

  return (
    <div className="detail-container">

      <div className="detail-carousel">
        <img src={`${BASE_URL}/storage/${kamar.foto}`} className="detail-image"/>
      </div>

      <div className="detail-section">
        <h1 className="detail-section-title">
          {kamar.nama}
          <span className="detail-price-kamar">
            Rp {Number(kamar.harga_per_malam).toLocaleString("id-ID")}
            <span className="detail-price-unit"> / malam</span>
          </span>
        </h1>

        <div className="detail-info-list">

          <div className="detail-info-item">
            <FaBed />
            <div>
              <b>Tempat Tidur</b>
              <p>{kamar.deskripsi_kasur || `${kamar.jumlah_kasur} kasur`}</p>
            </div>
          </div>

          <div className="detail-info-item">
            <FaBath />
            <div>
              <b>Kamar Mandi</b>
              <p>{kamar.deskripsi_toilet || `${kamar.jumlah_toilet} kamar mandi`}</p>
            </div>
          </div>

          <div className="detail-info-item">
            <FiWifi />
            <div>
              <b>Jaringan Internet</b>
              <p>{kamar.wifi ? kamar.wifi : "tidak tersedia wifi"}</p>
            </div>
          </div>

        </div>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title">Peraturan Homestay</h2>

        <div className="detail-info-list">

          <div className="detail-info-item">
            <FiClock />
            <div>
              <b>Jam Check-in & Check Out</b>
              <p>
                Check in mulai pukul <b>{homestay.check_in}</b> WIB |
                Check out maksimal pukul <b>{homestay.check_out}</b> WIB
              </p>
            </div>
          </div>

          <div className="detail-info-item">
            <FaSmoking />
            <div>
              <b>Rokok tradisional & elektrik</b>
              <p>{homestay.rokok}</p>
            </div>
          </div>

          <div className="detail-info-item">
            <FaPaw />
            <div>
              <b>Hewan Peliharaan</b>
              <p>{homestay.peliharaan}</p>
            </div>
          </div>

        </div>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title">Detail Pemesanan</h2>

        <div className="detail-booking-row">

          <div className="detail-input-group">
            <label>Check-in</label>

            <input
              type="date"
              min={minDateString}
              value={checkIn || ""}
              onChange={(e) =>
                navigate(".", {
                  state: {
                    ...location.state,
                    checkIn: e.target.value
                  },
                  replace: true
                })
              }
              className="detail-date-input uniform-input"
            />

            {!checkIn && (
              <p className="detail-warning">
                Pilih tanggal check-in
              </p>
            )}

            {!isAvailable && (
              <p className="detail-warning">
                Kamar tidak tersedia pada tanggal ini
              </p>
            )}
          </div>


          <div className="detail-input-group">
            <label>Check-out</label>

            <input
              type="date"
              min={checkIn || minDateString}
              value={checkOut || ""}
              onChange={(e) =>
                navigate(".", {
                  state: {
                    ...location.state,
                    checkOut: e.target.value
                  },
                  replace: true
                })
              }
              className="detail-date-input uniform-input"
            />

            {!checkOut && (
              <p className="detail-warning">
                Pilih tanggal check-out
              </p>
            )}
          </div>

        </div>
      </div>

      <div className="detail-bottom-bar">
        <div>
          <div className="detail-total-label">Total Biaya</div>
          <div className="detail-total-price">
            Rp {Number(total).toLocaleString("id-ID")}
          </div>
        </div>

        <button
          className="detail-book-btn"
          disabled={!checkIn || !checkOut || !isAvailable}
          onClick={handleBooking}
        >
          Pesan Sekarang
        </button>

      </div>

    </div>
  );
};

export default KamarDetail;