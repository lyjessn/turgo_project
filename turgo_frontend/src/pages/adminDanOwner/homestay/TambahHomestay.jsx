import { useState, useEffect, useRef } from "react";
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
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [timeError, setTimeError] = useState("");

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
    try {
      setSubmitting(true);
      setError("");

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
            formData.append(`kamars[${index}][${field}]`, kamar[field]);
          }
        });

        formData.append(`kamars[${index}][foto]`, kamar.foto);
      });

      await createHomestay(formData);

      setModal({
        show: true,
        type: "success",
        message: "Homestay berhasil dibuat"
      });

    } catch (err) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0];
        setError(firstError);
      } else {
        setError("Terjadi kesalahan saat menyimpan");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="admin-page">
        <h1>Tambah Homestay</h1>

        {step === 1 && (
          <div className="card-form">
            {error && <div className="error-text">{error}</div>}
            <div className="form-group">
                <label>Nama Homestay</label>
                <input
                  value={form.nama}
                  onChange={(e) => {
                    setForm({ ...form, nama: e.target.value });
                    setError("");
                  }}
                  required
                />
            </div>

            <div className="form-group">
                <label>Pilih Pemilik</label>
                <select
                  value={form.id_pemilik}
                  onChange={(e) => {
                    setForm({ ...form, id_pemilik: e.target.value });
                    setError("");
                  }}
                  required
                >
                  <option value="">Pilih Pemilik</option>
                  {ownerList.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.nama_lengkap}
                    </option>
                  ))}
                </select>
            </div>
            
            <div className="form-group">
                <label>Lokasi Homestay</label>
                <textarea
                  placeholder="Lokasi"
                  value={form.lokasi}
                  onChange={(e) => {
                    setForm({ ...form, lokasi: e.target.value });
                    setError("");
                  }}
                  required
                />
            </div>

            <div className="form-group">
                <label>Jam Check-in</label>
                <input
                  type="time"
                  step="60"
                  value={form.check_in}
                  onChange={(e) => {
                    const value = e.target.value;

                    const updatedForm = { ...form, check_in: value };
                    setForm(updatedForm);

                    if (updatedForm.check_out && value) {
                      const [inHour, inMin] = value.split(":").map(Number);
                      const [outHour, outMin] = updatedForm.check_out.split(":").map(Number);

                      let checkInMinutes = inHour * 60 + inMin;
                      let checkOutMinutes = outHour * 60 + outMin;

                      if (checkInMinutes < checkOutMinutes) {
                        if (checkOutMinutes - checkInMinutes > 12 * 60) {
                          checkInMinutes += 24 * 60;
                        }
                      }

                      if (checkInMinutes < checkOutMinutes + 60) {
                        setTimeError("Check-in harus minimal 1 jam setelah waktu check-out");
                      } else {
                        setTimeError("");
                        setError("");
                      }
                    }
                  }}
                  required
                />
            </div>

            <div className="form-group">
              <label>Jam Check-out</label>
              <input
                type="time"
                step="60"
                value={form.check_out}
                onChange={(e) => {
                  const value = e.target.value;

                  const updatedForm = { ...form, check_out: value };
                  setForm(updatedForm);

                  if (updatedForm.check_in && value) {
                    const [inHour, inMin] = updatedForm.check_in.split(":").map(Number);
                    const [outHour, outMin] = value.split(":").map(Number);

                    let checkInMinutes = inHour * 60 + inMin;
                    let checkOutMinutes = outHour * 60 + outMin;

                    if (checkInMinutes < checkOutMinutes) {
                      if (checkOutMinutes - checkInMinutes > 12 * 60) {
                        checkInMinutes += 24 * 60;
                      }
                    }

                    if (checkInMinutes < checkOutMinutes + 60) {
                      setTimeError("Check-in harus minimal 1 jam setelah waktu check-out");
                    } else {
                      setTimeError("");
                      setError("");
                    }
                  }
                }}
                required
              />

              {timeError && <small className="error-text">{timeError}</small>}
            </div>
            
            <div className="form-group">
                <label>Aturan Merokok</label>
                <input
                  placeholder="contoh: rokok elektrik diperbolehkan"
                  value={form.rokok}
                  onChange={(e) => {
                    setForm({ ...form, rokok: e.target.value });
                    setError("");
                  }}
                  required
                />
            </div>
            
            <div className="form-group">
                <label>Aturan Membawa Peliharaan</label>
                <input
                  placeholder="contoh: dilarang membawa anjing"
                  value={form.peliharaan}
                  onChange={(e) => {
                    setForm({ ...form, peliharaan: e.target.value });
                    setError("");
                  }}
                  required
                />
            </div>
            
            <div className="form-group">
                <label>Foto Homestay (minimal 3)</label>
                  <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    setPhotos(prev => [
                      ...prev,
                      ...Array.from(e.target.files)
                    ]);
                    setError("");
                  }}
                  required
                />
            </div>
            
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
                onClick={() => {
                  setError("");

                  if (!form.nama || !form.id_pemilik || !form.lokasi) {
                    setError("Semua field wajib diisi");
                    return;
                  }

                  if (photos.length < 3) {
                    setError("Minimal 3 foto homestay");
                    return;
                  }

                  if (timeError) {
                    setError("Perbaiki jam check-in/check-out terlebih dahulu");
                    return;
                  }

                  setStep(2);
                  setError("");
                }}
              >
                Lanjutkan
              </button>
            </div>

          </div>
        )}

        {step === 2 && (
          <div className="card-form ">
            {error && <div className="error-text">{error}</div>}
            {kamars.map((kamar, index) => (
              <div key={index} style={{
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
                background: "#f9fafb"
              }}>

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
                    onChange={(e) => {
                      handleKamarChange(index, "nama", e.target.value);
                      setError("");
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Harga per Malam</label>
                  <input
                    type="number"
                    value={kamar.harga_per_malam}
                    onChange={(e) => {
                      handleKamarChange(index, "harga_per_malam", e.target.value);
                      setError("");
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Wifi</label>
                  <input
                    placeholder="Contoh: wifi sharing di ruang tamu"
                    value={kamar.wifi}
                    onChange={(e) => {
                      handleKamarChange(index, "wifi", e.target.value);
                      setError("");
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Jumlah Kasur</label>
                  <input
                    placeholder="Contoh: 2"
                    type="number"
                    value={kamar.jumlah_kasur}
                    onChange={(e) => {
                      handleKamarChange(index, "jumlah_kasur", e.target.value);
                      setError("");
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Deskripsi Kasur</label>
                  <textarea
                    placeholder="Contoh: 1 king bed dan 1 Queen Bed"
                    value={kamar.deskripsi_kasur}
                    onChange={(e) => {
                      handleKamarChange(index, "deskripsi_kasur", e.target.value);
                      setError("");
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Jumlah Toilet</label>
                  <input
                    type="number"
                    value={kamar.jumlah_toilet}
                    onChange={(e) => {
                      handleKamarChange(index, "jumlah_toilet", e.target.value);
                      setError("");
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Deskripsi Toilet</label>
                  <textarea
                    value={kamar.deskripsi_toilet}
                    onChange={(e) => {
                      handleKamarChange(index, "deskripsi_toilet", e.target.value);
                      setError("");
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Foto Kamar</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      handleKamarChange(index, "foto", e.target.files[0])
                      setError("");
                    }}
                    required
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
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
              >
                Kembali
              </button>

              <button
                className="btn-primary"
                onClick={() => {
                  setError("");

                  if (!kamars.length) {
                    setError("Minimal 1 kamar");
                    return;
                  }

                  for (let kamar of kamars) {
                    if (
                      !kamar.nama ||
                      !kamar.harga_per_malam ||
                      !kamar.jumlah_kasur ||
                      !kamar.jumlah_toilet ||
                      !kamar.foto
                    ) {
                      setError("Semua data kamar wajib diisi");
                      return;
                    }
                  }

                  handleSubmit();
                }}
                disabled={submitting}
              >
                {submitting ? "Menyimpan..." : "Tambah Homestay"}
              </button>
            </div>
                
          </div>
        )}
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