import express from "express"
import { requireAuth } from "../middleware/auth.js"
import User from "../models/User.js"

const router = express.Router()

// Get user profile
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-googleId")
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" })
  }
})

// Update user profile
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { dateOfBirth, sex } = req.body

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { dateOfBirth, sex },
      { new: true, runValidators: true },
    ).select("-googleId")

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: "Failed to update user profile" })
  }
})

export default router
