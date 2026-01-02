import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/userModel"; // Importamos el modelo
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0].value;
        const displayName = profile.displayName;

        if (!email) {
          return done(new Error("Google no proporcionó un email"), undefined);
        }

        const user = await UserModel.findOrCreateByGoogle(googleId, email, displayName);

        return done(null, user);

      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

export default passport;