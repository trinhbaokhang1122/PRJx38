import Price from "../models/Price.js";
import PriceHistory from "../models/PriceHistory.js";

const createDefaultPrice = async () => {
  const defaultPrice = {
    base_price: 20000,
    per_km_price: 5000,
    overweight_fee: 10000,
    express_fee: 15000,
    note: "Giá mặc định hệ thống",
  };
  let price = await Price.findOne();
  if (!price) {
    price = await Price.create(defaultPrice);
  }
  const lastHistory = await PriceHistory.findOne();
  if (!lastHistory) {
    await PriceHistory.create(defaultPrice);
  }

  return price;
};

export const getPrices = async (req, res) => {
  try {
    let price = await Price.findOne();

    if (!price) {
      price = await createDefaultPrice();
    }

    res.json(price);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getLatestPrice = async (req, res) => {
  try {
    let latest = await PriceHistory.findOne().sort({ createdAt: -1 });

    if (!latest) {
      await createDefaultPrice();
      latest = await PriceHistory.findOne().sort({ createdAt: -1 });
    }

    res.json(latest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getPriceTimeline = async (req, res) => {
  try {
    let timeline = await PriceHistory.find().sort({ createdAt: -1 });

    if (timeline.length === 0) {
      await createDefaultPrice();
      timeline = await PriceHistory.find().sort({ createdAt: -1 });
    }

    res.json(timeline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updatePrices = async (req, res) => {
  try {
    const {
      base_price,
      per_km_price,
      overweight_fee,
      express_fee,
      note,
    } = req.body;

    let price = await Price.findOne();
    if (!price) {
      price = await Price.create({});
    }
    price.base_price = base_price ?? price.base_price;
    price.per_km_price = per_km_price ?? price.per_km_price;
    price.overweight_fee = overweight_fee ?? price.overweight_fee;
    price.express_fee = express_fee ?? price.express_fee;
    await price.save();
    await PriceHistory.create({
      base_price: price.base_price,
      per_km_price: price.per_km_price,
      overweight_fee: price.overweight_fee,
      express_fee: price.express_fee,
      note: note || "",
      updatedBy: req.user ? req.user._id : null,
    });
    res.json({
      message: "Cập nhật bảng giá thành công",
      price,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
