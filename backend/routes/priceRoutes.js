// backend/routes/priceRoutes.js
import express from "express";
import { getPrices, updatePrices, getPriceTimeline, getLatestPrice } from "../controllers/priceController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPrices);               
router.get("/latest", getLatestPrice);      
router.get("/timeline", getPriceTimeline);  
router.put("/", protect, admin, updatePrices); 
export default router;
