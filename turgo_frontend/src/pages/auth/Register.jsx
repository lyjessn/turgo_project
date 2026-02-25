import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Register as RegisterApi } from "../../api/apiAuth";
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fotoProfil, setFotoProfil] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      

      setError("");
      setSuccess("");
      setLoading(true);

      try {
        console.log("FORM STATE:", form);  
        const formData = new FormData();
        Object.keys(form).forEach((key) => {
          formData.append(key, form[key]);
        });

        if (fotoProfil) {
          formData.append("foto_profil", fotoProfil);
        }

        await RegisterApi(formData);

        setSuccess("Registrasi berhasil. Silakan login.");
        setTimeout(() => {
          navigate("/login", {
            state: location.state,
            replace: true
          });
        }, 1500);
      } catch (err) {
        setError(
          err?.message ||
            "Registrasi gagal. Silakan periksa kembali data Anda."
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div
            className="auth-image"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470')",
            }}
          >
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

            {error && <p className="auth-error">{error}</p>}
            {success && (
              <p style={{ color: "green", marginBottom: 16 }}>
                {success}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="auth-group">
                <label>Username</label>
                <input
                  name="username"
                  placeholder="masukkan username anda"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="masukkan email yang aktif"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-group">
                <label>Nama Lengkap</label>
                <input
                  name="nama_lengkap"
                  placeholder="Nama lengkap sesuai identitas anda"
                  value={form.nama_lengkap}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-group">
                <label>Nomor Telepon (Opsional)</label>
                <input
                  name="nomor_telepon"
                  placeholder="Nomor HP yang dapat dihubungi"
                  value={form.nomor_telepon}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-group">
                <label>Password</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password minimal 8 karakter"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    title={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>

              <div className="auth-group">
                <label>Konfirmasi Password</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    placeholder="Konfirmasi password"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={
                      showConfirmPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </span>
                </div>
              </div>

              <div className="auth-group">
                <label>Foto Profil (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFotoProfil(e.target.files[0])
                  }
                />
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={loading}
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
                    replace: true
                  })
                }
              >
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    );
};

export default Register;
