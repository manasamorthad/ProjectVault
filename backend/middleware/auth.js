import jwt from "jsonwebtoken";

// Existing middleware for students
export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// New Admin Authentication Middleware
export const adminAuthMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden. Admin access required." });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};