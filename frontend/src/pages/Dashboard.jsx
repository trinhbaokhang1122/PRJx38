import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard() {
  const [labels, setLabels] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const date = new Date().toISOString().split("T")[0];
      const res = await axiosClient.get(`/orders/stats/all?date=${date}`);
      const d = res.data;

      const labelsFixed = ["Sáng (00h-11h)", "Trưa (11h-17h)", "Tối (17h-24h)"];
      const revenueFixed = [d.morning.revenue, d.noon.revenue, d.evening.revenue];
      const ordersFixed = [d.morning.count, d.noon.count, d.evening.count];

      setLabels(labelsFixed);
      setRevenue(revenueFixed);
      setOrders(ordersFixed);
    } catch (err) {
      console.log("Lỗi lấy dữ liệu", err);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = (unit, step, max) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { weight: "500" } } },
      y: {
        beginAtZero: true,
        suggestedMax: max,
        ticks: {
          stepSize: step,
          callback: (v) => v.toLocaleString("vi-VN") + ` ${unit}`,
        },
      },
    },
  });

  const numberFormat = (num) => num?.toLocaleString("vi-VN") + " ₫";

  if (loading) return <div style={loadingStyle}>Đang tải dữ liệu phân tích...</div>;

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>📊 Dashboard Thống Kê</h1>
        <p style={subtitleStyle}>Theo dõi doanh thu và lượng đơn hàng trong ngày</p>
      </header>

      <div style={gridStyle}>
        <div style={boxStyle}>
          <div style={iconHeader}>
            <span style={{ fontSize: 24 }}>💰</span>
            <h2 style={boxTitle}>Doanh thu hôm nay</h2>
          </div>
          <div style={valueTextRevenue}>
            {numberFormat(revenue.reduce((a, b) => a + b, 0))}
          </div>
          <div style={chartContainer}>
            <Bar
              data={{
                labels,
                datasets: [{
                  data: revenue,
                  backgroundColor: "#3b82f6",
                  hoverBackgroundColor: "#2563eb",
                  borderRadius: 6,
                  barThickness: 40,
                }],
              }}
              options={chartOptions("₫", 200000, 1000000)}
            />
          </div>
        </div>

        <div style={boxStyle}>
          <div style={iconHeader}>
            <span style={{ fontSize: 24 }}>📦</span>
            <h2 style={boxTitle}>Số đơn hôm nay</h2>
          </div>
          <div style={valueTextOrders}>
            {orders.reduce((a, b) => a + b, 0)} <span style={{ fontSize: 18, fontWeight: 500 }}>đơn</span>
          </div>
          <div style={chartContainer}>
            <Bar
              data={{
                labels,
                datasets: [{
                  data: orders,
                  backgroundColor: "#10b981",
                  hoverBackgroundColor: "#059669",
                  borderRadius: 6,
                  barThickness: 40,
                }],
              }}
              options={chartOptions("đơn", 5, 20)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


const containerStyle = {
  padding: "40px 20px",
  backgroundColor: "#f8fafc",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif",
};

const headerStyle = {
  marginBottom: "30px",
  textAlign: "center",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#1e293b",
  margin: 0,
};

const subtitleStyle = {
  color: "#64748b",
  marginTop: "5px",
};

const gridStyle = {
  display: "flex",
  gap: "25px",
  maxWidth: "1200px",
  margin: "0 auto",
  flexWrap: "wrap",
};

const boxStyle = {
  flex: 1,
  minWidth: "400px",
  backgroundColor: "#ffffff",
  padding: "24px",
  borderRadius: "16px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const iconHeader = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "15px",
};

const boxTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#475569",
  margin: 0,
};

const valueTextRevenue = {
  fontSize: "36px",
  fontWeight: "800",
  color: "#3b82f6",
  marginBottom: "20px",
};

const valueTextOrders = {
  fontSize: "36px",
  fontWeight: "800",
  color: "#10b981",
  marginBottom: "20px",
};

const chartContainer = {
  height: "280px",
  width: "100%",
};

const loadingStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  fontSize: "18px",
  color: "#64748b",
};