const express = require('express'); 
const route = express.Router();
const bodyParser = require('body-parser');
const Chatroom = require('../models/Chatrooms');
const User = require('../models/User');
const Chat = require('../models/Chat');
const qs = require('querystring');


function routeFunction(passport){

    // route.use('', authController(passport));

    route.get('/', (req, res) => {
        res.render('index'); 
    });

    route.get('/chatview', (req, res) => {
        res.render('chatapp');
    });    

    route.get('/error', (req, res) => {
            res.render('error');
    });   
    
    route.post('/checkuser', (req, res) => {                
        User.find({ email: req.body.email}).select('displayName email profile_img')
            .then(users => {
                if (!users) {
                    return res.status(404).json({ userNotFound: "No user found" });
                }
                res.json(users);
            })
            .catch(err => console.log("Error while fetching users from DB" + err));
    });

    route.get('/getusers', (req, res) => {
        User.find({}).select('displayName email profile_img')
            .then(users => {
                if(!users){
                    return res.status(404).json({userNotFound: "No user found"});
                }
                res.json(users);
            })
            .catch(err => console.log("Error while fetching users from DB" + err));
    });

    route.get('/getprivatechat', (req,res) => {
        let channelid1 = req.query.channelid1;
        let channelid2 = req.query.channelid2;
                
        Chat.find({ channelId: { $in: [ channelid1, channelid2 ] }})
                .populate('senderId')
                .populate('receiverId')                                
            .then(chats => {
                if (!chats) {
                    return res.status(404).json({ chatNotFound: "No Chat Found" });
                }
                res.json(chats);
            })
            .catch(err => console.log("got some error in chat " + err));
    });


    route.post('/addrooms', (req, res) => {
        const name = req.body.roomName;
        const type = req.body.roomtype;
        const allowed = req.body.usersAllowed;
        const isActive = req.body.isActive;
        let roomdata = { roomName: name, roomType: type, usersAllowed: allowed, isActive: isActive};
                
        Chatroom.findOrCreate(roomdata, function (err, room) {            
            res.render('addroom',{msg:'room added successfully'});                            
        });
    });    

    route.get('/addroom', (req, res) => {
        res.render('addroom');
    });
    

    route.get('/welcome',         
        async(req, res) => {
            let roomsMap = [];        
            let user = req.session.userInfo[0];
            try{
                roomsMap = await Chatroom.find({}).select('roomName roomType userAllowed')            
            }
            catch(err) {
                res.status(400).json({ message: "Not able to get rooms" });         
            };  
            //roomsMap is returning proprer json
            res.render('welcome', {
                name: user.displayName,
                email: user.email,
                user: user.userInfo,
                img: user.profile_img,
                googleId: user.googleId,
                userId: user.userId,
                rooms: roomsMap
        });
    });    

    route.post("/chat",         
        (req, res) => {            
            let postdata = req.body;                                                 
            let room = JSON.parse(postdata.room);   
            
            if (room.roomName != 'none'){
                res.render('chatrooms', {
                    displayName: postdata.username,
                    room: room.roomName,
                    roomid: room._id,
                    email: postdata.email,
                    img: postdata.img,
                    googleId: postdata.googleId,
                    userId: postdata.userId
                });
            }else{
                res.render('chat', {
                    displayName: postdata.username,
                    room: room.roomName,
                    roomid: room._id,
                    email: postdata.email,
                    img: postdata.img,
                    googleId: postdata.googleId,
                    userId: postdata.userId
                });
            }
    });

    route.get('/logout', function (req, res) {
        console.log('logout route called');
        req.logout(); 
        res.redirect('/');
    });

    route.get('/auth/google',
        passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email']})
    );

    route.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/error' }),
        function (req, res) {                        
            req.session.userInfo = res.req.user;
            req.session.displayName = res.req.user.displayName;
            req.session.email =  res.req.user.email;
            req.session.img = res.req.user.profile_img;
            req.session.googleId = res.req.user.googleId;
            req.session.userId = res.req.user._id;

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

module.exports = routeFunction;