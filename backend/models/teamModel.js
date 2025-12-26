import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  team_name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  vehicle_type: { 
    type: String 
  },
  region: { 
    type: String 
  },
  price: { 
    type: Number, 
    default: 0 
  },
  member_count: { 
    type: Number, 
    default: 1 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.model("Team", teamSchema);