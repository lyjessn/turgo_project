import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const [pelakuList, setPelakuList] = useState([]);
  const [selectedPelaku, setSelectedPelaku] = useState("");
  const [participants, setParticipants] = useState([]);

  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState([]);

  const [thumbnail, setThumbnail] = useState(null);

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

      setModal({
        show: true,
        type: "error",
        message: "Total persentase harus 100%"
      });

      return;
    }

    try {

      const formData = new FormData();

      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      formData.append("participants", JSON.stringify(participants));

      deletedPhotoIds.forEach(id => {
        formData.append("deleted_photos[]", id);
      });

      newPhotos.forEach(file => {
        formData.append("new_photos[]", file);
      });

      if (thumbnail?.type === "existing") {
        formData.append("thumbnail_path", thumbnail.value);
      }

      if (thumbnail?.type === "new") {
        formData.append("thumbnail_index", thumbnail.value);
      }

      await updatePaketWisata(id, formData);

      setModal({
        show: true,
        type: "success",
        message: "Paket wisata berhasil diupdate"
      });

    } catch (err) {

      setModal({
        show: true,
        type: "error",
        message: "Terjadi kesalahan saat update"
      });
    }
  };

  return (
    <>
      <div className="admin-page">

        <h1>Edit Paket Wisata</h1>

        {step === 1 && (
          <div className="card-form">

            <input
              placeholder="Nama Paket"
              value={form.nama}
              onChange={(e) =>
                setForm({ ...form, nama: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Harga"
              value={form.harga}
              onChange={(e) =>
                setForm({ ...form, harga: e.target.value })
              }
            />

            <select
              value={form.kategori_paket}
              onChange={(e) =>
                setForm({
                  ...form,
                  kategori_paket: e.target.value
                })
              }
            >
              <option value="alam">Alam</option>
              <option value="kesenian">Kesenian</option>
              <option value="kebudayaan">Kebudayaan</option>
              <option value="lainnya">Lainnya</option>
            </select>

            <textarea
              placeholder="Deskripsi Singkat"
              value={form.preview}
              onChange={(e) =>
                setForm({ ...form, preview: e.target.value })
              }
            />

            <input
              type="file"
              multiple
              onChange={(e) => {

                const files = Array.from(e.target.files);
                setNewPhotos(prev => [...prev, ...files]);

                e.target.value = null;
              }}
            />

            <div className="preview-grid">
              {thumbnail?.type === "existing" &&
                !existingPhotos.some(f => f.url_foto === thumbnail.value) && (

                  <div className="preview-item">

                    <img src={`http://127.0.0.1:8000/storage/${thumbnail.value}`} />

                    <span className="thumbnail-badge">
                      Thumbnail
                    </span>

                  </div>

                )}
 
                {existingPhotos.map((foto) => {
                  const isThumbnail =
                    thumbnail?.type === "existing" &&
                    thumbnail.value === foto.url_foto;

                  return (
                    <div key={foto.id} className="preview-item">

                      <img src={`http://127.0.0.1:8000/storage/${foto.url_foto}`} />

                      {isThumbnail ? (
                        <span className="thumbnail-badge">Thumbnail</span>
                      ) : (
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
                      )}

                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() => {

                          if (typeof foto.id === "number") {
                            setDeletedPhotoIds(prev => [
                              ...prev,
                              foto.id
                            ]);
                          }

                          setExistingPhotos(prev =>
                            prev.filter(f => f.id !== foto.id)
                          );

                          if (
                            thumbnail?.type === "existing" &&
                            thumbnail.value === foto.url_foto
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

              {newPhotos.map((file, i) => {

                const isThumbnail =
                  thumbnail?.type === "new" &&
                  thumbnail.value === i;

                return (
                  <div key={i} className="preview-item">

                    <img src={URL.createObjectURL(file)} />

                    {isThumbnail ? (
                      <span className="thumbnail-badge">Thumbnail</span>
                    ) : (
                      <button
                        type="button"
                        className="set-thumb"
                        onClick={() =>
                          setThumbnail({
                            type: "new",
                            value: i
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
                          prev.filter((_, idx) => idx !== i)
                        );

                        if (
                          thumbnail?.type === "new" &&
                          thumbnail.value === i
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
                onClick={() => setStep(2)}
              >
                Lanjutkan
              </button>

            </div>
          </div>
        )}

        {step === 2 && (
            <div className="card-form">
                <textarea
                placeholder="Lokasi"
                value={form.lokasi}
                onChange={(e) =>
                    setForm({ ...form, lokasi: e.target.value })
                }
                />

                <input
                placeholder="Durasi"
                value={form.durasi}
                onChange={(e) =>
                    setForm({ ...form, durasi: e.target.value })
                }
                />

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

                <textarea
                placeholder="Perlengkapan"
                value={form.perlengkapan}
                onChange={(e) =>
                    setForm({ ...form, perlengkapan: e.target.value })
                }
                />

                <textarea
                placeholder="Deskripsi Panjang"
                value={form.deskripsi}
                onChange={(e) =>
                    setForm({ ...form, deskripsi: e.target.value })
                }
                />

                <div className="button-group">
                  <button
                      className="btn-secondary"
                      onClick={() => setStep(1)}
                  >
                      Kembali
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (role === "admin" || role === "owner") {
                        setStep(3);
                      } else {
                        handleSubmit();
                      }
                    }}
                  >
                    {role === "admin" || role === "owner"
                      ? "Lanjutkan"
                      : "Update"}
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
              >
                Update
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