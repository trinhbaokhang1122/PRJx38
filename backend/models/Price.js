import mongoose from "mongoose";

const priceSchema = new mongoose.Schema({
  base_price: { type: Number, required: true },
  per_km_price: { type: Number, required: true },
  overweight_fee: { type: Number, required: true },
  express_fee: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model("Price", priceSchema);
