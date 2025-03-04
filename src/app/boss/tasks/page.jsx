"use client"
import { useState } from 'react'
import TaskList from './TaskList'
import AddTask from './AddTask'

export default function Page() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleTaskAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen gap-2">
            <div className="w-full md:w-2/5">
                <AddTask onTaskAdded={handleTaskAdded} />
            </div>
            <div className="w-full md:w-3/5">
                <TaskList refreshTrigger={refreshTrigger} />
            </div>
        </div>
    )
}
