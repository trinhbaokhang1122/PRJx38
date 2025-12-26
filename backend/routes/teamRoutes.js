import express from "express";
import Team from "../models/teamModel.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getTeamById } from "../controllers/teamController.js";

const router = express.Router();

router.post("/register", protect, async (req, res) => {
  try {
    const { team_name, description, vehicle_type, region, members, price } = req.body;

    const existingTeam = await Team.findOne({ owner: req.user._id });
    if (existingTeam) {
      return res.status(400).json({
        message: "Bạn đã có đội vận chuyển rồi, không thể tạo thêm.",
      });
    }

    const team = await Team.create({
      team_name,
      description,
      vehicle_type,
      region,
      price,
      members,
      owner: req.user._id,
      status: "pending",
    });

    res.status(201).json({
      message: "Đã gửi yêu cầu tạo đội, chờ admin duyệt.",
      team,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", protect, admin, async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("owner", "full_name email")
      .populate("members", "full_name email");
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", protect, admin, getTeamById);

router.put("/approve/:id", protect, admin, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Không tìm thấy đội" });

    team.status = "approved";
    await team.save();

    res.json({ message: "Đã duyệt đội vận chuyển", team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Không tìm thấy đội." });

    if (!req.user.isAdmin && team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa đội này." });
    }

    await team.deleteOne();
    res.json({ message: "Đã xóa đội thành công." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;