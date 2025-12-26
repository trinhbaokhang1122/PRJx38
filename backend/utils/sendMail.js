import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const getStatusLabel = (status) => {
  const map = {
    pending: "Đang chờ xử lý",
    shipping: "Đang vận chuyển",
    delivered: "Đã giao hàng",
    canceled: "Đã hủy",
  };
  return map[status] || status;
};


export const sendOrderInvoiceMail = async ({ to, order, pdfBuffer }) => {
  const statusLabel = getStatusLabel(order.status);

  const html = `
    <div style="font-family:Arial;max-width:600px;margin:auto">
      <h2>HÓA ĐƠN ĐƠN HÀNG #${order._id}</h2>
      <p>Xin chào <b>${order.sender_name}</b>,</p>
      <p>Hóa đơn đơn hàng của bạn được đính kèm trong email này.</p>

      <table width="100%" cellpadding="8" cellspacing="0" border="1">
        <tr><td>Mã đơn</td><td>#${order._id}</td></tr>
        <tr><td>Ngày tạo</td><td>${new Date(order.createdAt).toLocaleString("vi-VN")}</td></tr>
        <tr><td>Tổng tiền</td><td><b>${order.price.toLocaleString("vi-VN")} VNĐ</b></td></tr>
        <tr><td>Trạng thái</td><td>${statusLabel}</td></tr>
      </table>

      <p style="margin-top:20px">Cảm ơn bạn đã sử dụng dịch vụ.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Hệ thống Vận chuyển" <${process.env.MAIL_USER}>`,
    to,
    subject: `Hóa đơn đơn hàng #${order._id}`,
    html,
    attachments: [
      {
        filename: `hoadon_${order._id}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
};

export const sendOrderStatusMail = async ({ to, order }) => {
  const statusLabel = getStatusLabel(order.status);

  const html = `
    <div style="font-family:Arial;max-width:600px;margin:auto">
      <h2>THÔNG BÁO TRẠNG THÁI ĐƠN HÀNG</h2>
      <p>Đơn hàng <b>#${order._id}</b> của bạn đã được cập nhật.</p>
      <p><b>Trạng thái mới:</b> ${statusLabel}</p>
      <p>Thời gian: ${new Date().toLocaleString("vi-VN")}</p>
      <p style="margin-top:20px">Vui lòng đăng nhập để xem chi tiết.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Hệ thống Vận chuyển" <${process.env.MAIL_USER}>`,
    to,
    subject: `[${statusLabel}] Đơn hàng #${order._id}`,
    html,
  });
};

export const generateInvoicePDF = async (order) => {
  const templatePath = path.join(
    process.cwd(),
    "templates",
    "invoiceTemplate.html"
  );

  let html = fs.readFileSync(templatePath, "utf8");

  html = html
    .replace(/{{orderId}}/g, order._id)
    .replace(/{{createdAt}}/g, new Date(order.createdAt).toLocaleString("vi-VN"))
    .replace(/{{sender_name}}/g, order.sender_name)
    .replace(/{{sender_phone}}/g, order.sender_phone)
    .replace(/{{pickup_address}}/g, order.pickup_address)
    .replace(/{{receiver_name}}/g, order.receiver_name)
    .replace(/{{receiver_phone}}/g, order.receiver_phone)
    .replace(/{{delivery_address}}/g, order.delivery_address)
    .replace(/{{package_type}}/g, order.package_type)
    .replace(/{{weight_kg}}/g, order.weight_kg)
    .replace(/{{price}}/g, order.price.toLocaleString("vi-VN"))
    .replace(/{{status}}/g, getStatusLabel(order.status))
    .replace(/{{service_type}}/g, order.service_type || "Tiêu chuẩn")
    .replace(/{{vehicle_type}}/g, order.vehicle_type || "Xe máy")
    .replace(/{{floors}}/g, order.floors || 0)
    .replace(/{{workers}}/g, order.workers || 0)
    .replace(/{{note}}/g, order.note || "Không có");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" },
  });

  await browser.close();
  return pdf;
};
