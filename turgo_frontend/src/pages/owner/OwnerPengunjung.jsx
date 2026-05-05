import { useEffect, useState, useMemo } from "react";
import { BASE_URL } from "../../utils/baseUrl";
import { FiSearch, FiUserPlus, FiEye, FiX, FiEdit, FiTrash2 } from "react-icons/fi";
import "../adminDanOwner/css/AdminShared.css";
import "../adminDanOwner/css/Modal.css";
import { getAllPengunjung, updatePengunjung, deleteUser } from "../../api/apiUser";
import { GetUserData, registerByOwner } from "../../api/apiAuth";

const OwnerPengunjung = () => {

  const defaultForm = {
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    nama_lengkap: "",
    nomor_telepon: "",
    foto_profil: null
  };

  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState("");
  const [statusFilter,setStatusFilter] = useState("semua");
  const [showModal,setShowModal] = useState(false);
  const [showEditModal,setShowEditModal] = useState(false);
  const [showDetailModal,setShowDetailModal] = useState(false);
  const [showDeleteModal,setShowDeleteModal] = useState(false);
  const [selectedItem,setSelectedItem] = useState(null);
  const [form,setForm] = useState(defaultForm);
  const [role, setRole] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
      loadUser();
      fetchData();
  }, []);

    useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const loadUser = async () => {
      try {
          const res = await GetUserData();
          setRole(res.role);
      } catch (err) {
          console.error("Gagal ambil user:", err);
      }
  };

  const fetchData = async ()=>{
    try{
      const res = await getAllPengunjung();
      setData(res.data);
    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  const filteredData = useMemo(()=>{

    let result = [...data];

    if(statusFilter === "aktif")
      result = result.filter(d=>d.is_aktif === 1);

    if(statusFilter === "nonaktif")
      result = result.filter(d=>d.is_aktif === 0);

    if(search)
      result = result.filter(d =>
        d.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
        d.username.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase())
      );

    return result;

  },[data,search,statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const toggleStatus = async(item)=>{
    try{

      const formData = new FormData();
      formData.append(
        "is_aktif",
        item.is_aktif === 1 ? 0 : 1
      );

      await updatePengunjung(item.id,formData);

      setData(prev =>
        prev.map(d =>
          d.id === item.id
            ? {...d,is_aktif:d.is_aktif === 1 ? 0 : 1}
            : d
        )
      );

    }catch(err){
      console.error(err);
    }
  };

  const handleSubmit = async()=>{

    try{

      const formData = new FormData();

      Object.keys(form).forEach(key=>{
        if(form[key] !== null)
          formData.append(key,form[key]);
      });

      await registerByOwner(formData);

      setShowModal(false);
      setForm(defaultForm);

      fetchData();

    }catch(err){
      console.error(err);
      alert(err.message || "Gagal membuat user");
    }

  };

  const handleEdit = async () => {
    try {

      const formData = new FormData();

      Object.keys(form).forEach(key => {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      await updatePengunjung(selectedItem.id, formData);

      setShowEditModal(false);
      setForm(defaultForm);
      setSelectedItem(null);

      fetchData();

    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(selectedItem.id);

      setShowDeleteModal(false);
      setSelectedItem(null);

      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if(loading) return <div>Loading...</div>;

  return(
    <>

      <div className="admin-page">
        <div className="admin-header">

          <h1>Pengunjung Turgo</h1>

          <div className="admin-header-actions">

            <button
              className="btn-primary"
              onClick={()=>{
                setForm(defaultForm);
                setShowModal(true);
              }}
            >
              <FiUserPlus/> Tambah
            </button>

            <div className="admin-search-wrapper">
              <FiSearch/>
              <input
                type="text"
                placeholder="Cari pengunjung..."
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="admin-filter-group">

          <button
            className={statusFilter==="semua"?"active":""}
            onClick={()=>setStatusFilter("semua")}
          >
            Semua
          </button>

          <button
            className={statusFilter==="aktif"?"active":""}
            onClick={()=>setStatusFilter("aktif")}
          >
            Aktif
          </button>

          <button
            className={statusFilter==="nonaktif"?"active":""}
            onClick={()=>setStatusFilter("nonaktif")}
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
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>

              {paginatedData.map(item=>(
                <tr key={item.id}>

                  <td>{item.id}</td>
                  <td>{item.nama_lengkap}</td>
                  <td>{item.username}</td>
                  <td>{item.email}</td>
                  <td>{item.role.name}</td>

                  <td>
                    <div className="status-switch">
                        <label className="switch">
                        <input
                            type="checkbox"
                            checked={item.is_aktif === 1}
                            onChange={() => toggleStatus(item)}
                        />
                        <span className="slider"></span>
                        </label>
                    </div>
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
                          nama_lengkap: item.nama_lengkap || "",
                          username: item.username || "",
                          email: item.email || "",
                          nomor_telepon: item.nomor_telepon || "",
                          foto_profil: null
                        });

                        setShowEditModal(true);

                      }}
                    >
                      <FiEdit/>
                    </button>

                    {role === "owner" && (
                      <button
                        className="btn-icon danger"
                        onClick={()=>{
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

      {showModal &&(
        <div className="modal-overlay">
          <div className="modal">

            <div className="modal-header">
              <h2>Tambah Pengunjung</h2>
              <FiX className="modal-close" onClick={() => setShowModal(false)}/>
            </div>

            <div className="form-group">
                <label>Role</label>

                <input
                  type="text"
                  value="pengunjung"
                  disabled
                >
                </input>

            </div>

            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                value={form.nama_lengkap}
                onChange={(e)=>setForm({...form,nama_lengkap:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e)=>setForm({...form,username:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e)=>setForm({...form,email:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e)=>setForm({...form,password:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Konfirmasi Password</label>
              <input
                type="password"
                value={form.password_confirmation}
                onChange={(e)=>setForm({...form,password_confirmation:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Nomor Telepon</label>
              <input
                type="text"
                value={form.nomor_telepon}
                onChange={(e)=>setForm({...form,nomor_telepon:e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Foto Profil</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e)=>setForm({...form,foto_profil:e.target.files[0]})}
              />
            </div>
           
            <div className="modal-actions">

              <button
                className="btn-primary"
                onClick={handleSubmit}
              >
                Simpan
              </button>

              <button
                className="btn-secondary"
                onClick={()=>setShowModal(false)}
              >
                Batal
              </button>

            </div>
          </div>
        </div>

      )}

      {showDetailModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-data">

            <div className="modal-header">
              <h2>Detail Pengunjung</h2>
              <FiX className="modal-close" onClick={() => setShowDetailModal(false)}/>
            </div>

            <div className="modal-data-body">

              <img
                className="modal-data-image"
                src={
                  selectedItem.foto_profil
                    ? `${BASE_URL}/storage/${selectedItem.foto_profil}`
                    : "/default-profile.png"
                }
              />

              <div className="modal-data-info">

                <h3 className="modal-data-title">
                  {selectedItem.nama_lengkap}
                </h3>

                <div className="modal-data-grid">

                  <div className="modal-data-row">
                    <span className="modal-data-label">Username: </span>
                    <span>{selectedItem.username}</span>
                  </div>

                  <div className="modal-data-row">
                    <span className="modal-data-label">Email: </span>
                    <span>{selectedItem.email}</span>
                  </div>

                  <div className="modal-data-row">
                    <span className="modal-data-label">Nomor Telepon: </span>
                    <span>{selectedItem.nomor_telepon || "-"}</span>
                  </div>

                  <div className="modal-data-row">
                    <span className="modal-data-label">Role: </span>
                    <span>{selectedItem.role?.name}</span>
                  </div>

                  <div className="modal-data-row">
                    <span className="modal-data-label">Status: </span>
                    <span
                      className={`modal-data-status ${
                        selectedItem.is_aktif ? "aktif" : "nonaktif"
                      }`}
                    >
                      {selectedItem.is_aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-data">

            <div className="modal-header">
              <h2>Edit Admin</h2>
              <FiX className="modal-close" onClick={()=>setShowEditModal(false)}/>
            </div>

            <div className="modal-data-body">

              <img
                className="modal-data-image"
                src={
                  selectedItem.foto_profil
                  ? `${BASE_URL}/storage/${selectedItem.foto_profil}`
                  : "/default-profile.png"
                }
              />

              <div className="modal-data-info">

                <div className="modal-data-grid">

                  <div className="modal-data-row">
                    <span className="modal-data-label">Nama Lengkap</span>
                    <input
                      type="text"
                      value={form.nama_lengkap}
                      onChange={(e)=>setForm({...form,nama_lengkap:e.target.value})}
                    />
                  </div>

                  <div className="modal-data-row">
                    <span className="modal-data-label">Username</span>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e)=>setForm({...form,username:e.target.value})}
                    />
                  </div>

                  <div className="modal-data-row">
                    <span className="modal-data-label">Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e)=>setForm({...form,email:e.target.value})}
                    />
                  </div>

                  <div className="modal-data-row">
                    <span className="modal-data-label">Nomor Telepon</span>
                    <input
                      type="text"
                      value={form.nomor_telepon}
                      onChange={(e)=>setForm({...form,nomor_telepon:e.target.value})}
                    />
                  </div>

                  <div className="modal-data-row">
                      <span className="modal-data-label">Role</span>
                      <input
                          type="text"
                          value={selectedItem.role?.name}
                          disabled
                      />
                  </div>

                  <div className="modal-data-row">
                    <span className="modal-data-label">Foto Profil</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e)=>setForm({...form,foto_profil:e.target.files[0]})}
                    />
                  </div>

                </div>

                <div className="modal-actions">

                  <button
                    className="btn-primary"
                    onClick={handleEdit}
                  >
                    Simpan
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={()=>setShowEditModal(false)}
                  >
                    Batal
                  </button>

                </div>

              </div>

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
              Hapus Pengunjung
            </h3>

            <p className="modal-message">
              Apakah Anda yakin ingin menghapus{" "}
              <b>{selectedItem.nama_lengkap}</b>?
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
                onClick={()=>setShowDeleteModal(false)}
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

export default OwnerPengunjung;