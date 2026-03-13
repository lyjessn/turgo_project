import { useEffect, useState, useMemo } from "react";
import { FiSearch, FiEdit, FiEye, FiTrash2, FiX } from "react-icons/fi";

import "./css/AdminShared.css";
import "./css/AdminPaketWisata.css";
import "./css/Modal.css"

import {
  getAllPelakuWisata,
  createPelakuWisata,
  updatePelakuWisata,
  deletePelakuWisata,
  togglePelakuWisata,
  getAllUsersPelakuWisata
} from "../../api/apiPelakuWisata";

import { GetUserData } from "../../api/apiAuth";

const AdminPelakuWisata = () => {
    const [data,setData] = useState([]);
    const [loading,setLoading] = useState(true);
    const [search,setSearch] = useState("");
    const [filter,setFilter] = useState("semua");
    const [showAddModal,setShowAddModal] = useState(false);
    const [showEditModal,setShowEditModal] = useState(false);
    const [showDetailModal,setShowDetailModal] = useState(false);
    const [selectedItem,setSelectedItem] = useState(null);
    const [role,setRole] = useState(null);
    const [userList, setUserList] = useState([]);

    const defaultForm = {
        user_id: "",
        nama_usaha: "",
        deskripsi: "",
        lokasi: "",
        nomor_telepon: "",
        foto_profil: null
    };

    const [form,setForm] = useState(defaultForm);

    useEffect(()=>{
        loadUser();
        fetchData();
    },[]);

    const loadUser = async ()=>{
        try{
        const res = await GetUserData();
        setRole(res.role);
        }catch(err){
        console.error(err);
        }
    };

    const fetchData = async()=>{
        try{
            const res = await getAllPelakuWisata();
            setData(res.data);
        } catch (err) {
            console.error(err);
        }finally{
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await getAllUsersPelakuWisata();
            setUserList(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredData = useMemo(()=>{

        let result = [...data];

        if(filter==="aktif")
        result = result.filter(d=>d.is_aktif===1);

        if(filter==="nonaktif")
        result = result.filter(d=>d.is_aktif===0);

        if(search)
        result = result.filter(d =>
            d.nama_usaha?.toLowerCase()
            .includes(search.toLowerCase())
        );

        return result;

    },[data,filter,search]);


    const toggleStatus = async(item)=>{
        try{

        await togglePelakuWisata(item.id);

        setData(prev =>
            prev.map(d =>
            d.id===item.id
                ? {...d,is_aktif:d.is_aktif===1?0:1}
                : d
            )
        );

        }catch(err){
        console.error(err);
        }
    };


    const handleAdd = async()=>{
        try{
            const formData = new FormData();
            Object.keys(form).forEach(key=>{
                if(form[key] !== null && form[key] !== "")
                formData.append(key,form[key]);
            });

            await createPelakuWisata(formData);
            setShowAddModal(false);
            setForm(defaultForm);
            fetchData();

        } catch(err) {
            console.error(err);
        }
    };


    const handleEdit = async()=>{
        try{
            const formData = new FormData();
            Object.keys(form).forEach(key=>{
                if(form[key])
                formData.append(key,form[key]);
            });

            await updatePelakuWisata(selectedItem.id,formData);

            setShowEditModal(false);
            setForm(defaultForm);
            setSelectedItem(null);

            fetchData();
        } catch (err) {
            console.error(err);
        }
    };


    const handleDelete = async(id)=>{
        if(!window.confirm("Hapus pelaku wisata ini?")) return;

        try{
            await deletePelakuWisata(id);
            setData(prev =>
                prev.filter(item=>item.id!==id)
            );
        } catch (err) {
            console.error(err);
        }
    };


    if(loading) return <div>Loading...</div>;


  return (
  <>

    <div className="admin-page">
      <div className="admin-header">
        <h1>Pelaku Wisata</h1>

        <div className="admin-header-actions">

          <button
            className="btn-primary"
            onClick={()=>{
              setForm(defaultForm);
              fetchUsers();
              setShowAddModal(true);
            }}
          >
            + Tambah
          </button>

          <div className="admin-search-wrapper">

            <FiSearch/>

            <input
              type="text"
              placeholder="Cari usaha"
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
              <th>Nama Usaha</th>
              <th>Lokasi</th>
              <th>Telepon</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>

            {filteredData.map(item=>(
              <tr key={item.id}>

                <td>{item.id}</td>
                <td>{item.nama_usaha}</td>
                <td>{item.lokasi}</td>
                <td>{item.nomor_telepon}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={item.is_aktif===1}
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
                        user_id:item.user_id,
                        nama_usaha:item.nama_usaha,
                        deskripsi:item.deskripsi || "",
                        lokasi:item.lokasi,
                        nomor_telepon:item.nomor_telepon,
                        foto_profil:null
                      });

                      setShowEditModal(true);

                    }}
                  >
                    <FiEdit/>
                  </button>

                  {role==="owner" && (

                    <button
                      className="btn-icon danger"
                      onClick={()=>handleDelete(item.id)}
                    >
                      <FiTrash2/>
                    </button>

                  )}
                </td>

              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>

    {showDetailModal && selectedItem && (
       <div className="modal-overlay">
            <div className="modal-data">
                <div className="modal-header">
                    <h2>Detail Pelaku Wisata</h2>
                    <FiX className="modal-close" onClick={() => setShowDetailModal(false)}/>
                </div>

                <div className="modal-data-body">
                    <img
                        className="modal-data-image"
                        src={`http://127.0.0.1:8000/storage/${selectedItem.foto_profil}`}
                    />

                    <div className="modal-data-info">
                        <h3 className="modal-data-title">{selectedItem.nama_usaha}</h3>
                        <div className="modal-data-grid">
                            <div className="modal-data-row">
                                <span className="modal-data-label">Nama Pemilik: </span>
                                <span>{selectedItem.user?.nama_lengkap}</span>
                            </div>

                            <div className="modal-data-row">
                                <span className="modal-data-label">Deskripsi: </span>
                                <span>{selectedItem.deskripsi}</span>
                            </div>

                            <div className="modal-data-row">
                                <span className="modal-data-label">Lokasi: </span>
                                <span>{selectedItem.lokasi}</span>
                            </div>

                            <div className="modal-data-row">
                                <span className="modal-data-label">Nomor Telepon: </span>
                                <span>{selectedItem.nomor_telepon}</span>
                            </div>

                            <div className="modal-data-row">
                                <span className="modal-data-label">Status: </span>
                                <span className={`modal-data-status ${selectedItem.is_aktif ? "aktif" : "nonaktif"}`}>
                                {selectedItem.is_aktif ? "Aktif" : "Nonaktif"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )}

    {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Tambah Pelaku Wisata</h2>
                    <FiX className="modal-close" onClick={() => setShowAddModal(false)} />
                </div>

                <div className="modal-body column">

                    <div className="form-group">
                        <label>Pilih User</label>
                        <select
                            value={form.user_id}
                            onChange={(e) =>
                                setForm({ ...form, user_id: e.target.value })
                            }
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
                        <label>Nama Usaha</label>
                        <input
                            type="text"
                            placeholder="Nama Usaha"
                            value={form.nama_usaha}
                            onChange={(e) =>
                                setForm({ ...form, nama_usaha: e.target.value })
                            }
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Deskripsi Usaha</label>
                        <textarea
                            placeholder="Deskripsi"
                            value={form.deskripsi}
                            onChange={(e) =>
                                setForm({ ...form, deskripsi: e.target.value })
                            }
                        /> 
                    </div>
                    
                    <div className="form-group">
                        <label>Lokasi Usaha</label>
                        <input
                            type="text"
                            placeholder="Lokasi"
                            value={form.lokasi}
                            onChange={(e) =>
                                setForm({ ...form, lokasi: e.target.value })
                            }
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Nomor Telepon</label>
                        <input
                            type="text"
                            placeholder="Nomor Telepon"
                            value={form.nomor_telepon}
                            onChange={(e) =>
                                setForm({ ...form, nomor_telepon: e.target.value })
                            }
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Foto Usaha</label>
                        <input
                            type="file"
                            onChange={(e) =>
                                setForm({ ...form, foto_profil: e.target.files[0] })
                            }
                        />
                    </div>
                    
                    <button className="btn-primary" onClick={handleAdd}> Simpan</button>
                </div>
            </div>
        </div>
    )}

    {showEditModal && selectedItem && (
        <div className="modal-overlay">
            <div className="modal-data">

                <div className="modal-header">
                    <h2>Edit Pelaku Wisata</h2>
                    <FiX
                    className="modal-close"
                    onClick={() => setShowEditModal(false)}
                    />
                </div>

                <div className="modal-data-body">

                    <img
                    className="modal-data-image"
                    src={
                        form.foto_profil
                        ? URL.createObjectURL(form.foto_profil)
                        : selectedItem.foto_profil
                            ? `http://127.0.0.1:8000/storage/${selectedItem.foto_profil}`
                            : "/default-image.png"
                    }
                    />

                    <div className="modal-data-info">
                        <div className="modal-data-grid">

                            <div className="modal-data-row">
                                <span className="modal-data-label">User</span>
                                <input
                                    type="text"
                                    value={selectedItem.user?.nama_lengkap}
                                    disabled
                                />
                            </div>

                            <div className="modal-data-row">
                                <span className="modal-data-label">Nama Usaha</span>
                                <input
                                    type="text"
                                    value={form.nama_usaha}
                                    onChange={(e)=>
                                    setForm({...form, nama_usaha:e.target.value})
                                    }
                                />
                            </div>

                            <div className="modal-data-row">
                                <span className="modal-data-label">Deskripsi Usaha</span>
                                <textarea
                                    value={form.deskripsi}
                                    onChange={(e)=>
                                    setForm({...form, deskripsi:e.target.value})
                                    }
                                />
                            </div>

                            <div className="modal-data-row">
                                <span className="modal-data-label">Lokasi Usaha</span>
                                <input
                                    type="text"
                                    value={form.lokasi}
                                    onChange={(e)=>
                                    setForm({...form, lokasi:e.target.value})
                                    }
                                />
                            </div>

                            <div className="modal-data-row">
                                <span className="modal-data-label">Nomor Telepon</span>
                                <input
                                    type="text"
                                    value={form.nomor_telepon}
                                    onChange={(e)=>
                                    setForm({...form, nomor_telepon:e.target.value})
                                    }
                                />
                            </div>

                            <div className="modal-data-row">
                                <span className="modal-data-label">Foto Usaha</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e)=>
                                    setForm({...form, foto_profil:e.target.files[0]})
                                    }
                                />
                            </div>

                        </div>

                        <div className="modal-actions">
                            <button className="btn-primary" onClick={handleEdit}>
                            Update
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

    </>
  );

};

export default AdminPelakuWisata;