import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";

const provinces = [
  "Hà Nội", "TP Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
  "Bình Dương", "Đồng Nai", "Bắc Ninh", "Quảng Ninh", "Thanh Hóa",
  "Nghệ An", "Khánh Hòa", "Lâm Đồng", "Bình Thuận", "Long An", "An Giang",
  "Tiền Giang", "Vĩnh Long", "Kiên Giang", "Bình Phước", "Thừa Thiên Huế",
  "Bình Định", "Phú Yên", "Bến Tre", "Sóc Trăng", "Trà Vinh", "Cà Mau",
  "Hậu Giang", "Kon Tum", "Gia Lai", "Đắk Lắk", "Đắk Nông", "Quảng Nam",
  "Quảng Ngãi", "Quảng Trị", "Hà Tĩnh", "Nam Định", "Ninh Bình", "Hòa Bình",
  "Sơn La", "Điện Biên", "Lào Cai", "Yên Bái", "Tuyên Quang", "Bắc Giang",
  "Thái Nguyên", "Vĩnh Phúc", "Phú Thọ", "Hà Nam", "Bắc Kạn", "Cao Bằng", "Lạng Sơn",
];

const GRAPHHOPPER_KEY = "c373255e-7b77-4d8d-8e3c-e06d5116305f";

const CreateOrder = () => {
  const navigate = useNavigate();

  const [priceConfig, setPriceConfig] = useState(null);
  const [form, setForm] = useState({
    sender_name: "", sender_phone: "", pickup_address: "", pickup_province: "",
    receiver_name: "", receiver_phone: "", delivery_address: "", delivery_province: "",
    package_type: "Hàng hóa thông thường", description: "", weight_kg: "", declared_value: "",
    vehicle_type: "Xe máy", service_type: "Trọn gói",
    floors: "", workers: 1, distance_to_truck: "", note: "",
  });

  const [distance, setDistance] = useState(null);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [paypalLoading, setPaypalLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosClient.get("/prices");
        const payload = res.data?.data ?? res.data;
        let cfg = null;
        if (Array.isArray(payload)) cfg = payload[0] ?? null;
        else cfg = payload ?? null;
        setPriceConfig(cfg);
      } catch (err) {
        console.error("Không tải được bảng giá:", err);
        setMessage("Không tải được bảng giá hệ thống");
      }
    };
    load();
  }, []);

  const getCoordinates = async (address) => {
    try {
      if (!address || address.length < 5) return null;
      const tryFetch = async (q) => {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=VN&limit=1&q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        return null;
      };
      let r = await tryFetch(address);
      if (r) return r;
      return await tryFetch(address.replace(/,?\s*Việt Nam/i, ""));
    } catch { return null; }
  };

  const estimateRoute = async (pickup, delivery) => {
    try {
      if (!pickup || !delivery) return 0;
      const url = `https://graphhopper.com/api/1/route?point=${pickup.lat},${pickup.lon}&point=${delivery.lat},${delivery.lon}&vehicle=car&locale=vi&calc_points=false&key=${GRAPHHOPPER_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      return data?.paths?.[0]?.distance || 0;
    } catch (err) {
      return 0;
    }
  };

  const calculatePrice = (distMeters, weightKg, vehicle, floors, workers) => {
    if (!distMeters || !weightKg) return 0;
    const km = distMeters / 1000;
    const base_price = Number(priceConfig?.base_price ?? 0);
    const per_km_price = Number(priceConfig?.per_km_price ?? priceConfig?.price_per_km ?? 0);
    const overweight_fee = Number(priceConfig?.overweight_fee ?? 3000);
    const express_fee = Number(priceConfig?.express_fee ?? 0);

    const vehicleRates = priceConfig?.vehicle_rates ?? null;
    let vehicleRate = 6000;
    if (vehicleRates && vehicleRates[vehicle]) vehicleRate = Number(vehicleRates[vehicle]);
    else vehicleRate = vehicle === "Xe máy" ? 6000 : vehicle === "Xe tải nhỏ" ? 10000 : 15000;

    let total = base_price;
    if (per_km_price > 0) {
      total += km * per_km_price;
      const weightFactor = Number(priceConfig?.weight_factor ?? 1);
      total += km * (weightKg - 1) * per_km_price * (weightFactor - 1);
    } else {
      total += Math.round(km * Number(weightKg) * vehicleRate);
    }

    total += (parseInt(floors) || 0) * Number(priceConfig?.floor_fee ?? 20000);
    total += (parseInt(workers) || 1) * Number(priceConfig?.worker_fee ?? 50000);

    if (priceConfig?.distance_to_truck_fee_per_m && form.distance_to_truck) {
      total += (parseFloat(form.distance_to_truck) || 0) * Number(priceConfig.distance_to_truck_fee_per_m);
    }
    if (weightKg > 1) total += (weightKg - 1) * overweight_fee;
    if (form.service_type === "Giao nhanh" || form.service_type === "Express") total += express_fee;
    if (form.package_type === "Đồ dễ vỡ") total += Number(priceConfig?.fragile_fee ?? 0);

    return Math.round(total);
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "sender_phone" || name === "receiver_phone") {
      newValue = value.replace(/\D/g, "");
      if (newValue.length > 10) return;
    }

    const updatedForm = { ...form, [name]: newValue };
    setForm(updatedForm);

    if (["pickup_address", "delivery_address", "pickup_province", "delivery_province"].includes(name)) {
      const pickupFull = `${updatedForm.pickup_address}, ${updatedForm.pickup_province}, Việt Nam`;
      const deliveryFull = `${updatedForm.delivery_address}, ${updatedForm.delivery_province}, Việt Nam`;
      const pickupCoord = await getCoordinates(pickupFull);
      const deliveryCoord = await getCoordinates(deliveryFull);
      const distMeters = await estimateRoute(pickupCoord, deliveryCoord);
      setDistance(distMeters);
      setPrice(calculatePrice(distMeters, updatedForm.weight_kg || 0, updatedForm.vehicle_type, updatedForm.floors, updatedForm.workers));
    } else if (["weight_kg", "vehicle_type", "floors", "workers", "distance_to_truck", "package_type", "service_type"].includes(name)) {
      setPrice(calculatePrice(distance, updatedForm.weight_kg || 0, updatedForm.vehicle_type, updatedForm.floors, updatedForm.workers));
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;
    if (!phoneRegex.test(form.sender_phone)) {
      setMessage("Số điện thoại người gửi không hợp lệ (10 số, đầu 03,05,07,08,09)");
      return;
    }
    if (!phoneRegex.test(form.receiver_phone)) {
      setMessage("Số điện thoại người nhận không hợp lệ.");
      return;
    }

    if (price <= 0) {
      setMessage("Vui lòng nhập đầy đủ địa chỉ để tính phí vận chuyển.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const payload = { ...form, distance_km: distance ? distance / 1000 : 0, price, price_config_id: priceConfig?.id ?? priceConfig?._id ?? null };
      const res = await axiosClient.post("/orders", payload);
      setOrderId(res.data.order._id || res.data._id);
    } catch (error) {
      setMessage("Lỗi hệ thống: " + (error.response?.data?.message || error.message));
    } finally { setLoading(false); }
  };

  const handlePaypalApprove = async (data, actions) => {
    setPaypalLoading(true);
    try {
      await actions.order.capture();
      setMessage("✅ Thanh toán hoàn tất! Đơn hàng đã được xác nhận.");
      setTimeout(() => navigate(`/orders/${orderId}`), 2000);
    } catch (err) {
      setMessage("Giao dịch không thành công. Vui lòng thử lại.");
    } finally { setPaypalLoading(false); }
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Tạo Đơn Vận Chuyển</h2>
          <p style={styles.subtitle}>Điền thông tin chi tiết để nhận báo giá và đặt xe</p>
        </div>

        {!orderId ? (
          <form onSubmit={handleCreateOrder} style={styles.formGrid}>
            <div style={styles.formColumn}>
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>📍 Thông tin lấy hàng</h3>
                <input placeholder="Họ tên người gửi" name="sender_name" value={form.sender_name} onChange={handleChange} required style={styles.input} />
                <input placeholder="Số điện thoại" name="sender_phone" type="tel" value={form.sender_phone} onChange={handleChange} required style={styles.input} />
                <select name="pickup_province" value={form.pickup_province} onChange={handleChange} required style={styles.select}>
                  <option value="">Chọn tỉnh/thành</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input placeholder="Số nhà, tên đường..." name="pickup_address" value={form.pickup_address} onChange={handleChange} required style={styles.input} />
              </div>

              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>🏁 Thông tin giao hàng</h3>
                <input placeholder="Họ tên người nhận" name="receiver_name" value={form.receiver_name} onChange={handleChange} required style={styles.input} />
                <input placeholder="Số điện thoại" name="receiver_phone" type="tel" value={form.receiver_phone} onChange={handleChange} required style={styles.input} />
                <select name="delivery_province" value={form.delivery_province} onChange={handleChange} required style={styles.select}>
                  <option value="">Chọn tỉnh/thành</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input placeholder="Số nhà, tên đường..." name="delivery_address" value={form.delivery_address} onChange={handleChange} required style={styles.input} />
              </div>
            </div>

            <div style={styles.formColumn}>
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>📦 Đặc điểm hàng hóa</h3>
                <div style={styles.row}>
                  <select name="package_type" value={form.package_type} onChange={handleChange} style={{...styles.select, flex: 1.5, marginBottom: 0}}>
                    <option value="Hàng hóa thông thường">Hàng thông thường</option>
                    <option value="Đồ dễ vỡ">Đồ dễ vỡ</option>
                    <option value="Thiết bị điện tử">Thiết bị điện tử</option>
                    <option value="Đồ nội thất">Đồ nội thất</option>
                  </select>
                  <input type="number" step="0.1" placeholder="Nặng (kg)" name="weight_kg" value={form.weight_kg} onChange={handleChange} required style={{...styles.input, flex: 1, marginBottom: 0}} />
                </div>
                <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange} style={{...styles.select, marginTop: 12}}>
                  <option value="Xe máy">Phương tiện: Xe máy</option>
                  <option value="Xe tải nhỏ">Phương tiện: Xe tải nhỏ</option>
                  <option value="Xe tải lớn">Phương tiện: Xe tải lớn</option>
                </select>
              </div>

              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>🛠 Dịch vụ bốc xếp</h3>
                <div style={styles.row}>
                  <input type="number" placeholder="Số tầng" name="floors" value={form.floors} onChange={handleChange} style={{...styles.input, flex: 1}} />
                  <input type="number" min="1" placeholder="Số người hỗ trợ" name="workers" value={form.workers} onChange={handleChange} style={{...styles.input, flex: 1}} />
                </div>
                <input placeholder="Khoảng cách xe đỗ đến nhà (m)" name="distance_to_truck" value={form.distance_to_truck} onChange={handleChange} style={styles.input} />
                <textarea 
                  placeholder="Ghi chú thêm cho tài xế..." 
                  name="note" 
                  value={form.note} 
                  onChange={handleChange} 
                  style={styles.textarea} 
                  rows="3" 
                />
              </div>

              <div style={styles.priceContainer}>
                {distance > 0 ? (
                  <>
                    <div style={styles.priceRow}><span>Khoảng cách:</span> <strong>{(distance / 1000).toFixed(2)} km</strong></div>
                    <div style={styles.totalPrice}>
                      <span>Tổng chi phí:</span>
                      <span style={styles.amount}>{price.toLocaleString()} VNĐ</span>
                    </div>
                  </>
                ) : (
                  <p style={styles.priceHint}>Vui lòng nhập địa chỉ để tính phí</p>
                )}
              </div>

              <button type="submit" disabled={loading || price <= 0} style={{...styles.submitBtn, opacity: (loading || price <= 0) ? 0.6 : 1}}>
                {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN & THANH TOÁN"}
              </button>
            </div>
          </form>
        ) : (
          <div style={styles.paymentContainer}>
             <div style={styles.paymentInfo}>
              <div style={styles.successIcon}>✓</div>
              <h3>Đơn hàng đã được khởi tạo</h3>
              <p style={{color: "#666"}}>Mã vận đơn: <strong>#{orderId.slice(-8).toUpperCase()}</strong></p>
              <div style={styles.paymentPrice}>
                <span style={{fontSize: 16, color: "#444"}}>Số tiền thanh toán:</span>
                <div style={styles.usdPrice}>${(price / 24000).toFixed(2)} USD</div>
              </div>
            </div>

            <PayPalScriptProvider options={{ "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID, currency: "USD" }}>
              <PayPalButtons
                style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                disabled={paypalLoading}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [{
                      amount: { value: (price / 24000).toFixed(2), currency_code: "USD" },
                      description: `Vận chuyển đơn hàng #${orderId}`,
                    }],
                  });
                }}
                onApprove={handlePaypalApprove}
              />
            </PayPalScriptProvider>
            <button onClick={() => setOrderId(null)} style={styles.btnSecondary}>Quay lại chỉnh sửa</button>
          </div>
        )}

        {message && (
          <div style={{
            ...styles.alert,
            backgroundColor: message.includes("✅") ? "#dcfce7" : "#fee2e2",
            color: message.includes("✅") ? "#166534" : "#991b1b"
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageBackground: { backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "40px 20px", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: 1000, margin: "0 auto", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", padding: "40px", boxSizing: "border-box" },
  header: { textAlign: "center", marginBottom: "40px" },
  title: { fontSize: "28px", fontWeight: "800", color: "#111", margin: "0 0 10px 0" },
  subtitle: { color: "#666", fontSize: "16px" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" },
  formColumn: { display: "flex", flexDirection: "column", gap: "20px" },
  sectionCard: { backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", boxSizing: "border-box" },
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#111", marginBottom: "15px" },
  input: { width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px", marginBottom: "12px", boxSizing: "border-box", outline: "none", transition: "0.2s" },
  select: { width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "15px", marginBottom: "12px", backgroundColor: "#fff", boxSizing: "border-box", outline: "none" },
  textarea: { 
    width: "100%", 
    padding: "12px 14px", 
    borderRadius: "8px", 
    border: "1px solid #d1d5db", 
    fontSize: "15px", 
    outline: "none", 
    resize: "none", 
    boxSizing: "border-box", // Cực kỳ quan trọng để không bị tràn
    display: "block",
    fontFamily: "inherit"
  },
  row: { display: "flex", gap: "12px", width: "100%" },
  priceContainer: { backgroundColor: "#f8fafc", borderRadius: "12px", padding: "20px", border: "1px dashed #cbd5e1", boxSizing: "border-box" },
  priceRow: { display: "flex", justifyContent: "space-between", color: "#64748b", marginBottom: "10px" },
  totalPrice: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: "10px" },
  amount: { fontSize: "22px", fontWeight: "800", color: "#059669" },
  priceHint: { color: "#94a3b8", fontSize: "14px", textAlign: "center", margin: 0, fontStyle: "italic" },
  submitBtn: { backgroundColor: "#111827", color: "#fff", border: "none", padding: "18px", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "0.2s" },
  paymentContainer: { maxWidth: "450px", margin: "0 auto", textAlign: "center", padding: "20px 0" },
  paymentInfo: { marginBottom: "30px" },
  successIcon: { width: "60px", height: "60px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", margin: "0 auto 20px" },
  paymentPrice: { margin: "25px 0", padding: "15px", backgroundColor: "#f9fafb", borderRadius: "10px" },
  usdPrice: { fontSize: "32px", fontWeight: "900", color: "#111", marginTop: "5px" },
  btnSecondary: { background: "none", border: "none", color: "#6b7280", textDecoration: "underline", marginTop: "20px", cursor: "pointer" },
  alert: { marginTop: "30px", padding: "15px", borderRadius: "10px", textAlign: "center", fontWeight: "600" }
};

export default CreateOrder;