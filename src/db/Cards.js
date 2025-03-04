import mongoose from "mongoose";

const CardsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    perHour: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
});

export default mongoose.models.Cards || mongoose.model('Cards', CardsSchema);