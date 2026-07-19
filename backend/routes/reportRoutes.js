import express from "express";
import Order from "../models/orderModel.js";
import PosOrder from "../models/posOrderModel.js";

const router = express.Router();

/* ===========================================================
   COMMON HELPERS
=========================================================== */

const getAmount = (order) => {
  return Number(order.totalAmount || order.amount || 0);
};

const getStatusCounts = (orders) => {
  const counts = {
    pending: 0,
    preparing: 0,
    prepared: 0,
    delivered: 0,
    rejected: 0,
    cancelled: 0,
  };

  orders.forEach((order) => {
    const status = (order.status || "").toLowerCase();

    if (counts.hasOwnProperty(status)) {
      counts[status]++;
    }
  });

  return counts;
};

const getRevenueBreakdown = (onlineOrders, posOrders) => {
  let onlineCollection = 0;
  let codCollection = 0;
  let cashCollection = 0;
  let upiCollection = 0;

  onlineOrders.forEach((order) => {
    if ((order.status || "").toLowerCase() !== "delivered") return;

    const amount = getAmount(order);

    if (
      order.payment === true ||
      (order.paymentMethod || "").toLowerCase() === "online"
    ) {
      onlineCollection += amount;
    } else {
      codCollection += amount;
    }
  });

  posOrders.forEach((order) => {
    if ((order.status || "").toLowerCase() !== "delivered") return;

    const amount = getAmount(order);

    if ((order.paymentMethod || "").toLowerCase() === "cash") {
      cashCollection += amount;
    }

    if ((order.paymentMethod || "").toLowerCase() === "upi") {
      upiCollection += amount;
    }
  });

const websiteTotal =
  onlineCollection + codCollection;

const posTotal =
  cashCollection + upiCollection;

return {
  website: {
    online: onlineCollection,
    cod: codCollection,
    total: websiteTotal,
  },

  pos: {
    cash: cashCollection,
    upi: upiCollection,
    total: posTotal,
  },

  grossRevenue: websiteTotal + posTotal,
};
};

const getPackedUnpackedSales = (orders) => {
  let packedSales = 0;
  let unpackedSales = 0;

  orders.forEach((order) => {
    if ((order.status || "").toLowerCase() !== "delivered") return;

    (order.items || []).forEach((item) => {
      const amount =
        Number(item.price || 0) *
        Number(item.quantity || 1);

      const type = (item.productType || "")
        .trim()
        .toLowerCase();

      if (type === "packed") {
        packedSales += amount;
      } else {
        unpackedSales += amount;
      }
    });
  });

  return {
    packedSales,
    unpackedSales,
  };
};

const getTopItems = (orders) => {
  const items = {};

  orders.forEach((order) => {
    if ((order.status || "").toLowerCase() !== "delivered") return;

    (order.items || []).forEach((item) => {
      if (!items[item.name]) {
        items[item.name] = {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
      }

      items[item.name].quantity += Number(item.quantity || 1);

      items[item.name].revenue +=
        Number(item.price || 0) *
        Number(item.quantity || 1);
    });
  });

  return Object.values(items)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);
};

const normalizeOrders = (onlineOrders, posOrders) => {
  const website = onlineOrders.map((order) => ({
    ...order.toObject(),
    source: "Website",
  }));

  const pos = posOrders.map((order) => ({
    ...order.toObject(),
    source: "POS",
  }));

  return [...website, ...pos].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};
/* ===========================================================
   SHARED REPORT GENERATOR
=========================================================== */

const buildReport = async (start, end, mode) => {
  // Fetch orders
  const onlineOrders = await Order.find({
    createdAt: {
      $gte: start,
      $lt: end,
    },
  }).sort({ createdAt: -1 });

  const posOrders = await PosOrder.find({
    createdAt: {
      $gte: start,
      $lt: end,
    },
  }).sort({ createdAt: -1 });

  // Merge Website + POS
  const allOrders = normalizeOrders(
    onlineOrders,
    posOrders
  );

  // Status Summary
  const status = getStatusCounts(allOrders);

  // Revenue Summary
  const revenue = getRevenueBreakdown(
    onlineOrders,
    posOrders
  );

  // Packed / Unpacked
  const sales = getPackedUnpackedSales(
    allOrders
  );

  // Top Selling Items
  const topItems = getTopItems(allOrders);

  // Order Type Counts
  const websiteOrders =
    allOrders.filter(
      (o) => o.source === "Website"
    ).length;

  const posOrderCount =
    allOrders.filter(
      (o) => o.source === "POS"
    ).length;

  // Discount Total
  const totalDiscount = allOrders.reduce(
    (sum, order) =>
      sum + Number(order.discount || 0),
    0
  );

  // Delivery Charges
  const totalDeliveryCharge =
    allOrders.reduce(
      (sum, order) =>
        sum +
        Number(order.deliveryFee || 0),
      0
    );

  // Average Order Value
  const averageOrderValue =
    status.delivered > 0
      ? Math.round(
          revenue.grossRevenue /
            status.delivered
        )
      : 0;

  // Net Revenue
  const netRevenue =
    revenue.grossRevenue -
    totalDiscount;

  return {
    success: true,

    mode,

    generatedAt: new Date(),

    totalOrders: allOrders.length,

    websiteOrders,

    posOrders: posOrderCount,

    status,

revenue: {
  grossRevenue: revenue.grossRevenue,

  netRevenue,

  website: revenue.website,

  pos: revenue.pos,

  totalDiscount,

  totalDeliveryCharge,

  averageOrderValue,
},

    sales,

    topItems,

    orders: allOrders,
  };
};

/* ===========================================================
   MONTHLY REPORT
=========================================================== */

router.get(
  "/monthly",
  async (req, res) => {
    try {
      const { month } = req.query;

      if (!month) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Month is required",
          });
      }

      const [year, monthNumber] =
        month.split("-");

      const start = new Date(
        Number(year),
        Number(monthNumber) - 1,
        1
      );

      const end = new Date(
        Number(year),
        Number(monthNumber),
        1
      );

      const report =
        await buildReport(
          start,
          end,
          "monthly"
        );

      res.json(report);
    } catch (error) {
      console.error(
        "Monthly Report Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to generate monthly report",
      });
    }
  }
);
/* ===========================================================
   DAILY REPORT
=========================================================== */

router.get("/daily", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const start = new Date(date);

    start.setHours(0, 0, 0, 0);

    const end = new Date(start);

    end.setDate(end.getDate() + 1);

    const report = await buildReport(
      start,
      end,
      "daily"
    );

    res.json(report);
  } catch (error) {
    console.error("Daily Report Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate daily report",
    });
  }
});

/* ===========================================================
   REPORT SUMMARY API
   GET /api/reports/summary
=========================================================== */

router.get("/summary", async (req, res) => {
  try {
    const today = new Date();

    const monthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const report = await buildReport(
      monthStart,
      today,
      "summary"
    );

    res.json(report);
  } catch (error) {
    console.error("Summary Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate summary",
    });
  }
});

/* ===========================================================
   FUTURE EXPORT PLACEHOLDER
=========================================================== */

router.get("/export", async (req, res) => {
  res.json({
    success: true,
    message:
      "Excel and PDF export will be connected here.",
  });
});

export default router;
