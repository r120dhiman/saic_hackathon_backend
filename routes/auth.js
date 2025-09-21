import express from "express"
import passport from "passport"

const router = express.Router()

// Check if Google OAuth is configured
const isGoogleOAuthConfigured = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET

// Google OAuth routes
if (isGoogleOAuthConfigured) {
  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

  router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173/dashboard")
  })
} else {
  // Fallback routes when Google OAuth is not configured
  router.get("/google", (req, res) => {
    res.status(503).json({ 
      error: "Google OAuth not configured", 
      message: "Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables" 
    })
  })

  router.get("/google/callback", (req, res) => {
    res.status(503).json({ 
      error: "Google OAuth not configured", 
      message: "Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables" 
    })
  })
}

// Logout route
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" })
    }
    res.json({ message: "Logged out successfully" })
  })
})

// Check authentication status
router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        profilePicture: req.user.profilePicture,
      },
    })
  } else {
    res.json({ isAuthenticated: false })
  }
})

export default router
