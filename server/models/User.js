const mongoose = require('mongoose'); // This was the missing line!

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: { type: String, default: "" }, 
    profilePic: { type: String, default: "" },   
    savedBooks: { type: Array, default: [] },
    likedBooks: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);