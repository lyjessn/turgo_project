import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/AdminShared.css";
import "../css/AdminPaketWisata.css";
import "../css/Modal.css";
import { getDetailHomestay, updateHomestay } from "../../../api/apiHomestay";
import { createKamar, updateKamar, deleteKamar } from "../../../api/apiKamar";

const EditHomestay = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [kamars, setKamars] = useState([]);

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

    console.log(data.kamars);

    setForm({
      nama: data.nama,
      lokasi: data.lokasi,
      check_in: data.check_in,
      check_out: data.check_out,
      rokok: data.rokok,
      peliharaan: data.peliharaan
    });

    setExistingPhotos(data.fotos || []);

    if (data.url_thumbnail) {
      setThumbnail({
        type: "existing",
        value: data.url_thumbnail
      });
    } else {
      setThumbnail(null);
    }

    setKamars(
      data.kamars.map(k => ({
        ...k,
        foto_existing: k.foto,
        foto_new: null
      }))
    );
  };


  const handleSubmit = async () => {
    try {

      const homestayFormData = new FormData();

      Object.keys(form).forEach(key => {
        homestayFormData.append(key, form[key]);
      });

      deletedPhotoIds.forEach(id => {
        homestayFormData.append("deleted_photos[]", id);
      });

      newPhotos.forEach(file => {
        homestayFormData.append("new_photos[]", file);
      });

      if (thumbnail?.type === "existing") {
        homestayFormData.append("thumbnail_path", thumbnail.value);
      }

      if (thumbnail?.type === "new") {
        homestayFormData.append("thumbnail_index", thumbnail.value);
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

    } catch {

      setModal({
        show: true,
        type: "error",
        message: "Terjadi kesalahan saat update"
      });

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
                  setNewPhotos(prev=>[...prev,...files]);
                  e.target.value=null;
                }}
              />
            </div>

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

              {existingPhotos.map((foto)=>{

                const isThumbnail =
                  thumbnail?.type === "existing" &&
                  thumbnail.value === foto.url_foto;

                return(
                  <div key={foto.id} className="preview-item">

                    <img src={`http://127.0.0.1:8000/storage/${foto.url_foto}`} />

                    {isThumbnail ? (
                      <span className="thumbnail-badge">Thumbnail</span>
                    ) : (
                      <button
                        type="button"
                        className="set-thumb"
                        onClick={() => {
                          const oldThumb =
                            thumbnail?.type === "existing"
                              ? thumbnail.value
                              : null;

                          setThumbnail({
                            type:"existing",
                            value:foto.url_foto
                          });

                          if(oldThumb && oldThumb !== foto.url_foto){
                            setExistingPhotos(prev => {

                              if(prev.some(p => p.url_foto === oldThumb)){
                                return prev
                              }

                              return [
                                ...prev,
                                {
                                  id:`temp-${Date.now()}`,
                                  url_foto:oldThumb
                                }
                              ]

                            })
                          }

                        }}
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

              {newPhotos.map((file,i)=>{

                const isThumbnail =
                  thumbnail?.type==="new" &&
                  thumbnail.value===i

                return(
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
                            type:"new",
                            value:i
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
                          prev.filter((_,idx)=>idx!==i)
                        )

                        if(
                          thumbnail?.type==="new" &&
                          thumbnail.value===i
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
                onClick={()=>setStep(2)}
              >
                Lanjutkan
              </button>
            </div>

          </div>
        )}

        {step === 2 && (
          <div className="card-form">

            {kamars.map((kamar,index)=>(
              <div key={kamar.id || index} className="kamar-card">

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
                    }}
                  />

                  <div className="preview-grid">
                    {kamar.foto_existing && !kamar.foto_new && (
                      <div className="preview-item">
                        <img
                          src={`http://127.0.0.1:8000/storage/${kamar.foto_existing}`}
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
          <div className="custom-modal">

            <div className="modal-icon-wrapper">
              <div className="modal-icon error">!</div>
            </div>

            <h3 className="modal-title">
              Konfirmasi Hapus
            </h3>

            <p className="modal-message">
              Apakah Anda yakin ingin menghapus kamar ini?
            </p>

            <div className="button-group">

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
                className="btn-primary"
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