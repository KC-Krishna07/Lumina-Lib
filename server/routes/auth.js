const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Review = require('../models/Review');

// --- 1. UPDATE PASSWORD (IMPORTANT: Keep this at the top) ---
router.put('/profile/update-password', async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ msg: "Password updated successfully! 🔐" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- 2. UPDATE PROFILE ---
router.put('/profile/update', async (req, res) => {
    const { userId, displayName, profilePic } = req.body;
    try {
        const user = await User.findByIdAndUpdate(userId, { displayName, profilePic }, { new: true });
        res.json(user);
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

// --- 3. REVIEWS & AUTH (The rest of your code) ---
router.post('/reviews/add', async (req, res) => {
    try {
        const newReview = new Review(req.body);
        await newReview.save();
        res.json(newReview);
    } catch (err) { res.status(500).json({ error: "Review failed" }); }
});

router.get('/reviews/:bookId', async (req, res) => {
    try {
        const decodedId = decodeURIComponent(req.params.bookId);
        const reviews = await Review.find({ bookId: decodedId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

router.delete('/reviews/:id', async (req, res) => {
    try {
        const { userId } = req.body;
        const review = await Review.findById(req.params.id);
        if (!review || review.userId !== userId) return res.status(403).json({ error: "Unauthorized" });
        await Review.findByIdAndDelete(req.params.id);
        res.json({ msg: "Deleted" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, email, password: hashedPassword });
        const savedUser = await newUser.save();
        const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);
        res.status(201).json({ token, user: { id: savedUser._id, username, email } });
    } catch (err) { res.status(500).json({ error: "Signup error" }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ msg: "Invalid credentials" });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic, displayName: user.displayName, savedBooks: user.savedBooks, likedBooks: user.likedBooks } });
    } catch (err) { res.status(500).json({ error: "Login error" }); }
});

router.post('/sync', async (req, res) => {
    try {
        const { userId, savedBooks, likedBooks } = req.body;
        const updatedUser = await User.findByIdAndUpdate(userId, { savedBooks, likedBooks }, { new: true });
        res.json({ msg: "Synced", user: updatedUser });
    } catch (err) { res.status(500).json({ error: "Sync failed" }); }
});

module.exports = router;