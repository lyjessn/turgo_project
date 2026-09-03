import { useEffect, useState, useMemo, useRef } from "react";
import { BASE_URL } from "../../utils/baseUrl";
import { FiSearch, FiEdit, FiEye, FiTrash2, FiX } from "react-icons/fi";
import "./css/AdminShared.css";
import "./css/AdminPaketWisata.css";
import "../pengunjung/css/Pembayaran.css";
import "./css/Modal.css"
import { getAllTourGuide, createTourGuide, updateTourGuide, getAllUsersTourGuide, deleteTourGuide } from "../../api/apiTourGuide";
import { GetUserData } from "../../api/apiAuth";

const AdminTourGuide = () => {
    const [data,setData] = useState([]);
    const [loading,setLoading] = useState(true);
    const [search,setSearch] = useState("");
    const [filter,setFilter] = useState("semua");
    const [showAddModal,setShowAddModal] = useState(false);
    const [showEditModal,setShowEditModal] = useState(false);
    const [showDetailModal,setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem,setSelectedItem] = useState(null);
    const [userList, setUserList] = useState([]);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;
    const formRef = useRef(null);

    const defaultForm = {
        user_id: "",
        bio: "",
        harga_per_hari: "",
        bahasa: "",
        spesialisasi: "",
        kapasitas_min: "",
        kapasitas_max: "",
        foto_profil: null
    };

    const [form,setForm] = useState(defaultForm);
    const [role, setRole] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [modal, setModal] = useState({
        show: false,
        type: "",
        message: ""
    });

    useEffect(() => {
        loadUser();
        fetchData();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, filter]);

    const loadUser = async () => {
        try {
            const res = await GetUserData();
            setRole(res.role);
        } catch (err) {
            console.error("Gagal ambil user:", err);
        }
    };

    const fetchData = async()=> {
        try {
            const res = await getAllTourGuide();

            console.log(res);

            setData(
                Array.isArray(res)
                    ? res
                    : Array.isArray(res.data)
                    ? res.data
                    : []
            );

        } catch (err) {
            console.error(err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await getAllUsersTourGuide();
            setUserList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredData = useMemo(()=>{
        let result = [...data];

        if(filter==="aktif")
        result = result.filter(d=>d.is_aktif==1);

        if(filter==="nonaktif")
        result = result.filter(d=>d.is_aktif==0);

        if(search)
        result = result.filter(d =>
            d.user?.nama_lengkap
            ?.toLowerCase()
            .includes(search.toLowerCase())
        );

        return result;
    },[data,filter,search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginatedData = filteredData.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const formatHarga = (harga)=>{
        return Number(harga).toLocaleString("id-ID");
    };

    const toggleStatus = async(item)=>{
        try{
            const formData = new FormData();
            formData.append(
                "is_aktif",
                item.is_aktif==1 ? 0 : 1
            );
            await updateTourGuide(item.id,formData);

            setData(prev =>
                prev.map(d =>
                d.id==item.id
                    ? {...d,is_aktif:d.is_aktif==1?0:1}
                    : d
                )
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = async()=>{
        try{
            setSubmitting(true);
            setError("");
            setSuccess("");

            const formData = new FormData();
            Object.keys(form).forEach(key=>{
                if(form[key] !== null && form[key] !== "")
                    formData.append(key,form[key]);
            });

            await createTourGuide(formData);

            setSuccess("Berhasil menambahkan tour guide");

            setShowAddModal(false);
            setForm(defaultForm);
            fetchData();

        } catch (err) {
            setError("Gagal menambahkan tour guide");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async()=>{
        try{
            setSubmitting(true);
            setError("");
            setSuccess("");

            const formData = new FormData();
            Object.keys(form).forEach(key=>{
                if(form[key])
                    formData.append(key,form[key]);
            });

            await updateTourGuide(selectedItem.id,formData);

            setSuccess("Berhasil update tour guide");

            setShowEditModal(false);
            setForm(defaultForm);
            setModal({
                show: true,
                type: "success",
                message: "Guide berhasil diupdate"
            });
            setSelectedItem(null);
            fetchData();

        } catch (err) {
            setModal({
                show: true,
                type: "error",
                message: "Terjadi kesalahan saat update"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            await deleteTourGuide(selectedItem.id);

            setSuccess("Berhasil menghapus tour guide");

            setShowDeleteModal(false);
            setSelectedItem(null);

            fetchData();
            loadUser();

        } catch (err) {
            setError("Gagal menghapus tour guide");
        } finally {
            setSubmitting(false);
        }
    };

    if(loading) return <div>Loading...</div>;

    return (
        <>
            <div className="admin-page">
                <div className="admin-header">
                    <h1>Tour Guide</h1>

                    <div className="admin-header-actions">
                        <button
                            className="btn-primary"
                            onClick={()=>{
                                setForm(defaultForm);
                                setError("");
                                setSuccess("");
                                fetchUsers();
                                setShowAddModal(true)
                            }}
                        >
                            + Tambah
                        </button>

                        <div className="admin-search-wrapper">
                            <FiSearch/>

                            <input
                                type="text"
                                placeholder="Cari tour guide"
                                value={search}
                                onChange={(e)=>setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="admin-filter-group">

                    <button
                    className={filter==="semua"?"active":""}
                    onClick={()=>setFilter("semua")}
                    >
                    Semua
                    </button>

                    <button
                    className={filter==="aktif"?"active":""}
                    onClick={()=>setFilter("aktif")}
                    >
                    Aktif
                    </button>

                    <button
                    className={filter==="nonaktif"?"active":""}
                    onClick={()=>setFilter("nonaktif")}
                    >
                    Nonaktif
                    </button>

                </div>

                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                            <th>ID</th>
                            <th>Nama</th>
                            <th>Harga / Hari</th>
                            <th>Bahasa</th>
                            <th>Kapasitas</th>
                            <th>Rating</th>
                            <th>Status</th>
                            <th>Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedData.map(item=>(
                                <tr key={item.id}>

                                    <td>{item.id}</td>
                                    <td>{item.user?.nama_lengkap}</td>
                                    <td> Rp {formatHarga(item.harga_per_hari)}</td>
                                    <td>{item.bahasa}</td>
                                    <td>{item.kapasitas_min}{" - "}{item.kapasitas_max}</td>
                                    <td> ⭐ {Number(item.ratings_avg_bintang ?? 0).toFixed(1)}</td>
                                    <td>
                                        <label className="switch">

                                            <input
                                            type="checkbox"
                                            checked={item.is_aktif==1}
                                            onChange={()=>toggleStatus(item)}
                                            />

                                            <span className="slider"></span>

                                        </label>
                                    </td>
                                    <td>

                                    <button
                                        className="btn-icon"
                                        onClick={()=>{
                                            setSelectedItem(item);
                                            setShowDetailModal(true);
                                        }}
                                    >
                                        <FiEye/>
                                    </button>

                                    <button
                                        className="btn-icon"
                                        onClick={()=>{
                                            setSelectedItem(item);

                                            setForm({
                                                bio:item.bio||"",
                                                harga_per_hari:item.harga_per_hari,
                                                bahasa:item.bahasa,
                                                spesialisasi:item.spesialisasi,
                                                kapasitas_min:item.kapasitas_min,
                                                kapasitas_max:item.kapasitas_max,
                                                foto_profil:null
                                            });

                                            setError("");
                                            setSuccess("");
                                            setShowEditModal(true);
                                        }}
                                    >
                                        <FiEdit/>
                                    </button>

                                    {role === "owner" && (
                                        <button
                                            className="btn-icon danger"
                                            onClick={() => {
                                                setSelectedItem(item);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            <FiTrash2/>
                                        </button>
                                    )}

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="admin-pagination">

                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Prev
                        </button>

                        <span>
                            Page {page} / {totalPages}
                        </span>

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next
                        </button>

                        </div>
                    )}

                </div>

            </div>

            {showDetailModal && selectedItem && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-data" onClick={(e) => e.stopPropagation()}>

                        <div className="modal-header">
                            <h2>Detail Tour Guide</h2>
                            <FiX className="modal-close" onClick={() => setShowDetailModal(false)}/>
                        </div>

                        <div className="modal-data-body">

                            <img
                            className="modal-data-image"
                            src={`${BASE_URL}/storage/${selectedItem.foto_profil}`}
                            alt={selectedItem.user?.nama_lengkap}
                            />

                            <div className="modal-data-info">

                                <h3 className="modal-data-title">
                                    {selectedItem.user?.nama_lengkap}
                                </h3>

                                <div className="modal-data-grid">
                                    <div className="modal-data-row">
                                        <span className="modal-data-label">Bio</span>
                                        <span>{selectedItem.bio || "-"}</span>
                                    </div>

                                    <div className="modal-data-row">
                                        <span className="modal-data-label">Harga</span>
                                        <span>Rp {Number(selectedItem.harga_per_hari).toLocaleString("id-ID")} / hari</span>
                                    </div>

                                    <div className="modal-data-row">
                                        <span className="modal-data-label">Bahasa</span>
                                        <span>{selectedItem.bahasa}</span>
                                    </div>

                                    <div className="modal-data-row">
                                        <span className="modal-data-label">Spesialisasi</span>
                                        <span>{selectedItem.spesialisasi}</span>
                                    </div>

                                    <div className="modal-data-row">
                                        <span className="modal-data-label">Kapasitas</span>
                                        <span>
                                            {selectedItem.kapasitas_min} - {selectedItem.kapasitas_max} orang
                                        </span>
                                    </div>

                                    <div className="modal-data-row">
                                        <span className="modal-data-label">Status</span>
                                        <span
                                            className={`modal-data-status ${
                                            selectedItem.is_aktif == 1 ? "aktif" : "nonaktif"
                                            }`}
                                        >
                                            {selectedItem.is_aktif == 1 ? "Aktif" : "Nonaktif"}
                                        </span>
                                    </div>

                                    <div className="modal-data-row">
                                        <span className="modal-data-label">Rating</span>
                                        <span>
                                            ⭐ {Number(selectedItem.ratings_avg_bintang ?? 0).toFixed(2)}
                                        </span>
                                        </div>

                                        <div className="modal-data-row">
                                        <span className="modal-data-label">Total Ulasan</span>
                                        <span>
                                            {selectedItem.ratings_count ?? 0} ulasan
                                        </span>
                                    </div>

                                </div>
                                {(selectedItem.ratings_count ?? 0) > 0 && (
                                    <div className="modal-actions">
                                        <button
                                        className="btn-secondary"
                                        onClick={() => {
                                            setShowDetailModal(false);
                                            window.location.href = `/dashboard/reviews/tour_guide/${selectedItem.id}`;
                                        }}
                                        >
                                        Lihat Ulasan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Tambah Tour Guide</h2>
                            <FiX className="modal-close" onClick={() => setShowAddModal(false)}/>
                        </div>

                        <div className="modal-body column" ref={formRef}>
                            {error && <div className="error-text">{error}</div>}
                            {success && <div className="success-text">{success}</div>}
                            <div className="form-group">
                                <label>Pilih User</label>
                                <select
                                    value={form.user_id}
                                    onChange={(e) =>
                                        setForm({ ...form, user_id: e.target.value })
                                    }
                                    required
                                >

                                <option value="">Pilih User</option>

                                {userList.length === 0 && (
                                    <option disabled>Tidak ada user tersedia</option>
                                )}

                                {userList.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.nama_lengkap}
                                </option>
                                ))}

                                </select>
                            </div>

                            <div className="form-group">
                                <label>Bio Tour Guide</label>
                                <textarea
                                    placeholder="Bio"
                                    value={form.bio}
                                    onChange={(e) =>
                                        setForm({ ...form, bio: e.target.value })
                                    }
                                />
                            </div>
                        
                            <div className="form-group">
                                <label>Harga (per hari)</label>
                                <input
                                    type="number"
                                    placeholder="Harga per hari"
                                    value={form.harga_per_hari}
                                    onChange={(e) =>
                                        setForm({
                                        ...form,
                                        harga_per_hari: e.target.value
                                        })
                                    }
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Bahasa Yang Dikuasai</label>
                                <input
                                    type="text"
                                    placeholder="Bahasa"
                                    value={form.bahasa}
                                    onChange={(e) =>
                                        setForm({ ...form, bahasa: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Spesialisasi</label>
                                <input
                                    type="text"
                                    placeholder="Spesialisasi"
                                    value={form.spesialisasi}
                                    onChange={(e) =>
                                        setForm({
                                        ...form,
                                        spesialisasi: e.target.value
                                        })
                                    }
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Kapasitas Minimum</label>
                                <input
                                    type="number"
                                    placeholder="Kapasitas minimum"
                                    value={form.kapasitas_min}
                                    onChange={(e) =>
                                        setForm({
                                        ...form,
                                        kapasitas_min: e.target.value
                                        })
                                    }
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Kapasitas Maksimum</label>
                                <input
                                    type="number"
                                    placeholder="Kapasitas maksimum"
                                    value={form.kapasitas_max}
                                    onChange={(e) =>
                                        setForm({
                                        ...form,
                                        kapasitas_max: e.target.value
                                        })
                                    }
                                    required
                                />
                                {form.kapasitas_min &&
                                    form.kapasitas_max &&
                                    Number(form.kapasitas_max) < Number(form.kapasitas_min) && (
                                    <small className="error-text">
                                        Kapasitas maksimum harus lebih besar dari minimum
                                    </small>
                                )}
                            </div>
                        
                            <div className="form-group">
                                <label>Foto Profil</label>
                                <input
                                    type="file"
                                    onChange={(e) =>
                                        setForm({
                                        ...form,
                                        foto_profil: e.target.files[0]
                                        })
                                    }
                                    required
                                />
                            </div>
                            
                            <button
                                className="btn-primary"
                                disabled={
                                    submitting ||
                                    Number(form.kapasitas_max) < 1 ||
                                    Number(form.kapasitas_min) < 1 ||
                                    Number(form.harga_per_hari) < 1
                                }
                                onClick={() => {
                                    const inputs = formRef.current.querySelectorAll("input, select, textarea");

                                    for (let input of inputs) {
                                        if (!input.checkValidity()) {
                                            input.reportValidity();
                                            return;
                                        }
                                    }

                                    handleAdd();
                                }}
                            >
                            {submitting ? "Menyimpan..." : "Simpan"}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {showEditModal && selectedItem && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Tour Guide</h2>
                            <FiX className="modal-close" onClick={() => setShowEditModal(false)}/>
                        </div>

                        <div className="modal-body column">
                            {error && <div className="error-text">{error}</div>}
                            {success && <div className="success-text">{success}</div>}
                            <div className="form-group">
                                <label>Pemilik</label>
                                <input
                                    type="text"
                                    value={selectedItem.user?.nama_lengkap}
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    value={form.bio}
                                    onChange={(e) =>
                                        setForm({ ...form, bio: e.target.value })
                                    }
                                /> 
                            </div>
                            
                            <div className="form-group">
                                <label>Harga (per hari)</label>
                                <input
                                    type="number"
                                    value={form.harga_per_hari}
                                    onChange={(e) =>
                                        setForm({
                                        ...form,
                                        harga_per_hari: e.target.value
                                        })
                                    }
                                />
                            </div>        

                            <input
                                type="text"
                                value={form.bahasa}
                                onChange={(e) =>
                                    setForm({ ...form, bahasa: e.target.value })
                                }
                            />

                            <input
                                type="text"
                                value={form.spesialisasi}
                                onChange={(e) =>
                                    setForm({
                                    ...form,
                                    spesialisasi: e.target.value
                                    })
                                }
                            />

                            <input
                                type="number"
                                value={form.kapasitas_min}
                                onChange={(e) =>
                                    setForm({
                                    ...form,
                                    kapasitas_min: e.target.value
                                    })
                                }
                            />

                            <input
                                type="number"
                                value={form.kapasitas_max}
                                onChange={(e) =>
                                    setForm({
                                    ...form,
                                    kapasitas_max: e.target.value
                                    })
                                }
                            />
                            {form.kapasitas_min &&
                            form.kapasitas_max &&
                            Number(form.kapasitas_max) < Number(form.kapasitas_min) && (
                                <small className="error-text">
                                    Kapasitas maksimum harus lebih besar dari minimum
                                </small>
                            )}

                            <input
                                type="file"
                                onChange={(e) =>
                                    setForm({
                                    ...form,
                                    foto_profil: e.target.files[0]
                                    })
                                }
                            />

                            <button
                                className="btn-primary"
                                onClick={handleEdit}
                                disabled={submitting}
                            >
                                {submitting ? "Menyimpan..." : "Update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            navigate("/dashboard/tour-guide");
                            }
                        }}
                        >
                        OK
                        </button>
                    </div>
                </div>
            )}

            {showDeleteModal && selectedItem && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal modal-center">

                        <div className="modal-icon-wrapper">
                            <div className="modal-icon error">!</div>
                        </div>

                        <h3 className="modal-title">
                            Hapus Tour Guide
                        </h3>

                        <p className="modal-message">
                            Apakah Anda yakin ingin menghapus{" "}
                            <b>{selectedItem.user?.nama_lengkap}</b>?
                            <br />
                            Data yang dihapus tidak dapat dikembalikan.
                        </p>

                        <div className="modal-actions">
                            <button
                                className="btn-danger"
                                onClick={handleDelete}
                                disabled={submitting}
                            >
                                {submitting ? "Menghapus..." : "Hapus"}
                            </button>

                            <button
                                className="btn-secondary"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Batal
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </>
    );
};

export default AdminTourGuide;