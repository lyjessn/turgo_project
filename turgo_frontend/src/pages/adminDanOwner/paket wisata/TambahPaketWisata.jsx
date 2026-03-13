import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AdminShared.css";
import "../css/AdminPaketWisata.css";
import "../css/Modal.css";
import { createPaketWisata } from "../../../api/apiPaketWisata";
import { getAllPelakuWisata } from "../../../api/apiPelakuWisata";

const TambahPaketWisata = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [pelakuList, setPelakuList] = useState([]);
    const [selectedPelaku, setSelectedPelaku] = useState("");
    const [participants, setParticipants] = useState([]);
    const [newPhotos, setNewPhotos] = useState([]);
    const [thumbnailIndex, setThumbnailIndex] = useState(0);
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
        kapasitas_max: "",
        thumbnail: null
    });

    useEffect(() => {
        fetchPelaku();
    }, []);

    const fetchPelaku = async () => {
        const res = await getAllPelakuWisata();
        const data = res.data ?? res;
  
        setPelakuList(data);
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleNextStep1 = () => {
        if (!form.nama || !form.harga || !form.preview) {
            alert("Semua field wajib diisi");
            return;
        }

        if (newPhotos.length < 3) {
            alert("Minimal 3 foto paket");
            return;
        }

        handleNext();
    };

    const handleAddPelaku = () => {
        if (!selectedPelaku) return;

        const already = participants.find(p => p.user_id == selectedPelaku);
        if (already) return;

        const pelaku = pelakuList.find(p => p.user_id == selectedPelaku);

        setParticipants([
        ...participants,
        {
            user_id: selectedPelaku,
            nama: pelaku?.user?.nama_lengkap,
            persentase: 0
        }
        ]);

        setSelectedPelaku("");
    };

    const handleRemovePelaku = (index) => {
        const updated = participants.filter((_, i) => i !== index);
        setParticipants(updated);
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

    if (newPhotos.length < 3) {
        setModal({
        show: true,
        type: "error",
        message: "Minimal 3 foto paket"
        });
        return;
    }

    if (participants.length === 0) {
        setModal({
        show: true,
        type: "error",
        message: "Minimal 1 pelaku wisata"
        });
        return;
    }

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

        formData.append("thumbnail", newPhotos[thumbnailIndex]);

        newPhotos.forEach(file => {
        formData.append("photos[]", file);
        });

        formData.append("participants", JSON.stringify(participants));

        await createPaketWisata(formData);

        setModal({
        show: true,
        type: "success",
        message: "Paket wisata berhasil ditambahkan"
        });

    } catch (err) {
        setModal({
        show: true,
        type: "error",
        message: "Terjadi kesalahan saat menyimpan data"
        });
    }
    };

  return (
    <>
        <div className="admin-page">

        <h1>Tambah Paket Wisata</h1>
        <div className="stepper-wrapper">

            <div className="step-item">
                <div className={`step-circle ${step >= 1 ? "active" : ""}`}>1</div>
                <span className={step >= 1 ? "active-text" : ""}>
                Informasi Dasar
                </span>
            </div>

            <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>

            <div className="step-item">
                <div className={`step-circle ${step >= 2 ? "active" : ""}`}>2</div>
                <span className={step >= 2 ? "active-text" : ""}>
                Detail Paket
                </span>
            </div>

            <div className={`step-line ${step >= 3 ? "active" : ""}`}></div>

            <div className="step-item">
                <div className={`step-circle ${step >= 3 ? "active" : ""}`}>3</div>
                <span className={step >= 3 ? "active-text" : ""}>
                Pelaku & Persentase
                </span>
            </div>

        </div>

        {step === 1 && (
            <div className="card-form">
            <input
                placeholder="Nama Paket"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />

            <input
                type="number"
                placeholder="Harga"
                value={form.harga}
                onChange={(e) => setForm({ ...form, harga: e.target.value })}
            />

            <select
                value={form.kategori_paket}
                onChange={(e) =>
                    setForm({ ...form, kategori_paket: e.target.value })
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
                onChange={(e) => setForm({ ...form, preview: e.target.value })}
            />

                <div>
                    <label>Upload Foto Paket (Minimal 3)</label>
                    <input
                        type="file"
                        multiple
                        onChange={(e)=>{
                            const files = Array.from(e.target.files);
                            setNewPhotos(prev => [...prev, ...files]);
                            e.target.value = null;
                        }}
                    />
                </div>

                <div className="preview-grid">
                    {newPhotos.map((file, i) => {
                        const isThumbnail = thumbnailIndex === i;

                        return (
                        <div key={i} className="preview-item">
                            <img src={URL.createObjectURL(file)} alt="" />

                            {isThumbnail && (
                            <span className="thumbnail-badge">
                                Thumbnail
                            </span>
                            )}

                            <button
                                type="button"
                                className="remove-photo"
                                onClick={() => {
                                    setNewPhotos(prev => {
                                        const updated = prev.filter((_, index) => index !== i);

                                        if (thumbnailIndex >= updated.length) {
                                        setThumbnailIndex(0);
                                        }

                                        return updated;
                                    });
                                }}
                            >
                            ✕
                            </button>

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
                    <button className="btn-secondary" onClick={() => navigate(-1)}>Batal</button>
                    <button className="btn-primary" onClick={handleNextStep1}>Lanjutkan</button>
                </div>
            </div>
        )}

        {step === 2 && (
            <div className="card-form">
                <textarea
                    placeholder="Lokasi"
                    value={form.lokasi}
                    onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                />

                <input
                    placeholder="Durasi"
                    value={form.durasi}
                    onChange={(e) => setForm({ ...form, durasi: e.target.value })}
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
                    <button className="btn-secondary" onClick={handleBack}>Kembali</button>
                    <button className="btn-primary" onClick={handleNext}>Lanjutkan</button>
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="card-form">
                <div className="row">
                    <select
                        value={selectedPelaku}
                        onChange={(e) => setSelectedPelaku(e.target.value)}
                    >
                        <option value="">Pilih Pelaku Wisata</option>
                        {pelakuList.map((p) => (
                            <option key={p.user_id} value={p.user_id}>
                            {p.user.nama_lengkap}
                            </option>
                        ))}
                    </select>

                    <button className="btn-add-pelaku" onClick={handleAddPelaku}>+ Tambah</button>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Pelaku</th>
                            <th>Persentase</th>
                            <th>Aksi</th>
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
                                handlePersenChange(i, e.target.value)
                                }
                            />
                            </td>

                            <td>
                            <button
                                type="button"
                                className="btn-danger"
                                onClick={() => handleRemovePelaku(i)}
                            >
                                Hapus
                            </button>
                            </td>

                        </tr>
                        ))}
                    </tbody>
                </table>

                <div className={`total ${totalPersen !== 100 ? "error" : ""}`}>
                    Total: {totalPersen}%
                </div>

                <div className="button-group">
                    <button className="btn-secondary" onClick={handleBack}>Kembali</button>
                    <button className="btn-primary" onClick={handleSubmit}>
                    Tambah
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
                        {modal.type === "success" && "Berhasil"}
                        {modal.type === "error" && "Terjadi Kesalahan"}
                    </h3>

                    <p className="modal-message">{modal.message}</p>

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

export default TambahPaketWisata;