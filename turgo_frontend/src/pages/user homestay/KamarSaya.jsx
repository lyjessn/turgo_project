import { useEffect, useState, useMemo } from "react";
import { FiSearch, FiX, FiWifi, FiHome } from "react-icons/fi";
import { FaBed, FaBath } from "react-icons/fa";
import "./css/KamarSaya.css";
import "../adminDanOwner/css/AdminShared.css";
import { getMyKamars, createKamar, updateKamar } from "../../api/apiKamar";


const KamarSaya = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    harga_per_malam: "",
    wifi: "",
    jumlah_kasur: "",
    deskripsi_kasur: "",
    jumlah_toilet: "",
    deskripsi_toilet: "",
    foto: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getMyKamars();
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (item) => {
    const formData = new FormData();

    formData.append(
        "is_aktif",
        item.is_aktif === 1 ? 0 : 1
    );

    await updateKamar(item.id, formData);

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

  const handleAdd = async () => {

    try {

      const formData = new FormData();

      Object.keys(form).forEach(key => {
        if (form[key]) {
          formData.append(key, form[key]);
        }
      });

      await createKamar(formData);

      setShowAddModal(false);

      setForm({
        nama: "",
        harga_per_malam: "",
        wifi: "",
        jumlah_kasur: "",
        deskripsi_kasur: "",
        jumlah_toilet: "",
        deskripsi_toilet: "",
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

      Object.keys(form).forEach(key => {
        if (form[key]) {
          formData.append(key, form[key]);
        }
      });

      await updateKamar(selectedItem.id, formData);

      setShowEditModal(false);
      setSelectedItem(null);

      fetchData();

    } catch (err) {
      console.error(err);
    }
  };

//   const handleDelete = async (id) => {

//     if (!window.confirm("Hapus kamar ini?")) return;

//     try {

//       await deleteKamar(id);

//       setData(prev => prev.filter(item => item.id !== id));

//     } catch (err) {
//       console.error(err);
//     }
//   };

  if (loading) return <div className="kamar-loading">Loading...</div>;

  return (

    <>
        <div className="kamar-page">
            <div className="kamar-header">
                <h1>Kamar Saya</h1>

                <div className="kamar-actions">

                    <button
                        className="kamar-btn-primary"
                        onClick={() => {
                            setForm({
                                nama: "",
                                harga_per_malam: "",
                                wifi: "",
                                jumlah_kasur: "",
                                deskripsi_kasur: "",
                                jumlah_toilet: "",
                                deskripsi_toilet: "",
                                foto: null
                            });
                            setShowAddModal(true);
                        }}
                    >
                    + Tambah
                    </button>

                    <div className="kamar-search">

                    <FiSearch />

                    <input
                        type="text"
                        placeholder="Cari kamar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    </div>
                </div>
            </div>

            <div className="kamar-filter">
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

            <div className="kamar-list">

                {filteredData.length === 0 && (
                    <div className="kamar-empty">
                    Tidak ada kamar
                    </div>
                )}

                {filteredData.map(item => (
                    <div key={item.id} className="kamar-card">
                        <div className="kamar-image">
                            <img src={`http://127.0.0.1:8000/storage/${item.foto}`}/>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={item.is_aktif === 1}
                                    onChange={() => toggleStatus(item)}
                                />

                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="kamar-content">
                            <h3>{item.nama}</h3>
                            <p className="kamar-price"> Rp {Number(item.harga_per_malam).toLocaleString()} / malam</p>
                            <div className="kamar-fasilitas">
                                <div className="kamar-item">
                                    <FaBed />
                                    <span>{item.jumlah_kasur} kasur</span>
                                </div>

                                <div className="kamar-item">
                                    <FaBath />
                                    <span>{item.jumlah_toilet} kamar mandi</span>
                                </div>

                                <div className="kamar-item">
                                    <FiWifi />
                                    <span>{item.wifi || "Tidak ada wifi"}</span>
                                </div>
                            </div>

                            {(item.deskripsi_kasur || item.deskripsi_toilet) && (
                                <div className="kamar-deskripsi">
                                    {item.deskripsi_kasur && (
                                    <p>
                                        <b>Kasur:</b> {item.deskripsi_kasur}
                                    </p>
                                    )}
                                    {item.deskripsi_toilet && (
                                    <p>
                                        <b>Toilet:</b> {item.deskripsi_toilet}
                                    </p>
                                    )}
                                </div>
                            )}

                            <div className="kamar-card-actions">

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
                                        harga_per_malam: item.harga_per_malam,
                                        wifi: item.wifi,
                                        jumlah_kasur: item.jumlah_kasur,
                                        deskripsi_kasur: item.deskripsi_kasur,
                                        jumlah_toilet: item.jumlah_toilet,
                                        deskripsi_toilet: item.deskripsi_toilet,
                                        foto: null
                                    });

                                    setShowEditModal(true);

                                    }}
                                >
                                    Edit
                                </button>

                                {/* <button
                                    className="btn-delete"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    Hapus
                                </button> */}

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {showDetailModal && selectedItem && (
            <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>

                <div className="modal" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                    <h2>Detail Kamar</h2>
                    <FiX className="modal-close" onClick={() => setShowDetailModal(false)} />
                </div>

                <div className="modal-body">

                    <img
                    className="modal-image"
                    src={`http://127.0.0.1:8000/storage/${selectedItem.foto}`}
                    />

                    <div>

                    <h3>{selectedItem.nama}</h3>

                    <p> Rp {Number(selectedItem.harga_per_malam).toLocaleString()} / malam</p>

                    <p>{selectedItem.jumlah_kasur} kasur</p>

                    <p>
                        {selectedItem.deskripsi_kasur}
                    </p>

                    <p>
                        {selectedItem.jumlah_toilet} toilet
                    </p>

                    <p>
                        {selectedItem.deskripsi_toilet}
                    </p>

                    <p>
                        Wifi: {selectedItem.wifi || "-"}
                    </p>

                    </div>

                </div>

                </div>

            </div>
            )}

        {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>

                    <div className="modal-header">
                        <h2>Tambah Kamar</h2>
                        <FiX className="modal-close" onClick={() => setShowAddModal(false)} />
                    </div>

                    <div className="modal-body column">

                        <input
                        type="text"
                        placeholder="Nama kamar"
                        value={form.nama}
                        onChange={(e)=>setForm({...form,nama:e.target.value})}
                        />

                        <input
                        type="number"
                        placeholder="Harga per malam"
                        value={form.harga_per_malam}
                        onChange={(e)=>setForm({...form,harga_per_malam:e.target.value})}
                        />

                        <input
                        type="text"
                        placeholder="Wifi"
                        value={form.wifi}
                        onChange={(e)=>setForm({...form,wifi:e.target.value})}
                        />

                        <input
                        type="number"
                        placeholder="Jumlah kasur"
                        value={form.jumlah_kasur}
                        onChange={(e)=>setForm({...form,jumlah_kasur:e.target.value})}
                        />

                        <textarea
                        placeholder="Deskripsi kasur"
                        value={form.deskripsi_kasur}
                        onChange={(e)=>setForm({...form,deskripsi_kasur:e.target.value})}
                        />

                        <input
                        type="number"
                        placeholder="Jumlah toilet"
                        value={form.jumlah_toilet}
                        onChange={(e)=>setForm({...form,jumlah_toilet:e.target.value})}
                        />

                        <textarea
                        placeholder="Deskripsi toilet"
                        value={form.deskripsi_toilet}
                        onChange={(e)=>setForm({...form,deskripsi_toilet:e.target.value})}
                        />

                        <input
                        type="file"
                        onChange={(e)=>setForm({...form,foto:e.target.files[0]})}
                        />

                        <button className="kamar-btn-primary" onClick={handleAdd}>
                        Simpan
                        </button>

                    </div>
                </div>
            </div>
        )}

        {showEditModal && selectedItem && (
            <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>

                    <div className="modal-header">
                        <h2>Edit Kamar</h2>
                        <FiX className="modal-close" onClick={() => setShowEditModal(false)} />
                    </div>

                    <div className="modal-body column">

                        <input
                            type="text"
                            value={form.nama}
                            onChange={(e)=>setForm({...form,nama:e.target.value})}
                        />

                        <input
                            type="number"
                            value={form.harga_per_malam}
                            onChange={(e)=>setForm({...form,harga_per_malam:e.target.value})}
                        />

                        <input
                            type="text"
                            value={form.wifi}
                            onChange={(e)=>setForm({...form,wifi:e.target.value})}
                        />

                        <input
                            type="number"
                            value={form.jumlah_kasur}
                            onChange={(e)=>setForm({...form,jumlah_kasur:e.target.value})}
                        />

                        <textarea
                            value={form.deskripsi_kasur}
                            onChange={(e)=>setForm({...form,deskripsi_kasur:e.target.value})}
                        />

                        <input
                            type="number"
                            value={form.jumlah_toilet}
                            onChange={(e)=>setForm({...form,jumlah_toilet:e.target.value})}
                        />

                        <textarea
                            value={form.deskripsi_toilet}
                            onChange={(e)=>setForm({...form,deskripsi_toilet:e.target.value})}
                        />

                        <input
                            type="file"
                            onChange={(e)=>setForm({...form,foto:e.target.files[0]})}
                        />

                        <button className="kamar-btn-primary" onClick={handleEdit}>
                            Update
                        </button>

                    </div>
                </div>
            </div>
        )}

    </>

  );

};

export default KamarSaya;