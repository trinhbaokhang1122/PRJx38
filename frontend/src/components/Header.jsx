import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isAdmin =
    user &&
    (user.isAdmin === true ||
      user.isAdmin === "true" ||
      user.role === "admin");

  const headerCss = `
    .nav-link {
      color: #BBE1FA;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      padding: 0 12px;
      transition: 0.3s;
      display: flex;
      align-items: center;
      height: 70px;
      box-sizing: border-box;
    }
    .nav-link:hover { color: #ffffff; }

    .dropdown {
      position: relative;
      display: flex;
      align-items: center;
      height: 70px;
    }
    .dropdown-content {
      display: none;
      position: absolute;
      right: 0;
      top: 70px;
      background-color: #1B262C;
      min-width: 190px;
      box-shadow: 0px 8px 16px rgba(0,0,0,0.4);
      z-index: 1001;
      border-radius: 0 0 8px 8px;
      overflow: hidden;
    }
    .dropdown-content a, .dropdown-content .logout-btn {
      color: white;
      padding: 12px 16px;
      text-decoration: none;
      display: block;
      font-size: 0.9rem;
      cursor: pointer;
      transition: 0.2s;
    }
    .dropdown-content a:hover, .dropdown-content .logout-btn:hover {
      background-color: #3282B8;
    }
    
    /* ✅ Sửa lỗi khoảng trống: Divider tinh chỉnh lại */
    .dropdown-divider {
      height: 1px;
      background-color: rgba(255, 255, 255, 0.1);
      margin: 4px 0;
      padding: 0 !important; /* Triệt tiêu padding gây ra ô trống */
    }

    .dropdown:hover .dropdown-content {
      display: block;
    }
    .account-label {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
    }
  `;

  return (
    <header style={styles.header}>
      <style>{headerCss}</style>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          zkay<span style={{ color: "#3282B8" }}>exe</span>
        </Link>

        <nav style={styles.nav}>
          {user ? (
            <>
              {/* MENU HỆ THỐNG */}
              <div className="dropdown" style={{marginRight: '10px'}}>
                <div className="nav-link account-label">
                  Hệ thống <small style={{fontSize: '10px'}}>▼</small>
                </div>
                <div className="dropdown-content">
                  {isAdmin && (
                    <>
                      <Link to="/admin">🛠 Quản trị</Link>
                      <Link to="/admin/prices">💰 Sửa giá</Link>
                      <Link to="/dashboard">📊 Thống kê</Link>
                      {/* Dùng class mới để không bị dính padding */}
                      <div className="dropdown-divider"></div>
                    </>
                  )}
                  <Link to="/price-timeline">📅 Bảng giá</Link>
                  <Link to="/orders">📦 Đơn hàng</Link>
                </div>
              </div>

              {/* MENU TÀI KHOẢN */}
              <div className="dropdown">
                <div className="nav-link account-label" style={{color: '#fff'}}>
                  {user.full_name || "Tài khoản"} <small style={{fontSize: '10px'}}>▼</small>
                </div>
                <div className="dropdown-content">
                  <Link to="/profile">👤 Cá nhân</Link>
                  <div className="dropdown-divider"></div>
                  <div onClick={handleLogout} className="logout-btn" style={{color: '#ff4d4d'}}>
                    🚪 Đăng xuất
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Đăng nhập</Link>
              <Link to="/register" className="nav-link">Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

const styles = {
  header: { backgroundColor: "#0F4C75", height: "70px", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 1000 },
  container: { width: "100%", maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px", height: "100%" },
  logo: { fontSize: "24px", fontWeight: "800", textDecoration: "none", color: "#FFFFFF" },
  nav: { display: "flex", alignItems: "center", height: "100%" },
};

export default Header;