//OrderModel
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sender_name: {
      type: String,
      required: true,
    },
    receiver_name: {
      type: String,
      required: true,
    },
    pickup_address: {
      type: String,
      required: true,
    },
    delivery_address: {
      type: String,
      required: true,
    },
    package_type: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "in_transit", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
