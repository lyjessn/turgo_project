import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { redirectByRole } from "../../auth/redirectByRole";
import heroImage from "../../assets/iconTurgo.jpg";
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

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setTouched({
      email: true,
      password: true,
    });

    setError("");

    const newErrors = {};

    if (!email.trim()) newErrors.email = "Email wajib diisi";
    if (!password) newErrors.password = "Password wajib diisi";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const data = await login(email, password);
      const redirectTo = location.state?.redirectTo;

      if (redirectTo) {
        navigate(redirectTo, {
          state: location.state,
          replace: true,
        });
      } else {
        navigate(redirectByRole(data.role));
      }
    } catch (err) {
      console.log("FULL ERROR:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
          "Email/password tidak sesuai."
        );
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Tidak dapat terhubung ke server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <div
          className="auth-image"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="auth-image-caption">
            <p className="title">
              Ketika alam dan budaya menyatu
              <br />
              ke dalam sebuah kehidupan yang sederhana
            </p>
            <p className="subtitle">
              Menghubungkan wisatawan dengan pengalaman lokal terbaik.
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

            {/* EMAIL */}
            <div className="auth-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="emailTerdaftar@gmail.com"
                value={email}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  setError("");

                  setErrors((prev) => {
                    const newErrors = { ...prev };

                    if (!value.trim()) newErrors.email = "Email wajib diisi";
                    else delete newErrors.email;

                    return newErrors;
                  });
                }}
              />

              {touched.email && errors.email && (
                <p className="auth-error">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="auth-group">
              <label>Password</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password minimal 8 karakter"
                  value={password}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    setError("");

                    setErrors((prev) => {
                      const newErrors = { ...prev };

                      if (!value) newErrors.password = "Password wajib diisi";
                      else delete newErrors.password;

                      return newErrors;
                    });
                  }}
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

              {touched.password && errors.password && (
                <p className="auth-error">Password wajib diisi</p>
              )}
            </div>

            <p
              className="forgot-password"
              onClick={() => navigate("/forgot-password")}
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