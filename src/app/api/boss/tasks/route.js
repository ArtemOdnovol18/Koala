import { NextResponse } from "next/server";
import Tasks from "@/db/Tasks";

export async function GET() {
    const tasks = await Tasks.find({});
    return NextResponse.json(tasks);
}

export async function POST(request) {
    const { taskId, name, description, value, url, isMainTask, category, icon, subTasks, telegramFollow, telegramChatId, mainTaskId } = await request.json();

    if (isMainTask) {
        await Tasks.create({ taskId, name, description, value, url, isMainTask, category, icon, subTasks, telegramFollow, telegramChatId, mainTaskId });
    } else {
        const mainTask = await Tasks.findOne({ taskId: mainTaskId });
        if (!mainTask) {
            return NextResponse.json({ error: 'Main task not found' }, { status: 404 });
        }
        mainTask.subTasks.push(
            {
                taskId,
                name,
                description,
                value: parseFloat(value),
                url,
                category,
                icon,
                telegramFollow,
                telegramChatId,
                mainTaskId,
                status: true
            }
        );
        await mainTask.save();
    }

    return NextResponse.json({ message: 'Task added successfully' });
}

export async function DELETE(request) {
    const { taskId } = await request.json();
    //console.log(taskId);
    await Tasks.deleteOne({ taskId });
    return NextResponse.json({ message: 'Task deleted successfully' });
}