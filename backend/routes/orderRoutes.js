import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  estimateOrderPrice,
  cancelOrder,
  getOrderQR,
  getOrderInvoice,
  getOrderInvoiceHTML,
  getOrderInvoiceHTMLPDF,
  getRevenueStats,
  getOrderStats,
  getAllStats,
  sendInvoiceByAdmin,
  payOrder, 
} from "../controllers/orderController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/stats/revenue", protect, admin, getRevenueStats);
router.get("/stats/orders", protect, admin, getOrderStats);
router.get("/stats/all", protect, admin, getAllStats);
router.post("/estimate", protect, estimateOrderPrice);
router.post("/", protect, createOrder);
router.put("/:id/pay", protect, payOrder);
router.get("/:id/qr", protect, getOrderQR);
router.get("/:id/invoice", protect, getOrderInvoice);
router.get("/:id/invoice-html", getOrderInvoiceHTML);
router.get("/:id/invoice-html-pdf", protect, getOrderInvoiceHTMLPDF);
router.post("/:id/send-invoice", protect, admin, sendInvoiceByAdmin);
router.get("/", protect, getMyOrders);
router.get("/all", protect, admin, getOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, admin, updateOrderStatus);
router.put("/:id/cancel", protect, cancelOrder);
router.delete("/:id", protect, admin, deleteOrder);

export default router;
