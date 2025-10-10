import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { roll, password } = req.body;

  const user = await User.findOne({ roll });
  if (!user) return res.status(404).json({ message: "Roll not found" });

  if (user.password !== password)
    return res.status(401).json({ message: "Incorrect password" });

  const token = jwt.sign({ roll: user.roll }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.status(200).json({ message: "Login successful", token });
});

export default router;
