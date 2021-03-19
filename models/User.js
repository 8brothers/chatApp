const mongoose = require('mongoose');
const connection = require('./connection');
let findOrCreate = require('mongoose-findorcreate');
let Schema = mongoose.Schema;

let UserSchema = new Schema({
    googleId: String,
    email: String,
    displayName: String,
    first_name: String,
    last_name: String,
    profile_img: String,
    provider: String,    
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: null }
});
UserSchema.plugin(findOrCreate);
module.exports = mongoose.model('User', UserSchema);