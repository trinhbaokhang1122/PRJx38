import Team from "../models/teamModel.js";
import User from "../models/User.js";

export const createTeam = async (req, res) => {
  try {
    const { 
      team_name, 
      description, 
      vehicle_type, 
      region, 
      price, 
      member_count, 
      members 
    } = req.body;

    const existingTeam = await Team.findOne({ owner: req.user._id });
    if (existingTeam) {
      return res.status(400).json({ 
        message: "Bạn đã có đội vận chuyển rồi, không thể tạo thêm." 
      });
    }

    const newTeam = new Team({
      team_name,
      description,
      vehicle_type,
      region,
      price,
      member_count: member_count || 1,
      members: members || [],
      owner: req.user._id,
      status: "pending",
    });

    await newTeam.save();
    res.status(201).json({ 
      message: "Đã gửi yêu cầu tạo đội, chờ admin duyệt.", 
      team: newTeam 
    });
  } catch (error) {
    console.error("Lỗi khi tạo đội:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("owner", "full_name email")
      .populate("members", "full_name email")
      .sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("owner", "full_name email")
      .populate("members", "full_name email");

    if (!team) {
      return res.status(404).json({ message: "Không tìm thấy đội vận chuyển." });
    }

    res.status(200).json(team);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đội:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const approveTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Không tìm thấy đội." });

    team.status = "approved";
    await team.save();

    res.json({ message: "Đã duyệt đội vận chuyển thành công!", team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Không tìm thấy đội." });

    team.status = "rejected";
    await team.save();

    res.json({ message: "Đã từ chối yêu cầu lập đội.", team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};