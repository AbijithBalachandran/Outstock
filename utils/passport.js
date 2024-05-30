const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2');
require('dotenv').config();

passport.serializeUser((user , done)=>{
      done(null,user);
});
passport.deserializeUser((user,done)=>{
      done(null,user);
});

passport.use(new GoogleStrategy({
      clientID:process.env.CLIENT_ID ,
      clientSecret:process.env.CLIENT_SECRET,
      callbackURL:'http://localhost:3000/google/callback',
      passReqToCallback:true
},
function(request,accessToken,refreshToken,profile,done){
      return done(null,profile);
}
));
