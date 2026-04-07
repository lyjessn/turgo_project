import { useState } from "react";
import { forgotPassword } from "../../api/apiAuth";
import "../../auth/auth.css";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const res = await forgotPassword(email);
      setMessage(res.message);

    } catch (err) {

      setMessage(
        err.response?.data?.message ||
        "Terjadi kesalahan"
      );

    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <div className="auth-form">

          <h2 className="auth-title">Lupa Password</h2>

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

            <button
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Kirim Link Reset"}
            </button>

          </form>

          {message && <p className="auth-caption">{message}</p>}

        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;