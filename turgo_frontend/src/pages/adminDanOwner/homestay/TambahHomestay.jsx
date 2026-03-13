import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminShared.css";
import "../css/AdminHomestay.css";
import "../../pengunjung/css/Pembayaran.css";

import { createHomestay, getAllUsersHomestay } from "../../../api/apiHomestay";

const TambahHomestay = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [ownerList, setOwnerList] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  const [modal, setModal] = useState({
    show: false,
    type: "",
    message: ""
  });

  const [form, setForm] = useState({
    nama: "",
    id_pemilik: "",
    lokasi: "",
    check_in: "",
    check_out: "",
    rokok: "",
    peliharaan: ""
  });

  const [kamars, setKamars] = useState([
    {
      nama: "",
      harga_per_malam: "",
      wifi: "",
      jumlah_kasur: 1,
      deskripsi_kasur: "",
      jumlah_toilet: 1,
      deskripsi_toilet: "",
      foto: null
    }
  ]);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    const res = await getAllUsersHomestay();
    setOwnerList(res.data || []);
  };

  const handleAddKamar = () => {
    setKamars([
      ...kamars,
      {
        nama: "",
        harga_per_malam: "",
        wifi: "",
        jumlah_kasur: 1,
        deskripsi_kasur: "",
        jumlah_toilet: 1,
        deskripsi_toilet: "",
        foto: null
      }
    ]);
  };

  const handleKamarChange = (index, field, value) => {
    const updated = [...kamars];
    updated[index][field] = value;
    setKamars(updated);
  };

  const handleRemoveKamar = (index) => {
  if (kamars.length === 1) {
    return; 
  }

  const updated = kamars.filter((_, i) => i !== index);
    setKamars(updated);
  };

  const handleSubmit = async () => {

    if (!form.id_pemilik) {
      setModal({
        show: true,
        type: "error",
        message: "Pilih pemilik homestay"
      });
      return;
    }

    if (photos.length < 1) {
      setModal({
        show: true,
        type: "error",
        message: "Minimal 1 foto homestay"
      });
      return;
    }

    try {
      const formData = new FormData();

      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      formData.append("thumbnail_index", thumbnailIndex);

      photos.forEach(file => {
        formData.append("photos[]", file);
      });

      kamars.forEach((kamar, index) => {
        Object.keys(kamar).forEach(field => {
          if (field !== "foto") {
            formData.append(
              `kamars[${index}][${field}]`,
              kamar[field]
            );
          }
        });

        formData.append(
          `kamars[${index}][foto]`,
          kamar.foto
        );
      });

      await createHomestay(formData);

      setModal({
        show: true,
        type: "success",
        message: "Homestay berhasil dibuat"
      });

    } catch (err) {
      setModal({
        show: true,
        type: "error",
        message: "Terjadi kesalahan saat menyimpan"
      });
    }
  };

  return (
    <>
      <div className="admin-page">
        <h1>Tambah Homestay</h1>

        {step === 1 && (
          <div className="card-form">

            <div className="form-group">
              <label>Nama Homestay</label>
              <input
                value={form.nama}
                onChange={(e) =>
                  setForm({ ...form, nama: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Pilih Pemilik</label>
              <select
                value={form.id_pemilik}
                onChange={(e) =>
                  setForm({ ...form, id_pemilik: e.target.value })
                }
              >
                <option value="">Pilih Pemilik</option>
                {ownerList.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.nama_lengkap}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              placeholder="Lokasi"
              value={form.lokasi}
              onChange={(e) =>
                setForm({ ...form, lokasi: e.target.value })
              }
            />

            <div className="form-group">
              <label>Jam Check-in</label>
              <input
                type="time"
                step="60"
                value={form.check_in}
                onChange={(e)=>setForm({...form,check_in:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Jam Check-out</label>
              <input
                type="time"
                step="60"
                value={form.check_out}
                onChange={(e)=>setForm({...form,check_out:e.target.value})}
              />
            </div>

            <input
              placeholder="Aturan Rokok"
              value={form.rokok}
              onChange={(e) =>
                setForm({ ...form, rokok: e.target.value })
              }
            />

            <input
              placeholder="Aturan Peliharaan"
              value={form.peliharaan}
              onChange={(e) =>
                setForm({ ...form, peliharaan: e.target.value })
              }
            />

            <input
              type="file"
              multiple
              onChange={(e) => {
                setPhotos([
                  ...photos,
                  ...Array.from(e.target.files)
                ]);
              }}
            />

            <div className="preview-grid">
              {photos.map((file, i) => {
                const isThumbnail = i === thumbnailIndex;

                return (
                  <div key={i} className="preview-item">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                    />

                    {isThumbnail && (
                      <span className="thumbnail-badge">
                        Thumbnail
                      </span>
                    )}

                    {!isThumbnail && (
                      <button
                        type="button"
                        className="set-thumb"
                        onClick={() => setThumbnailIndex(i)}
                      >
                        Set Thumbnail
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="button-group">
              <button
                className="btn-secondary"
                onClick={() => navigate(-1)}
              >
                Batal
              </button>

              <button
                className="btn-primary"
                onClick={() => setStep(2)}
              >
                Lanjutkan
              </button>
            </div>

          </div>
        )}

        {step === 2 && (
          <div className="card-form">

            {kamars.map((kamar, index) => (
              <div key={index} className="kamar-card">

                <div className="kamar-header">
                  <h3>Kamar {index + 1}</h3>

                  {kamars.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-kamar"
                      onClick={() => handleRemoveKamar(index)}
                    >
                      Hapus Kamar
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Nama Kamar</label>
                  <input
                    value={kamar.nama}
                    onChange={(e) =>
                      handleKamarChange(index, "nama", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Harga per Malam</label>
                  <input
                    type="number"
                    value={kamar.harga_per_malam}
                    onChange={(e) =>
                      handleKamarChange(index, "harga_per_malam", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Wifi</label>
                  <input
                    placeholder="Contoh: wifi sharing di ruang tamu"
                    value={kamar.wifi}
                    onChange={(e) =>
                      handleKamarChange(index, "wifi", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Jumlah Kasur</label>
                  <input
                    placeholder="Contoh: 2"
                    type="number"
                    value={kamar.jumlah_kasur}
                    onChange={(e) =>
                      handleKamarChange(index, "jumlah_kasur", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Deskripsi Kasur</label>
                  <textarea
                    placeholder="Contoh: 1 king bed dan 1 Queen Bed"
                    value={kamar.deskripsi_kasur}
                    onChange={(e) =>
                      handleKamarChange(index, "deskripsi_kasur", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Jumlah Toilet</label>
                  <input
                    type="number"
                    value={kamar.jumlah_toilet}
                    onChange={(e) =>
                      handleKamarChange(index, "jumlah_toilet", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Deskripsi Toilet</label>
                  <textarea
                    value={kamar.deskripsi_toilet}
                    onChange={(e) =>
                      handleKamarChange(index, "deskripsi_toilet", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Foto Kamar</label>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleKamarChange(index, "foto", e.target.files[0])
                    }
                  />
                </div>

              </div>
            ))}
            <button
              className="btn-add-pelaku"
              onClick={handleAddKamar}
            >
              + Tambah Kamar
            </button>

            <div className="button-group">
              <button
                className="btn-secondary"
                onClick={() => setStep(1)}
              >
                Kembali
              </button>

              <button
                className="btn-primary"
                onClick={handleSubmit}
              >
                Tambah Homestay
              </button>
            </div>

          </div>
        )}
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
            </div>

            <h3 className="modal-title">
              {modal.type === "success"
                ? "Berhasil"
                : "Terjadi Kesalahan"}
            </h3>

            <p className="modal-message">
              {modal.message}
            </p>

            <button
              className="modal-button"
              onClick={() => {
                setModal({ ...modal, show: false });
                if (modal.type === "success") {
                  navigate("/dashboard/homestay");
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

export default TambahHomestay;