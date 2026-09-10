import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
// Diagnostic: show whether env vars are present and log masked values
const hasGoogleId = Boolean(process.env.GOOGLE_CLIENT_ID);
const hasGoogleSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET);
const maskedId = hasGoogleId ? `${process.env.GOOGLE_CLIENT_ID.slice(0, 8)}...` : 'not-set';
const maskedSecret = hasGoogleSecret
  ? `${process.env.GOOGLE_CLIENT_SECRET.slice(0, 6)}...`
  : 'not-set';
console.log(`Google OAuth - CLIENT_ID set: ${hasGoogleId}, CLIENT_SECRET set: ${hasGoogleSecret}`);
console.log(`Google OAuth - CLIENT_ID: ${maskedId}, CLIENT_SECRET: ${maskedSecret}`);

// Build absolute callback URL (passport-google-oauth20 requires absolute callback)
const callbackURL =
  process.env.GOOGLE_REDIRECT_URI || `${process.env.CLIENT_URL}/api/auth/google/callback`;

// Only configure Google strategy if credentials are available
if (hasGoogleId && hasGoogleSecret) {
  try {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL,
          proxy: true, // Handle reverse proxy scenarios
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
              // Link account if email exists, otherwise create a new account
              const email = profile.emails && profile.emails[0] && profile.emails[0].value;
              if (!email) {
                return done(new Error('Google profile has no email'), null);
              }
              user = await User.findOne({ email });

              if (user) {
                user.googleId = profile.id;
                user.isVerified = true;
                await user.save();
              } else {
                user = await User.create({
                  name: profile.displayName,
                  email,
                  googleId: profile.id,
                  isVerified: true, // Auto-verify Google accounts
                });
              }
            }
            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        },
      ),
    );
    console.log('Google OAuth strategy registered.');
  } catch (err) {
    console.error('Failed to register Google OAuth strategy:', err.message);
  }
} else {
  console.warn('⚠️  Google OAuth credentials not configured. OAuth login will be disabled.');
}
