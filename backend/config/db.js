import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB kết nối thành công!");
  } catch (err) {
    console.log("Lỗi kết nối MongoDB:", err.message);
    console.log(err);
    process.exit(1);
  }
};
export default connectDB;