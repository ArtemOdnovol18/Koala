const mongoose = require("mongoose");

const CardsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    perHour: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
});

const Cards = mongoose.model("Cards", CardsSchema);

module.exports = Cards;