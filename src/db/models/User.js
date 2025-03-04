const mongoose = require("mongoose");



const UserSchema = new mongoose.Schema({
    telegramId: { type: Number, required: true, unique: true, index: true },
    username: { type: String, required: true },
    ref: { type: Number, required: false },
    premium: { type: Boolean, required: true },
    fullname: { type: String, required: true },
    coin: { type: Number, required: true, default: 0 },
    spin: { type: Number, required: true, default: 1 },
    totalSpin: { type: Number, required: true, default: 0 },
    hourlyEarn: { type: Number, required: true, default: 10 },
    cards: { type: Array, required: true },
    tasks: { type: Array, required: true },
    lastLogin: { type: Date, required: true, default: Date.now },
    createdAt: { type: Date, required: true, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;