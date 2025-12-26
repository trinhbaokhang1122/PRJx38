import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FaLock, FaTruck, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const ResetPassword = () => {
  const { token } = useParams(); // Lấy mã token từ URL
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/users/reset-password/${token}`, {
        password: formData.password,
      });
      setMessage("✅ " + res.data.message);
      setSuccess(true);
      // Chuyển hướng sau 2 giây nếu thành công
      setTimeout(() => navigate("/login"), 2500);
    } catch (error) {
      setMessage("❌ " + (error.response?.data?.message || "Đã có lỗi xảy ra!"));
    } finally {
      setLoading(false);
    }
  };

  const css = `
    .reset-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      background-color: #f8f9fa;
      padding-top: 50px;
      font-family: 'Inter', sans-serif;
    }
    .reset-box {
      background: #fff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      width: 100%;
      max-width: 400px;
      text-align: center;
      border: 1px solid #eee;
    }
    .reset-logo { font-size: 2.5rem; color: #0F4C75; margin-bottom: 10px; }
    .input-group { position: relative; margin-bottom: 16px; text-align: left; }
    .input-group svg { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #999; }
    .reset-input {
      width: 100%;
      padding: 12px 15px 12px 45px;
      border: 1.5px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      box-sizing: border-box;
    }
    .reset-input:focus { border-color: #3282B8; }
    .reset-submit {
      background: #0F4C75;
      color: #fff;
      border: none;
      width: 100%;
      padding: 14px;
      font-weight: 700;
      cursor: pointer;
      border-radius: 8px;
      transition: 0.3s;
    }
    .reset-submit:hover { background: #3282B8; }
    .reset-submit:disabled { background: #ccc; cursor: not-allowed; }
  `;

  return (
    <div className="reset-container">
      <style>{css}</style>
      <div className="reset-box">
        <div className="reset-logo"><FaTruck /></div>
        <h2 style={{ color: "#1B262C", marginBottom: "8px" }}>Đặt lại mật khẩu</h2>
        <p style={{ color: "#777", fontSize: "14px", marginBottom: "25px" }}>
          Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <FaLock />
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu mới"
                className="reset-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FaLock />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu mới"
                className="reset-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="reset-submit" disabled={loading}>
              {loading ? "ĐANG CẬP NHẬT..." : "XÁC NHẬN ĐỔI MẬT KHẨU"}
            </button>
          </form>
        ) : (
          <div style={{ color: "#2e7d32", fontWeight: "600" }}>
            <FaCheckCircle size={40} style={{ marginBottom: "10px" }} />
            <p>Mật khẩu đã được thay đổi!</p>
            <p style={{ fontSize: "12px", color: "#666" }}>Đang chuyển hướng về trang đăng nhập...</p>
          </div>
        )}

        {message && !success && (
          <div style={{ 
            marginTop: "15px", 
            padding: "10px", 
            backgroundColor: "#fdecea", 
            color: "#c62828", 
            borderRadius: "6px", 
            fontSize: "13px" 
          }}>
            {message}
          </div>
        )}

        <div style={{ marginTop: "25px", fontSize: "14px" }}>
          <Link to="/login" style={{ textDecoration: "none", color: "#0F4C75", fontWeight: "700" }}>
            <FaArrowLeft size={12} /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;