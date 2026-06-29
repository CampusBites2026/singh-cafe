import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import crypto from "crypto";
import generateOrderNumber from "../utils/generateOrderNumber.js";

import {
  updateStock,
  reserveStock,
  releaseReservedStock,
} from "../utils/stockManager.js";

/* ================= VALIDATE ITEMS ================= */
const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.every(
    (item) =>
      item._id &&
      item.name &&
      item.price != null &&
      item.quantity != null &&
      item.productType
  );
};

/* ================= FACULTY VALIDATION ================= */
const validateFacultyAccess = (address) => {
  const SECRET = (process.env.FACULTY_SECRET_CODE || "").trim().toUpperCase();
  if (!address) return false;
  if (address.userType === "faculty") {
    const incoming = (address.facultyCode || "").trim().toUpperCase();
    if (!incoming || incoming !== SECRET) return false;
  }
  return true;
};



/* ================= CREATE ORDER OBJECT ================= */
const createOrderObject = async ({
  userId,
  items,
  amount,
  discount,
  couponCode,
  address,
  deliveryFee,
  paymentMethod = "PENDING",
}) => {
  const orderNumber = await generateOrderNumber();

  const formattedItems = [];
  for (const item of items) {
    const food = await foodModel.findById(item._id);
    if (!food) continue;

    const quantity = item.quantity || 1;
    formattedItems.push({
      _id: food._id,
      name: food.name,
      price: food.price,
      quantity,
      productType:
        String(food.productType || "").trim().toLowerCase() === "packed"
          ? "Packed"
          : "Unpacked",
    });
  }

  return new orderModel({
    orderNumber,
    userId: userId || null,
    items: formattedItems,
    amount,
    discount: discount || 0,
    couponCode: couponCode || null,
    address,
    specialInstructions: address?.specialInstructions || "",
    paymentStatus: paymentMethod === "PENDING" ? "PENDING" : "PAID",
    status: paymentMethod === "PENDING" ? "PENDING" : "PAID",
    payment: paymentMethod === "PAID",
    paymentMethod,
    deliveryFee: deliveryFee || 0,
  });
};

/* ================= CLEAR USER CART ================= */
const clearUserCart = async (userId) => {
  if (userId) {
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
  }
};

/* ================= PLACE ORDER (ONLINE) ================= */
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, discount, couponCode, address, deliveryFee } =
      req.body;

    const user = await userModel.findById(userId);

    const updatedAddress = {
      ...address,
      email: user.email,
      phone: user.phone || address?.phone,
    };

    if (!validateItems(items)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cart items" });
    }

    if (address && !validateFacultyAccess(address)) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid faculty verification code" });
    }

 let stockReserved = false;

try {
  await reserveStock(items);
  stockReserved = true;

  const order = await createOrderObject({
    userId,
    items,
    amount,
    discount,
    couponCode,
    address: updatedAddress,
    deliveryFee,
    paymentMethod: "PENDING",
  });

  order.reservationExpiresAt =
    new Date(Date.now() + 5 * 60 * 1000);

  order.reservationStatus = "ACTIVE";

  await order.save();

  const io = req.app.get("io");
  if (io) io.emit("new-order", order);

  await userModel.findByIdAndUpdate(userId, {
    $push: {
      notifications: {
        message: `✅ Order ${order.orderNumber} placed successfully`,
      },
    },
  });

  return res.json({
    success: true,
    order,
  });

} catch (err) {

  if (stockReserved) {
    await releaseReservedStock(items);
  }

  throw err;
}


  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Order failed",
    });
  }
};

/* ================= PLACE ORDER (COD) ================= */
export const placeOrderCod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, amount, discount, couponCode, address, deliveryFee } =
      req.body;

    const user = await userModel.findById(userId);

    const updatedAddress = {
      ...address,
      email: user.email,
      phone: user.phone || address?.phone,
    };

    if (!validateItems(items)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid cart items" });
    }

    if (!address || address.userType === "student") {
      return res.status(403).json({
        success: false,
        message: "Students cannot use Cash on Delivery",
      });
    }

    if (!validateFacultyAccess(address)) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid faculty verification code" });
    }

    const order = await createOrderObject({
      userId,
      items,
      amount,
      discount,
      couponCode,
      address: updatedAddress,
      deliveryFee,
      paymentMethod: "COD",
    });

    await updateStock(order.items);
    await order.save();
    if (
  order.userId &&
  order.couponCode
) {
  await userModel.findByIdAndUpdate(
    order.userId,
    {
      $addToSet: {
        usedCoupons:
          order.couponCode.toUpperCase(),
      },
    }
  );
}

    // 🔔 EMIT NEW ORDER TO ADMIN
    const io = req.app.get("io");
    if (io) io.emit("new-order", order);

    await userModel.findByIdAndUpdate(userId, {
      $push: {
        notifications: {
          message: `✅ Order ${order.orderNumber} placed successfully`,
        },
      },
    });

    await clearUserCart(userId);

    res.json({ success: true, order });
  } catch (error) {
    console.error("COD ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "COD order failed",
    });
  }
};

/* ================= LIST ORDERS ================= */
export const listOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .sort({ createdAt: -1 })
      .populate("userId", "name phone");
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

/* ================= USER ORDERS ================= */
export const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated properly",
      });
    }

    const orders = await orderModel
      .find({ userId: String(userId) })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("USER ORDERS ERROR:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

/* ================= ACCEPT ORDER ================= */
export const acceptOrder = async (req, res) => {
  try {
    console.log("🔥 ACCEPT CLICKED:", req.body.orderId);

    const order = await orderModel.findById(
  req.body.orderId
);

if (!order) {
  return res.status(404).json({
    success: false,
    message: "Order not found",
  });
}

if (order.status !== "CONFIRMED") {
  return res.status(400).json({
    success: false,
    message: "Order already processed",
  });
}

order.status = "preparing";

await order.save();

    console.log("🔥 ORDER FOUND:", order);

    // 🔔 EMIT ORDER UPDATED — stops sound on admin if no more pending
    const io = req.app.get("io");
    if (io) io.emit("order-updated", order);

    if (order?.userId) {
      const user = await userModel.findByIdAndUpdate(
        order.userId,
        {
          $push: {
            notifications: {
              message: `🎉 Order ${order.orderNumber} accepted by kitchen`,
            },
          },
        },
        { new: true }
      );
      console.log("🔥 USER FOUND:", user?._id);
      console.log("🔥 TOTAL NOTIFICATIONS:", user?.notifications?.length);
    } else {
      console.log("❌ NO USER ID FOUND IN ORDER");
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ ACCEPT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= REJECT ORDER ================= */
export const rejectOrder = async (req, res) => {
  try {
    const order = await orderModel.findById(
  req.body.orderId
);

if (!order) {
  if (order.status === "rejected") {
  return res.status(400).json({
    success: false,
    message: "Order already rejected",
  });
}
  return res.status(404).json({
    success: false,
    message: "Order not found",
  });
}

order.status = "rejected";

if (order.paymentStatus === "PAID") {
  for (const item of order.items) {
    const food = await foodModel.findById(
      item._id
    );

    if (!food) continue;

    if (food.quantity !== null) {
      food.quantity += item.quantity;
      await food.save();
    }
  }
}

await order.save();

    const io = req.app.get("io");
    if (io) io.emit("order-updated", order);

    if (order?.userId) {
      await userModel.findByIdAndUpdate(order.userId, {
        $push: {
          notifications: {
            message: `❌ Order ${order.orderNumber} was rejected`,
          },
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("REJECT ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const kitchenOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({
      status: "preparing",
    });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "KITCHEN ORDERS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markPrepared = async (req, res) => {
  try {
    const order = await orderModel.findById(
  req.body.orderId
);

if (!order) {
  return res.status(404).json({
    success: false,
    message: "Order not found",
  });
}

if (order.status !== "preparing") {
  return res.status(400).json({
    success: false,
    message:
      "Order must be preparing first",
  });
}

order.status = "prepared";

await order.save();

    if (order?.userId) {
      await userModel.findByIdAndUpdate(
        order.userId,
        {
          $push: {
            notifications: {
              message: `🍔 Order ${order.orderNumber} is ready for pickup`,
            },
          },
        }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error(
      "MARK PREPARED ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markDelivered = async (req, res) => {
  try {
   const order = await orderModel.findById(
  req.body.orderId
);

if (!order) {
  return res.status(404).json({
    success: false,
    message: "Order not found",
  });
}

if (order.status !== "prepared") {
  return res.status(400).json({
    success: false,
    message:
      "Order must be prepared first",
  });
}

order.status = "delivered";

await order.save();

    if (order?.userId) {
      await userModel.findByIdAndUpdate(
        order.userId,
        {
          $push: {
            notifications: {
              message: `🎉 Order ${order.orderNumber} delivered successfully`,
            },
          },
        }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error(
      "MARK DELIVERED ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= GET ORDER STATUS ================= */
export const getOrderStatus = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    console.log(
      "📊 STATUS CHECK:",
      order._id,
      "Payment:",
      order.paymentStatus,
      "Status:",
      order.status
    );

return res.json({
  success: true,
  order: {
    _id: order._id,
    status: order.status,
    paymentStatus: order.paymentStatus,
  },
});
  } catch (error) {
    console.error("STATUS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ================= VERIFY PAYMENT ================= */
export const verifyOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const order = await orderModel.findById(orderId);
      if (order.paymentStatus === "PAID") {
  return res.json({
    success: true,
    message: "Order already verified",
  });
}

      if (!order) {
        return res.json({ success: false, message: "Order not found" });
      }

      await updateStock(order.items);

order.paymentStatus = "PAID";
order.status = "CONFIRMED";
order.payment = true;

order.reservationStatus = "COMPLETED";

      await order.save();
      await clearUserCart(order.userId);
      if (
  order.userId &&
  order.couponCode
) {
  await userModel.findByIdAndUpdate(
    order.userId,
    {
      $addToSet: {
        usedCoupons:
          order.couponCode.toUpperCase(),
      },
    }
  );
}

      // 🔔 EMIT NEW ORDER AFTER PAYMENT CONFIRMED
      const io = req.app.get("io");
      if (io) io.emit("new-order", order);

      if (order.userId) {
        await userModel.findByIdAndUpdate(order.userId, {
          $push: {
            notifications: {
              message: `✅ Order ${order.orderNumber} payment successful`,
            },
          },
        });
      }

      return res.json({ success: true });
    } else {
     const failedOrder =
  await orderModel.findById(orderId);

if (failedOrder) {
  await releaseReservedStock(
    failedOrder.items
  );

  failedOrder.paymentStatus = "FAILED";
  failedOrder.status = "CANCELLED";
  failedOrder.reservationStatus = "RELEASED";

  await failedOrder.save();
}

      return res.json({ success: false });
    }
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    return res.status(500).json({ success: false });
  }
};

/* ================= GET BILL ================= */
export const getBillByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    if (order.status !== "delivered") {
      return res.json({
        success: false,
        message: "Bill available only for delivered orders",
      });
    }

    const bill = {
      orderId: order.orderNumber,
      customerName: order.address?.fullName || "Customer",
      items: order.items,
      amount: order.amount,
      deliveryFee: order.deliveryFee || 0,
      totalAmount: order.amount + (order.deliveryFee || 0),
      status: order.status,
      createdAt: order.createdAt,
    };

    res.json({ success: true, bill });
  } catch (error) {
    console.error("GET BILL ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const cancelReservation = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.reservationStatus !== "ACTIVE" ||
      order.paymentStatus !== "PENDING"
    ) {
      return res.json({
        success: true,
      });
    }

    await releaseReservedStock(order.items);

    order.reservationStatus = "RELEASED";
    order.status = "CANCELLED";
    order.paymentStatus = "FAILED";

    await order.save();

    return res.json({
      success: true,
    });

  } catch (error) {
    console.error(
      "CANCEL RESERVATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
    });
  }
};
export const releaseExpiredReservations = async () => {
  try {
    const expiredOrders = await orderModel.find({
      paymentStatus: "PENDING",
      reservationStatus: "ACTIVE",
      reservationExpiresAt: { $lt: new Date() },
    });

    for (const order of expiredOrders) {
      await releaseReservedStock(order.items);

      order.reservationStatus = "RELEASED";
      order.status = "CANCELLED";
      order.paymentStatus = "FAILED";

      await order.save();

      console.log(
        `⏰ Reservation expired for Order ${order.orderNumber}`
      );
    }
  } catch (error) {
    console.error(
      "Reservation Cleanup Error:",
      error
    );
  }
};