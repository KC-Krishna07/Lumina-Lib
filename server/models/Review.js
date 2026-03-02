const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    bookId: { type: String, required: true },
    userId: { type: String, required: true }, // Ensure this field exists!
    username: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);