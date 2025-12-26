// backend/models/PriceHistory.js
import mongoose from "mongoose";

const PriceHistorySchema = new mongoose.Schema({
  base_price: { type: Number, default: 0 },
  per_km_price: { type: Number, default: 0 },
  overweight_fee: { type: Number, default: 0 },
  express_fee: { type: Number, default: 0 },
  note: { type: String, default: "" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("PriceHistory", PriceHistorySchema);
