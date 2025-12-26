// frontend/src/pages/PriceManager.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const PriceManager = () => {
  const [price, setPrice] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const current = await axiosClient.get("/prices");
        setPrice(current.data);
        const history = await axiosClient.get("/prices/timeline");
        setTimeline(history.data || []);
      } catch (err) {
        setMessage("❌ Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put("/prices", form);
      setMessage("✅ Cập nhật bảng giá thành công!");
      setPrice(form);
      const history = await axiosClient.get("/prices/timeline");
      setTimeline(history.data);
      setShowEdit(false);
    } catch {
      setMessage("❌ Lỗi khi cập nhật giá");
    }
  };

  if (loading) return <div style={styles.loading}>Đang tải...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerArea}>
        <h2 style={styles.title}>⚙️ Quản lý bảng giá hệ thống</h2>
        <p style={styles.subtitle}>Điều chỉnh biểu phí vận chuyển cho toàn bộ nền tảng</p>
      </div>

      {message && (
        <div style={{...styles.alert, backgroundColor: message.includes("✅") ? "#e6fffa" : "#fff5f5", color: message.includes("✅") ? "#2c7a7b" : "#c53030"}}>
          {message}
        </div>
      )}

      {/* ---- Khối giá hiện tại ---- */}
      <div style={styles.priceCard}>
        <div style={styles.cardTitle}>📊 Biểu phí hiện hành</div>
        <div style={styles.priceGrid}>
          <div style={styles.priceItem}>
            <span style={styles.priceLabel}>Giá cơ bản</span>
            <span style={styles.priceValue}>{price.base_price.toLocaleString()} VNĐ</span>
          </div>
          <div style={styles.priceItem}>
            <span style={styles.priceLabel}>Giá mỗi km</span>
            <span style={styles.priceValue}>{price.per_km_price.toLocaleString()} VNĐ</span>
          </div>
          <div style={styles.priceItem}>
            <span style={styles.priceLabel}>Phụ phí quá tải</span>
            <span style={styles.priceValue}>{price.overweight_fee.toLocaleString()} VNĐ</span>
          </div>
          <div style={styles.priceItem}>
            <span style={styles.priceLabel}>Phí giao nhanh</span>
            <span style={styles.priceValue}>{price.express_fee.toLocaleString()} VNĐ</span>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button onClick={() => { setForm(price); setShowEdit(true); }} style={styles.btnEdit}>
            ✏️ Chỉnh sửa giá
          </button>
          <button onClick={() => setShowTimeline(!showTimeline)} style={styles.btnHistory}>
            {showTimeline ? "📂 Ẩn lịch sử" : "📂 Xem lịch sử"}
          </button>
        </div>
      </div>

      {/* ---- Timeline ---- */}
      {showTimeline && (
        <div style={styles.timelineCard}>
          <h3 style={styles.cardTitle}>📜 Lịch sử thay đổi</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th>Thời gian</th>
                  <th>Giá cơ bản</th>
                  <th>Mỗi KM</th>
                  <th>Quá tải</th>
                  <th>Giao nhanh</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((t) => (
                  <tr key={t._id} style={styles.tableRow}>
                    <td>{new Date(t.createdAt).toLocaleString("vi-VN")}</td>
                    <td>{t.base_price.toLocaleString()}</td>
                    <td>{t.per_km_price.toLocaleString()}</td>
                    <td>{t.overweight_fee.toLocaleString()}</td>
                    <td>{t.express_fee.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- Popup sửa giá ---- */}
      {showEdit && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: 20, textAlign: "center" }}>Sửa bảng giá</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputBox}>
                <label style={styles.label}>Giá cơ bản (VNĐ)</label>
                <input type="number" name="base_price" value={form.base_price} onChange={handleChange} required style={styles.input} />
              </div>
              <div style={styles.inputBox}>
                <label style={styles.label}>Giá mỗi km (VNĐ)</label>
                <input type="number" name="per_km_price" value={form.per_km_price} onChange={handleChange} required style={styles.input} />
              </div>
              <div style={styles.inputBox}>
                <label style={styles.label}>Phụ phí quá tải (VNĐ)</label>
                <input type="number" name="overweight_fee" value={form.overweight_fee} onChange={handleChange} required style={styles.input} />
              </div>
              <div style={styles.inputBox}>
                <label style={styles.label}>Phí giao nhanh (VNĐ)</label>
                <input type="number" name="express_fee" value={form.express_fee} onChange={handleChange} required style={styles.input} />
              </div>
              
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button type="submit" style={styles.btnSubmit}>Lưu thay đổi</button>
                <button type="button" onClick={() => setShowEdit(false)} style={styles.btnCancel}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: 1000, margin: "40px auto", padding: "0 20px", fontFamily: "'Segoe UI', Roboto, sans-serif" },
  loading: { textAlign: "center", padding: 50, fontSize: 18, color: "#666" },
  headerArea: { marginBottom: 30 },
  title: { fontSize: 26, color: "#1a202c", fontWeight: "700", marginBottom: 5 },
  subtitle: { color: "#718096", fontSize: 15 },
  alert: { padding: "12px 20px", borderRadius: 8, marginBottom: 20, fontWeight: "600", border: "1px solid transparent" },
  priceCard: { background: "#fff", padding: 30, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: 30 },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 20, color: "#2d3748" },
  priceGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 },
  priceItem: { display: "flex", flexDirection: "column", padding: 15, background: "#f8fafc", borderRadius: 12, border: "1px solid #edf2f7" },
  priceLabel: { fontSize: 13, color: "#718096", marginBottom: 5, fontWeight: "600" },
  priceValue: { fontSize: 18, color: "#0F4C75", fontWeight: "700" },
  buttonGroup: { display: "flex", gap: 12, marginTop: 25 },
  btnEdit: { background: "#0F4C75", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 10, cursor: "pointer", fontWeight: "600", transition: "0.2s" },
  btnHistory: { background: "#edf2f7", color: "#4a5568", border: "none", padding: "12px 24px", borderRadius: 10, cursor: "pointer", fontWeight: "600" },
  timelineCard: { background: "#fff", padding: 25, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { textAlign: "left", borderBottom: "2px solid #edf2f7", color: "#718096", fontSize: 14 },
  tableRow: { borderBottom: "1px solid #f7fafc", fontSize: 14, color: "#2d3748" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  modal: { background: "#fff", padding: 30, width: 450, borderRadius: 20, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" },
  form: { display: "flex", flexDirection: "column", gap: 15 },
  inputBox: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 14, fontWeight: "600", color: "#4a5568" },
  input: { padding: "12px", borderRadius: 8, border: "1px solid #e2e8f0", outline: "none", fontSize: 15 },
  btnSubmit: { flex: 1, background: "#0F4C75", color: "#fff", border: "none", padding: "12px", borderRadius: 10, cursor: "pointer", fontWeight: "700" },
  btnCancel: { background: "#f7fafc", color: "#a0aec0", border: "1px solid #e2e8f0", padding: "12px 20px", borderRadius: 10, cursor: "pointer" }
};

export default PriceManager;