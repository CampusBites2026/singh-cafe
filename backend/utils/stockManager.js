import foodModel from "../models/foodModel.js";

/* ===========================================================
   REDUCE ACTUAL STOCK
=========================================================== */
export const updateStock = async (items) => {
  console.log("🔥 updateStock CALLED");
  console.log("Items:", JSON.stringify(items, null, 2));

  for (const item of items) {
    console.log("Checking item:", item);

    const qty = Number(item.quantity) || 1;

    console.log("Finding food by id:", item._id);

    const food = await foodModel.findById(item._id);

    console.log("Food found:", food);

    if (!food) {
      throw new Error(`${item.name} not found`);
    }


    // Unlimited stock
    if (food.quantity === null) {
      continue;
    }

    if (food.quantity < qty) {
      throw new Error(`${food.name} is out of stock`);
    }

    food.quantity -= qty;

    food.reservedQuantity = Math.max(
      (food.reservedQuantity || 0) - qty,
      0
    );

    await food.save();

    console.log(
      `✅ Stock Updated -> ${food.name} | Remaining: ${food.quantity}`
    );
  }
};

/* ===========================================================
   RESERVE STOCK (ONLINE PAYMENT)
=========================================================== */
export const reserveStock = async (items) => {
  for (const item of items) {
    const qty = Number(item.quantity) || 1;

    const food = await foodModel.findById(item._id);

    if (!food) {
      throw new Error(`${item.name} not found`);
    }

    // Unlimited stock
    if (food.quantity === null) {
      continue;
    }

    const available =
      food.quantity - (food.reservedQuantity || 0);

    if (available < qty) {
      throw new Error(
        `${food.name} only ${available} left in stock`
      );
    }

    food.reservedQuantity =
      (food.reservedQuantity || 0) + qty;

    await food.save();

    console.log(
      `🔒 Reserved ${qty} x ${food.name}`
    );
  }
};

/* ===========================================================
   RELEASE RESERVED STOCK
=========================================================== */
export const releaseReservedStock = async (items) => {
  for (const item of items) {
    const qty = Number(item.quantity) || 1;

    const food = await foodModel.findById(item._id);

    if (!food) continue;

    if (food.quantity === null) {
      continue;
    }

    food.reservedQuantity = Math.max(
      (food.reservedQuantity || 0) - qty,
      0
    );

    await food.save();

    console.log(
      `🔓 Released ${qty} x ${food.name}`
    );
  }
};

/* ===========================================================
   VALIDATE STOCK (POS + COD)
=========================================================== */
export const validateStock = async (items) => {
  for (const item of items) {
    const qty = Number(item.quantity) || 1;

    const food = await foodModel.findById(item._id);

    if (!food) {
      throw new Error(`${item.name} not found`);
    }

    // Unlimited stock
    if (food.quantity === null) {
      continue;
    }

    if (food.quantity < qty) {
      throw new Error(
        `${food.name} only ${food.quantity} left`
      );
    }
  }
};