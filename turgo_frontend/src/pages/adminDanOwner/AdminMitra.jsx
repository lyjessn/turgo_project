import { useEffect, useState, useMemo } from "react";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import "./css/AdminShared.css";

import { getAllMitra, updateUser } from "../../api/apiUser";
import { registerByAdmin } from "../../api/apiAuth";

const AdminMitra = () => {

  const defaultForm = {
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
    nama_lengkap: "",
    nomor_telepon: "",
    role_id: "",
    foto_profil: null
  };

  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(true);

  const [search,setSearch] = useState("");
  const [roleFilter,setRoleFilter] = useState("semua");
  const [statusFilter,setStatusFilter] = useState("semua");

  const [showModal,setShowModal] = useState(false);
  const [form,setForm] = useState(defaultForm);

  useEffect(()=>{
    fetchData();
  },[]);

  const fetchData = async ()=>{
    try{
      const res = await getAllMitra();
      setData(res.data);
    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  const filteredData = useMemo(()=>{

    let result = [...data];

    if(roleFilter !== "semua")
      result = result.filter(d=>d.role.name === roleFilter);

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

  },[data,search,roleFilter,statusFilter]);

  const toggleStatus = async(item)=>{
    try{

      const formData = new FormData();
      formData.append(
        "is_aktif",
        item.is_aktif === 1 ? 0 : 1
      );

      await updateUser(item.id,formData);

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

      await registerByAdmin(formData);

      setShowModal(false);
      setForm(defaultForm);

      fetchData();

    }catch(err){
      console.error(err);
      alert(err.message || "Gagal membuat user");
    }

  };

  if(loading) return <div>Loading...</div>;

  return(
    <>

      <div className="admin-page">
        <div className="admin-header">

          <h1>Mitra Wisata</h1>

          <div className="admin-header-actions">

            <button
              className="btn-primary"
              onClick={()=>setShowModal(true)}
            >
              <FiUserPlus/> Tambah
            </button>

            <div className="admin-search-wrapper">
              <FiSearch/>
              <input
                type="text"
                placeholder="Cari mitra..."
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="admin-filter-group">

          <button
            className={roleFilter==="semua"?"active":""}
            onClick={()=>setRoleFilter("semua")}
          >
            Semua
          </button>

          <button
            className={roleFilter==="tour guide"?"active":""}
            onClick={()=>setRoleFilter("tour guide")}
          >
            Tour Guide
          </button>

          <button
            className={roleFilter==="homestay"?"active":""}
            onClick={()=>setRoleFilter("homestay")}
          >
            Homestay
          </button>

          <button
            className={roleFilter==="pelaku wisata"?"active":""}
            onClick={()=>setRoleFilter("pelaku wisata")}
          >
            Pelaku Wisata
          </button>

          <button
            className={roleFilter==="umkm"?"active":""}
            onClick={()=>setRoleFilter("umkm")}
          >
            UMKM
          </button>

        </div>

        <div className="admin-filter-group">

          <button
            className={statusFilter==="semua"?"active":""}
            onClick={()=>setStatusFilter("semua")}
          >
            Semua Status
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
                <th>Profil</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {filteredData.map(item=>(
                <tr key={item.id}>

                  <td>{item.id}</td>
                  <td>{item.nama_lengkap}</td>
                  <td>{item.username}</td>
                  <td>{item.email}</td>
                  <td>{item.role.name}</td>

                  <td>
                    <span
                      className={`badge ${
                        item.profile_completed
                          ? "confirmed"
                          : "rejected"
                      }`}
                    >
                      {item.profile_completed
                        ? "Lengkap"
                        : "Belum Lengkap"}
                    </span>
                  </td>

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

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL TAMBAH MITRA */}

      {showModal &&(

        <div className="modal-overlay">
          <div className="modal">

            <h3>Tambah Mitra</h3>

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
              <label>Role</label>

              <select
                value={form.role_id}
                onChange={(e)=>setForm({...form,role_id:e.target.value})}
              >
                <option value="">Pilih Role</option>
                <option value="3">Pelaku Wisata</option>
                <option value="4">Homestay</option>
                <option value="5">Tour Guide</option>
                <option value="6">UMKM</option>
              </select>

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

    </>
  );

};

export default AdminMitra;