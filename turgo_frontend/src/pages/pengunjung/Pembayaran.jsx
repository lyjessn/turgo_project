import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useEffect, useState } from "react";
import { confirmPayment, getBookingDetail } from "../../api/apiBooking";
import "./css/Pembayaran.css";
import "../adminDanOwner/css/Modal.css";
import { FaCalendar, FaUsers } from "react-icons/fa";

const Pembayaran = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const [form, setForm] = useState({
    norek: "",
    bank: "",
    nama: ""
  });

  const [bukti, setBukti] = useState(null);

  const [modal, setModal] = useState({
    show: false,
    type: "",
    message: ""
  });

  const isValid = bukti && form.norek && form.bank && form.nama;

  // fetch booking
  useEffect(() => {

    if (!id) return;

    const fetchBooking = async () => {
      try {

        const data = await getBookingDetail(id);
        setBooking(data);

      } catch (err) {
        console.error(err);
        navigate("/");
      }
    };

    fetchBooking();

  }, [id, navigate]);

  // check login
  useEffect(() => {

    if (!user) {
      navigate("/login");
    }

  }, [user, navigate]);

  // timer pembayaran
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

  const guideJenis = booking?.custom_details?.[0]?.jenis_tour_guide || "tanpa";

  const guideHarga =
    guideJenis === "full day"
      ? 300000
      : guideJenis === "half day"
      ? 150000
      : 0;

  const formatTime = () => {

    if (timeLeft === null) return "-- : -- : --";

    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;

    return `${h.toString().padStart(2,"0")} : ${m
      .toString()
      .padStart(2,"0")} : ${s.toString().padStart(2,"0")}`;
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

      const message =
        err.response?.data?.message || "Gagal mengirim pembayaran.";

      setModal({
        show: true,
        type: "error",
        message
      });

    }
  };

  // ambil paket dari booking
  const items = [];

  if (booking?.custom_details?.length) {
    booking.custom_details.forEach(d => {
      if (d.paket_wisata) items.push(d.paket_wisata);
    });
  }

  if (booking?.paket_wisata_details?.paket_wisata) {
    items.push(booking.paket_wisata_details.paket_wisata);
  }

  const total = booking?.total_harga || 0;

  if (!booking) {
    return <div className="payment-container">Loading...</div>;
  }

  return (
    <>
      <div className="payment-container">

        <h1>Pembayaran</h1>

        <p style={{marginBottom:"20px", color:"#666"}}>
          Booking ID #{booking.id}
        </p>

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

            {guideJenis !== "tanpa" && (
              <div className="payment-summary">
                <div>
                  <b>Tour Guide ({guideJenis})</b>
                  <p>
                    Rp {guideHarga.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            )}

            <div className="payment-divider"></div>

            <div className="payment-meta">

              <div className="meta-item">
                <FaCalendar className="meta-icon"/>
                <span>{booking.tanggal_mulai}</span>
              </div>

            </div>

            <div className="payment-total-wrapper">

              <div className="payment-total-card">

                <div className="payment-total-main">

                  <span className="total-label">
                    Total Pembayaran
                  </span>

                  <span className="total-value">
                    Rp {Number(total).toLocaleString("id-ID")}
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
              fontSize:"13px",
              color:"#666",
              marginTop:"6px",
              textAlign:"center"
            }}>
              Pemesanan akan dibatalkan otomatis jika pembayaran tidak diselesaikan dalam waktu 30 menit.
            </p>

          </div>

        </div>

        <div className="payment-card">

          <h3>Pembayaran</h3>
          <p>Transfer ke BCA 12345678 a/n Desa Wisata Turgo</p>

          <input
            type="file"
            accept="image/*"
            onChange={(e)=>setBukti(e.target.files[0])}
          />

        </div>

        <div className="payment-card">

          <h3>
            Informasi Pengembalian Dana <span style={{color:"red"}}>*</span>
          </h3>

          <p className="refund-note">
            Data rekening ini diperlukan apabila terjadi kendala pada pesanan 
            atau pesanan perlu dibatalkan sehingga proses pengembalian dana 
            dapat dilakukan lebih cepat.
          </p>

          <input
            placeholder="Nomor rekening minimal 8 digit"
            onChange={(e)=>setForm({...form,norek:e.target.value})}
          />

          <input
            placeholder="Nama bank tujuan"
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

          <div className="custom-modal modal-center">

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

            <p className="modal-message">
              {modal.message}
            </p>

            <button
              className="modal-button"
              onClick={() => {
                setModal({ ...modal, show: false });

                if (modal.type === "success") {
                  navigate("/profile?tab=booking");
                }

                if (modal.type === "expired") {
                  navigate("/profile?tab=booking");
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