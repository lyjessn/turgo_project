import { useEffect, useState } from "react";
import { FiMapPin, FiClock, FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getMyHomestay, updateHomestay } from "../../api/apiHomestay";
import "./css/HomestayData.css";
import "../adminDanOwner/css/Modal.css";

const HomestayData = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [homestay, setHomestay] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({});
    const [existingPhotos,setExistingPhotos] = useState([]);
    const [newPhotos,setNewPhotos] = useState([]);
    const [deletedPhotoIds,setDeletedPhotoIds] = useState([]);
    const [thumbnail,setThumbnail] = useState(null);
    const [currentImage,setCurrentImage] = useState(0);
    const [saving,setSaving] = useState(false);

    useEffect(() => {
        fetchHomestay();
    }, []);

    const fetchHomestay = async () => {
        try {
            const res = await getMyHomestay();

            setHomestay(res.data);
            setForm(res.data);

            setExistingPhotos(res.data.fotos || []);
            setNewPhotos([]);
            setDeletedPhotoIds([]);

            if (res.data.url_thumbnail) {
                setThumbnail({
                    type: "existing",
                    value: res.data.url_thumbnail
                });
            } else {
                setThumbnail(null);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        try{
            setSaving(true);
            const formData = new FormData()

            formData.append("nama",form.nama)
            formData.append("lokasi",form.lokasi)
            formData.append("check_in",form.check_in)
            formData.append("check_out",form.check_out)
            formData.append("rokok",form.rokok)
            formData.append("peliharaan",form.peliharaan)

            deletedPhotoIds.forEach(id=>{
                formData.append("deleted_photos[]",id)
            })

            newPhotos.forEach(file=>{
                formData.append("new_photos[]",file)
            })

            if(thumbnail?.type === "existing"){
                formData.append("thumbnail_path",thumbnail.value)
            }

            if(thumbnail?.type === "new"){
                formData.append("thumbnail_index",thumbnail.value)
            }

            await updateHomestay(homestay.id,formData);
            await fetchHomestay();
            setShowModal(false);     
        }
        catch(err){
            console.error(err.response?.data)
        }
    }

    if (loading) return <div className="homestay-loading">Memuat data...</div>;

    if (!homestay)
        return (
        <div className="homestay-empty">
            <p>Homestay belum tersedia</p>
        </div>
        );
    
    const images = [
        homestay.url_thumbnail,
        ...(homestay.fotos?.map(f => f.url_foto) || [])
    ];
    const fotos = homestay.fotos || [];

    return (
        <>
            <div className="homestay-page">

               <div className="homestay-header">
                    <h2 className="homestay-title">
                        {homestay.nama}

                        <span className="rating">
                        ⭐ {Number(homestay.ratings_avg_bintang).toFixed(1)} ({homestay.ratings_count})
                        </span>

                        {homestay.ratings_count > 0 && (
                        <span
                            className="review-link"
                            onClick={() =>
                            navigate(`/dashboard/reviews/homestay/${homestay.id}`)
                            }
                        >
                            lihat semua
                        </span>
                        )}
                    </h2>
                </div>

                <div className="homestay-gallery">
                    <img
                        src={`http://localhost:8000/storage/${images[currentImage]}`}
                        className="homestay-main-image"
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

                <div className="homestay-info">
                    <div className="info-item">
                        <FiMapPin />
                        <div>
                            <b>Lokasi</b>
                            <p>{homestay.lokasi}</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <FiClock />
                        <div>
                            <b>Check-in dan Check-out</b>
                            <p>
                            Check-in dibuka mulai pukul <b>{homestay.check_in}</b> |
                            check-out maksimal pukul <b>{homestay.check_out}</b>
                            </p>
                        </div>
                    </div>

                    <div className="info-item">
                        <span>🚬</span>
                        <div>
                            <b>Rokok Tradisional & Elektrik</b>
                            <p>{homestay.rokok}</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <span>🐾</span>
                        <div>
                            <b>Hewan Peliharaan</b>
                            <p>{homestay.peliharaan}</p>
                        </div>
                    </div>

                </div>

                <button
                    className="edit-button"
                    onClick={() => setShowModal(true)}
                >
                    <FiEdit /> Edit Informasi
                </button>

            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Edit Homestay</h3>
                            <span
                            className="modal-close"
                            onClick={() => setShowModal(false)}
                            >
                            ✕
                            </span>
                        </div>

                        <div className="modal-body">
                            <div className="column">
                                <label>Nama</label>
                                <input
                                    value={form.nama || ""}
                                    onChange={(e) =>
                                    setForm({ ...form, nama: e.target.value })
                                    }
                                />
                            </div>

                            <div className="column">
                                <label>Lokasi</label>
                                <textarea
                                    className="modal-textarea"
                                    value={form.lokasi || ""}
                                    onChange={(e) =>
                                    setForm({ ...form, lokasi: e.target.value })
                                    }
                                />
                            </div>

                            <div className="column">
                                <label>Check In</label>
                                <input
                                    type="time"
                                    value={form.check_in || ""}
                                    onChange={(e) =>
                                    setForm({ ...form, check_in: e.target.value })
                                    }
                                />
                            </div>

                            <div className="column">
                                <label>Check Out</label>
                                <input
                                    type="time"
                                    value={form.check_out || ""}
                                    onChange={(e) =>
                                    setForm({ ...form, check_out: e.target.value })
                                    }
                                />
                            </div>

                            <div className="column">
                                <label>Aturan Rokok</label>
                                <textarea
                                    className="modal-textarea"
                                    value={form.rokok || ""}
                                    onChange={(e) =>
                                    setForm({ ...form, rokok: e.target.value })
                                    }
                                />
                            </div>

                            <div className="column">
                                <label>Hewan Peliharaan</label>
                                <textarea
                                    className="modal-textarea"
                                    value={form.peliharaan || ""}
                                    onChange={(e) =>
                                    setForm({ ...form, peliharaan: e.target.value })
                                    }
                                />
                            </div>

                            <div className="column">
                                <label>Tambah Foto Homestay</label>

                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => {
                                    const files = Array.from(e.target.files);
                                    setNewPhotos((prev) => [...prev, ...files]);
                                    e.target.value = null;
                                    }}
                                />
                            </div>

                            <div className="preview-grid">

                                {thumbnail?.type === "existing" &&
                                !existingPhotos.some(f => f.url_foto === thumbnail.value) && (

                                <div className="preview-item">

                                    <img src={`http://localhost:8000/storage/${thumbnail.value}`} />

                                    <span className="thumbnail-badge">
                                        Thumbnail
                                    </span>

                                </div>

                                )}

                                {/* existing photos */}
                                {existingPhotos.map((foto)=>{

                                    const isThumbnail =
                                        thumbnail?.type === "existing" &&
                                        thumbnail.value === foto.url_foto;

                                    return(
                                        <div key={foto.id} className="preview-item">

                                            <img src={`http://localhost:8000/storage/${foto.url_foto}`} />

                                            {isThumbnail ? (
                                                <span className="thumbnail-badge">Thumbnail</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="set-thumb"
                                                    onClick={()=>{
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

                                                    if(typeof foto.id === "number"){
                                                        setDeletedPhotoIds(prev=>[
                                                            ...prev,
                                                            foto.id
                                                        ])
                                                    }

                                                    setExistingPhotos(prev =>
                                                        prev.filter(f=>f.id!==foto.id)
                                                    )

                                                    if(
                                                        thumbnail?.type === "existing" &&
                                                        thumbnail.value === foto.url_foto
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
                                                    onClick={()=>{

                                                        const oldThumb =
                                                            thumbnail?.type === "existing"
                                                                ? thumbnail.value
                                                                : null;

                                                        setThumbnail({
                                                            type:"new",
                                                            value:i
                                                        });

                                                        if(oldThumb){
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

                                                    setNewPhotos(prev =>
                                                        prev.filter((_,idx)=>idx!==i)
                                                    )

                                                    if(
                                                        thumbnail?.type === "new" &&
                                                        thumbnail.value === i
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

export default HomestayData;