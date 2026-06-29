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

/* ================= ADMIN ================= */

router.get("/list", authMiddleware, listOrders);

router.post("/accept", authMiddleware, acceptOrder);
router.post("/reject", authMiddleware, rejectOrder);

router.get("/kitchen", authMiddleware, kitchenOrders);

router.post("/prepared", authMiddleware, markPrepared);
router.post("/delivered", authMiddleware, markDelivered);

/* ================= USER ================= */

router.post("/place", authMiddleware, placeOrder);

router.post("/placecod", authMiddleware, placeOrderCod);

router.get("/userorders", authMiddleware, userOrders);

router.post("/verify", authMiddleware, verifyOrder);

router.post(
  "/cancel-reservation",
  authMiddleware,
  cancelReservation
);

router.get(
  "/status/:orderId",
  authMiddleware,
  getOrderStatus
);

router.get(
  "/bill/:orderId",
  authMiddleware,
  getBillByOrderId
);

export default router;