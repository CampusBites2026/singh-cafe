// ================================
// server.js (FINAL WITH SOCKET.IO)
// ================================

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

// =====================================
// FIX __dirname (ES MODULE SUPPORT)
// =====================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================
// LOAD ENV FILE
// =====================================

dotenv.config({ path: path.resolve(__dirname, ".env") });

// =====================================
// IMPORT ROUTES
// =====================================

import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import posRoutes from "./routes/posRoutes.js";
import settingsRoute from "./routes/settingsRoute.js";
import reportRoutes from "./routes/reportRoutes.js";
import categoryRouter from "./routes/categoryRoute.js";
import couponRouter from "./routes/couponRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import { releaseExpiredReservations } from "./controllers/orderController.js";

// =====================================
// INIT APP
// =====================================

const app = express();
app.disable("x-powered-by");

const PORT = process.env.PORT || 5000;

// =====================================
// CREATE HTTP SERVER
// =====================================

const server = http.createServer(app);

// =====================================
// ALLOWED ORIGINS
// =====================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5500",
  "https://campusbitessinghcafe.vercel.app",
  "https://campusbitessinghcafeadmin.vercel.app",
];

// =====================================
// SOCKET.IO SETUP
// =====================================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Make io available everywhere
app.set("io", io);

// Socket Connection
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// =====================================
// CORS
// =====================================

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// =====================================
// MIDDLEWARE
// =====================================

// Razorpay webhook must be BEFORE express.json()
app.use(
  "/api/payment/webhook",
  express.raw({ type: "application/json" })
);

// Body parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// =====================================
// STATIC FILES
// =====================================

app.use("/images", express.static(path.join(__dirname, "uploads")));

// =====================================
// API ROUTES
// =====================================

app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/payment", paymentRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/settings", settingsRoute);
app.use("/api/reports", reportRoutes);
app.use("/api/categories", categoryRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/review", reviewRouter);

// =====================================
// HEALTH CHECK
// =====================================

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Working",
    timestamp: new Date().toISOString(),
    paymentStatus: "READY",
  });
});

// =====================================
// ROOT ROUTE
// =====================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Campus Bites Backend Running",
  });
});

// =====================================
// 404 HANDLER
// =====================================

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// =====================================
// START SERVER
// =====================================

const startServer = async () => {
  try {
    await connectDB();

    // Release expired stock reservations every minute
    setInterval(async () => {
      try {
        await releaseExpiredReservations();
      } catch (error) {
        console.error(
          "❌ Reservation Cleanup Error:",
          error.message
        );
      }
    }, 60000);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server started on port ${PORT}`);
      console.log(`⚡ Socket.IO running`);
      console.log(
        `📱 Webhook ready: http://localhost:${PORT}/api/payment/webhook`
      );
    });
  } catch (error) {
    console.error("❌ Server Startup Failed:", error);
    process.exit(1);
  }
};

startServer();
