import mongoose from "mongoose";

const TasksSchema = new mongoose.Schema({
    taskId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    value: { type: Number, required: true },
    url: { type: String },
    isMainTask: { type: Boolean, required: true },
    icon: { type: String, required: true },
    subTasks: { type: Array, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    status: { type: Boolean, required: true, default: true },
    isTelegramFollow: { type: Boolean, required: true, default: false },
    chatId: { type: String },
    category: { type: String, required: true },
});

export default mongoose.models.Tasks || mongoose.model('Tasks', TasksSchema);