// routes/adminRoutes.js
import express from "express";
import {
  getAllUsers,
  updateUserStatus,
  deleteUserByAdmin,
} from "../controllers/adminController.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();


router.get("/", adminOnly, getAllUsers);
router.put("/:id", adminOnly, updateUserStatus);
router.delete("/:id", adminOnly, deleteUserByAdmin);

export default router;
