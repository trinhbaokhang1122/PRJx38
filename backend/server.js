import "dotenv/config";
import express from "express";
import cors from "cors";
import axios from "axios";
import bcrypt from "bcrypt";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";
import User from "./models/User.js";


connectDB();
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const GH_API_KEY = "c373255e-7b77-4d8d-8e3c-e06d5116305f";

app.post("/api/ors/v2/directions/driving-car", async (req, res) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || coordinates.length < 2) {
      return res.status(400).json({ error: "Missing coordinates" });
    }

    const start = `${coordinates[0][1]},${coordinates[0][0]}`;
    const end = `${coordinates[1][1]},${coordinates[1][0]}`;

    const url = `https://graphhopper.com/api/1/route?point=${start}&point=${end}&vehicle=car&locale=vn&calc_points=false&key=${GH_API_KEY}`;

    const ghRes = await axios.get(url);
    const path = ghRes.data.paths[0];

    return res.json({
      routes: [
        {
          summary: {
            distance: path.distance,
            duration: path.time / 1000,
          },
        },
      ],
    });
  } catch (error) {
    console.error("GraphHopper Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "GraphHopper API error",
      details: error.response?.data || error.message,
    });
  }
});

app.get("/api/users/test-direct", (req, res) => {
  res.json({ message: "Direct route working fine!" });
});
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/prices", priceRoutes);

setTimeout(() => {
  try {
    if (app._router?.stack) {
      console.log("Registered routes:");
      app._router.stack.forEach((layer) => {
        if (layer.route?.path) {
          const methods = Object.keys(layer.route.methods)
            .map((m) => m.toUpperCase())
            .join(", ");
          console.log(`${methods} ${layer.route.path}`);
        }
      });
    }
  } catch (err) {
    console.log("Error while listing routes:", err.message);
  }
}, 500);
const seedSuperAdmin = async () => {
  try {
    const adminEmail = "khangzz@gmail.com";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Super Admin already exists:", adminEmail);
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      full_name: "Super Admin",
      email: adminEmail,
      password_hash: hashedPassword,
      isAdmin: true,
    });

    console.log("Super Admin created successfully!");
    console.log("Email:", adminEmail);
    console.log("Password: Admin@123");
  } catch (error) {
    console.error("Error creating Super Admin:", error.message);
  }
};

seedSuperAdmin();
app.get("/", (req, res) => {
  res.send("Server is running...");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
