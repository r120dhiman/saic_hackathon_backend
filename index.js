import express from "express"
import mongoose from "mongoose"
import session from "express-session"
import passport from "passport"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import reportRoutes from "./routes/reports.js"
import userRoutes from "./routes/users.js"
import "./config/passport.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "health-report-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use("/auth", authRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/users", userRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Health Report API is running" })
})

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
  })
