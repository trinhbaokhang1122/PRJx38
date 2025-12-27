import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openCancelModal = (id) => {
    setOrderToCancel(id);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/orders/${orderToCancel}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) => prev.filter((o) => o._id !== orderToCancel));
      setShowCancelModal(false);
    } catch (err) {
      console.error(err);
      setShowCancelModal(false);
    }
  };

  if (loading)
    return <p style={styles.loading}>⏳ Đang tải...</p>;
  if (error)
    return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📦 Danh sách đơn hàng của bạn</h1>

      {orders.length === 0 ? (
        <p style={styles.noOrders}>Bạn chưa có đơn hàng nào.</p>
      ) : (
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>Người nhận</th>
              <th style={styles.th}>Loại hàng</th>
              <th style={styles.th}>Giá</th>
              <th style={styles.th}>Trạng thái</th>
              <th style={styles.th}>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id} style={styles.tr}>
                <td style={styles.tdCenter}>{order.receiver_name}</td>
                <td style={styles.tdCenter}>{order.package_type}</td>
                <td style={styles.tdCenter}>{order.price.toLocaleString()} đ</td>

                <td
                  style={{
                    ...styles.tdCenter,
                    ...styles.status,
                    ...(order.status === "pending"
                      ? styles.statusPending
                      : order.status === "canceled"
                      ? styles.statusCanceled
                      : order.status === "delivered"
                      ? styles.statusDelivered
                      : styles.statusOther),
                  }}
                >
                  {order.status}
                </td>

                <td style={styles.tdAction}>
                  <Link to={`/orders/${order._id}`} style={styles.btnView}>
                    Xem
                  </Link>

                  {order.status !== "canceled" &&
                    order.status !== "delivered" && (
                      <button
                        onClick={() => openCancelModal(order._id)}
                        style={styles.btnCancel}
                      >
                        Hủy
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showCancelModal && (
        <div style={modal.overlay}>
          <div style={modal.box}>
            <h3 style={{ marginTop: 0 }}>Xác nhận</h3>
            <p>Bạn có chắc chắn muốn <b style={{ color: "red" }}>HỦY</b> đơn hàng này?</p>

            <div style={modal.btnWrap}>
              <button style={modal.btnConfirm} onClick={confirmCancel}>
                Đồng ý
              </button>

              <button
                style={modal.btnCancel}
                onClick={() => setShowCancelModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>

          <style>
            {`
              @keyframes fadeIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
              }
            `}
          </style>
        </div>
      )}
    </div>
  );
}


const styles = {
  container: {
    maxWidth: 960,
    margin: "2rem auto",
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: 10,
    boxShadow: "0 3px 12px rgb(0 0 0 / 0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#222",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "1.25rem",
  },
  noOrders: {
    textAlign: "center",
    color: "#666",
    fontSize: "1rem",
    padding: "2rem 0",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    fontSize: "1.2rem",
    color: "#999",
  },
  error: {
    textAlign: "center",
    padding: "3rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#d32f2f",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #d1d5db",
    fontSize: "1rem",
  },
  thead: {
    backgroundColor: "#f3f4f6",
    fontWeight: "600",
    textAlign: "center",
    color: "#374151",
  },
  th: {
    padding: "0.75rem 1rem",
    border: "1px solid #d1d5db",
  },
  tr: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s",
  },
  tdCenter: {
    border: "1px solid #d1d5db",
    padding: "0.75rem 1rem",
    textAlign: "center",
  },
  tdAction: {
    border: "1px solid #d1d5db",
    padding: "0.75rem 1rem",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
  },
  btnView: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    borderRadius: 6,
    padding: "0.4rem 0.9rem",
    textDecoration: "none",
    fontWeight: "600",
  },
  btnCancel: {
    backgroundColor: "#ef4444",
    color: "#fff",
    borderRadius: 6,
    padding: "0.4rem 0.9rem",
    cursor: "pointer",
    fontWeight: "600",
  },
  status: { fontWeight: "700" },
  statusPending: { color: "#ca8a04" },
  statusCanceled: { color: "#dc2626" },
  statusDelivered: { color: "#16a34a" },
  statusOther: { color: "#2563eb" },
};


const modal = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  box: {
    background: "#fff",
    padding: "25px",
    width: "360px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    animation: "fadeIn .2s ease",
  },
  btnWrap: {
    marginTop: "20px",
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  btnConfirm: {
    padding: "8px 20px",
    background: "#e53935",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  btnCancel: {
    padding: "8px 20px",
    background: "#9e9e9e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default OrderList;
