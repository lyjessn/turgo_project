import { useEffect, useState, useMemo } from "react";
import { BASE_URL } from "../../utils/baseUrl";
import { FiSearch, FiX } from "react-icons/fi";
import "./css/BudayaDanUmkm.css";
import "./css/AdminShared.css";
import { getAllKebudayaanAdmin, updateKebudayaan, createKebudayaan, deleteKebudayaan} from "../../api/apiKebudayaan";
import { GetUserData } from "../../api/apiAuth";

const AdminKebudayaan = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("semua");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 10;

    const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    foto: null,
    });

    const [role, setRole] = useState(null);
   
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

    const fetchData = async () => {
        try {
            const res = await getAllKebudayaanAdmin();
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (item) => {
        try {
            const formData = new FormData();
            formData.append(
                "is_aktif",
                item.is_aktif === 1 ? 0 : 1
            );
            await updateKebudayaan(item.id, formData);

            setData(prev =>
                prev.map(d =>
                d.id === item.id
                    ? { ...d, is_aktif: d.is_aktif === 1 ? 0 : 1 }
                    : d
                )
            );
        } catch (err) {
            console.error(err);
        }
    };

    const filteredData = useMemo(() => {

        let result = [...data];

        if (filter === "aktif") {
        result = result.filter(d => d.is_aktif === 1);
        }

        if (filter === "nonaktif") {
        result = result.filter(d => d.is_aktif === 0);
        }

        if (search) {
        result = result.filter(d =>
            d.nama.toLowerCase().includes(search.toLowerCase())
        );
        }

        return result;

    }, [data, filter, search]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginatedData = filteredData.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const handleAdd = async () => {
        try {
            const formData = new FormData();
            formData.append("nama", form.nama);
            formData.append("deskripsi", form.deskripsi);

            if (form.foto)
            formData.append("foto", form.foto);

            await createKebudayaan(formData);

            setShowAddModal(false);

            setForm({
            nama: "",
            deskripsi: "",
            foto: null
            });

            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = async () => {
        try {
            const formData = new FormData();

            formData.append("nama", form.nama);
            formData.append("deskripsi", form.deskripsi);

            if (form.foto)
            formData.append("foto", form.foto);

            await updateKebudayaan(selectedItem.id, formData);

            setShowEditModal(false);
            setSelectedItem(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteKebudayaan(selectedItem.id);

            setShowDeleteModal(false);
            setSelectedItem(null);

            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading)
        return (
        <div className="admin-loading">
            Loading...
        </div>
        );


    return (
        <>
            <div className="admin-page">

                <div className="admin-header">

                    <h1>Kebudayaan</h1>

                    <div className="admin-card-actions">

                        <button
                            className="btn-primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            + Tambah
                        </button>

                        <div className="admin-search-wrapper">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Cari Kebudayaan di sini"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                </div>

                <div className="admin-filter-group">
                    <button
                        className={filter === "semua" ? "active" : ""}
                        onClick={() => setFilter("semua")}
                    >
                        Semua
                    </button>

                    <button
                        className={filter === "aktif" ? "active" : ""}
                        onClick={() => setFilter("aktif")}
                    >
                        Aktif
                    </button>

                    <button
                        className={filter === "nonaktif" ? "active" : ""}
                        onClick={() => setFilter("nonaktif")}
                    >
                        Nonaktif
                    </button>
                </div>

            <div className="admin-kebudayaan-list">

                {paginatedData.length === 0 && (
                <div className="admin-empty">
                    Tidak ada data kebudayaan
                </div>
                )}


                {filteredData.map(item => (
                    <div key={item.id} className="admin-kebudayaan-card">
                        <div className="admin-kebudayaan-image">
                            <img
                            src={`${BASE_URL}/storage/${item.foto}`}
                            />

                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={item.is_aktif === 1}
                                    onChange={() => toggleStatus(item)}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="admin-kebudayaan-content">
                            <h3>{item.nama}</h3>
                            <p className="admin-desc">
                            {item.deskripsi.length > 180
                                ? item.deskripsi.substring(0,180) + "..."
                                : item.deskripsi}
                            </p>

                            <div className="admin-card-actions">
                                <button
                                    className="btn-detail"
                                    onClick={() => {
                                    setSelectedItem(item);
                                    setShowDetailModal(true);
                                    }}
                                >
                                    Detail
                                </button>

                                <button
                                    className="btn-edit"
                                    onClick={() => {
                                    setSelectedItem(item);
                                    setForm({
                                        nama: item.nama,
                                        deskripsi: item.deskripsi,
                                        foto: null,
                                    });
                                    setShowEditModal(true);
                                    }}
                                >
                                    Edit
                                </button>

                                {role === "owner" && (
                                    <button
                                    className="btn-delete"
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setShowDeleteModal(true);
                                    }}
                                    >
                                    Hapus
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

            </div>

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

        {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Tambah Kebudayaan</h2>
                        <FiX className="modal-close" onClick={() => setShowAddModal(false)} />
                    </div>

                    <div className="modal-body column">
                        <input type="text" placeholder="Nama kebudayaan"
                            value={form.nama}
                            onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        />

                        <textarea placeholder="Deskripsi kebudayaan"
                            value={form.deskripsi}
                            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                        />

                        <input type="file"
                            onChange={(e) => setForm({ ...form, foto: e.target.files[0] })}
                        />

                        <button className="btn-primary" onClick={handleAdd}>Simpan</button>
                    </div>
                </div>
            </div>
        )}

        {showDetailModal && selectedItem && (
            <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                <div className="modal"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h2>Detail Kebudayaan</h2>

                        <FiX className="modal-close"
                            onClick={() => setShowDetailModal(false)}
                        />
                    </div>

                    <div className="modal-body">
                        <img className="modal-image"
                            src={`${BASE_URL}/storage/${selectedItem.foto}`}
                        />

                        <div>
                            <h3>{selectedItem.nama}</h3>
                            <p>{selectedItem.deskripsi}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {showEditModal && selectedItem && (
            <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Edit Kebudayaan</h2>
                        <FiX className="modal-close" onClick={() => setShowEditModal(false)} />
                    </div>

                    <div className="modal-body column">
                        <input type="text"
                            value={form.nama}
                            onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        />

                        <textarea
                            value={form.deskripsi}
                            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                        />

                        <input type="file"
                            onChange={(e) => setForm({ ...form, foto: e.target.files[0] })}
                        />

                        <button className="btn-primary" onClick={handleEdit}>Update</button>
                    </div>
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
                        Hapus Kebudayaan
                    </h3>

                    <p className="modal-message">
                        Apakah Anda yakin ingin menghapus{" "}
                        <b>{selectedItem.nama}</b>?
                        <br />
                        Data yang dihapus tidak dapat dikembalikan.
                    </p>

                    <div className="modal-actions">
                        <button
                            className="btn-danger"
                            onClick={handleDelete}
                        >
                            Hapus
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

export default AdminKebudayaan;