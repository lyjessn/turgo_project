import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../../utils/baseUrl";
import "../css/AdminShared.css";
import "../css/AdminPaketWisata.css";
import "../css/Modal.css";
import { getDetailHomestay, updateHomestay } from "../../../api/apiHomestay";
import { createKamar, updateKamar, deleteKamar } from "../../../api/apiKamar";

const EditHomestay = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [kamars, setKamars] = useState([]);
  
  const hasThumbnail = thumbnail !== null ? 1 : 0;
  const totalPhotos = existingPhotos.length + newPhotos.length + hasThumbnail;

  const [modal, setModal] = useState({
    show: false,
    type: "",
    message: ""
  });

  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    kamarId: null,
    kamarIndex: null
  });

  const [form, setForm] = useState({
    nama: "",
    lokasi: "",
    check_in: "",
    check_out: "",
    rokok: "",
    peliharaan: ""
  });

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    const res = await getDetailHomestay(id);
    const data = res.data;

    setForm({
      nama: data.nama,
      lokasi: data.lokasi,
      check_in: data.check_in,
      check_out: data.check_out,
      rokok: data.rokok,
      peliharaan: data.peliharaan
    });

    let fotos = data.fotos || [];

    if (data.url_thumbnail) {
      const exists = fotos.some(f => f.url_foto === data.url_thumbnail);

      if (!exists) {
        fotos = [
          ...fotos,
          {
            id: "thumbnail-temp",
            url_foto: data.url_thumbnail
          }
        ];
      }

      setThumbnail({
        type: "existing",
        value: data.url_thumbnail
      });
    } else {
      setThumbnail(null);
    }

    setExistingPhotos(fotos);

    setKamars(
      data.kamars.map(k => ({
        ...k,
        foto_existing: k.foto,
        foto_new: null
      }))
    );
  };

  const handleSubmit = async () => {

    if (!thumbnail) {
      setError("Pilih thumbnail terlebih dahulu");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const homestayFormData = new FormData();

      Object.keys(form).forEach(key => {
        homestayFormData.append(key, form[key]);
      });

      deletedPhotoIds.forEach(id => {
        if (typeof id === "number") {
          homestayFormData.append("deleted_photos[]", id);
        }
      });

      newPhotos.forEach(item => {
        homestayFormData.append("new_photos[]", item.file);
      });

      if (thumbnail?.type === "new") {
        const selected = newPhotos.find(p => p.id === thumbnail.value);
        if (selected) {
          homestayFormData.append("thumbnail_file", selected.file);
        }
      }

      if (thumbnail?.type === "existing") {
        homestayFormData.append("thumbnail_path", thumbnail.value);
      }

      await Promise.all(
        kamars.map(async (kamar) => {
          const kamarFormData = new FormData();

          kamarFormData.append("nama", kamar.nama);
          kamarFormData.append("harga_per_malam", kamar.harga_per_malam);
          kamarFormData.append("wifi", kamar.wifi || "");
          kamarFormData.append("jumlah_kasur", kamar.jumlah_kasur);
          kamarFormData.append("deskripsi_kasur", kamar.deskripsi_kasur || "");
          kamarFormData.append("jumlah_toilet", kamar.jumlah_toilet);
          kamarFormData.append("deskripsi_toilet", kamar.deskripsi_toilet || "");

          if (kamar.foto_new) {
            kamarFormData.append("foto", kamar.foto_new);
          }

          if (!kamar.id) {
            kamarFormData.append("homestay_id", id);
            return createKamar(kamarFormData);
          }

          return updateKamar(kamar.id, kamarFormData);
        })
      );

      await updateHomestay(id, homestayFormData);

      setModal({
        show: true,
        type: "success",
        message: "Homestay berhasil diupdate"
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
        message: "Terjadi kesalahan saat update"
      });
    } finally {
      setSubmitting(false);
    }
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
        foto_existing: null,
        foto_new: null
      }
    ]);
  };

  const handleDeleteKamar = (kamarId, index) => {
    if (!kamarId) {
      setKamars(prev => prev.filter((_, i) => i !== index));
      return;
    }

    setConfirmDelete({
      show: true,
      kamarId: kamarId,
      kamarIndex: index
    });
  };

  const confirmDeleteKamar = async () => {
    try {
      await deleteKamar(confirmDelete.kamarId);

      setConfirmDelete({
        show: false,
        kamarId: null,
        kamarIndex: null
      });

      fetchDetail();

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="admin-page">
        <h1>Edit Homestay</h1>

        {step === 1 && (
          <div className="card-form">
            {error && <div className="error-text">{error}</div>}
            <div className="form-group">
              <label>Nama Homestay</label>
              <input
                placeholder="Nama Homestay"
                value={form.nama}
                onChange={(e)=>setForm({...form,nama:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Lokasi Homestay</label>
              <textarea
                placeholder="Lokasi"
                value={form.lokasi}
                onChange={(e)=>setForm({...form,lokasi:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Jam Check-in</label>
              <input
                type="time"
                value={form.check_in}
                onChange={(e)=>setForm({...form,check_in:e.target.value})}
              />
            </div>
              
            <div className="form-group">
              <label>Jam Check-out</label>
              <input
                type="time"
                value={form.check_out}
                onChange={(e)=>setForm({...form,check_out:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Aturan Rokok Tradisional & Elektrik</label>
              <input
                placeholder="Aturan Rokok"
                value={form.rokok}
                onChange={(e)=>setForm({...form,rokok:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Aturan Membawa Peliharaan</label>
              <input
                placeholder="Aturan Peliharaan"
                value={form.peliharaan}
                onChange={(e)=>setForm({...form,peliharaan:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Foto Homestay</label>
              <input
                type="file"
                multiple
                onChange={(e)=>{
                  const files = Array.from(e.target.files);

                  const mapped = files.map(file => ({
                    id: Date.now() + Math.random(),
                    file
                  }));

                  setNewPhotos(prev=>[...prev,...mapped]);
                  e.target.value=null;
                }}
              />
            </div>

            <div className="preview-grid">
              {existingPhotos.map((foto)=>{

                const isThumbnail =
                  thumbnail?.type === "existing" &&
                  thumbnail.value === foto.url_foto;

                return(
                  <div key={foto.id} className="preview-item">

                    <img src={`${BASE_URL}/storage/${foto.url_foto}`} />

                    {isThumbnail ? (
                      <span className="thumbnail-badge">Thumbnail</span>
                    ) : (
                      <button
                        type="button"
                        className="set-thumb"
                        onClick={() =>
                          setThumbnail({
                            type:"existing",
                            value:foto.url_foto
                          })
                        }
                      >
                        Set Thumbnail
                      </button>
                    )}

                    <button
                      type="button"
                      className="remove-photo"
                      onClick={()=>{

                        setDeletedPhotoIds(prev=>[
                          ...prev,
                          foto.id
                        ])

                        setExistingPhotos(prev =>
                          prev.filter(f=>f.id!==foto.id)
                        )

                        if(
                          thumbnail?.type==="existing" &&
                          thumbnail.value===foto.url_foto
                        ){
                          setThumbnail(null)
                        }

                      }}
                    >
                      ✕
                    </button>

                  </div>
                )
              })}

              {newPhotos.map((item)=>{
                const isThumbnail =
                  thumbnail?.type==="new" &&
                  thumbnail.value===item.id

                return(
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
                            type:"new",
                            value:item.id
                          })
                        }
                      >
                        Set Thumbnail
                      </button>
                    )}

                    <button
                      type="button"
                      className="remove-photo"
                      onClick={()=>{
                        setNewPhotos(prev =>
                          prev.filter(f=>f.id!==item.id)
                        )

                        if(
                          thumbnail?.type==="new" &&
                          thumbnail.value===item.id
                        ){
                          setThumbnail(null)
                        }
                      }}
                    >
                      ✕
                    </button>

                  </div>
                )
              })}

            </div>

            <div className="button-group">
              <button
                className="btn-secondary"
                onClick={()=>navigate(-1)}
              >
                Batal
              </button>

             <button
                className="btn-primary"
                onClick={() => {
                  setError("");

                  if (!form.nama || !form.lokasi) {
                    setError("Semua field wajib diisi");
                    return;
                  }

                  if (totalPhotos < 3) {
                    setError("Minimal 3 foto homestay");
                    return;
                  }

                  if (!thumbnail) {
                    setError("Pilih thumbnail terlebih dahulu");
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
          <div className="card-form">
            {error && <div className="error-text">{error}</div>}
            {kamars.map((kamar,index)=>(
              <div key={index} style={{
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px",
                background: "#f9fafb"
              }}>

                <div className="kamar-header">
                  <h3>Kamar {index+1}</h3>
                  <button
                    className="btn-remove-kamar"
                    onClick={() => handleDeleteKamar(kamar.id, index)}
                  >
                    Hapus
                  </button>
                </div>

                <div className="form-group">
                  <label>Nama Kamar</label>
                  <input
                    value={kamar.nama}
                    onChange={(e)=>{
                      const updated=[...kamars];
                      updated[index].nama=e.target.value;
                      setKamars(updated);
                      setError("");
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label>Harga Kamar (per malam)</label>
                  <input
                    type="number"
                    value={kamar.harga_per_malam}
                    onChange={(e)=>{
                      const updated=[...kamars];
                      updated[index].harga_per_malam=e.target.value;
                      setKamars(updated);
                      setError("");
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Wifi</label>
                  <input
                    value={kamar.wifi || ""}
                    onChange={(e)=>{
                      const updated=[...kamars];
                      updated[index].wifi=e.target.value;
                      setKamars(updated);
                      setError("");
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Jumlah Kasur</label>
                  <input
                    type="number"
                    value={kamar.jumlah_kasur}
                    onChange={(e)=>{
                      const updated=[...kamars];
                      updated[index].jumlah_kasur=e.target.value;
                      setKamars(updated);
                      setError("");
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Deskripsi Kasur</label>
                  <textarea
                    value={kamar.deskripsi_kasur || ""}
                    onChange={(e)=>{
                      const updated=[...kamars];
                      updated[index].deskripsi_kasur=e.target.value;
                      setKamars(updated);
                      setError("");
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Jumlah Toilet</label>
                  <input
                    type="number"
                    value={kamar.jumlah_toilet}
                    onChange={(e)=>{
                      const updated=[...kamars];
                      updated[index].jumlah_toilet=e.target.value;
                      setKamars(updated);
                      setError("");
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Deskripsi Toilet</label>
                  <textarea
                    value={kamar.deskripsi_toilet || ""}
                    onChange={(e)=>{
                      const updated=[...kamars];
                      updated[index].deskripsi_toilet=e.target.value;
                      setKamars(updated);
                      setError("");
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label>Foto Kamar</label>

                  <input
                    type="file"
                    onChange={(e) => {
                      const updated = [...kamars];
                      updated[index].foto_new = e.target.files[0];
                      updated[index].foto_existing = null;
                      setKamars(updated);
                      setError("");
                    }}
                  />

                  <div className="preview-grid">
                    {kamar.foto_existing && !kamar.foto_new && (
                      <div className="preview-item">
                        <img
                          src={`${BASE_URL}/storage/${kamar.foto_existing}`}
                        />
                      </div>
                    )}

                    {kamar.foto_new && (
                      <div className="preview-item">
                        <img src={URL.createObjectURL(kamar.foto_new)} />

                        <button
                          type="button"
                          className="remove-photo"
                          onClick={() => {
                            const updated = [...kamars];
                            updated[index].foto_new = null;
                            setKamars(updated);
                            setError("");
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

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
                onClick={()=>setStep(1)}
              >
                Kembali
              </button>

              <button
                className="btn-primary"
                disabled={submitting}
                onClick={() => {
                  setError("");

                  if (!kamars.length) {
                    setError("Minimal harus ada 1 kamar");
                    return;
                  }

                  for (let i = 0; i < kamars.length; i++) {
                    const kamar = kamars[i];

                    if (!kamar.nama) {
                      setError(`Nama kamar ke-${i + 1} wajib diisi`);
                      return;
                    }

                    if (!kamar.harga_per_malam) {
                      setError(`Harga kamar ke-${i + 1} wajib diisi`);
                      return;
                    }

                    if (!kamar.jumlah_kasur) {
                      setError(`Jumlah kasur kamar ke-${i + 1} wajib diisi`);
                      return;
                    }

                    if (!kamar.jumlah_toilet) {
                      setError(`Jumlah toilet kamar ke-${i + 1} wajib diisi`);
                      return;
                    }

                    if (!kamar.foto_existing && !kamar.foto_new) {
                      setError(`Foto kamar ke-${i + 1} wajib diisi`);
                      return;
                    }
                  }

                  handleSubmit();
                }}
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
              {modal.type==="success" &&
                <div className="modal-icon success">✓</div>}
              {modal.type==="error" &&
                <div className="modal-icon error">✕</div>}
            </div>

            <h3 className="modal-title">
              {modal.type==="success"?"Berhasil":"Terjadi Kesalahan"}
            </h3>

            <p className="modal-message">
              {modal.message}
            </p>

            <button
              className="modal-button"
              onClick={()=>{
                setModal({...modal,show:false});
                if(modal.type==="success"){
                  navigate("/dashboard/homestay");
                }
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {confirmDelete.show && (
        <div className="custom-modal-overlay">
          <div className="custom-modal modal-center">

            <div className="modal-icon-wrapper">
              <div className="modal-icon error">!</div>
            </div>

            <h3 className="modal-title">
              Konfirmasi Hapus
            </h3>

            <p className="modal-message">
              Apakah Anda yakin ingin menghapus kamar ini?
            </p>

            <div className="button-center">

              <button
                className="btn-secondary"
                onClick={() =>
                  setConfirmDelete({
                    show:false,
                    kamarId:null,
                    kamarIndex:null
                  })
                }
              >
                Batal
              </button>

              <button
                className="btn-danger"
                onClick={confirmDeleteKamar}
              >
                Hapus
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default EditHomestay;