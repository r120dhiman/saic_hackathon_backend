export const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.status(401).json({ error: "Authentication required" })
}

export const optionalAuth = (req, res, next) => {
  // Middleware that doesn't require auth but provides user info if available
  next()
}
