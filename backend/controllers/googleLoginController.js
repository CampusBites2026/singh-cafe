import { OAuth2Client } from "google-auth-library";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// 🔐 JWT generator
const createToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const googleLoginUser = async (
  req,
  res
) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token missing",
      });
    }

    // ✅ Verify Google token
    const ticket =
      await client.verifyIdToken({
        idToken: token,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload =
      ticket.getPayload();

    if (!payload) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Google token",
      });
    }

    const {
      email,
      name,
      picture,
      sub,
    } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
      });
    }

    // ✅ Find existing user
    let user =
      await userModel.findOne({
        email,
      });

    // ✅ Create new Google user
    if (!user) {
      const hashedPassword =
        await bcrypt.hash(
          "google-auth-user",
          10
        );

      user =
        await userModel.create({
          name,
          email,
          password:
            hashedPassword,
          image: picture || "",
          googleId: sub,
        });
    } else {
      // ✅ Update Google data if missing
      let updated = false;

      if (
        !user.googleId &&
        sub
      ) {
        user.googleId = sub;
        updated = true;
      }

      if (
        !user.image &&
        picture
      ) {
        user.image = picture;
        updated = true;
      }

      if (updated) {
        await user.save();
      }
    }

    const authToken =
      createToken(user._id);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
    };

    return res.status(200).json({
      success: true,
      token: authToken,
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "GOOGLE LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Google Login Failed",
    });
  }
};

export default googleLoginUser;