import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaKey, FaTruck, FaArrowLeft } from "react-icons/fa";

const ForgotPassword = () => {
  const navigate = useNavigate();
  // Quản lý trạng thái: 1 = Nhập Email, 2 = Nhập OTP & Mật khẩu mới
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); 
  const [password, setPassword] = useState("");

  // BƯỚC 1: Gửi mã OTP về Email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await axios.post("http://localhost:5000/api/users/forgot-password", { email });
      setMessage("✅ Mã xác thực đã được gửi! Vui lòng kiểm tra Email.");
      setStep(2); // Tự động chuyển sang giao diện nhập mã
    } catch (error) {
      setMessage("❌ " + (error.response?.data?.message || "Email không tồn tại!"));
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 2: Nhập OTP + Pass mới để xác nhận đổi
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // Gửi mã OTP (resetToken) lên API reset-password
      await axios.post(`http://localhost:5000/api/users/reset-password/${otp}`, { 
        password: password 
      });
      setMessage("✅ Đổi mật khẩu thành công!");
      // Sau 2 giây chuyển về trang đăng nhập
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage("❌ Mã OTP không đúng hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  const css = `
    .forgot-container { min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; background: #f8f9fa; padding-top: 50px; font-family: 'Inter', sans-serif; }
    .forgot-box { background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 400px; text-align: center; border: 1px solid #eee; }
    .forgot-logo { font-size: 2.5rem; color: #0F4C75; margin-bottom: 10px; }
    .input-group { position: relative; margin-bottom: 15px; text-align: left; }
    .input-group svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #999; }
    .forgot-input { width: 100%; padding: 12px 15px 12px 45px; border: 1.5px solid #ddd; border-radius: 8px; outline: none; box-sizing: border-box; font-size: 14px; }
    .forgot-btn { background: #0F4C75; color: #fff; border: none; width: 100%; padding: 14px; font-weight: 700; border-radius: 8px; cursor: pointer; transition: 0.3s; margin-top: 10px; }
    .forgot-btn:hover { background: #3282B8; }
    .forgot-btn:disabled { background: #ccc; cursor: not-allowed; }
    .msg { margin-top: 15px; font-size: 13px; padding: 10px; border-radius: 5px; }
  `;

  return (
    <div className="forgot-container">
      <style>{css}</style>
      <div className="forgot-box">
        <div className="forgot-logo"><FaTruck /></div>
        <h2 style={{ color: "#1B262C" }}>{step === 1 ? "Quên mật khẩu" : "Xác thực mã"}</h2>
        
        {step === 1 ? (
          <form onSubmit={handleSendEmail}>
            <p style={{ color: "#777", fontSize: "14px", marginBottom: "20px" }}>Nhập email để nhận mã khôi phục</p>
            <div className="input-group">
              <FaEnvelope />
              <input type="email" placeholder="Email của bạn" className="forgot-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="forgot-btn" disabled={loading}>{loading ? "ĐANG GỬI..." : "GỬI MÃ XÁC THỰC"}</button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <p style={{ color: "#777", fontSize: "14px", marginBottom: "20px" }}>Nhập mã OTP từ Email và mật khẩu mới</p>
            <div className="input-group">
              <FaKey />
              <input type="text" placeholder="Nhập mã OTP" className="forgot-input" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            <div className="input-group">
              <FaLock />
              <input type="password" placeholder="Mật khẩu mới" className="forgot-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="forgot-btn" disabled={loading}>{loading ? "ĐANG CẬP NHẬT..." : "XÁC NHẬN ĐỔI"}</button>
            <p onClick={() => setStep(1)} style={{ color: "#0F4C75", cursor: "pointer", fontSize: "13px", marginTop: "15px" }}>Gửi lại mã khác?</p>
          </form>
        )}

        {message && <div className="msg" style={{ background: message.includes("✅") ? "#e8f5e9" : "#ffebee", color: message.includes("✅") ? "#2e7d32" : "#c62828" }}>{message}</div>}

        <div style={{ marginTop: "20px" }}>
          <Link to="/login" style={{ textDecoration: "none", color: "#0F4C75", fontWeight: "700", fontSize: "14px" }}><FaArrowLeft size={10}/> Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;