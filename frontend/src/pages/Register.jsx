import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaTruck } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Mật khẩu nhập lại không khớp!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/users/register", {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
      });
      setMessage("✅ Đăng ký thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setMessage("❌ " + (error.response?.data?.message || "Đăng ký thất bại!"));
    }
  };

  const css = `
    :root {
      --primary: #0F4C75;
      --accent: #3282B8;
      --dark: #1B262C;
      --white: #ffffff;
      --bg-light: #f8f9fa;
    }

    .register-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start; /* Đẩy lên trên */
      background-color: var(--bg-light);
      font-family: 'Inter', sans-serif;
      padding-top: 30px; /* Cách thanh điều hướng 30px */
      padding-left: 20px;
      padding-right: 20px;
      box-sizing: border-box;
    }

    .register-box {
      background: var(--white);
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      width: 100%;
      max-width: 420px;
      text-align: center;
      border: 1px solid #eee;
      animation: fadeIn 0.5s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .register-logo {
      font-size: 2.5rem;
      color: var(--primary);
      margin-bottom: 10px;
    }

    .register-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--dark);
      margin-bottom: 8px;
    }

    .register-subtitle {
      font-size: 14px;
      color: #777;
      margin-bottom: 25px;
    }

    .input-group {
      position: relative;
      margin-bottom: 16px;
      text-align: left;
    }

    .input-group svg {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
    }

    .register-input {
      width: 100%;
      padding: 12px 15px 12px 45px;
      border: 1.5px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s;
      outline: none;
      box-sizing: border-box;
    }

    .register-input:focus {
      border-color: var(--accent);
      background-color: #fff;
      box-shadow: 0 0 0 3px rgba(50, 130, 184, 0.1);
    }

    .register-submit {
      background: var(--primary);
      color: var(--white);
      border: none;
      width: 100%;
      padding: 14px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 10px;
    }

    .register-submit:hover {
      background: var(--accent);
      box-shadow: 0 5px 15px rgba(50, 130, 184, 0.3);
    }

    .register-message {
      margin-top: 15px;
      padding: 10px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
    }

    .login-link {
      font-size: 14px;
      margin-top: 25px;
      color: #555;
    }

    .login-link a {
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
    }

    .login-link a:hover {
      color: var(--accent);
      text-decoration: underline;
    }

    .register-footer {
      font-size: 12px;
      color: #bbb;
      margin-top: 30px;
    }
  `;

  return (
    <div className="register-container">
      <style>{css}</style>
      <div className="register-box">
        <div className="register-logo">
          <FaTruck />
        </div>
        <div className="register-title">Tạo tài khoản</div>
        <div className="register-subtitle">Gia nhập cộng đồng vận chuyển zkayexe</div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser />
            <input
              type="text"
              name="full_name"
              placeholder="Họ và tên của bạn"
              value={formData.full_name}
              onChange={handleChange}
              className="register-input"
              required
            />
          </div>

          <div className="input-group">
            <FaEnvelope />
            <input
              type="email"
              name="email"
              placeholder="Địa chỉ Email"
              value={formData.email}
              onChange={handleChange}
              className="register-input"
              required
            />
          </div>

          <div className="input-group">
            <FaLock />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              className="register-input"
              required
            />
          </div>

          <div className="input-group">
            <FaLock />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="register-input"
              required
            />
          </div>

          <button type="submit" className="register-submit">
            Đăng ký ngay
          </button>
        </form>

        {message && (
          <div className="register-message" 
               style={{ 
                 color: message.includes("✅") ? "#28a745" : "#dc3545",
                 backgroundColor: message.includes("✅") ? "#e8f5e9" : "#fdecea" 
               }}>
            {message}
          </div>
        )}

        <div className="login-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>

        <div className="register-footer">
          © 2025 zkayexe Logistics
        </div>
      </div>
    </div>
  );
};

export default Register;