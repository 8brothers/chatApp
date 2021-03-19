const dotenv = require('dotenv');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/User');
dotenv.config();
console.log(process.env.CALLBACK_URL);

const stratergy = new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
},
    async function (accessToken, refreshToken, profile, done) {
        //save information in database                   
        try {
            user = await User.find({ email: profile.emails[0].value });
            if (!user.length) {                
                
                user = await User.create({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    first_name: profile.name.givenName,
                    last_name: profile.name.familyName,
                    email: profile.emails[0].value,
                    profile_img: profile.photos[0].value,
                    provider: profile.provider
                });                
            } 
            
            return done(null, user);            
        } catch (error) {
            return done(error, null);            
        }
               
    }
);

module.exports = stratergy;