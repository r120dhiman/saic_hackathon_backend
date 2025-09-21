import dotenv from "dotenv"
dotenv.config()

import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import User from "../models/User.js"

// Only configure Google OAuth if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id })

          if (user) {
            return done(null, user)
          }

          // Create new user
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            profilePicture: profile.photos[0].value,
          })

          await user.save()
          return done(null, user)
        } catch (error) {
          return done(error, null)
        }
      },
    ),
  )
} else {
  console.warn("Google OAuth credentials not found. Authentication will not work until GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.")
}

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

