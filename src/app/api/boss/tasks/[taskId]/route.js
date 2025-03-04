import { NextResponse } from 'next/server';
import Tasks from "@/db/Tasks";

export async function PUT(request, { params }) {
    const { taskId } = params;
    const { name, description, value, url, isMainTask, icon, subTasks, category, telegramFollow, telegramChatId, status, mainTaskId } = await request.json();

    if (mainTaskId) {
        const mainTask = await Tasks.findOne({ taskId: mainTaskId });
        if (!mainTask) {
            return NextResponse.json({ error: 'Main task not found' }, { status: 404 });
        }

        await Tasks.updateOne(
            {
                taskId: mainTaskId,
                "subTasks.taskId": taskId
            },
            {
                $set: {
                    "subTasks.$.name": name,
                    "subTasks.$.description": description,
                    "subTasks.$.url": url,
                    "subTasks.$.icon": icon,
                    "subTasks.$.category": category,
                    "subTasks.$.telegramFollow": telegramFollow,
                    "subTasks.$.telegramChatId": telegramChatId,
                    "subTasks.$.status": status,
                    "subTasks.$.value": parseFloat(value),
                    "subTasks.$.mainTaskId": mainTaskId
                }
            }
        );
    } else {
        await Tasks.updateOne({ taskId }, { $set: { name, description, value, url, isMainTask, icon, subTasks, category, telegramFollow, telegramChatId, status } });
    }



    return NextResponse.json(taskId);
}

export async function DELETE(request, { params }) {
    const { taskId } = params;
    const { mainTaskId } = await request.json();
    //mainTaskId li kaydı bul, subTasks arrayinden taskId==taskId itemı sil
    await Tasks.updateOne({ taskId: mainTaskId }, { $pull: { subTasks: { taskId: taskId } } });
    return NextResponse.json(taskId);
}