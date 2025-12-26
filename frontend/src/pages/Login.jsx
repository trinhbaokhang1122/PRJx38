import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaEnvelope, FaTruck } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      alert("❌ Đăng nhập thất bại! Vui lòng kiểm tra lại.");
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

    .login-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start; 
      background-color: var(--bg-light);
      font-family: 'Inter', sans-serif;
      padding-top: 30px; 
      padding-left: 20px;
      padding-right: 20px;
      box-sizing: border-box;
    }

    .login-box {
      background: var(--white);
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      width: 100%;
      max-width: 400px;
      text-align: center;
      border: 1px solid #eee;
    }

    .login-logo {
      font-size: 2.5rem;
      color: var(--primary);
      margin-bottom: 10px;
    }

    .login-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--dark);
      margin-bottom: 8px;
    }

    .login-subtitle {
      font-size: 14px;
      color: #777;
      margin-bottom: 30px;
    }

    .input-group {
      position: relative;
      margin-bottom: 18px;
      text-align: left;
    }

    .input-group svg {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
    }

    .login-input {
      width: 100%;
      padding: 12px 15px 12px 45px;
      border: 1.5px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s;
      outline: none;
      box-sizing: border-box;
    }

    .login-input:focus {
      border-color: var(--accent);
      background-color: #fff;
    }

    .login-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      font-size: 13.5px;
    }

    .login-checkbox {
      display: flex;
      align-items: center;
      cursor: pointer;
      color: #555;
    }

    .login-checkbox input {
      margin-right: 8px;
    }

    .login-forgot {
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
    }

    .login-submit {
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
    }

    .login-submit:hover {
      background: var(--accent);
      box-shadow: 0 5px 15px rgba(50, 130, 184, 0.3);
    }

    .login-register {
      font-size: 14px;
      margin-top: 25px;
      color: #555;
    }

    .login-register a {
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
    }

    .login-footer {
      font-size: 12px;
      color: #bbb;
      margin-top: 30px;
    }
  `;

  return (
    <div className="login-container">
      <style>{css}</style>
      <div className="login-box">
        <div className="login-logo">
          <FaTruck />
        </div>
        <div className="login-title">Đăng Nhập</div>
        <div className="login-subtitle">Hệ thống vận chuyển zkayexe</div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaEnvelope />
            <input
              type="email"
              placeholder="Email của bạn (@gmail.com)"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaLock />
            <input
              type="password"
              placeholder="Mật khẩu"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-row">
            <label className="login-checkbox">
              <input type="checkbox" />
              Ghi nhớ đăng nhập
            </label>
            <Link to="/forgot-password" className="login-forgot">Quên mật khẩu?</Link>
          </div>

          <button type="submit" className="login-submit">
            Đăng nhập
          </button>
        </form>

        <div className="login-register">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>

        <div className="login-footer">
          © 2025 zkayexe Logistics
        </div>
      </div>
    </div>
  );
};

export default Login;