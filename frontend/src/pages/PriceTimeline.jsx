import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const PriceTimeline = () => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/prices/timeline");
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTimeline(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = {
    labels: timeline.map((i) =>
      new Date(i.createdAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    ),
    datasets: [
      {
        label: "Giá cố định",                    
        data: timeline.map((i) => i.base_price),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.15)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#1d4ed8",
        pointBorderColor: "#fff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 9,
        borderWidth: 4,
      },
      {
        label: "Giá/km",                          
        data: timeline.map((i) => i.per_km_price),
        borderColor: "#dc2626",
        backgroundColor: "rgba(220, 38, 38, 0.15)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#b91c1c",
        pointBorderColor: "#fff",
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 9,
        borderWidth: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200 },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 16, weight: "bold" },
          padding: 30,
          usePointStyle: true,
          pointStyle: "circle",
          color: "#1f2937",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleFont: { size: 15, weight: "bold" },
        bodyFont: { size: 16 },
        padding: 14,
        cornerRadius: 10,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} ₫`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          font: { size: 14, weight: "bold" },
          color: "#374151",
          callback: (value) => value.toLocaleString() + " ₫",
          padding: 10,
        },
        grid: { color: "rgba(0, 0, 0, 0.1)", lineWidth: 1.5 },
      },
      x: {
        ticks: {
          font: { size: 13, weight: "bold" },
          color: "#374151",
        },
        grid: { display: false },
      },
    },
  };

  return (
    <div style={{ maxWidth: 1100, margin: "20px auto", padding: "0 16px" }}>
      <h2 style={{ textAlign: "center", marginBottom: 30, color: "#1e40af", fontSize: "2rem", fontWeight: "bold" }}>
        LỊCH SỬ THAY ĐỔI GIÁ CƯỚC
      </h2>

      <div
        style={{
          background: "#ffffff",
          padding: "30px 24px",
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          marginBottom: 50,
          height: 500,
          border: "1px solid #e5e7eb",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 150, fontSize: 18, color: "#666" }}>
            Đang tải biểu đồ...
          </div>
        ) : timeline.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 150, color: "#999", fontSize: 18 }}>
            Chưa có dữ liệu giá
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
      <h3 style={{ margin: "40px 0 20px", color: "#1e40af", fontWeight: "bold" }}>
        Chi tiết các lần cập nhật
      </h3>

      {timeline.map((item, index) => {
        const prev = timeline[index + 1];
        return (
          <div
            key={item._id}
            style={{
              background: "#fff",
              padding: 20,
              margin: "16px 0",
              borderRadius: 14,
              borderLeft: "6px solid #2563eb",
              boxShadow: "0 4px 15px rgba(37,99,235,0.1)",
            }}
          >
            <h4 style={{ margin: "0 0 12px", color: "#1e40af", fontWeight: "bold" }}>
              {new Date(item.createdAt).toLocaleString("vi-VN")}
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              <p style={{ margin: 0, fontSize: "1.05em" }}>
                <strong>Giá :</strong>{" "}
                <span style={{ fontWeight: "bold", color: "#1d4ed8" }}>
                  {item.base_price.toLocaleString()} ₫
                </span>{" "}
                {prev && (
                  <span style={{ fontWeight: "bold", color: item.base_price > prev.base_price ? "#dc2626" : "#16a34a" }}>
                    {item.base_price > prev.base_price ? "Tăng" : "Giảm"} {Math.abs(item.base_price - prev.base_price).toLocaleString()}
                  </span>
                )}
              </p>

              <p style={{ margin: 0, fontSize: "1.05em" }}>
                <strong>Giá/km:</strong>{" "}
                <span style={{ fontWeight: "bold", color: "#dc2626" }}>
                  {item.per_km_price.toLocaleString()} ₫
                </span>{" "}
                {prev && (
                  <span style={{ fontWeight: "bold", color: item.per_km_price > prev.per_km_price ? "#dc2626" : "#16a34a" }}>
                    {item.per_km_price > prev.per_km_price ? "Tăng" : "Giảm"} {Math.abs(item.per_km_price - prev.per_km_price).toLocaleString()}
                  </span>
                )}
              </p>

              <p style={{ margin: 0 }}><strong>Phụ phí quá tải:</strong> {item.overweight_fee?.toLocaleString() || 0} ₫</p>
              <p style={{ margin: 0 }}><strong>Phí giao nhanh:</strong> {item.express_fee?.toLocaleString() || 0} ₫</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PriceTimeline;