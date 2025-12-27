import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [teams, setTeams] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 30;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Không tìm thấy token");
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [teamsResponse, ordersResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/teams", config),
          axios.get("http://localhost:5000/api/orders/all", config),
        ]);

        setTeams(teamsResponse.data || []);
        setOrders(ordersResponse.data || []);
      } catch (error) {
        console.error("❌ Lỗi tải dữ liệu admin:", error.response?.data || error.message);
        alert("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc đăng nhập lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    document
      .getElementById("orders-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const approveTeam = async (teamId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/teams/approve/${teamId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTeams((prev) =>
        prev.map((team) =>
          team._id === teamId ? { ...team, status: "approved" } : team
        )
      );
    } catch (error) {
      console.error("❌ Lỗi duyệt đội:", error);
      alert("Không thể duyệt đội. Vui lòng thử lại.");
    }
  };

  const confirmDeleteTeam = (teamId) => {
    setTeamToDelete(teamId);
    setShowDeleteModal(true);
  };

  const deleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/teams/${teamToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTeams((prev) => prev.filter((t) => t._id !== teamToDelete));
      setShowDeleteModal(false);
      setTeamToDelete(null);
    } catch (error) {
      console.error("❌ Lỗi xóa đội:", error);
      alert("Không thể xóa đội. Vui lòng thử lại.");
    }
  };

  const getOrderStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "assigned":
        return "Đã giao đội";
      case "in_transit":
        return "Đang giao";
      case "delivered":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status || "Không xác định";
    }
  };

  if (loading) {
    return <div style={styles.loading}>Đang tải dữ liệu hệ thống...</div>;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h2 style={styles.mainTitle}>🛠 Quản trị Hệ thống</h2>
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Tổng đội xe</span>
            <span style={styles.statValue}>{teams.length}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Tổng đơn hàng</span>
            <span style={styles.statValue}>{orders.length}</span>
          </div>
        </div>
      </header>

      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>🚚 Danh sách đội vận chuyển</h3>
        {teams.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", padding: "40px 0" }}>
            Chưa có đội vận chuyển nào đăng ký.
          </p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Tên đội</th>
                  <th style={styles.th}>Trưởng đội</th>
                  <th style={styles.th}>Thành viên</th>
                  <th style={styles.th}>Khu vực</th>
                  <th style={styles.th}>Trạng thái</th>
                  <th style={styles.th}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team._id} style={styles.tr}>
                    <td
                      style={styles.tdPrimary}
                      onClick={() => setSelectedTeam(team)}
                    >
                      {team.team_name || team.name || "Chưa đặt tên"}
                    </td>
                    <td style={styles.td}>
                      {team.owner?.full_name || "Không xác định"}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {team.member_count || 0}
                    </td>
                    <td style={styles.td}>{team.region || "-"}</td>
                    <td style={styles.td}>
                      <span
                        style={
                          team.status === "approved"
                            ? styles.badgeApproved
                            : styles.badgePending
                        }
                      >
                        {team.status === "approved" ? "● Đã duyệt" : "● Chờ duyệt"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.btnGroup}>
                        {team.status !== "approved" && (
                          <button
                            onClick={() => approveTeam(team._id)}
                            style={styles.btnApprove}
                          >
                            Duyệt
                          </button>
                        )}
                        <button
                          onClick={() => confirmDeleteTeam(team._id)}
                          style={styles.btnDelete}
                        >
                          Sa thải
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="orders-section" style={styles.section}>
        <h3 style={styles.sectionTitle}>📦 Danh sách vận đơn</h3>
        {orders.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", padding: "40px 0" }}>
            Chưa có đơn hàng nào được tạo.
          </p>
        ) : (
          <>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Mã đơn</th>
                    <th style={styles.th}>Người tạo</th>
                    <th style={styles.th}>Giá</th>
                    <th style={styles.th}>Ngày tạo</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={styles.th}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr key={order._id} style={styles.tr}>
                      <td style={styles.idText}>
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td style={styles.td}>
                        {order.user?.full_name || "Ẩn danh"}
                      </td>
                      <td style={styles.priceText}>
                        {order.price?.toLocaleString() || 0}₫
                      </td>
                      <td style={styles.td}>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge(order.status)}>
                          {getOrderStatusText(order.status)}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={styles.btnDetail}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => paginate(currentPage - 1)}
                  style={styles.pageArrow}
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    style={{
                      ...styles.pageNumber,
                      backgroundColor:
                        currentPage === i + 1 ? "#007bff" : "#fff",
                      color: currentPage === i + 1 ? "#fff" : "#333",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => paginate(currentPage + 1)}
                  style={styles.pageArrow}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {selectedTeam && (
        <div style={styles.overlay} onClick={() => setSelectedTeam(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
              🔍 {selectedTeam.team_name || selectedTeam.name}
            </h2>
            <div style={styles.modalContent}>
              <p>
                <b>Trưởng đội:</b> {selectedTeam.owner?.full_name || "Không xác định"}
              </p>
              <p>
                <b>Khu vực:</b> {selectedTeam.region || "Toàn quốc"}
              </p>
              <p>
                <b>Mô tả:</b> {selectedTeam.description || "Không có mô tả"}
              </p>
              <p>
                <b>Giá cơ bản:</b> {selectedTeam.price?.toLocaleString() || 0}₫
              </p>
            </div>
            <button
              onClick={() => setSelectedTeam(null)}
              style={styles.btnClose}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
      {selectedOrder && (
        <div style={styles.overlay} onClick={() => setSelectedOrder(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
              📦 Chi tiết đơn hàng
            </h2>
            <div style={styles.modalContent}>
              <p>
                <b>Mã đơn:</b> {selectedOrder._id}
              </p>
              <p>
                <b>Người nhận:</b> {selectedOrder.receiver_name}
              </p>
              <p>
                <b>Số điện thoại:</b> {selectedOrder.receiver_phone}
              </p>
              <p>
                <b>Địa chỉ giao:</b> {selectedOrder.delivery_address}, {selectedOrder.delivery_province}
              </p>
              <p>
                <b>Giá tiền:</b> {selectedOrder.price?.toLocaleString()}₫
              </p>
              <p>
                <b>Trạng thái:</b> {getOrderStatusText(selectedOrder.status)}
              </p>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              style={styles.btnClose}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div style={styles.overlay}>
          <div style={styles.confirmModal}>
            <h3>Xác nhận sa thải đội</h3>
            <p>
              Hành động này <strong>không thể hoàn tác</strong>. Bạn có chắc chắn muốn loại bỏ đội này khỏi hệ thống?
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={deleteTeam} style={styles.btnConfirm}>
                Đồng ý, sa thải
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={styles.btnCancel}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { background: "#f0f2f5", minHeight: "100vh", padding: "40px 20px", fontFamily: "'Inter', system-ui, sans-serif" },
  header: { maxWidth: "1100px", margin: "0 auto 30px auto", display: "flex", justifyContent: "space-between", alignItems: "center" },
  mainTitle: { fontSize: "26px", fontWeight: "800", color: "#1a1a1a", margin: 0 },
  statsContainer: { display: "flex", gap: "15px" },
  statCard: { background: "#fff", padding: "12px 20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" },
  statLabel: { fontSize: "12px", color: "#666", fontWeight: "600", textTransform: "uppercase" },
  statValue: { fontSize: "20px", fontWeight: "800", color: "#007bff" },
  section: { maxWidth: "1100px", margin: "0 auto 40px auto", background: "#fff", padding: "25px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
  sectionTitle: { fontSize: "18px", fontWeight: "700", marginBottom: "20px", color: "#333", borderLeft: "4px solid #007bff", paddingLeft: "12px" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "800px" },
  th: { textAlign: "left", padding: "12px", background: "#f8f9fa", color: "#666", fontWeight: "600", borderBottom: "2px solid #edf2f7" },
  tr: { borderBottom: "1px solid #edf2f7", transition: "0.2s" },
  td: { padding: "14px 12px", fontSize: "14px", color: "#444" },
  tdPrimary: { padding: "14px 12px", fontSize: "14px", color: "#007bff", fontWeight: "600", cursor: "pointer" },
  idText: { fontFamily: "monospace", fontSize: "13px", color: "#777" },
  priceText: { fontWeight: "700", color: "#2d3436" },
  badgeApproved: { background: "#e1f7e9", color: "#155724", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  badgePending: { background: "#fff3cd", color: "#856404", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  btnGroup: { display: "flex", gap: "8px" },
  btnApprove: { background: "#28a745", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" },
  btnDelete: { background: "#dc3545", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" },
  btnDetail: { background: "#f0f2f5", color: "#333", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" },
  statusBadge: (status) => ({
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    background:
      status === "delivered"
        ? "#d4edda"
        : status === "pending" || status === "assigned"
        ? "#fff3cd"
        : "#f8d7da",
    color:
      status === "delivered"
        ? "#155724"
        : status === "pending" || status === "assigned"
        ? "#856404"
        : "#721c24",
  }),
  pagination: { display: "flex", justifyContent: "center", gap: "6px", marginTop: "25px" },
  pageNumber: { width: "35px", height: "35px", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  pageArrow: { padding: "0 15px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff", cursor: "pointer" },
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#fff", padding: "30px", borderRadius: "16px", width: "420px", maxWidth: "90vw", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" },
  modalContent: { margin: "20px 0", lineHeight: "1.8", color: "#444" },
  btnClose: { width: "100%", padding: "12px", background: "#6c757d", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  confirmModal: { background: "#fff", padding: "30px", borderRadius: "16px", width: "380px", maxWidth: "90vw", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" },
  btnConfirm: { background: "#dc3545", color: "#fff", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  btnCancel: { background: "#f0f2f5", color: "#333", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  loading: { textAlign: "center", marginTop: "100px", fontSize: "18px", fontWeight: "600", color: "#666" },
};

export default AdminPanel;