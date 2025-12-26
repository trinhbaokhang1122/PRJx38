import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender_name: { type: String, required: true },
    sender_phone: { type: String },
    receiver_name: { type: String, required: true },
    receiver_phone: { type: String },
    pickup_address: { type: String, required: true },
    delivery_address: { type: String, required: true },
    package_type: { type: String, required: true },
    description: { type: String },
    weight_kg: { type: Number, default: 1 },
    declared_value: { type: Number },
    vehicle_type: { type: String },
    service_type: { type: String },
    floors: { type: Number, default: 0 },
    workers: { type: Number, default: 1 },
    distance_to_truck: { type: String },
    distance_km: { type: Number, default: 0 },
    price: { type: Number, required: true },

    // ===== THANH TOÁN (PAYPAL – CÁCH 1) =====
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    paymentMethod: { type: String, default: "PayPal" },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "picking",
        "delivering",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    note: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
