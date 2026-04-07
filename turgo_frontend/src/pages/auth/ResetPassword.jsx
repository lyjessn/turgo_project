import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/apiAuth";
import "../../auth/auth.css";
import "../adminDanOwner/css/Modal.css"

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get("email");
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const translateMessage = (msg) => {
        if (!msg) return msg;

        const m = msg.toLowerCase();

        if (m.includes("password confirmation does not match")) {
            return "Konfirmasi password tidak cocok";
        }

        if (m.includes("password must be at least")) {
            return "Password minimal 8 karakter";
        }

        if (m.includes("token is invalid") || m.includes("token has expired")) {
            return "Link reset password tidak valid atau sudah kadaluarsa";
        }

        if (m.includes("password reset failed")) {
            return "Reset password gagal";
        }

        if (m.includes("password baru tidak boleh sama dengan password lama")) {
            return "Password baru tidak boleh sama dengan password lama";
        }

        return msg;
    };

    const handleSubmit = async (e) => {

        e.preventDefault();
        setError("");

        if (!email || !token) {
            setError("Link reset password tidak valid atau sudah kadaluarsa");
            return;
        }

        if (!password) {
            setError("Password harus diisi");
            return;
        }

        if (password.length < 8) {
            setError("Password minimal 8 karakter");
            return;
        }

        if (password !== confirmPassword) {
            setError("Konfirmasi password tidak sama");
            return;
        }

        setLoading(true);

        try {
            await resetPassword({
            email,
            token,
            password,
            password_confirmation: confirmPassword
            });
            setShowSuccessModal(true);
        } catch (err) {
            console.log("ERROR FULL:", err);
            let msg = "Reset password gagal";

            if (err.response?.data?.errors) {
                const allErrors = Object.values(err.response.data.errors).flat();
                msg = allErrors[0];
            }
            else if (err.response?.data?.message) {
                msg = err.response.data.message;
            }
            else if (err.message) {
                msg = err.message;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

  return (
    <>
    <div className="auth-wrapper">
      <div className="auth-card">

        <div className="auth-form">

          <h2 className="auth-title">Reset Password</h2>
          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit}>

            <div className="auth-group">
              <label>Password Baru</label>

              <input
                type="password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-group">
                <label>Konfirmasi Password</label>

                <input
                    type="password"
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>

            <button
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Reset Password"}
            </button>

          </form>

        </div>

      </div>
    </div>

    {showSuccessModal && (
        <div className="modal-overlay">

            <div className="modal-box">

            <h3>Password berhasil diubah</h3>

            <p>
                Password Anda telah diperbarui.
                Silakan login kembali.
            </p>

            <button
                onClick={() => navigate("/login")}
                className="auth-button"
            >
                Kembali ke Login
            </button>

            </div>

        </div>
        )}
    </>
  );
};

export default ResetPassword;