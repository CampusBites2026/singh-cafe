import OrderCounter from "../models/orderCounterModel.js";

const generateOrderNumber = async () => {
  const today = new Date().toISOString().split("T")[0]; // e.g. "2025-06-25"

  const counter = await OrderCounter.findOneAndUpdate(
    { date: today },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  // e.g. "20250625-001" — unique across all days
  const datePart = today.replace(/-/g, ""); // "20250625"
  const seqPart = String(counter.sequence).padStart(3, "0"); // "001"

  return `${datePart}-${seqPart}`;
};

export default generateOrderNumber;