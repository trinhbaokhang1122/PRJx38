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

  const loadData = async () => {
    try {
      const current = await axiosClient.get("/prices");
      setPrice(current.data);

      const history = await axiosClient.get("/prices/timeline");
      setTimeline(history.data || []);
    } catch (err) {
      setMessage("❌ Không tải được dữ liệu bảng giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put("/prices", form);
      setMessage("✅ Cập nhật bảng giá thành công!");
      setShowEdit(false);
      await loadData(); 
    } catch {
      setMessage("❌ Lỗi khi cập nhật giá");
    }
  };

  if (loading) {
    return <div style={styles.loading}>Đang tải...</div>;
  }

  if (!price) {
    return <div style={styles.loading}>Không có dữ liệu bảng giá</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerArea}>
        <h2 style={styles.title}>⚙️ Quản lý bảng giá hệ thống</h2>
        <p style={styles.subtitle}>
          Điều chỉnh biểu phí vận chuyển cho toàn bộ nền tảng
        </p>
      </div>

      {message && (
        <div
          style={{
            ...styles.alert,
            backgroundColor: message.includes("✅") ? "#e6fffa" : "#fff5f5",
            color: message.includes("✅") ? "#2c7a7b" : "#c53030",
          }}
        >
          {message}
        </div>
      )}

      <div style={styles.priceCard}>
        <div style={styles.cardTitle}>📊 Biểu phí hiện hành</div>

        <div style={styles.priceGrid}>
          <div style={styles.priceItem}>
            <span style={styles.priceLabel}>Giá cơ bản</span>
            <span style={styles.priceValue}>
              {price.base_price.toLocaleString()} VNĐ
            </span>
          </div>

          <div style={styles.priceItem}>
            <span style={styles.priceLabel}>Giá mỗi km</span>
            <span style={styles.priceValue}>
              {price.per_km_price.toLocaleString()} VNĐ
            </span>
          </div>

          <div style={styles.priceItem}>
            <span style={styles.priceLabel}>Phụ phí quá tải</span>
            <span style={styles.priceValue}>
              {price.overweight_fee.toLocaleString()} VNĐ
            </span>
          </div>

          <div style={styles.priceItem}>
            <span style={styles.priceLabel}>Phí giao nhanh</span>
            <span style={styles.priceValue}>
              {price.express_fee.toLocaleString()} VNĐ
            </span>
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => {
              setForm(price);
              setShowEdit(true);
            }}
            style={styles.btnEdit}
          >
            ✏️ Chỉnh sửa giá
          </button>

          <button
            onClick={() => setShowTimeline(!showTimeline)}
            style={styles.btnHistory}
          >
            {showTimeline ? "📂 Ẩn lịch sử" : "📂 Xem lịch sử"}
          </button>
        </div>
      </div>

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
                {timeline.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: 20, textAlign: "center" }}>
                      Chưa có lịch sử thay đổi
                    </td>
                  </tr>
                )}

                {timeline.map((t) => (
                  <tr key={t._id} style={styles.tableRow}>
                    <td>
                      {new Date(t.createdAt).toLocaleString("vi-VN")}
                    </td>
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

      {showEdit && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ textAlign: "center", marginBottom: 20 }}>
              Sửa bảng giá
            </h3>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputBox}>
                <label>Giá cơ bản</label>
                <input
                  type="number"
                  name="base_price"
                  value={form.base_price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={styles.inputBox}>
                <label>Giá mỗi km</label>
                <input
                  type="number"
                  name="per_km_price"
                  value={form.per_km_price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={styles.inputBox}>
                <label>Phụ phí quá tải</label>
                <input
                  type="number"
                  name="overweight_fee"
                  value={form.overweight_fee}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={styles.inputBox}>
                <label>Phí giao nhanh</label>
                <input
                  type="number"
                  name="express_fee"
                  value={form.express_fee}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" style={styles.btnSubmit}>
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  style={styles.btnCancel}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: 1000, margin: "40px auto", padding: 20 },
  loading: { textAlign: "center", padding: 50 },
  headerArea: { marginBottom: 30 },
  title: { fontSize: 26, fontWeight: 700 },
  subtitle: { color: "#718096" },
  alert: { padding: 15, borderRadius: 8, marginBottom: 20 },
  priceCard: {
    background: "#fff",
    padding: 30,
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  cardTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20 },
  priceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 20,
  },
  priceItem: {
    background: "#f8fafc",
    padding: 15,
    borderRadius: 12,
  },
  priceLabel: { fontSize: 13, color: "#718096" },
  priceValue: { fontSize: 18, fontWeight: 700 },
  buttonGroup: { display: "flex", gap: 12, marginTop: 25 },
  btnEdit: { padding: "12px 24px", cursor: "pointer" },
  btnHistory: { padding: "12px 24px", cursor: "pointer" },
  timelineCard: {
    marginTop: 30,
    padding: 25,
    background: "#fff",
    borderRadius: 16,
  },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { borderBottom: "2px solid #eee" },
  tableRow: { borderBottom: "1px solid #f1f1f1" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    padding: 30,
    borderRadius: 20,
    width: 450,
  },
  form: { display: "flex", flexDirection: "column", gap: 15 },
  inputBox: { display: "flex", flexDirection: "column", gap: 5 },
  btnSubmit: { padding: 12 },
  btnCancel: { padding: 12 },
};

export default PriceManager;
