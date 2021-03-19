const mongoose = require('mongoose');
const connection = require('./connection');
let Schema = mongoose.Schema;

let ChatSchema = new Schema({
    message: String,
    msgtimestamp: String,
    senderId: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    receiverId: [{ type: Schema.Types.ObjectId, ref: 'User' }],    
    chatroomId: [{ type: Schema.Types.ObjectId, ref: 'Chatroom' }],
    channelId: String,    
    //stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }],
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Chat', ChatSchema);