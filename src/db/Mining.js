import mongoose from "mongoose";

const miningSchema = new mongoose.Schema({
    reward: Number,
    percentage: Number,
});

export default mongoose.models.Mining || mongoose.model('Mining', miningSchema);