import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

const CreateTeam = () => {
  const [form, setForm] = useState({
    team_name: "",
    leader_name: "",
    leader_phone: "",
    description: "",
    vehicle_type: "Xe tải nhỏ",
    vehicle_capacity: "",
    base_price: "",
    price_per_km: "",
    max_distance_km: "",
    member_count: "", // Số lượng thành viên nhập từ Form
    region: "",
    price: "", 
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Chuẩn hóa dữ liệu trước khi gửi: Chuyển các ô nhập số từ chuỗi sang kiểu Number
      const dataToSubmit = {
        ...form,
        member_count: parseInt(form.member_count) || 0,
        price: parseFloat(form.price) || 0,
        vehicle_capacity: parseFloat(form.vehicle_capacity) || 0,
        base_price: parseFloat(form.base_price) || 0,
        price_per_km: parseFloat(form.price_per_km) || 0,
        max_distance_km: parseFloat(form.max_distance_km) || 0,
      };

      await axiosClient.post("/teams/register", dataToSubmit);
      
      setMessage("✅ Đăng ký đội vận chuyển thành công! Vui lòng chờ admin duyệt.");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setMessage("❌ Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🚛 Đăng ký đội vận chuyển</h2>

      <form style={styles.form} onSubmit={handleSubmit}>
        {/* Cột trái: Thông tin đội */}
        <div style={styles.column}>
          <h3 style={styles.sectionTitle}>📋 Thông tin đội</h3>

          <label style={styles.label}>
            Tên đội
            <input
              type="text"
              name="team_name"
              value={form.team_name}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="VD: Đội vận chuyển Minh Tâm"
            />
          </label>

          <label style={styles.label}>
            Đội trưởng
            <input
              type="text"
              name="leader_name"
              value={form.leader_name}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Tên người đại diện"
            />
          </label>

          <label style={styles.label}>
            Số điện thoại
            <input
              type="tel"
              name="leader_phone"
              value={form.leader_phone}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="VD: 0901234567"
            />
          </label>

          <label style={styles.label}>
            Khu vực hoạt động
            <input
              type="text"
              name="region"
              value={form.region}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="VD: Hà Nội, TP.HCM, Đà Nẵng..."
            />
          </label>

          <label style={styles.label}>
            Số người trong đội (Gồm cả trưởng đội)
            <input
              type="number"
              name="member_count" 
              value={form.member_count}
              onChange={handleChange}
              style={styles.input}
              placeholder="VD: 5"
              required
              min="1"
            />
          </label>

          <label style={styles.label}>
            Giá dịch vụ trọn gói (VNĐ)
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              style={styles.input}
              placeholder="VD: 200000"
              required
            />
          </label>
        </div>

        {/* Cột phải: Thông tin phương tiện */}
        <div style={styles.column}>
          <h3 style={styles.sectionTitle}>🚚 Thông tin phương tiện</h3>

          <label style={styles.label}>
            Loại phương tiện
            <select
              name="vehicle_type"
              value={form.vehicle_type}
              onChange={handleChange}
              style={styles.select}
            >
              <option>Xe tải nhỏ</option>
              <option>Xe tải lớn</option>
              <option>Xe ba gác</option>
              <option>Xe máy giao hàng</option>
            </select>
          </label>

          <label style={styles.label}>
            Tải trọng xe (kg)
            <input
              type="number"
              name="vehicle_capacity"
              value={form.vehicle_capacity}
              onChange={handleChange}
              style={styles.input}
              placeholder="VD: 1000"
            />
          </label>

          <label style={styles.label}>
            Giá khởi điểm (VNĐ)
            <input
              type="number"
              name="base_price"
              value={form.base_price}
              onChange={handleChange}
              style={styles.input}
              placeholder="VD: 50000"
            />
          </label>

          <label style={styles.label}>
            Giá mỗi km (VNĐ)
            <input
              type="number"
              name="price_per_km"
              value={form.price_per_km}
              onChange={handleChange}
              style={styles.input}
              placeholder="VD: 10000"
            />
          </label>

          <label style={styles.label}>
            Phạm vi hoạt động tối đa (km)
            <input
              type="number"
              name="max_distance_km"
              value={form.max_distance_km}
              onChange={handleChange}
              style={styles.input}
              placeholder="VD: 30"
            />
          </label>
        </div>

        <div style={styles.fullWidth}>
          <label style={styles.label}>
            Mô tả chi tiết năng lực đội
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              placeholder="Giới thiệu kinh nghiệm, các loại máy móc hỗ trợ..."
              style={styles.textarea}
            />
          </label>
        </div>

        <div style={styles.footer}>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Đang xử lý..." : "Gửi yêu cầu đăng ký đội"}
          </button>
        </div>
      </form>

      {message && (
        <p style={{ 
          ...styles.message, 
          color: message.includes("✅") ? "green" : "red" 
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: 900, margin: "40px auto", padding: "30px", backgroundColor: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderRadius: 16, fontFamily: "'Segoe UI', sans-serif", color: "#111", border: "1px solid #eee" },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 28 },
  form: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  column: { display: "flex", flexDirection: "column", gap: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4, borderBottom: "2px solid #000", paddingBottom: 4 },
  label: { display: "flex", flexDirection: "column", fontWeight: "600", fontSize: 14 },
  input: { marginTop: 6, padding: "10px 14px", borderRadius: 8, border: "1.5px solid #ddd", fontSize: 15, outline: "none" },
  textarea: { marginTop: 6, padding: "10px 14px", borderRadius: 8, border: "1.5px solid #ddd", fontSize: 15, resize: "vertical", minHeight: 100, outline: "none" },
  select: { marginTop: 6, padding: "10px 14px", borderRadius: 8, border: "1.5px solid #ddd", fontSize: 15, outline: "none", backgroundColor: "#fff" },
  fullWidth: { gridColumn: "1 / 3" },
  footer: { gridColumn: "1 / 3", textAlign: "center", marginTop: 10 },
  button: { backgroundColor: "#000", color: "#fff", border: "none", borderRadius: 10, padding: "14px 40px", fontSize: 16, fontWeight: "700", cursor: "pointer", transition: "0.3s" },
  message: { marginTop: 20, textAlign: "center", fontWeight: "600", padding: "10px", borderRadius: "8px" },
};

export default CreateTeam;