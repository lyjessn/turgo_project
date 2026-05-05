import { useEffect, useState } from "react";
import { BASE_URL } from "../../utils/baseUrl";
import ProfileCard from "../../components/dashboard/ProfileCard";
import { getMyUmkm, updateUmkm } from "../../api/apiUmkm";
import { FiMapPin, FiPhone, FiClock, FiEdit, FiPower, FiCheckCircle, FiXCircle  } from "react-icons/fi";

import "./Dashboard.css"
import "./DashboardUmkm.css"
import "../adminDanOwner/css/Modal.css";

const DashboardUmkm = () => {
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [umkm,setUmkm] = useState(null);
  const [form,setForm] = useState({});
  const [showModal,setShowModal] = useState(false);
  const [existingPhotos,setExistingPhotos] = useState([]);
  const [newPhotos,setNewPhotos] = useState([]);
  const [deletedPhotoIds,setDeletedPhotoIds] = useState([]);
  const [thumbnail,setThumbnail] = useState(null);
  const [currentImage,setCurrentImage] = useState(0);

  useEffect(()=>{
    fetchUmkm();
  },[]);

  const fetchUmkm = async () => {
    try{
      const res = await getMyUmkm();
      console.log(res.data);
      setUmkm(res.data);
      setForm(res.data);

      setExistingPhotos(res.data.fotos || []);
      setNewPhotos([]);
      setDeletedPhotoIds([]);

      if(res.data.url_thumbnail){
        setThumbnail({
          type:"existing",
          value:res.data.url_thumbnail
        });
      }

    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    try {
      const formData = new FormData();
      formData.append("is_buka", umkm.is_buka ? 0 : 1);

      await updateUmkm(umkm.id, formData);

      setUmkm(prev => ({
        ...prev,
        is_buka: prev.is_buka ? 0 : 1
      }));

    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {

    try{

      setSaving(true);

      const formData = new FormData();

      formData.append("nama_usaha",form.nama_usaha);
      formData.append("lokasi",form.lokasi);
      formData.append("nomor_telepon",form.nomor_telepon);
      formData.append("jam_operasional",form.jam_operasional);
      formData.append("menu_tersedia",form.menu_tersedia);

      deletedPhotoIds.forEach(id=>{
        formData.append("deleted_fotos[]",id)
      })

      newPhotos.forEach(file=>{
        formData.append("new_fotos[]",file)
      })

      if(thumbnail?.type === "existing"){
        formData.append("thumbnail_path",thumbnail.value)
      }

      if(thumbnail?.type === "new"){
        formData.append("thumbnail_index",thumbnail.value)
      }

      await updateUmkm(umkm.id,formData);
      await fetchUmkm();
      setShowModal(false);

    }catch(err){
      console.error(err);
    }finally{
      setSaving(false);
    }

  };

  if(loading){
    return <div className="admin-page">Loading...</div>
  }

  const images = [
    umkm?.url_thumbnail,
    ...existingPhotos
      .map(f => f.url_foto)
      .filter(f => f !== umkm?.url_thumbnail)
  ];

  return (
    <>

    <div className="admin-page">

      <h1>Beranda</h1>

      <div className="dashboard-row">

        <ProfileCard />

        <div className="umkm-card">

          <div className="umkm-header">
            <h2>{umkm.nama_usaha}</h2>

            <div
              className={`umkm-status ${umkm.is_buka ? "open" : "closed"}`}
              onClick={toggleStatus}
              title="Klik untuk ubah status"
            >
              {umkm.is_buka ? (
                <>
                  <FiCheckCircle /> Buka
                </>
              ) : (
                <>
                  <FiXCircle /> Tutup
                </>
              )}
            </div>
          </div>

          <div className="umkm-gallery">
            <img
              src={`${BASE_URL}/storage/${images[currentImage]}`}
              className="umkm-main-image"
            />

            {images.length > 1 && (
              <div className="gallery-dots">
                {images.map((_,i)=>(
                  <span
                    key={i}
                    className={i===currentImage ? "dot active" : "dot"}
                    onClick={()=>setCurrentImage(i)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="umkm-info">

            <div className="info-item">
              <FiMapPin />
              <div>
                <b>Lokasi</b>
                <p>{umkm.lokasi}</p>
              </div>
            </div>

            <div className="info-item">
              <FiClock />
              <div>
                <b>Jam Operasional</b>
                <p>{umkm.jam_operasional}</p>
              </div>
            </div>

            <div className="info-item">
              <span>🍴</span>
              <div>
                <b>Menyediakan</b>
                <p>{umkm.menu_tersedia}</p>
              </div>
            </div>

            <div className="info-item">
              <FiPhone />
              <div>
                <b>Kontak</b>
                <p>{umkm.nomor_telepon}</p>
              </div>
            </div>

          </div>

          <button
            className="edit-button"
            onClick={()=>setShowModal(true)}
          >
            <FiEdit /> Edit Informasi
          </button>

        </div>

      </div>

    </div>

    {showModal && (
      <div className="modal-overlay">

        <div className="modal">

          <div className="modal-header">
            <h3>Edit UMKM</h3>
            <span
              className="modal-close"
              onClick={()=>setShowModal(false)}
            >
              ✕
            </span>
          </div>

          <div className="modal-body">

            <div className="column">
              <label>Nama Usaha</label>
              <input
                value={form.nama_usaha || ""}
                onChange={(e)=>setForm({...form,nama_usaha:e.target.value})}
              />
            </div>

            <div className="column">
              <label>Lokasi</label>
              <textarea
                className="modal-textarea"
                value={form.lokasi || ""}
                onChange={(e)=>setForm({...form,lokasi:e.target.value})}
              />
            </div>

            <div className="column">
              <label>Nomor Telepon</label>
              <input
                value={form.nomor_telepon || ""}
                onChange={(e)=>setForm({...form,nomor_telepon:e.target.value})}
              />
            </div>

            <div className="column">
              <label>Jam Operasional</label>
              <input
                value={form.jam_operasional || ""}
                onChange={(e)=>setForm({...form,jam_operasional:e.target.value})}
              />
            </div>

            <div className="column">
              <label>Menu Tersedia</label>
              <textarea
                className="modal-textarea"
                value={form.menu_tersedia || ""}
                onChange={(e)=>setForm({...form,menu_tersedia:e.target.value})}
              />
            </div>

            <div className="column">
              <label>Tambah Foto UMKM</label>

              <input
                type="file"
                multiple
                onChange={(e)=>{
                  const files = Array.from(e.target.files);
                  setNewPhotos(prev => [...prev,...files]);
                  e.target.value = null;
                }}
              />
            </div>

            <div className="preview-grid">
              {thumbnail?.type === "existing" &&
              !existingPhotos.some(f => f.url_foto === thumbnail.value) && (

                <div className="preview-item">

                  <img src={`${BASE_URL}/storage/${thumbnail.value}`} />

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

                    <img src={`${BASE_URL}/storage/${foto.url_foto}`} />

                    {isThumbnail ? (
                      <span className="thumbnail-badge">Thumbnail</span>
                    ) : (
                      <button
                        type="button"
                        className="set-thumb"
                        onClick={()=>setThumbnail({
                          type:"existing",
                          value:foto.url_foto
                        })}
                      >
                        Set Thumbnail
                      </button>
                    )}

                    <button
                      type="button"
                      className="remove-photo"
                      onClick={()=>{
                        setDeletedPhotoIds(prev=>[...prev,foto.id]);
                        setExistingPhotos(prev =>
                          prev.filter(f=>f.id!==foto.id)
                        );

                        if(
                          thumbnail?.type === "existing" &&
                          thumbnail.value === foto.url_foto
                        ){
                          setThumbnail(null);
                        }
                      }}
                    >
                      ✕
                    </button>

                  </div>
                )
              })}

              {/* new photos */}
              {newPhotos.map((file,i)=>{

                const isThumbnail =
                  thumbnail?.type === "new" &&
                  thumbnail.value === i;

                return(
                  <div key={i} className="preview-item">

                    <img src={URL.createObjectURL(file)} />

                    {isThumbnail ? (
                      <span className="thumbnail-badge">Thumbnail</span>
                    ) : (
                      <button
                        type="button"
                        className="set-thumb"
                        onClick={()=>setThumbnail({
                          type:"new",
                          value:i
                        })}
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
                        );

                        if(
                          thumbnail?.type === "new" &&
                          thumbnail.value === i
                        ){
                          setThumbnail(null);
                        }
                      }}
                    >
                      ✕
                    </button>

                  </div>
                )
              })}

            </div>

            <button
              className={`modal-button ${saving ? "loading" : ""}`}
              onClick={handleUpdate}
              disabled={saving}
            >
              {saving ? "Memproses..." : "Simpan"}
            </button>

          </div>

        </div>

      </div>
    )}

    </>

  );

};

export default DashboardUmkm;