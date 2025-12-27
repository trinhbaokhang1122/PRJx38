import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/orders/all");
      setOrders(res.data || []);
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetail = async (id) => {
    try {
      const res = await axiosClient.get(`/orders/${id}`);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error("Lỗi khi tải chi tiết đơn:", err);
      alert("Không thể tải chi tiết đơn hàng.");
    }
  };
  const closeModal = () => setSelectedOrder(null);
  const handleChangeStatus = async (id, status) => {
    try {
      await axiosClient.put(`/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert("Cập nhật trạng thái thất bại.");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn này không?")) return;
    try {
      await axiosClient.delete(`/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error("Lỗi khi xóa đơn:", err);
      alert("Xóa đơn thất bại.");
    }
  };

  if (loading) return <div className="bg-white p-4 rounded">Đang tải đơn hàng...</div>;

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <h2 className="text-2xl font-bold mb-3">📦 Quản lý đơn hàng</h2>

      {orders.length === 0 ? (
        <p>Không có đơn hàng.</p>
      ) : (
        <div className="space-y-3 max-h-[520px] overflow-auto">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border p-3 rounded flex justify-between items-start hover:bg-gray-50 transition"
            >
              <div>
                <div>
                  <strong>ID:</strong>{" "}
                  <span
                    onClick={() => handleViewDetail(order._id)} 
                    style={{ cursor: "pointer", color: "#000", textDecoration: "none" }}
                  >
                    {order._id}
                  </span>
                </div>
                <div className="text-sm">
                  <strong>Người tạo:</strong>{" "}
                  {order.user?.full_name || order.user?.email || order.user}
                </div>
                <div className="text-sm">
                  <strong>Người nhận:</strong> {order.receiver_name}
                </div>
                <div className="text-sm">
                  <strong>Giá:</strong>{" "}
                  {Number(order.price || order.totalPrice || 0).toLocaleString()} VNĐ
                </div>
                <div className="text-sm">
                  <strong>Trạng thái:</strong> {order.status}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleChangeStatus(order._id, "shipping")}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Đang giao
                  </button>
                  <button
                    onClick={() => handleChangeStatus(order._id, "delivered")}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Đã giao
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(order._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-bold mb-3">📦 Chi tiết đơn hàng</h3>
            <p><strong>Mã đơn:</strong> {selectedOrder._id}</p>
            <p><strong>Người tạo:</strong> {selectedOrder.user?.full_name || selectedOrder.user?.email}</p>
            <p><strong>Người nhận:</strong> {selectedOrder.receiver_name}</p>
            <p><strong>SĐT người nhận:</strong> {selectedOrder.receiver_phone}</p>
            <p><strong>Địa chỉ giao:</strong> {selectedOrder.receiver_address}</p>
            <p><strong>Giá:</strong> {Number(selectedOrder.totalPrice || selectedOrder.price || 0).toLocaleString()} VNĐ</p>
            <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
            <p><strong>Ngày tạo:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>

            <button
              onClick={closeModal}
              className="mt-4 bg-gray-700 text-white px-4 py-2 rounded"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
