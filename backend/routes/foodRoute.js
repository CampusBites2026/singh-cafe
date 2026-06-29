import express from "express";
import multer from "multer";

import {
  addFood,
  listFood,
  removeFood,
  updateFood,
  toggleFoodStatus,
  updateQuantity,
} from "../controllers/foodController.js";

const foodRouter = express.Router();

/* ================================
   IMAGE STORAGE (MULTER)
================================ */

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${file.originalname}`
    );
  },
});

const upload = multer({ storage });

/* ================================
   ROUTES
================================ */

// Get all foods
foodRouter.get("/list", listFood);

// Add food
foodRouter.post(
  "/add",
  upload.single("image"),
  addFood
);

// Update food
foodRouter.post(
  "/update",
  upload.single("image"),
  updateFood
);

// Remove food
foodRouter.post(
  "/remove",
  removeFood
);

// Pause / Resume food
foodRouter.post(
  "/toggle-status",
  toggleFoodStatus
);

// Update quantity
foodRouter.post(
  "/update-quantity",
  updateQuantity
);

export default foodRouter;