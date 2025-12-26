import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

export const generateInvoicePDF = async (order) => {
  const templatePath = path.join(
    process.cwd(),
    "backend",
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
    .replace(/{{status}}/g, order.status);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return pdfBuffer;
};
