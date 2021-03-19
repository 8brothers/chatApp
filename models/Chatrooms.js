const mongoose = require('mongoose');
const connection = require('./connection');

let Schema = mongoose.Schema;
let findOrCreate = require('mongoose-findorcreate');
let ChatroomSchema = new Schema({
    roomName: String,
    roomType: String,
    usersAllowed: Number,    
    isActive:  { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: null }
});

ChatroomSchema.plugin(findOrCreate);
module.exports = mongoose.model('Chatroom', ChatroomSchema); 