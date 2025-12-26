import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const PriceList = () => {
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    const loadPrice = async () => {
      try {
        const res = await axiosClient.get("/prices");
        setPrices(res.data);
      } catch (error) {
        console.log("Lỗi tải bảng giá:", error);
      }
    };
    loadPrice();
  }, []);

  if (!prices) return <p>Đang tải bảng giá...</p>;

  return (
    <div className="container">
      <h2>Bảng Giá Dịch Vụ</h2>

      <table className="price-table">
        <tbody>
          <tr>
            <td>Giá cơ bản</td>
            <td>{prices.base_price.toLocaleString()} VNĐ</td>
          </tr>

          <tr>
            <td>Giá theo km</td>
            <td>{prices.price_per_km.toLocaleString()} VNĐ</td>
          </tr>

          <tr>
            <td>Khoảng cách tối thiểu</td>
            <td>{prices.minimum_distance} km</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PriceList;
