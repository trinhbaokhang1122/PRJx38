import React, { useEffect, useState, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaUser, FaPhone, FaEnvelope, FaCamera, FaLock, FaSignOutAlt, FaSave } from "react-icons/fa";

const Profile = () => {
  const { logout } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axiosClient.get("/users/profile");
        const avatarUrl = data.avatar?.startsWith("http")
          ? data.avatar
          : `http://localhost:5000${data.avatar}`;
        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          avatar: avatarUrl,
        });
        setAvatarPreview(avatarUrl);
      } catch {
        setMessage("❌ Không tải được thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      const res = await axiosClient.put("/users/profile", {
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
      });
      setMessage("✅ Cập nhật thông tin thành công!");
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...stored,
          full_name: res.data.user.full_name,
          email: res.data.user.email,
        })
      );
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Cập nhật thất bại."));
    } finally {
      setLoading(false);
    }
  };

  const onSelectAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(preview);
  };

  const submitAvatar = async () => {
    if (!avatarFile) return setMessage("⚠️ Chưa chọn ảnh mới.");
    const fd = new FormData();
    fd.append("avatar", avatarFile);
    try {
      setLoading(true);
      const res = await axiosClient.put("/users/profile/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const avatarUrl = `http://localhost:5000${res.data.avatar}`;
      setMessage("✅ Ảnh đại diện đã được cập nhật!");
      setProfile((p) => ({ ...p, avatar: avatarUrl }));
      setAvatarPreview(avatarUrl);
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, avatar: res.data.avatar }));
    } catch {
      setMessage("❌ Tải lên ảnh thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={css.container}>
      <style>{hoverEffects}</style>
      <div style={css.card}>
        {/* === LEFT SIDEBAR === */}
        <aside style={css.aside}>
          <div style={css.avatarWrapper}>
            <img
              src={avatarPreview || profile.avatar || "/placeholder-avatar.png"}
              alt="avatar"
              style={css.avatar}
            />
            <label htmlFor="avatar-upload" style={css.cameraIcon}>
              <FaCamera size={14} />
            </label>
          </div>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={onSelectAvatar}
            style={{ display: "none" }}
          />
          
          <div style={css.name}>{profile.full_name || "Khách hàng"}</div>
          <div style={css.emailBadge}>{profile.email}</div>

          <button 
            onClick={submitAvatar} 
            disabled={loading || !avatarFile} 
            className="btn-hover"
            style={{...css.saveAvatarBtn, opacity: (!avatarFile) ? 0.6 : 1}}
          >
            {loading ? "Đang lưu..." : "Cập nhật ảnh"}
          </button>
        </aside>

        {/* === MAIN CONTENT === */}
        <main style={css.main}>
          <h2 style={css.title}>Thiết lập tài khoản</h2>

          <form onSubmit={handleUpdate} style={css.form}>
            <div style={css.field}>
              <label style={css.label}><FaUser size={12} /> Họ và tên</label>
              <input
                style={css.input}
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={css.field}>
              <label style={css.label}><FaEnvelope size={12} /> Email hệ thống</label>
              <input
                style={css.input}
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={css.field}>
              <label style={css.label}><FaPhone size={12} /> Số điện thoại</label>
              <input
                style={css.input}
                name="phone"
                placeholder="Chưa cập nhật SĐT"
                value={profile.phone || ""}
                onChange={handleChange}
              />
            </div>

            <div style={css.actions}>
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="submit" disabled={loading} className="btn-black" style={css.saveBtn}>
                  <FaSave /> {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <Link to="/change-password" className="btn-outline" style={css.changePassLink}>
                  <FaLock /> Đổi mật khẩu
                </Link>
              </div>
              
              <button type="button" onClick={logout} className="btn-logout" style={css.logoutBtn}>
                <FaSignOutAlt /> Đăng xuất
              </button>
            </div>
          </form>

          {message && (
            <div style={message.includes("❌") || message.includes("⚠️") ? css.errorMsg : css.successMsg}>
              {message}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const hoverEffects = `
  .btn-hover:hover { background: #333 !important; transform: translateY(-2px); }
  .btn-black:hover { background: #333 !important; box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important; }
  .btn-outline:hover { background: #f8f8f8 !important; border-color: #000 !important; }
  .btn-logout:hover { background: #b71c1c !important; color: #fff !important; }
`;

const css = {
  container: {
    maxWidth: "1100px",
    margin: "60px auto",
    padding: "0 20px",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  card: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    background: "#fff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
    border: "1px solid #f0f0f0",
  },
  aside: {
    background: "#F9FAFB",
    padding: "48px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRight: "1px solid #f0f0f0",
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: "24px",
  },
  avatar: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  cameraIcon: {
    position: "absolute",
    bottom: "5px",
    right: "5px",
    background: "#000",
    color: "#fff",
    padding: "8px",
    borderRadius: "50%",
    cursor: "pointer",
    border: "3px solid #fff",
  },
  name: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#111",
    marginBottom: "8px",
    textAlign: "center",
  },
  emailBadge: {
    fontSize: "14px",
    color: "#6B7280",
    background: "#F3F4F6",
    padding: "4px 12px",
    borderRadius: "20px",
    marginBottom: "32px",
  },
  saveAvatarBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    background: "#000",
    color: "#fff",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  main: {
    padding: "48px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    marginBottom: "40px",
    color: "#111",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "32px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#4B5563",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textTransform: "uppercase",
  },
  input: {
    padding: "14px 18px",
    borderRadius: "12px",
    border: "1.5px solid #E5E7EB",
    fontSize: "15px",
    transition: "all 0.2s",
    outline: "none",
    background: "#fff",
  },
  actions: {
    gridColumn: "1 / -1",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "24px",
    paddingTop: "32px",
    borderTop: "1px solid #F3F4F6",
  },
  saveBtn: {
    padding: "14px 28px",
    borderRadius: "12px",
    background: "#000",
    color: "#fff",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s",
  },
  changePassLink: {
    padding: "14px 24px",
    borderRadius: "12px",
    border: "1.5px solid #E5E7EB",
    color: "#374151",
    fontWeight: "700",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s",
  },
  logoutBtn: {
    padding: "14px 24px",
    borderRadius: "12px",
    background: "#FEF2F2",
    color: "#DC2626",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s",
  },
  successMsg: {
    marginTop: "32px",
    padding: "16px",
    background: "#ECFDF5",
    color: "#059669",
    borderRadius: "12px",
    fontWeight: "700",
    textAlign: "center",
    border: "1px solid #A7F3D0",
  },
  errorMsg: {
    marginTop: "32px",
    padding: "16px",
    background: "#FEF2F2",
    color: "#DC2626",
    borderRadius: "12px",
    fontWeight: "700",
    textAlign: "center",
    border: "1px solid #FECACA",
  },
};

export default Profile;