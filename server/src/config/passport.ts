import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { User } from "../models/User"
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_ENABLED, SERVER_URL } from "./env"

if (GOOGLE_ENABLED) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${SERVER_URL}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id })

          if (user) {
            return done(null, user)
          }

          // Check if user exists with same email
          user = await User.findOne({ email: profile.emails?.[0]?.value })

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id
            user.profileImageUrl = profile.photos?.[0]?.value
            await user.save()
            return done(null, user)
          }

          // Create new user
          user = await User.create({
            name: profile.displayName || "Google User",
            email: profile.emails?.[0]?.value || "",
            dob: new Date("1990-01-01"), // Default DOB for Google users
            passwordHash: "", // No password for Google users
            isEmailVerified: true,
            googleId: profile.id,
            profileImageUrl: profile.photos?.[0]?.value,
          })

          return done(null, user)
        } catch (error) {
          return done(error, false)
        }
      },
    ),
  )
}

passport.serializeUser((user: any, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findOne({ _id: id })
    done(null, user || false)
  } catch (error) {
    done(error, false)
  }
})
