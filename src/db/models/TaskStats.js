const mongoose = require("mongoose");

const TaskStatsSchema = new mongoose.Schema({
    taskId: { type: String, required: true, unique: true, index: true },
    reward: { type: Number, required: true, default: 0 },
    count: { type: Number, default: 0 },
    taskName: { type: String, required: true },
});

const TaskStats = mongoose.model("TaskStats", TaskStatsSchema);

module.exports = TaskStats;
