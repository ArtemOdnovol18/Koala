const mongoose = require('mongoose');
const UserTasksSchema = new mongoose.Schema({
    telegramId: { type: Number, required: true, index: true },
    taskId: { type: String, required: true },
    status: { type: String, required: true, default: "check" },
    reward: { type: Number, required: true },
    telegramFollow: { type: Boolean, required: true, default: false },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
});

const UserTasks = mongoose.model("UserTasks", UserTasksSchema);

module.exports = UserTasks;