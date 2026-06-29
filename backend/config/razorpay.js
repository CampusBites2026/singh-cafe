import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

if (
  !process.env.RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET
) {
  throw new Error(
    "Razorpay credentials are missing in .env"
  );
}

export const razorpayInstance =
  new Razorpay({
    key_id:
      process.env.RAZORPAY_KEY_ID,
    key_secret:
      process.env.RAZORPAY_KEY_SECRET,
  });