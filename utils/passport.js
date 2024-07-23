
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth2').Strategy; 
// require('dotenv').config();

// passport.serializeUser((user , done)=>{
//       done(null,user);
// });
// passport.deserializeUser((user,done)=>{
//       done(null,user);
// });

// passport.use(new GoogleStrategy({
//       clientID:process.env.CLIENT_ID ,
//       clientSecret:process.env.CLIENT_SECRET,
//       callbackURL:'http://localhost:3000/google/callback',
//       passReqToCallback:true
// },
// function(request,accessToken,refreshToken,profile,done){
//       return done(null,profile);
// }
// ));

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('../Models/user'); 

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/google/callback',
  passReqToCallback: true,
},
async (request, accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create({
        name: profile.displayName,
        email: profile.email,
        is_verified: true,
      });
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));
