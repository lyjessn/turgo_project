import { useEffect, useState, useMemo } from "react";
import { FiSearch, FiX, FiMapPin, FiClock, FiPhone, FiTrash2 } from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";
import "./css/BudayaDanUmkm.css";
import "./css/AdminShared.css";
import { getAllUmkmAdmin, createUmkm, updateUmkm, getAllUsersUmkm, deleteUmkm } from "../../api/apiUmkm";
import { GetUserData } from "../../api/apiAuth";

const AdminUmkm = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("semua");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [selectedItem, setSelectedItem] = useState(null);

    const defaultForm = {
        user_id: "",
        nama_usaha: "",
        lokasi: "",
        nomor_telepon: "",
        jam_operasional: "",
        menu_tersedia: "",
        existingFotos: [],
        newFotos: [],
        deletedFotoIds: [],
        thumbnailPath: "",   
        thumbnailIndex: 0
    };
    const [form, setForm] = useState(defaultForm);

    const [users, setUsers] = useState([]);
    const [role, setRole] = useState(null);
   
    useEffect(() => {
       loadUser();
       fetchData();
    }, []);
   
    const loadUser = async () => {
       try {
         const res = await GetUserData();
         setRole(res.role);
       } catch (err) {
         console.error("Gagal ambil user:", err);
       }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const res = await getAllUsersUmkm();
        setUsers(res.data);
    };

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
        const res = await getAllUmkmAdmin();
        setData(res.data);
        } catch (err) {
        console.error(err);
        } finally {
        setLoading(false);
        }
    };

    const toggleStatus = async (item) => {
        const formData = new FormData();
        formData.append("is_aktif", item.is_aktif === 1 ? 0 : 1);
        await updateUmkm(item.id, formData);

        setData(prev =>
        prev.map(d =>
            d.id === item.id
            ? { ...d, is_aktif: d.is_aktif === 1 ? 0 : 1 }
            : d
        )
        );
    };

    const filteredData = useMemo(() => {
        let result = [...data];

        if (filter === "aktif")
        result = result.filter(d => d.is_aktif === 1);

        if (filter === "nonaktif")
        result = result.filter(d => d.is_aktif === 0);

        if (search)
        result = result.filter(d =>
            d.nama_usaha.toLowerCase().includes(search.toLowerCase())
        );

        return result;
    }, [data, filter, search]);

    const handleAdd = async () => {
        const formData = new FormData();

        formData.append("user_id", form.user_id);
        formData.append("nama_usaha", form.nama_usaha);
        formData.append("lokasi", form.lokasi);
        formData.append("nomor_telepon", form.nomor_telepon);
        formData.append("jam_operasional", form.jam_operasional);
        formData.append("menu_tersedia", form.menu_tersedia);

        if (form.newFotos.length > 0) {
            formData.append("thumbnail", form.newFotos[0]);

            form.newFotos.forEach(file=>{
            formData.append("fotos[]", file);
            });
        }

        await createUmkm(formData);
        setShowAddModal(false);
        setForm(defaultForm);
        fetchData();
    };

    const handleEdit = async () => {
        const formData = new FormData();

        formData.append("nama_usaha", form.nama_usaha);
        formData.append("lokasi", form.lokasi);
        formData.append("nomor_telepon", form.nomor_telepon);
        formData.append("jam_operasional", form.jam_operasional);
        formData.append("menu_tersedia", form.menu_tersedia);

        form.deletedFotoIds.forEach(id=>{
            formData.append("deleted_fotos[]", id);
        });

        form.newFotos.forEach(file=>{
            formData.append("new_fotos[]", file);
        });

        if (form.thumbnailPath) {
            formData.append("thumbnail_path", form.thumbnailPath);
        } else if (form.newFotos.length > 0) {
            formData.append(
                "thumbnail",
                form.newFotos[form.thumbnailIndex]
            );
        }

        await updateUmkm(selectedItem.id, formData);
        setShowEditModal(false);
        setForm(defaultForm);
        fetchData();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus umkm ini?")) return;
    
        try {
            await deleteUmkm(id);
            setData(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <>
        <div className="admin-page">
            <div className="admin-header">
                <h1>UMKM</h1>
                <div className="admin-card-actions">
                    <button
                        className="btn-primary"
                        onClick={() => {
                            setForm(defaultForm);
                            setShowAddModal(true);
                        }}
                    >
                        + Tambah
                    </button>

                    <div className="admin-search-wrapper">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Cari UMKM di sini"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="admin-filter-group">
                <button className={filter==="semua"?"active":""}
                    onClick={()=>setFilter("semua")}>Semua</button>

                <button className={filter==="aktif"?"active":""}
                    onClick={()=>setFilter("aktif")}>Aktif</button>

                <button className={filter==="nonaktif"?"active":""}
                    onClick={()=>setFilter("nonaktif")}>Nonaktif</button>
            </div>

            <div className="admin-kebudayaan-list">

                {filteredData.map(item=>(
                    <div key={item.id} className="admin-kebudayaan-card">

                        <div className="admin-kebudayaan-image">
                            <img
                            src={`http://127.0.0.1:8000/storage/${item.url_thumbnail}`}
                            />

                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={item.is_aktif===1}
                                    onChange={()=>toggleStatus(item)} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="admin-kebudayaan-content">

                            <h3>{item.nama_usaha}</h3>

                            <div className="admin-desc">
                                <div className="umkm-info"><FiMapPin /> {item.lokasi}</div>
                                <div className="umkm-info"><FiClock /> {item.jam_operasional}</div>
                                <div className="umkm-info"><FaUtensils /> {item.menu_tersedia}</div>
                                <div className="umkm-info"><FiPhone /> {item.nomor_telepon}</div>
                            </div>

                            <div className="admin-card-actions">
                                <button className="btn-detail"
                                    onClick={()=>{setSelectedItem(item);setShowDetailModal(true);}}>
                                    Detail
                                </button>

                                <button className="btn-edit"
                                    onClick={()=>{
                                        setSelectedItem(item);
                                        setForm({
                                            user_id: item.user_id,
                                            nama_usaha: item.nama_usaha,
                                            lokasi: item.lokasi,
                                            nomor_telepon: item.nomor_telepon,
                                            jam_operasional: item.jam_operasional,
                                            menu_tersedia: item.menu_tersedia,
                                            existingFotos: item.fotos || [],
                                            newFotos: [],
                                            deletedFotoIds: [],
                                            thumbnailPath: item.url_thumbnail,
                                            thumbnailIndex: 0
                                        });
                                        setShowEditModal(true);
                                    }}>
                                    Edit
                                </button>
                                {role === "owner" && (
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                    Hapus
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {(showAddModal || showEditModal) && (
            <div
                className="modal-overlay"
                onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setForm(defaultForm);
                }}
            >
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>{showAddModal ? "Tambah UMKM" : "Edit UMKM"}</h2>
                        <FiX className="modal-close"
                            onClick={() => {
                                setShowAddModal(false);
                                setShowEditModal(false);
                                setForm(defaultForm);
                            }}
                        />
                    </div>

                    <div className="modal-body column">

                        {showAddModal && (
                        <select
                            value={form.user_id}
                            onChange={(e) =>
                            setForm({ ...form, user_id: e.target.value })
                            }
                        >
                            <option value="">Pilih User UMKM</option>
                            {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.nama_lengkap}
                            </option>
                            ))}
                        </select>
                        )}

                        <input
                            placeholder="Nama UMKM"
                            value={form.nama_usaha}
                            onChange={(e) =>
                                setForm({ ...form, nama_usaha: e.target.value })
                            }
                        />

                        <input
                            placeholder="Lokasi"
                            value={form.lokasi}
                            onChange={(e) =>
                                setForm({ ...form, lokasi: e.target.value })
                            }
                        />

                        <input
                            placeholder="Menu tersedia"
                            value={form.menu_tersedia}
                            onChange={(e) =>
                                setForm({ ...form, menu_tersedia: e.target.value })
                            }
                        />

                        <input
                            placeholder="Jam operasional"
                            value={form.jam_operasional}
                            onChange={(e) =>
                                setForm({ ...form, jam_operasional: e.target.value })
                            }
                        />

                        <input
                            placeholder="Nomor telepon"
                            value={form.nomor_telepon}
                            onChange={(e) =>
                                setForm({ ...form, nomor_telepon: e.target.value })
                            }
                        />

                        <input
                            type="file"
                            multiple
                            onChange={(e) => {
                                const newFiles = Array.from(e.target.files);

                                setForm((prev) => ({
                                ...prev,
                                newFotos: [...prev.newFotos, ...newFiles]
                                }));

                                e.target.value = null;
                            }}
                        />

                        <div className="preview-grid">

                            {(form.existingFotos || []).map((foto) => {
                                const isThumbnail =
                                form.thumbnailPath === foto.url_foto;

                                return (
                                <div key={foto.id} className="preview-item">
                                    <img
                                    src={`http://127.0.0.1:8000/storage/${foto.url_foto}`}
                                    alt=""
                                    />

                                    {isThumbnail && (
                                    <span className="thumbnail-badge">
                                        Thumbnail
                                    </span>
                                    )}

                                    <button
                                    type="button"
                                    className="remove-photo"
                                    onClick={()=>{
                                        setForm(prev=>({
                                        ...prev,
                                        existingFotos: prev.existingFotos.filter(f=>f.id!==foto.id),
                                        deletedFotoIds: [...prev.deletedFotoIds, foto.id],
                                        thumbnailPath:
                                            prev.thumbnailPath === foto.url_foto
                                            ? ""
                                            : prev.thumbnailPath
                                        }));
                                    }}
                                    >
                                    ✕
                                    </button>

                                    {!isThumbnail && (
                                    <button
                                        type="button"
                                        className="set-thumb"
                                        onClick={()=>{
                                        setForm(prev=>({
                                            ...prev,
                                            thumbnailPath: foto.url_foto
                                        }));
                                        }}
                                    >
                                        Set Thumbnail
                                    </button>
                                    )}

                                </div>
                                );
                            })}

                            {(form.newFotos || []).map((file,i)=>{
                                const isThumbnail =
                                !form.thumbnailPath && form.thumbnailIndex === i;

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
                                    onClick={()=>{
                                        setForm(prev=>({
                                        ...prev,
                                        newFotos: prev.newFotos.filter((_,index)=>index!==i)
                                        }));
                                    }}
                                    >
                                    ✕
                                    </button>

                                    {!isThumbnail && (
                                    <button
                                        type="button"
                                        className="set-thumb"
                                        onClick={()=>{
                                        setForm(prev=>({
                                            ...prev,
                                            thumbnailPath: "",
                                            thumbnailIndex: i
                                        }));
                                        }}
                                    >
                                        Set Thumbnail
                                    </button>
                                    )}

                                </div>
                                );
                            })}

                        </div>

                        <button
                            className="btn-primary"
                            onClick={showAddModal ? handleAdd : handleEdit}
                        >
                            {showAddModal ? "Simpan" : "Update"}
                        </button>

                    </div>
                </div>
            </div>
        )}

        {showDetailModal && selectedItem && (
            <div className="modal-overlay" onClick={()=>setShowDetailModal(false)}>
                <div className="modal" onClick={(e)=>e.stopPropagation()}>

                    <div className="modal-header">
                        <h2>Detail UMKM</h2>
                        <FiX className="modal-close" onClick={()=>setShowDetailModal(false)} />
                    </div>

                    <div className="modal-body column">
                        <h2 className="detail-title">
                            {selectedItem.nama_usaha}
                        </h2>

                        {selectedItem.url_thumbnail && (
                            <div className="detail-hero">
                            <img
                                src={`http://127.0.0.1:8000/storage/${selectedItem.url_thumbnail}`}
                                alt=""
                            />
                            </div>
                        )}

                        {selectedItem.fotos?.length > 0 && (
                            <>
                                <div className="detail-gallery">
                                    {selectedItem.fotos.map((foto) => (
                                    <img
                                        key={foto.id}
                                        src={`http://127.0.0.1:8000/storage/${foto.url_foto}`}
                                        alt=""
                                    />
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="detail-info">
                            <div><FiMapPin /> {selectedItem.lokasi}</div>
                            <div><FiClock /> {selectedItem.jam_operasional}</div>
                            <div><FaUtensils /> {selectedItem.menu_tersedia}</div>
                            <div><FiPhone /> {selectedItem.nomor_telepon}</div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        </>
    );
};

export default AdminUmkm;