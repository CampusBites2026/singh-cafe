import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    let token = null;

    // Get token from Authorization header
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;

      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // Fallback support
    if (!token && req.headers.token) {
      token = req.headers.token;
    }

    // No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized, Login Again",
      });
    }

    // Verify JWT
const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET
);

const userId =
  decoded?.id ||
  decoded?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

req.user = {
  id: String(userId),
  token,
};

    next();

  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

export default authMiddleware;