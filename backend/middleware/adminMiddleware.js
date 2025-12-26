const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa xác thực người dùng" });
    }

    const adminEmail = "khangzz@gmail.com";

    if (req.user.email !== adminEmail) {
      return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
    }

    next();
  } catch (error) {
    console.error("Lỗi trong adminMiddleware:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export default adminMiddleware;