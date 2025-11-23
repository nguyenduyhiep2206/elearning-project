require('dotenv').config();
const passport =require ('passport');
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
//import { Strategy as FacebookStrategy } from "passport-facebook";
const Users =require ('../models/users');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await Users.findOne({ where: { email } });

        if (!user) {
          user = await Users.create({
            fullname: profile.displayName,
            email: email,
            passwordhash: null,
            role: "Student",
            profilepicture: profile.photos?.[0]?.value || null,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_CLIENT_ID,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//       callbackURL: process.env.FACEBOOK_CALLBACK_URL,
//       profileFields: ["id", "displayName", "emails", "photos"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
//         let user = await Users.findOne({ where: { email } });

//         if (!user) {
//           user = await Users.create({
//             fullname: profile.displayName,
//             email: email,
//             passwordhash: null,
//             role: "Student",
//             profilepicture: profile.photos?.[0]?.value || null,
//           });
//         }
//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

passport.serializeUser((user, done) => done(null, user.userid));
passport.deserializeUser(async (id, done) => {
  const user = await Users.findByPk(id);
  done(null, user);
});
module.exports = passport;