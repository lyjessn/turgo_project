import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../../utils/baseUrl";
import { useAuth } from "../../../auth/useAuth";
import "../css/AdminShared.css";
import "../css/AdminPaketWisata.css";
import "../css/Modal.css";

import { getDetailPaketWisata, updatePaketWisata } from "../../../api/apiPaketWisata";
import { getAllPelakuWisata } from "../../../api/apiPelakuWisata";

const EditPaketWisata = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const role = user?.role?.name;
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
   const [submitting, setSubmitting] = useState(false);
  const [pelakuList, setPelakuList] = useState([]);
  const [selectedPelaku, setSelectedPelaku] = useState("");
  const [participants, setParticipants] = useState([]);

  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);

  const hasThumbnail = thumbnail !== null ? 1 : 0;
  const totalPhotos = existingPhotos.length + newPhotos.length + hasThumbnail;

  const [modal, setModal] = useState({
    show: false,
    type: "",
    message: ""
  });

  const [form, setForm] = useState({
    nama: "",
    kategori_paket: "alam",
    preview: "",
    deskripsi: "",
    harga: "",
    durasi: "",
    lokasi: "",
    perlengkapan: "",
    kapasitas_min: "",
    kapasitas_max: ""
  });

  const getFileName = (path) => path?.split("/").pop();

  useEffect(() => {
    fetchDetail();

    if (role === "admin" || role === "owner") {
      fetchPelaku();
    }
  }, []);

  const fetchPelaku = async () => {
    const res = await getAllPelakuWisata();
    setPelakuList(res.data || []);
  };

  const fetchDetail = async () => {

    const res = await getDetailPaketWisata(id);
    const data = res.data;

    setForm({
      nama: data.nama,
      kategori_paket: data.kategori_paket,
      preview: data.preview,
      deskripsi: data.deskripsi,
      harga: data.harga,
      durasi: data.durasi,
      lokasi: data.lokasi,
      perlengkapan: data.perlengkapan,
      kapasitas_min: data.kapasitas_min,
      kapasitas_max: data.kapasitas_max
    });

    setParticipants(
      data.participants.map(p => ({
        user_id: p.id,
        nama: p.nama_lengkap,
        persentase: p.pivot.persentase
      }))
    );

    setExistingPhotos(data.fotos || []);

    if (data.url_thumbnail) {
      setThumbnail({
        type: "existing",
        value: data.url_thumbnail
      });
    } else {
      setThumbnail(null);
    }
  };

  const handleAddPelaku = () => {

    if (!selectedPelaku) return;

    const already = participants.find(
      p => p.user_id == selectedPelaku
    );

    if (already) return;

    const pelaku = pelakuList.find(
      p => p.id == selectedPelaku
    );

    setParticipants([
      ...participants,
      {
        user_id: selectedPelaku,
        nama: pelaku?.nama_lengkap,
        persentase: 0
      }
    ]);

    setSelectedPelaku("");
  };

  const handlePersenChange = (index, value) => {

    const updated = [...participants];
    updated[index].persentase = Number(value);

    setParticipants(updated);
  };

  const totalPersen = participants.reduce(
    (sum, p) => sum + Number(p.persentase),
    0
  );

  const handleSubmit = async () => {

    if (totalPersen !== 100) {
      setError("Total persentase harus 100%");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const formData = new FormData();

      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      formData.append("participants", JSON.stringify(participants));

      deletedPhotoIds.forEach(id => {
        if (typeof id === "number") {
          formData.append("deleted_photos[]", id);
        }
      });

      newPhotos.forEach(item => {
        formData.append("new_photos[]", item.file);
      });

      if (thumbnail?.type === "existing") {
        formData.append("thumbnail_path", thumbnail.value);
      }

      if (thumbnail?.type === "new") {
        const selected = newPhotos.find(p => p.id === thumbnail.value);
        if (selected) {
          formData.append("thumbnail_file", selected.file);
        }
      }

      await updatePaketWisata(id, formData);

      setModal({
        show: true,
        type: "success",
        message: "Paket wisata berhasil diupdate"
      });

    } catch (err) {
      console.log("ERROR FULL:", err);

      if (err.response) {
        console.log("ERROR DATA:", err.response.data);
        console.log("ERROR STATUS:", err.response.status);
      }

      setModal({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Terjadi kesalahan saat update"
      });

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="admin-page">

        <h1>Edit Paket Wisata</h1>

        {step === 1 && (
          <div className="card-form">
            {error && <div className="error-text">{error}</div>}
            <div className="form-group">
              <label>Nama Paket</label>
              <input
                placeholder="Nama Paket"
                value={form.nama}
                onChange={(e) => {
                  setForm({ ...form, nama: e.target.value });
                  setError("");
                }}
              />
            </div>
           
            <div className="form-group">
              <label>Harga Paket (per orang)</label>
              <input
                type="number"
                placeholder="Harga"
                value={form.harga}
                onChange={(e) => {
                  setForm({ ...form, harga: e.target.value });
                  setError("");
                }}
              />
            </div>

            <div className="form-group">
              <label>Pilih Kategori Paket</label>
              <select
                value={form.kategori_paket}
                onChange={(e) => {
                  setForm({
                    ...form,
                    kategori_paket: e.target.value
                  });
                  setError("");
                }}
              >
                <option value="alam">Alam</option>
                <option value="kesenian">Kesenian</option>
                <option value="kebudayaan">Kebudayaan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Deskripsi Singkat</label>
              <textarea
                placeholder="Deskripsi Singkat"
                value={form.preview}
                onChange={(e) => {
                  setForm({ ...form, preview: e.target.value });
                  setError("");
                }}
              />
            </div>

            <div className="form-group">
              <label>Upload Foto Paket (Minimal 3)</label>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);

                  const mapped = files.map(file => ({
                    id: Date.now() + Math.random(),
                    file
                  }));

                  setNewPhotos(prev => [...prev, ...mapped]);

                  e.target.value = null;
                }}
              />
            </div>
            
            <div className="preview-grid">

              {thumbnail?.type === "existing" && (
                <div className="preview-item">
                  <img src={`${BASE_URL}/storage/${thumbnail.value}`} />
                  <span className="thumbnail-badge">Thumbnail</span>
                </div>
              )}

              {existingPhotos
                .filter(f => f.url_foto !== thumbnail?.value)
                .map((foto) => {
                  return (
                    <div key={foto.id} className="preview-item">

                      <img src={`${BASE_URL}/storage/${foto.url_foto}`} />

                      <button
                        type="button"
                        className="set-thumb"
                        onClick={() =>
                          setThumbnail({
                            type: "existing",
                            value: foto.url_foto
                          })
                        }
                      >
                        Set Thumbnail
                      </button>

                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() => {

                          if (typeof foto.id === "number") {
                            setDeletedPhotoIds(prev => [...prev, foto.id]);
                          }

                          setExistingPhotos(prev =>
                            prev.filter(f => f.id !== foto.id)
                          );

                          if (thumbnail?.value === foto.url_foto) {
                            setThumbnail(null);
                          }
                        }}
                      >
                        ✕
                      </button>

                    </div>
                  );
                })}

              {/* ✅ NEW PHOTOS */}
              {newPhotos.map((item) => {

                const isThumbnail =
                  thumbnail?.type === "new" &&
                  thumbnail.value === item.id;

                return (
                  <div key={item.id} className="preview-item">

                    <img src={URL.createObjectURL(item.file)} />

                    {isThumbnail ? (
                      <span className="thumbnail-badge">Thumbnail</span>
                    ) : (
                      <button
                        type="button"
                        className="set-thumb"
                        onClick={() =>
                          setThumbnail({
                            type: "new",
                            value: item.id
                          })
                        }
                      >
                        Set Thumbnail
                      </button>
                    )}

                    <button
                      type="button"
                      className="remove-photo"
                      onClick={() => {
                        setNewPhotos(prev =>
                          prev.filter(f => f.id !== item.id)
                        );

                        if (
                          thumbnail?.type === "new" &&
                          thumbnail.value === item.id
                        ) {
                          setThumbnail(null);
                        }
                      }}
                    >
                      ✕
                    </button>

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

                  if (!form.nama || !form.harga) {
                    setError("Semua field wajib diisi");
                    return;
                  }

                  if (totalPhotos < 3) {
                    setError("Minimal harus ada 3 foto paket");
                    return;
                  }

                  if (!thumbnail) {
                    setError("Pilih thumbnail terlebih dahulu");
                    return;
                  }

                  setStep(2);
                }}
              >
                Lanjutkan
              </button>

            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card-form">
            {error && <div className="error-text">{error}</div>}
            <div className="form-group">
              <label>Lokasi Kegiatan</label>
              <textarea
                placeholder="Lokasi"
                value={form.lokasi}
                onChange={(e) =>
                    setForm({ ...form, lokasi: e.target.value })
                }
              />
            </div>
              
            <div className="form-group">
              <label>Durasi Kegiatan</label>
              <input
                placeholder="Durasi"
                value={form.durasi}
                onChange={(e) =>
                    setForm({ ...form, durasi: e.target.value })
                }
                />
            </div>
              
            <div className="form-group">
              <label>Kapasitas Paket</label>
              <div className="row">
                <input
                    type="number"
                    placeholder="Kapasitas Min"
                    value={form.kapasitas_min}
                    onChange={(e) =>
                      setForm({ ...form, kapasitas_min: e.target.value })
                    }
                />

                <input
                    type="number"
                    placeholder="Kapasitas Max"
                    value={form.kapasitas_max}
                    onChange={(e) =>
                      setForm({ ...form, kapasitas_max: e.target.value })
                    }
                />
                </div>
            </div>
                
            <div className="form-group">
              <label>Perlengkapan Paket</label>
              <textarea
                placeholder="Perlengkapan"
                value={form.perlengkapan}
                onChange={(e) =>
                    setForm({ ...form, perlengkapan: e.target.value })
                }
              />
            </div>
               
            <div className="form-group">
              <label>Deskripsi Lengkap</label>
              <textarea
                placeholder="Deskripsi Panjang"
                value={form.deskripsi}
                onChange={(e) =>
                    setForm({ ...form, deskripsi: e.target.value })
                }
              />
            </div>
              
            <div className="button-group">
              <button
                  className="btn-secondary"
                  onClick={() => setStep(1)}
              >
                  Kembali
              </button>

              <button
                className="btn-primary"
                disabled={submitting}
                onClick={() => {
                  if (role === "admin" || role === "owner") {
                    setStep(3);
                  } else {
                    handleSubmit();
                  }
                }}
              >
                {submitting ? "Mengupdate..." : (role === "admin" || role === "owner" ? "Lanjutkan" : "Update")}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (role === "admin" || role === "owner") && (
          <div className="card-form">

            <div className="row">
              <select
                value={selectedPelaku}
                onChange={(e) =>
                  setSelectedPelaku(e.target.value)
                }
              >
                <option value="">
                  Pilih Pelaku Wisata
                </option>
                {pelakuList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_lengkap}
                  </option>
                ))}
              </select>

              <button
                className="btn-add-pelaku"
                onClick={handleAddPelaku}
              >
                + Tambah
              </button>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pelaku</th>
                  <th>Persentase</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={i}>
                    <td>{p.nama}</td>
                    <td>
                      <input
                        type="number"
                        value={p.persentase}
                        onChange={(e) =>
                          handlePersenChange(
                            i,
                            e.target.value
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={`total ${totalPersen !== 100 ? "error" : ""}`}>
              Total: {totalPersen}%
            </div>

            <div className="button-group">
              <button
                className="btn-secondary"
                onClick={() => setStep(2)}
              >
                Kembali
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Mengupdate..." : "Update"}
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
                  navigate("/dashboard/paket-wisata");
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

export default EditPaketWisata;