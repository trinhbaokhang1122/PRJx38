import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";


const TeamsManager = () => {
  const [teams, setTeams] = useState([]);
  const [orders, setOrders] = useState([]); // toàn bộ đơn (admin)
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsRes, ordersRes] = await Promise.all([
        axiosClient.get("/teams"),
        axiosClient.get("/orders/all"),
      ]);
      setTeams(teamsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Lỗi khi tải teams/orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (teamId) => {
    try {
      await axiosClient.put(`/teams/approve/${teamId}`);
      setTeams((prev) => prev.map((t) => (t._id === teamId ? { ...t, status: "approved" } : t)));
      if (selectedTeam && selectedTeam._id === teamId) setSelectedTeam({ ...selectedTeam, status: "approved" });
    } catch (err) {
      console.error("Lỗi khi duyệt đội:", err);
      alert("Duyệt đội thất bại.");
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đội này không?")) return;
    try {
      await axiosClient.delete(`/teams/${teamId}`);
      setTeams((prev) => prev.filter((t) => t._id !== teamId));
      if (selectedTeam && selectedTeam._id === teamId) setSelectedTeam(null);
    } catch (err) {
      console.error("Lỗi khi xóa đội:", err);
      alert("Xóa đội thất bại.");
    }
  };

  const getOrdersOfOwner = (team) => {
    if (!team) return [];
    const ownerId = team.owner && (team.owner._id || team.owner);
    if (!ownerId) return [];
    return orders.filter((o) => {
      const ou = o.user;
      const ouId = ou && (ou._id || ou);
      return ouId && ouId.toString() === ownerId.toString();
    });
  };

  if (loading) return <div className="bg-white p-4 rounded">Đang tải danh sách đội...</div>;

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h2 className="text-2xl font-bold mb-3">🚚 Quản lý đội vận chuyển</h2>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2 border rounded p-3 overflow-auto" style={{ maxHeight: 520 }}>
          <h3 className="font-semibold mb-2">Danh sách đội ({teams.length})</h3>

          {teams.length === 0 ? (
            <p>Không có đội nào.</p>
          ) : (
            teams.map((team) => (
              <div key={team._id} className="p-3 mb-2 border rounded hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{team.team_name}</div>
                    <div className="text-sm text-gray-600">
                      Chủ đội: {team.owner?.full_name || team.owner?.email || "—"}
                    </div>
                    <div className="text-sm mt-1">
                      Khu vực: {team.region || "—"} • {team.vehicle_type || "—"}
                    </div>
                    <div className="text-sm mt-1">
                      Trạng thái:{" "}
                      <span className={team.status === "approved" ? "text-green-600" : "text-orange-500"}>
                        {team.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedTeam(team)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Xem
                    </button>
                    {team.status !== "approved" && (
                      <button
                        onClick={() => handleApprove(team._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Duyệt
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(team._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="md:w-1/2 border rounded p-3 overflow-auto" style={{ maxHeight: 520 }}>
          {selectedTeam ? (
            <>
              <h3 className="text-lg font-semibold mb-2">Chi tiết đội</h3>
              <p><strong>Tên đội:</strong> {selectedTeam.team_name}</p>
              <p><strong>Mô tả:</strong> {selectedTeam.description || "—"}</p>
              <p><strong>Phương tiện:</strong> {selectedTeam.vehicle_type || "—"}</p>
              <p><strong>Khu vực:</strong> {selectedTeam.region || "—"}</p>
              <p className="mt-2"><strong>Chủ đội:</strong> {selectedTeam.owner?.full_name || selectedTeam.owner?.email || "—"}</p>
              <p className="mt-2"><strong>Trạng thái:</strong> {selectedTeam.status}</p>

              <hr className="my-3" />

              <div className="mb-3">
                <p><strong>Tổng đội hiện có:</strong> {teams.length}</p>
                <p><strong>Tổng đơn toàn hệ thống:</strong> {orders.length}</p>

                <p className="mt-2">
                  <strong>Đơn do chủ đội ({selectedTeam.owner?.full_name || "—"}) gửi:</strong>{" "}
                  {getOrdersOfOwner(selectedTeam).length}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Danh sách đơn của chủ đội</h4>
                {getOrdersOfOwner(selectedTeam).length === 0 ? (
                  <p>Chưa có đơn nào từ tài khoản này.</p>
                ) : (
                  getOrdersOfOwner(selectedTeam).map((o) => (
                    <div key={o._id} className="p-2 mb-2 border rounded">
                      <div className="text-sm"><strong>Mã:</strong> {o._id}</div>
                      <div className="text-sm"><strong>Người nhận:</strong> {o.receiver_name}</div>
                      <div className="text-sm"><strong>Trạng thái:</strong> {o.status}</div>
                      <div className="text-sm"><strong>Giá:</strong> {Number(o.price || o.totalPrice || 0).toLocaleString()} VNĐ</div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <p>Chọn một đội ở cột bên trái để xem chi tiết.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamsManager;
