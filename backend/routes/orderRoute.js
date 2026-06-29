import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  listOrders,
  placeOrder,
  placeOrderCod,
  userOrders,
  verifyOrder,
  acceptOrder,
  rejectOrder,
  kitchenOrders,
  markPrepared,
  markDelivered,
  getBillByOrderId,
  getOrderStatus,
  cancelReservation,
} from "../controllers/orderController.js";

const router = express.Router();

/* ================= ADMIN (no auth) ================= */
router.get("/list", listOrders);
router.post("/accept", acceptOrder);
router.post("/reject", rejectOrder);
router.get("/kitchen", kitchenOrders);
router.post("/prepared", markPrepared);
router.post("/delivered", markDelivered);

/* ================= USER (keep auth) ================= */
router.post("/place", authMiddleware, placeOrder);
router.post("/placecod", authMiddleware, placeOrderCod);
router.get("/userorders", authMiddleware, userOrders);
router.post("/verify", authMiddleware, verifyOrder);
router.post("/cancel-reservation", authMiddleware, cancelReservation);
router.get("/status/:orderId", authMiddleware, getOrderStatus);
router.get("/bill/:orderId", authMiddleware, getBillByOrderId);

export default router;
