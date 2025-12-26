// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// 🔥 Import thêm 2 trang mới
import ForgotPassword from "./pages/ForgotPassword"; 
import ResetPassword from "./pages/ResetPassword";

import OrderList from "./pages/OrderList";
import OrderDetail from "./pages/OrderDetail";
import CreateOrder from "./pages/CreateOrder";

import AdminPanel from "./pages/AdminPanel";
import CreateTeam from "./pages/CreateTeam";
import Profile from "./pages/Profile";

// 🔥 Bảng giá
import PriceList from "./pages/PriceList";
import PriceManager from "./pages/PriceManager";
import PriceTimeline from "./pages/PriceTimeline";

// 🔥 Dashboard (biểu đồ)
import Dashboard from "./pages/Dashboard";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />

        <main style={{ minHeight: "80vh", padding: "20px" }}>
          <Routes>
            {/* Trang chủ */}
            <Route path="/" element={<Home />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ⭐ CÁC ROUTE MỚI CHO QUÊN MẬT KHẨU ⭐ */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Đơn hàng */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-order"
              element={
                <ProtectedRoute>
                  <CreateOrder />
                </ProtectedRoute>
              }
            />

            {/* Trang quản trị */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Bảng giá – Admin chỉnh sửa */}
            <Route
              path="/admin/prices"
              element={
                <ProtectedRoute adminOnly>
                  <PriceManager />
                </ProtectedRoute>
              }
            />

            {/* 🔥 Lịch sử giá dành cho khách xem */}
            <Route path="/price-timeline" element={<PriceTimeline />} />

            {/* Trang giá đơn giản */}
            <Route path="/prices" element={<PriceList />} />

            {/* 🔥 Dashboard biểu đồ */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Tạo đội nhóm */}
            <Route
              path="/create-team"
              element={
                <ProtectedRoute>
                  <CreateTeam />
                </ProtectedRoute>
              }
            />

            {/* Hồ sơ tài khoản */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;