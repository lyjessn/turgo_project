import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { redirectByRole } from "../../auth/redirectByRole";
import "../../auth/auth.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      const redirectTo = location.state?.redirectTo;

      if (redirectTo) {
        navigate(redirectTo, {
          state: location.state,
          replace: true
        });
      } else {
        navigate(redirectByRole(data.role));
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan. Silakan coba lagi."
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
              Ketika alam dan budaya menyatu
              <br />
              ke dalam sebuah kehidupan yang sederhana
            </p>

            <p className="subtitle">
              Menghubungkan wisatawan dengan pengalaman lokal
              terbaik.
            </p>
          </div>
        </div>
        <div className="auth-form">
          <h2 className="auth-title">Selamat Datang</h2>

          <p className="auth-caption">
            Masuk untuk mengelola akun dan melanjutkan aktivitas Anda.
          </p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="auth-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="emailTerdaftar@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <p
              className="forgot-password"
              onClick={() =>
                alert("Fitur lupa password belum tersedia")
              }
            >
              Lupa password? Klik di sini
            </p>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="auth-register">
            Belum memiliki akun?{" "}
            <span
              onClick={() =>
                navigate("/register", {
                  state: location.state,
                })
              }
            >
              Daftar
            </span>
          </p>
        </div>

        
      </div>
    </div>
  );
};

export default Login;
