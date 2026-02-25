import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useEffect, useState } from "react";
import { confirmPayment } from "../../api/apiBooking";
import "./css/Pembayaran.css";
import { FaCalendar, FaUsers } from "react-icons/fa";

const Pembayaran = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    booking,
    paket,
    selectedPakets = [],
    selectedGuide,
    tanggal,
    jumlahOrang,
    total
  } = location.state || {};

  const [timeLeft, setTimeLeft] = useState(null);

  const [form, setForm] = useState({
    norek: "",
    bank: "",
    nama: ""
  });

  const [bukti, setBukti] = useState(null);

  const isValid = bukti && form.norek && form.bank && form.nama;

  const [modal, setModal] = useState({
    show: false,
    type: "",
    message: ""
  });


  useEffect(() => {

    if (!user)
      navigate("/login");

    if (!location.state)
      navigate("/");

  }, []);

  useEffect(() => {

    if (!booking?.expired_at) return;
    const expireTime = new Date(booking.expired_at).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.floor((expireTime - now) / 1000);
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft(0);

        setModal({
          show: true,
          type: "expired",
          message: "Waktu pembayaran habis. Pesanan dibatalkan otomatis."
        });

        return;
      }

      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);


  const formatTime = () => {

    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;

    return `${h.toString().padStart(2,"0")} : ${m.toString().padStart(2,"0")} : ${s.toString().padStart(2,"0")}`;

  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("bukti_pembayaran", bukti);
      formData.append("norek_refund", form.norek);
      formData.append("bank_refund", form.bank);
      formData.append("nama_rekening_refund", form.nama);

      await confirmPayment(booking.id, formData);

      setModal({
        show: true,
        type: "success",
        message: "Pembayaran berhasil dikirim dan sedang diverifikasi admin."
      });

    } catch (err) {
      setModal({
        show: true,
        type: "error",
        message: err.message || "Gagal upload pembayaran"
      });
    }
  };

  const items = selectedPakets?.length
	? selectedPakets
	: paket
	? [paket]
	: [];

  const isCustom = selectedPakets && selectedPakets.length > 0;

  const guidePrice =
    selectedGuide === "full" ? 300000 :
    selectedGuide === "half" ? 150000 : 0;

  const paketTotal = isCustom
    ? selectedPakets.reduce(
      (sum, p) => sum + Number(p.harga || 0),
      0
      ) * jumlahOrang
    : Number(paket?.harga || 0) * jumlahOrang;

  const grandTotal = booking?.total_harga ?? total ?? paketTotal + guidePrice;


    return (
      <>
        <div className="payment-container">
            <h1>Pembayaran</h1>

            <div className="payment-card">
              <h3>Rincian Pesanan</h3>

              <div className="payment-summary-list">
                {items.map(p => (
                  <div key={p.id} className="payment-summary">
                    <img
                      src={`http://127.0.0.1:8000/storage/${p.url_thumbnail}`}
                    />
                    <div>
                      <b>{p.nama}</b>
                      <p>
                        Rp {Number(p.harga).toLocaleString("id-ID")} /orang
                      </p>
                    </div>
                  </div>

                ))}

                {selectedGuide && (
                  <div className="payment-summary">
                    <div>
                      <b>Tour Guide ({selectedGuide === "full" ? "Full Day" : "Half Day"})</b>
                      <p>
                        + Rp {(
                          selectedGuide === "full"
                            ? 300000
                            : 180000
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>

                  </div>
                )}

                <div className="payment-divider"></div>

                <div className="payment-meta">
                  {jumlahOrang > 0 && (
                    <div className="meta-item">
                      <FaUsers className="meta-icon"/>
                      <span>{jumlahOrang} orang </span>
                    </div>
                  )}

                  <div className="meta-item">
                     <span>||</span>
                  </div>

                  {tanggal && (
                    <div className="meta-item">
                      <FaCalendar className="meta-icon"/>
                      <span>{tanggal}</span>
                    </div>
                  )}
                </div>

                <div className="payment-total-wrapper">
                  <div className="payment-total-card">
                    <div className="payment-total-main">
                      <span className="total-label">
                        Total Pembayaran
                      </span>

                      <span className="total-value">
                        Rp {Number(
                          booking?.total_harga ?? total ?? 0
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <div className="timer-card center">
                <h3>Sisa Waktu Pembayaran</h3>
                <div className="payment-timer">
                  <div className="payment-timer-icon">
                    ⏱
                  </div>

                  <div className="payment-timer-text">
                    {formatTime()}
                  </div>
                  <p style={{
                      fontSize: "13px",
                      color: "#666",
                      marginTop: "6px",
                      textAlign: "center"
                    }}>
                      Pemesanan akan dibatalkan otomatis jika pembayaran tidak diselesaikan dalam waktu 30 menit.
                  </p>

                </div>
            </div>

            <div className="payment-card">
                <h3>Pembayaran</h3>
                <p> Transfer ke BCA 12345678 a/n Desa Wisata Turgo</p>

                <input
                type="file"
                accept="image/*"
                onChange={(e)=>setBukti(e.target.files[0])}
                />
            </div>
            <div className="payment-card">
                <h3>Informasi Pengembalian Dana</h3>

                <input
                placeholder="Nomor rekening"
                onChange={(e)=>setForm({...form,norek:e.target.value})}
                />

                <input
                placeholder="Nama bank"
                onChange={(e)=>setForm({...form,bank:e.target.value})}
                />

                <input
                placeholder="Nama pemilik rekening"
                onChange={(e)=>setForm({...form,nama:e.target.value})}
                />
            </div>

            <button
                className="payment-btn"
                disabled={!isValid}
                onClick={handleSubmit}
            >
                Konfirmasi Pembayaran
            </button>

            
        </div>
        {modal.show && (
          <div className="custom-modal-overlay">
            <div className="custom-modal">
              <div className="modal-icon-wrapper">
                {modal.type === "success" && (
                  <div className="modal-icon success">✓</div>
                )}
                {modal.type === "error" && (
                  <div className="modal-icon error">✕</div>
                )}
                {modal.type === "expired" && (
                  <div className="modal-icon expired">!</div>
                )}
              </div>

              <h3 className="modal-title">
                {modal.type === "success" && "Pembayaran Berhasil"}
                {modal.type === "error" && "Terjadi Kesalahan"}
                {modal.type === "expired" && "Waktu Pembayaran Habis"}
              </h3>

              <p className="modal-message">{modal.message}</p>

              <button
                className="modal-button"
                onClick={() => {
                  setModal({ ...modal, show: false });

                  if (modal.type !== "error") {
                    navigate("/");
                  }
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </>
    );
};

export default Pembayaran;
