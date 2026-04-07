import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Register as RegisterApi } from "../../api/apiAuth";
import heroImage from "../../assets/iconTurgo.jpg";
import "../../auth/auth.css";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    username: "",
    email: "",
    nama_lengkap: "",
    nomor_telepon: "",
    password: "",
    password_confirmation: "",
  });

  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fotoProfil, setFotoProfil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const errorRef = useRef(null);

  const [modal, setModal] = useState({
    show: false,
    type: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => {
      const newErrors = { ...prev };

      if (name === "email") {
        if (!value.trim()) newErrors.email = "Email wajib diisi";
        else delete newErrors.email;
      }

      if (name === "username") {
        if (!value.trim()) newErrors.username = "Username wajib diisi";
        else delete newErrors.username;
      }

      if (name === "nama_lengkap") {
        if (!value.trim()) newErrors.nama_lengkap = "Nama lengkap wajib diisi";
        else delete newErrors.nama_lengkap;
      }

      if (name === "nomor_telepon") {
        if (!value) {
          delete newErrors.nomor_telepon;
        } else if (!/^[0-9]+$/.test(value)) {
          newErrors.nomor_telepon = "Nomor telepon harus berupa angka";
        } else if (value.length < 10) {
          newErrors.nomor_telepon = "Nomor telepon minimal 10 digit";
        } else {
          delete newErrors.nomor_telepon;
        }
      }

      if (name === "password") {
        if (!value) newErrors.password = "Password wajib diisi";
        else if (value.length < 8) newErrors.password = "Password minimal 8 karakter";
        else delete newErrors.password;
      }

      if (name === "password_confirmation") {
        if (!value) newErrors.password_confirmation = "Konfirmasi password wajib diisi";
        else if (value !== form.password) newErrors.password_confirmation = "Password tidak sama";
        else delete newErrors.password_confirmation;
      }

      newErrors.general = null;

      return newErrors;
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const translateMessage = (msg) => {
    if (!msg) return msg;

    const m = msg.toLowerCase();

    if (m.includes("the email has already been taken")) return "Email sudah terdaftar";
    if (m.includes("the username has already been taken")) return "Username sudah terdaftar";
    if (m.includes("password confirmation does not match")) return "Konfirmasi password tidak cocok";
    if (m.includes("password must be at least")) return "Password minimal 8 karakter";

    return msg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setErrors({});

    setTouched({
      username: true,
      email: true,
      nama_lengkap: true,
      nomor_telepon: true,
      password: true,
      password_confirmation: true,
      foto_profil: true,
    });

    const newErrors = {};

    if (!form.username.trim()) newErrors.username = "Username wajib diisi";
    if (!form.email.trim()) newErrors.email = "Email wajib diisi";
    if (!form.nama_lengkap.trim()) newErrors.nama_lengkap = "Nama lengkap wajib diisi";
    if (form.nomor_telepon) {
      if (!/^[0-9]+$/.test(form.nomor_telepon)) {
        newErrors.nomor_telepon = "Nomor telepon harus berupa angka";
      } else if (form.nomor_telepon.length < 10) {
        newErrors.nomor_telepon = "Nomor telepon minimal 10 digit";
      }
    }
    if (!form.password) newErrors.password = "Password wajib diisi";
    if (!form.password_confirmation) newErrors.password_confirmation = "Konfirmasi password wajib diisi";

    if (form.password && form.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }

    if (
      form.password &&
      form.password_confirmation &&
      form.password !== form.password_confirmation
    ) {
      newErrors.password_confirmation = "Password tidak sama";
    }

    if (fotoProfil) {
      if (!fotoProfil.type.startsWith("image/")) {
        newErrors.foto_profil = "File harus berupa gambar";
      }

      if (fotoProfil.size > 2 * 1024 * 1024) {
        newErrors.foto_profil = "Ukuran gambar maksimal 2MB";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      if (fotoProfil) {
        formData.append("foto_profil", fotoProfil);
      }

      await RegisterApi(formData);

      setModal({
        show: true,
        type: "success",
        message: "Registrasi berhasil. Silakan login."
      });

    } catch (err) {
      console.log("RAW MESSAGE:", err.response?.data);
      console.log("ERROR FULL:", err);

      let newErrors = {};

      if (err.response?.data?.errors) {
        Object.keys(err.response.data.errors).forEach((key) => {
          newErrors[key] = Array.isArray(err.response.data.errors[key])
            ? translateMessage(err.response.data.errors[key][0])
            : translateMessage(err.response.data.errors[key]);
        });

      } else if (err.response?.data?.message) {
        newErrors.general = translateMessage(err.response.data.message);

      } else if (err.message) {
        newErrors.general = err.message;

      } else {
        newErrors.general = "Registrasi gagal.";
      }

      setErrors(newErrors);

      setTimeout(() => {
        errorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-wrapper">
        <div className="auth-card">

          <div
            className="auth-image"
          >
            <img src={heroImage} alt="auth" />
            <div className="auth-image-caption">
              <p className="title">
                Mulai perjalanan Anda
                <br />
                bersama pengalaman lokal terbaik
              </p>
              <p className="subtitle">
                Satu akun untuk menjelajah dan terhubung.
              </p>
            </div>
          </div>

          <div className="auth-form">
            <h2 className="auth-title">Daftar Akun</h2>

            <p className="auth-caption">
              Lengkapi data berikut untuk membuat akun baru.
            </p>

            {errors.general && (
              <p ref={errorRef} className="auth-error">{errors.general}</p>
            )}

            <form onSubmit={handleSubmit} noValidate>

              <div className="auth-group">
                <label>Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.username && errors.username && (
                  <p className="auth-error">{errors.username}</p>
                )}
              </div>

              <div className="auth-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.email && errors.email && (
                  <p className="auth-error">{errors.email}</p>
                )}
              </div>

              <div className="auth-group">
                <label>Nama Lengkap</label>
                <input
                  name="nama_lengkap"
                  value={form.nama_lengkap}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.nama_lengkap && errors.nama_lengkap && (
                  <p className="auth-error">{errors.nama_lengkap}</p>
                )}
              </div>

              <div className="auth-group">
                <label>Nomor Telepon</label>
                <input
                  name="nomor_telepon"
                  value={form.nomor_telepon}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="numeric"
                />
                {touched.nomor_telepon && errors.nomor_telepon && (
                  <p className="auth-error">{errors.nomor_telepon}</p>
                )}
              </div>

              <div className="auth-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>
                {touched.password && errors.password && (
                  <p className="auth-error">{errors.password}</p>
                )}
              </div>

              <div className="auth-group">
                <label>Konfirmasi Password</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <span
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </span>
                </div>
                {touched.password_confirmation && errors.password_confirmation && (
                  <p className="auth-error">{errors.password_confirmation}</p>
                )}
              </div>

              <div className="auth-group">
                <label>Foto Profil (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFotoProfil(e.target.files[0])}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, foto_profil: true }))
                  }
                />
                {touched.foto_profil && errors.foto_profil && (
                  <p className="auth-error">{errors.foto_profil}</p>
                )}
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={
                  loading ||
                  !form.username ||
                  !form.email ||
                  !form.nama_lengkap ||
                  !form.password ||
                  !form.password_confirmation
                }
              >
                {loading ? "Mendaftar..." : "Daftar"}
              </button>

            </form>

            <p className="auth-register">
              Sudah punya akun?{" "}
              <span
                onClick={() =>
                  navigate("/login", {
                    state: location.state,
                    replace: true,
                  })
                }
              >
                Login
              </span>
            </p>
          </div>
        </div>
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
              {modal.type === "success" && "Registrasi Berhasil"}
              {modal.type === "error" && "Terjadi Kesalahan"}
            </h3>

            <p className="modal-message">{modal.message}</p>

            <button
              className="modal-button"
              onClick={() => {
                setModal({ ...modal, show: false });

                if (modal.type === "success") {
                  navigate("/login", {
                    state: location.state,
                    replace: true
                  });
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

export default Register;