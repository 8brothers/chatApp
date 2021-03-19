
const path = require('path');
const http = require('http');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const socketio = require('socket.io');
const session = require('express-session');
let ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');

let userInfo = '';
let displayName = '';
let email = '';
let img = '';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketio(server);

var sessionMiddleware = session({
    secret: 'secret',
    key: 'tiger',
    resave: true,
    httpOnly: true,
    secure: true,
    ephemeral: true,
    saveUninitialized: true,
    cookie: {}
});

app.use(sessionMiddleware);

app.use(passport.initialize());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

const connection = require('./models/connection');
const ChatSchema = require('./models/Chat');
const UserSchema = require('./models/User');
const Chatroom = require('./models/Chatrooms');

passport.serializeUser(function (User, done) {
    done(null, User);
});   

const stratergy = require('./middleware/stratergy');
passport.use(stratergy);

passport.deserializeUser(function (User, done) {
    done(null, User);
});

const route = require('./routes/routes');
const socket = require('./controller/socket');
app.use(session({
    secret: '123456', resave: true,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 }
}));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(route(passport));
socket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));