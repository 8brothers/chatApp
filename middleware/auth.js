const express = require('express');
const route = express.Router();
const dotenv = require('dotenv');
const User = require('../models/User');
dotenv.config();

function authController(passport){

    route.get('/auth/google',
        passport.authenticate('google',
            {
                scope: [
                    'https://www.googleapis.com/auth/plus.login',
                    'https://www.googleapis.com/auth/userinfo.email'
                ]
            }
        )
    );

    route.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/error' }),
        function (req, res) {
            userInfo = res.req.user;
            displayName = res.req.user.displayName;
            email = res.req.user.email;
            img = res.req.user.profile_img;
            googleId = res.req.user.googleId;
            userId = res.req.user._id;
            res.redirect('/welcome');
    });

    return route;
}

module.exports = authController;