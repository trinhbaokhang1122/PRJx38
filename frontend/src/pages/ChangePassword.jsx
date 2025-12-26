import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return setMsg("Mật khẩu mới không khớp.");
    try {
      setLoading(true);
      const res = await axiosClient.put("/users/profile/password", {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      setMsg(res.data.message || "Đổi mật khẩu thành công.");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Lỗi đổi mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card pw-box">
        <h2>Đổi mật khẩu</h2>
        <form onSubmit={submit} className="form-grid">
          <div>
            <label className="label">Mật khẩu hiện tại</label>
            <input className="input" type="password" name="oldPassword" value={form.oldPassword} onChange={onChange} required />
          </div>

          <div>
            <label className="label">Mật khẩu mới</label>
            <input className="input" type="password" name="newPassword" value={form.newPassword} onChange={onChange} required />
          </div>

          <div>
            <label className="label">Nhập lại mật khẩu mới</label>
            <input className="input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} required />
          </div>

          <div className="actions">
            <button className="btn primary" type="submit" disabled={loading}>Cập nhật mật khẩu</button>
          </div>

          {msg && <div className={msg.includes("thành") ? "message" : "error"}>{msg}</div>}
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
