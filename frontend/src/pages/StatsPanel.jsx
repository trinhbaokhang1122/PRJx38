import React from "react";

const StatsPanel = ({ stats }) => {
  const { totalTeams, totalOrders, deliveredOrders, pendingOrders, canceledOrders } = stats;
  const cards = [
    { label: "Tổng đội vận chuyển", value: totalTeams },
    { label: "Tổng đơn hàng", value: totalOrders },
    { label: "Đã giao", value: deliveredOrders },
    { label: "Đang chờ/đang vận chuyển", value: pendingOrders },
    { label: "Đã huỷ", value: canceledOrders },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white shadow-md rounded-xl p-4 text-center border">
          <h3 className="text-sm text-gray-500">{c.label}</h3>
          <p className="text-2xl font-bold mt-2 text-blue-600">{c.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsPanel;
