import mongoose from "mongoose";
const FrensSchema = new mongoose.Schema({
    telegramId: { type: Number, required: true, index: true },
    username: { type: String, required: true },
    ref: { type: Number, required: true, index: true },
    reward: { type: Number, required: true, default: 0 },
    level: { type: Number, required: true, default: 1 },
    createdAt: { type: Date, required: true, default: Date.now },
});

export default mongoose.models.Frens || mongoose.model('Frens', FrensSchema);