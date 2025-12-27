import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { data } = await axiosClient.get(`/orders/${id}`);
        setOrder(data);
        await loadQR();
      } catch (err) {
        setError("Không thể tải thông tin đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadOrder();
  }, [id]);

  const loadQR = async () => {
    try {
      const res = await axiosClient.get(`/orders/${id}/qr`, { responseType: "blob" });
      if (res.data.type?.includes("json")) return;
      const url = URL.createObjectURL(res.data);
      setQrUrl(url);
    } catch (err) { 
      console.error("Lỗi tải QR:", err); 
    }
  };

  const formatStatus = (status) => {
    const map = {
      pending: "Chờ xác nhận", 
      confirmed: "Đã xác nhận", 
      picking: "Đang lấy hàng",
      delivering: "Đang giao", 
      completed: "Hoàn thành", 
      cancelled: "Đã hủy"
    };
    return map[status] || status;
  };

  if (loading) return <div style={styles.loading}>Đang tải dữ liệu...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>← Quay lại</button>
          <div style={styles.statusBadge}>{formatStatus(order.status)}</div>
        </div>

        <h2 style={styles.title}>Chi tiết vận đơn</h2>
        <p style={styles.orderIdText}>Mã số: #{order._id.toUpperCase()}</p>

        <div style={styles.contentGrid}>
          <div style={styles.mainInfo}>
            <div style={styles.infoSection}>
              <h3 style={styles.sectionTitle}>📍 Lộ trình vận chuyển</h3>
              <div style={styles.routeBox}>
                <div style={styles.routePoint}>
                  <div style={styles.dotGreen} />
                  <div>
                    <strong>{order.sender_name}</strong> · {order.sender_phone}
                    <p style={styles.addressText}>{order.pickup_address}</p>
                  </div>
                </div>
                <div style={styles.routeLine} />
                <div style={styles.routePoint}>
                  <div style={styles.dotRed} />
                  <div>
                    <strong>{order.receiver_name}</strong> · {order.receiver_phone}
                    <p style={styles.addressText}>{order.delivery_address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.infoSection}>
              <h3 style={styles.sectionTitle}>📦 Thông tin kiện hàng</h3>
              <div style={styles.grid2Col}>
                <DetailItem label="Loại kiện hàng" value={order.package_type} />
                <DetailItem label="Trọng lượng" value={`${order.weight_kg} kg`} />
                <DetailItem label="Dịch vụ" value={order.service_type} />
                <DetailItem label="Phương tiện" value={order.vehicle_type || "Xe tải"} />
              </div>
              {order.note && (
                <div style={{ marginTop: "20px" }}>
                  <DetailItem label="Ghi chú đơn hàng" value={order.note} />
                </div>
              )}
            </div>
          </div>

          <div style={styles.sideBar}>
            <div style={styles.qrCard}>
              <h3 style={styles.qrTitle}>Mã tra cứu nhanh</h3>
              {qrUrl ? (
                <img src={qrUrl} alt="QR" style={styles.qrImg} />
              ) : (
                <div style={styles.qrPlaceholder}>Không có mã QR</div>
              )}
              <p style={styles.qrHint}>Quét mã để kiểm tra trạng thái đơn hàng</p>
            </div>

            <div style={styles.priceCard}>
              <div style={styles.priceRow}>
                <span>Phí vận chuyển</span>
                <span>{Number(order.price || 0).toLocaleString()} ₫</span>
              </div>
              <div style={styles.totalRow}>
                <span>Tổng cộng</span>
                <span style={styles.finalPrice}>{Number(order.price || 0).toLocaleString()} ₫</span>
              </div>
              <p style={styles.emailNote}>* Chi tiết hóa đơn đã được gửi về email của bạn.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div style={styles.detailItem}>
    <span style={styles.detailLabel}>{label}</span>
    <span style={styles.detailValue}>{value || "---"}</span>
  </div>
);

const styles = {
  page: { background: "#F1F5F9", minHeight: "100vh", padding: "40px 20px" },
  container: { maxWidth: "1000px", margin: "0 auto", background: "#fff", borderRadius: "24px", padding: "40px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  backBtn: { background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: "16px", fontWeight: "600" },
  statusBadge: { background: "#E0F2FE", color: "#0369A1", padding: "8px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "700" },
  title: { fontSize: "28px", fontWeight: "900", color: "#1E293B", margin: 0 },
  orderIdText: { color: "#94A3B8", fontSize: "14px", marginTop: "5px" },
  contentGrid: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "40px", marginTop: "40px" },
  sectionTitle: { fontSize: "18px", fontWeight: "700", color: "#334155", marginBottom: "20px", borderLeft: "4px solid #0F4C75", paddingLeft: "15px" },
  routeBox: { background: "#F8FAFC", padding: "25px", borderRadius: "16px", position: "relative" },
  routePoint: { display: "flex", gap: "15px", alignItems: "flex-start", marginBottom: "20px" },
  dotGreen: { width: "12px", height: "12px", borderRadius: "50%", background: "#22C55E", marginTop: "5px" },
  dotRed: { width: "12px", height: "12px", borderRadius: "50%", background: "#EF4444", marginTop: "5px" },
  routeLine: { position: "absolute", left: "30px", top: "45px", bottom: "50px", width: "1px", borderLeft: "2px dashed #CBD5E1" },
  addressText: { color: "#64748B", margin: "5px 0 0 0", fontSize: "14px", lineHeight: "1.4" },
  grid2Col: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  detailItem: { display: "flex", flexDirection: "column" },
  detailLabel: { fontSize: "12px", color: "#94A3B8", textTransform: "uppercase", fontWeight: "600" },
  detailValue: { fontSize: "15px", color: "#1E293B", fontWeight: "600", marginTop: "4px" },
  sideBar: { display: "flex", flexDirection: "column", gap: "25px" },
  qrCard: { background: "#fff", border: "1px solid #E2E8F0", padding: "25px", borderRadius: "16px", textAlign: "center" },
  qrTitle: { fontSize: "15px", fontWeight: "700", marginBottom: "15px" },
  qrImg: { width: "160px", height: "160px", padding: "10px", border: "1px solid #F1F5F9", borderRadius: "8px" },
  qrPlaceholder: { width: "160px", height: "160px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "#94a3b8" },
  qrHint: { fontSize: "12px", color: "#94A3B8", marginTop: "10px" },
  priceCard: { background: "#0F4C75", color: "#fff", padding: "25px", borderRadius: "16px" },
  priceRow: { display: "flex", justifyContent: "space-between", fontSize: "14px", opacity: 0.8, marginBottom: "15px" },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "15px" },
  finalPrice: { fontSize: "24px", fontWeight: "800" },
  emailNote: { fontSize: "11px", fontStyle: "italic", marginTop: "15px", opacity: 0.7, textAlign: "center" },
  loading: { textAlign: "center", padding: "100px", color: "#64748B" },
  error: { textAlign: "center", padding: "100px", color: "#EF4444", fontWeight: "bold" }
};

export default OrderDetail;