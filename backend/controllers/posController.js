import orderModel from "../models/orderModel.js";
import foodModel from "../models/foodModel.js";

import generateOrderNumber from "../utils/generateOrderNumber.js";

import {
  validateStock,
  updateStock,
} from "../utils/stockManager.js";

/* ================= CREATE POS ORDER ================= */
const createPosOrder = async (req, res) => {
  console.log("🔥 POS API HIT");
  console.log(
    "POS ORDER RECEIVED:",
    JSON.stringify(req.body, null, 2)
  );

  try {
   const {
  items,
  customerName,
  customerPhone,
  amount,
  status,
  paymentStatus,
  orderType,
} = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart empty",
      });
    }

    if (items.some((item) => !item.productType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid items (missing product type)",
      });
    }

    // ✅ Check stock before creating order
    await validateStock(items);

    const orderNumber = await generateOrderNumber();

    const formattedItems = [];

    for (const item of items) {
      const food = await foodModel.findById(item._id);

      if (!food) {
        return res.status(404).json({
          success: false,
          message: `${item.name} not found`,
        });
      }

      formattedItems.push({
        _id: food._id,
        name: food.name,
        price: food.price, // Always use latest DB price
        quantity: Number(item.quantity),
        productType:
          String(food.productType)
            .trim()
            .toLowerCase() === "packed"
            ? "Packed"
            : "Unpacked",
      });
    }

    const order = new orderModel({
      orderNumber,
      items: formattedItems,
      amount: Number(amount),

      source: "POS",
orderType: orderType || "Dine-In",
      paymentMethod: "POS",

      paymentStatus:
        paymentStatus === "paid"
          ? "PAID"
          : "PENDING",

      payment:
        paymentStatus === "paid",

      address: {
        fullName:
          customerName || "Walk-in",

        phone:
          customerPhone || "",
      },

      status:
        status || "preparing",
    });

    // ✅ Reduce stock
    await updateStock(order.items);

    // ✅ Save order
    await order.save();

    console.log(
      "✅ POS ORDER SAVED:",
      JSON.stringify(order.items, null, 2)
    );

    res.json({
      success: true,
      orderId: order._id,
    });
  } catch (error) {
    console.error(
      "POS ORDER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message || "POS order failed",
    });
  }
};

/* ================= LIST POS ORDERS ================= */

const listPosOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
    });
  }
};

/* ================= UPDATE POS STATUS ================= */

const updatePosStatus = async (
  req,
  res
) => {
  try {
    const { orderId, status } =
      req.body;

    await orderModel.findByIdAndUpdate(
      orderId,
      { status }
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
    });
  }
};

export {
  createPosOrder,
  listPosOrders,
  updatePosStatus,
};
