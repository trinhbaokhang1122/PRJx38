import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import puppeteer from "puppeteer";

import Order from "../models/Order.js";
import User from "../models/User.js";
import {
  generateInvoicePDF,
  sendOrderInvoiceMail,
  sendOrderStatusMail,
} from "../utils/sendMail.js";

/* =========================
   PDF INVOICE (PDFKit)
========================= */
const generateInvoiceBuffer = (order) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(24).text("HÓA ĐƠN VẬN CHUYỂN", { align: "center" });
    doc.moveDown(1.5);

    doc.fontSize(14);
    doc.text(`Mã đơn hàng: ${order._id}`);
    doc.text(
      `Ngày tạo: ${new Date(order.createdAt).toLocaleString("vi-VN")}`
    );
    doc.moveDown(2);

    doc.fontSize(16).text("Người gửi", { underline: true });
    doc.fontSize(13)
      .text(`• Họ tên: ${order.sender_name}`)
      .text(`• SĐT: ${order.sender_phone}`)
      .text(`• Địa chỉ: ${order.pickup_address}`);
    doc.moveDown();

    doc.fontSize(16).text("Người nhận", { underline: true });
    doc.fontSize(13)
      .text(`• Họ tên: ${order.receiver_name}`)
      .text(`• SĐT: ${order.receiver_phone}`)
      .text(`• Địa chỉ: ${order.delivery_address}`);
    doc.moveDown();

    doc.fontSize(16).text("Hàng hóa & Dịch vụ", { underline: true });
    doc.fontSize(13)
      .text(`• Loại hàng: ${order.package_type || "Thường"}`)
      .text(`• Trọng lượng: ${order.weight_kg} kg`)
      .text(`• Loại xe: ${order.vehicle_type || "Xe máy"}`)
      .text(`• Dịch vụ: ${order.service_type || "Tiêu chuẩn"}`)
      .text(
        `• Tầng: ${order.floors || 0} | Bốc vác: ${
          order.workers || 0
        } người`
      )
      .text(`• Ghi chú: ${order.note || "Không có"}`);
    doc.moveDown(2);

    doc.fontSize(20).text(
      `TỔNG TIỀN: ${order.price.toLocaleString()} VNĐ`,
      { align: "right" }
    );

    doc.end();
  });
};

/* =========================
   PRICE / TIME HELPERS
========================= */
const timeBasedFee = (price) => {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 5) {
    return Math.round(price * 1.2);
  }
  return price;
};

const getDateRangeFromSelectedDate = (selectedDate) => {
  const [y, m, d] = selectedDate.split("-").map(Number);

  const startVN = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const endVN = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));

  return {
    startUTC: new Date(startVN.getTime() - 7 * 3600 * 1000),
    endUTC: new Date(endVN.getTime() - 7 * 3600 * 1000),
  };
};

const getStartDateByType = (type) => {
  const now = new Date();
  const vnNow = new Date(now.getTime() + 7 * 3600 * 1000);

  if (type === "day") {
    const today = vnNow.toISOString().split("T")[0];
    return getDateRangeFromSelectedDate(today).startUTC;
  }

  const year = vnNow.getUTCFullYear();
  const month = vnNow.getUTCMonth();
  let startVN;

  if (type === "week") {
    const weekday = vnNow.getUTCDay() || 7;
    const monday = vnNow.getUTCDate() - weekday + 1;
    startVN = new Date(Date.UTC(year, month, monday, 0, 0, 0));
  } else if (type === "month") {
    startVN = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  } else {
    const today = vnNow.toISOString().split("T")[0];
    return getDateRangeFromSelectedDate(today).startUTC;
  }

  return new Date(startVN.getTime() - 7 * 3600 * 1000);
};

/* =========================
   ORDER CORE
========================= */
export const createOrder = async (req, res) => {
  try {
    const finalPrice = timeBasedFee(req.body.price);

    const newOrder = await Order.create({
      ...req.body,
      price: finalPrice,
      user: req.user._id,
    });

    const user = await User.findById(req.user._id);
    if (user?.email) {
      const pdf = await generateInvoicePDF(newOrder);
      await sendOrderInvoiceMail({
        to: user.email,
        order: newOrder,
        pdfBuffer: pdf,
      });
    }

    res.status(201).json({
      message: "Tạo đơn thành công, đã gửi hóa đơn qua email",
      order: newOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi tạo đơn hàng" });
  }
};

export const payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    if (order.isPaid) {
      return res
        .status(400)
        .json({ message: "Đơn hàng đã được thanh toán" });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.status = "confirmed";
    await order.save();

    const user = await User.findById(order.user);
    if (user?.email) {
      await sendOrderStatusMail({ to: user.email, order });
    }

    res.json({
      message: "Thanh toán thành công (giả lập PayPal)",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xử lý thanh toán" });
  }
};

export const sendInvoiceByAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn" });
    }

    const user = await User.findById(order.user);
    if (!user?.email) {
      return res.status(400).json({ message: "User không có email" });
    }

    const pdf = await generateInvoicePDF(order);
    await sendOrderInvoiceMail({
      to: user.email,
      order,
      pdfBuffer: pdf,
    });

    res.json({ message: "Đã gửi lại hóa đơn thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi gửi hóa đơn" });
  }
};

export const getOrderQR = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng." });
    }

    const qrText = `${
      process.env.APP_URL || "http://localhost:3000"
    }/order/${order._id}`;

    const qrBuffer = await QRCode.toBuffer(qrText, { width: 300 });

    res.set("Content-Type", "image/png");
    res.send(qrBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi tạo mã QR." });
  }
};

export const getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng." });
    }

    const buffer = await generateInvoiceBuffer(order);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=hoadon_${order._id}.pdf`
    );
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xuất hóa đơn PDF." });
  }
};

export const getOrderInvoiceHTML = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send("Không tìm thấy đơn hàng");

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Hóa đơn #${order._id}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; }
  .container { max-width: 800px; margin: auto; }
  .print-btn {
    margin-top: 30px;
    padding: 12px 24px;
    background: #d32f2f;
    color: #fff;
    border: none;
    font-size: 16px;
    cursor: pointer;
    border-radius: 4px;
  }
  @media print { .print-btn { display:none; } }
</style>
</head>
<body>
<div class="container">
  <h1 style="text-align:center;color:#d32f2f">HÓA ĐƠN VẬN CHUYỂN</h1>
  <p><strong>Mã đơn hàng:</strong> ${order._id}</p>
  <p><strong>Ngày tạo:</strong> ${new Date(
    order.createdAt
  ).toLocaleString("vi-VN")}</p>

  <h3>Người gửi</h3>
  <p>${order.sender_name} - ${order.sender_phone}</p>
  <p>${order.pickup_address}</p>

  <h3>Người nhận</h3>
  <p>${order.receiver_name} - ${order.receiver_phone}</p>
  <p>${order.delivery_address}</p>

  <h3>Thông tin hàng hóa & dịch vụ</h3>
  <p>Loại hàng: ${order.package_type || "Thường"}</p>
  <p>Khối lượng: ${order.weight_kg} kg</p>
  <p>Dịch vụ: ${order.service_type || "Tiêu chuẩn"}</p>

  <h2 style="color:#d32f2f;text-align:right">
    Tổng tiền: ${order.price.toLocaleString()} VNĐ
  </h2>

  <button onclick="window.print()" class="print-btn">
    In hóa đơn
  </button>
</div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi tạo HTML." });
  }
};

export const getOrderInvoiceHTMLPDF = async (req, res) => {
  let browser;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng." });
    }

    const htmlUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/orders/${order._id}/invoice-html`;

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(htmlUrl, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "15mm",
        right: "15mm",
        bottom: "15mm",
        left: "15mm",
      },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=hoadon_${order._id}_in.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    if (browser) await browser.close();
    console.error(err);
    res.status(500).json({ message: "Lỗi tạo PDF từ HTML." });
  }
};
/* =========================
   UPDATE / CANCEL
========================= */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatus = [
      "pending",
      "confirmed",
      "picking",
      "delivering",
      "completed",
      "cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn" });
    }

    order.status = status;
    await order.save();

    const user = await User.findById(order.user);
    if (user?.email) {
      await sendOrderStatusMail({ to: user.email, order });
    }

    res.json({
      message: "Cập nhật trạng thái thành công",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy." });
    }

    order.status = "cancelled";
    await order.save();

    res.json({
      message: "Hủy đơn thành công",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hủy đơn." });
  }
};

/* =========================
   GET ORDERS
========================= */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Lỗi lấy danh sách đơn của tôi.",
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Lỗi lấy tất cả đơn hàng.",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy đơn hàng." });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Lỗi lấy chi tiết đơn hàng.",
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);

    res.json({ message: "Xóa đơn thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Lỗi xóa đơn.",
    });
  }
};

/* =========================
   PRICE ESTIMATE
========================= */
export const estimateOrderPrice = async (req, res) => {
  try {
    const { floors = 0, workers = 0, weight_kg = 1 } = req.body;

    let price =
      150000 +
      floors * 20000 +
      workers * 30000 +
      weight_kg * 5000;

    price = timeBasedFee(price);

    res.json({ totalPrice: price });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Lỗi ước tính giá.",
    });
  }
};

/* =========================
   REVENUE STATS
========================= */
export const getRevenueStats = async (req, res) => {
  try {
    const { date, type = "day" } = req.query;

    let match;
    if (date) {
      const { startUTC, endUTC } =
        getDateRangeFromSelectedDate(date);
      match = { createdAt: { $gte: startUTC, $lte: endUTC } };
    } else {
      const startUTC = getStartDateByType(type);
      match = { createdAt: { $gte: startUTC } };
    }

    const result = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$price" },
        },
      },
    ]);

    res.json({
      date: date || null,
      type: date ? "day" : type,
      revenue: result[0]?.revenue || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Lỗi thống kê doanh thu.",
    });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const { date, type = "day" } = req.query;

    let filter;
    if (date) {
      const { startUTC, endUTC } =
        getDateRangeFromSelectedDate(date);
      filter = { createdAt: { $gte: startUTC, $lte: endUTC } };
    } else {
      const startUTC = getStartDateByType(type);
      filter = { createdAt: { $gte: startUTC } };
    }

    const count = await Order.countDocuments(filter);

    res.json({
      date: date || null,
      type: date ? "day" : type,
      count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Lỗi thống kê số đơn.",
    });
  }
};

/* =========================
   HOURLY STATS
========================= */
export const getAllStats = async (req, res) => {
  try {
    const selectedDate = req.query.date;
    if (!selectedDate) {
      return res.status(400).json({
        message: "Thiếu ngày thống kê. Gửi ?date=YYYY-MM-DD",
      });
    }

    const { startUTC, endUTC } =
      getDateRangeFromSelectedDate(selectedDate);

    const orders = await Order.find({
      createdAt: { $gte: startUTC, $lte: endUTC },
    });

    const morning = [];
    const noon = [];
    const evening = [];

    for (const order of orders) {
      const vnTime = new Date(
        new Date(order.createdAt).getTime() +
          7 * 3600 * 1000
      );
      const hour = vnTime.getUTCHours();

      if (hour >= 5 && hour < 12) morning.push(order);
      else if (hour >= 12 && hour < 18) noon.push(order);
      else evening.push(order);
    }

    const sumRevenue = (arr) =>
      arr.reduce((sum, o) => sum + (o.price || 0), 0);

    res.json({
      date: selectedDate,
      totalOrders: orders.length,
      totalRevenue: sumRevenue(orders),
      morning: {
        count: morning.length,
        revenue: sumRevenue(morning),
      },
      noon: {
        count: noon.length,
        revenue: sumRevenue(noon),
      },
      evening: {
        count: evening.length,
        revenue: sumRevenue(evening),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Lỗi thống kê theo mốc giờ.",
    });
  }
};

/* =========================
   REVENUE BUCKETS
========================= */
export const getRevenueBuckets = async (req, res) => {
  try {
    const { date, type = "day" } = req.query;

    let match;
    if (date) {
      const { startUTC, endUTC } =
        getDateRangeFromSelectedDate(date);
      match = { createdAt: { $gte: startUTC, $lte: endUTC } };
    } else {
      const startUTC = getStartDateByType(type);
      match = { createdAt: { $gte: startUTC } };
    }

    const results = await Order.aggregate([
      { $match: match },
      {
        $bucket: {
          groupBy: "$price",
          boundaries: [0, 1000000, 10000000, Infinity],
          default: ">= 10 Triệu",
          output: {
            count: { $sum: 1 },
            totalRevenue: { $sum: "$price" },
          },
        },
      },
      {
        $project: {
          _id: 0,
          bucket: "$_id",
          count: 1,
          totalRevenue: 1,
        },
      },
      {
        $addFields: {
          bucketLabel: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$bucket", 0] },
                  then: "0đ - <1 Triệu",
                },
                {
                  case: { $eq: ["$bucket", 1000000] },
                  then: "1 Triệu - <10 Triệu",
                },
                {
                  case: { $eq: ["$bucket", 10000000] },
                  then: ">= 10 Triệu",
                },
              ],
              default: "Khác",
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          results: {
            $push: { k: "$bucketLabel", v: "$$ROOT" },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayToObject: "$results" },
        },
      },
    ]);

    res.json({
      date: date || null,
      type: date ? "day" : type,
      results: results[0] || {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Lỗi thống kê mốc doanh thu.",
    });
  }
};

/* =========================
   ORDER COUNT BUCKETS
========================= */
export const getOrderCountBuckets = async (req, res) => {
  try {
    const { date, type = "day" } = req.query;

    let filter;
    if (date) {
      const { startUTC, endUTC } =
        getDateRangeFromSelectedDate(date);
      filter = { createdAt: { $gte: startUTC, $lte: endUTC } };
    } else {
      const startUTC = getStartDateByType(type);
      filter = { createdAt: { $gte: startUTC } };
    }

    const totalOrders = await Order.countDocuments(filter);

    let bucketLabel = "0 đơn";
    if (totalOrders >= 100)
      bucketLabel = ">= 100 đơn (Xuất sắc)";
    else if (totalOrders >= 10)
      bucketLabel = "10 - 99 đơn (Tốt)";
    else if (totalOrders > 0)
      bucketLabel = "1 - 9 đơn (Cần cải thiện)";

    const detailsByStatus = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$price" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      date: date || null,
      type: date ? "day" : type,
      totalOrders,
      bucket: bucketLabel,
      detailsByStatus,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Lỗi phân loại mốc số đơn.",
    });
  }
};
