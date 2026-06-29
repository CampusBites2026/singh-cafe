import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      console.error("❌ MONGODB_URL is not defined");
      process.exit(1);
    }

    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(
      process.env.MONGODB_URL
    );

    console.log(
      `✅ MongoDB Connected: ${conn.connection.name}`
    );

    console.log(
      `🌐 MongoDB Host: ${conn.connection.host}`
    );

    // =====================================
    // REMOVE OLD REVIEW INDEX AUTOMATICALLY
    // =====================================

    try {
      const db = mongoose.connection.db;

      const indexes = await db
        .collection("reviews")
        .indexes();

      const oldIndex = indexes.find(
        (index) =>
          index.name === "foodId_1_userId_1"
      );

      if (oldIndex) {
        await db
          .collection("reviews")
          .dropIndex(
            "foodId_1_userId_1"
          );

        console.log(
          "✅ Removed old review index: foodId_1_userId_1"
        );
      } else {
        console.log(
          "✅ Old review index already removed"
        );
      }
    } catch (err) {
      console.log(
        "ℹ️ Review index check:",
        err.message
      );
    }

    mongoose.connection.on(
      "error",
      (err) => {
        console.error(
          "❌ MongoDB Error:",
          err.message
        );
      }
    );

    mongoose.connection.on(
      "disconnected",
      () => {
        console.warn(
          "⚠️ MongoDB Disconnected"
        );
      }
    );

    mongoose.connection.on(
      "reconnected",
      () => {
        console.log(
          "✅ MongoDB Reconnected"
        );
      }
    );

    return conn;
  } catch (error) {
    console.error(
      "❌ MongoDB Connection Failed:",
      error.message
    );

    process.exit(1);
  }
};