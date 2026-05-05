import { useState } from "react";
import { BASE_URL } from "../../utils/baseUrl";
import { useAuth } from "../../auth/useAuth";
import { updateProfile } from "../../api/apiUser";
import "./ProfileCard.css";

const ProfileCard = () => {
  const { user, setUser } = useAuth();
  const [editMode,setEditMode] = useState(false);
  const [modal, setModal] = useState({
        show: false,
        type: "success",
        message: ""
  });

  const [form,setForm] = useState({
    nama_lengkap:user?.nama_lengkap || "",
    email:user?.email || "",
    nomor_telepon:user?.nomor_telepon || "",
    foto_profil:null
  });

  const handleUpdate = async () => {

    try{
      const formData = new FormData();

      Object.keys(form).forEach(key=>{
        if(form[key] !== null)
          formData.append(key,form[key]);
      });

      const res = await updateProfile(formData);
      setUser(res.data);
      setModal({
        show: true,
        type: "success",
        message: "Profil berhasil diperbarui"
      });
      setEditMode(false);
    }catch(err){
      console.error(err);
    }

  };

  return (
    <>
        <div className="profile-card">

            <div className="profile-left">

                {user?.foto_profil ? (
                <img
                    src={`${BASE_URL}/storage/${user.foto_profil}`}
                    className="profile-avatar"
                />
                ) : (
                <div className="avatar-placeholder">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                )}

                <div className="profile-basic">
                    <h3>{user?.nama_lengkap}</h3>
                    <span className="role">{user?.role?.name}</span>
                </div>

            </div>

            <div className="profile-right">

                <div className="profile-row">
                <span>Username</span>
                <p>@{user?.username}</p>
                </div>

                <div className="profile-row">
                <span>Email</span>
                <p>{user?.email}</p>
                </div>

                <div className="profile-row">
                <span>No HP</span>
                <p>{user?.nomor_telepon}</p>
                </div>

                <button
                className="btn-primary"
                onClick={()=>setEditMode(true)}
                >
                Edit Profil
                </button>

            </div>

        </div>


        {editMode &&(

            <div className="modal-overlay">
                <div className="modal">

                    <div className="modal-header">
                        <h3>Edit Profil</h3>
                        <span className="modal-close" onClick={()=>setEditMode(false)}>✕</span>
                    </div>

                    <div className="modal-body">
                        <div className="column">
                            <label>Nama Lengkap</label>
                            <input
                                type="text"
                                value={form.nama_lengkap}
                                onChange={(e)=>setForm({...form,nama_lengkap:e.target.value})}
                            />
                        </div>

                        <div className="column">
                            <label>Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e)=>setForm({...form,email:e.target.value})}
                            />
                        </div>

                        <div className="column">
                            <label>No HP</label>
                            <input
                                type="text"
                                value={form.nomor_telepon}
                                onChange={(e)=>setForm({...form,nomor_telepon:e.target.value})}
                            />
                        </div>

                        <div className="column">
                            <label>Foto Profil</label>
                            <input
                                type="file"
                                onChange={(e)=>setForm({...form,foto_profil:e.target.files[0]})}
                            />
                        </div>

                    </div>

                    <div className="modal-actions">

                        <button
                            className="btn-primary"
                            onClick={handleUpdate}
                        >
                            Simpan
                        </button>

                        <button
                            className="btn-secondary"
                            onClick={()=>setEditMode(false)}
                        >
                            Batal
                        </button>

                    </div>
                </div>
            </div>
        )}

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

                    <h3 className="modal-title">{modal.type === "success" ? "Berhasil" : "Terjadi Kesalahan"}</h3>

                    <p className="modal-message">{modal.message}</p>

                    <button
                        className="modal-button"
                        onClick={() => setModal({ ...modal, show: false })}
                    >
                        OK
                    </button>
                </div>
            </div>
        )}

    </>
  );

};

export default ProfileCard;