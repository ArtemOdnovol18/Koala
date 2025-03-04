"use client"
import React, { useEffect, useState } from 'react'
import { FiEdit } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { TbSubtask } from "react-icons/tb";
import EditTaskModal from './EditTaskModal';
import { toast } from 'react-hot-toast';
import SubTasksModal from './SubTasksModal';

export default function TaskList({ refreshTrigger }) {
    const [tasks, setTasks] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isSubTasksModalOpen, setIsSubTasksModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/boss/tasks');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setTasks(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    useEffect(() => {

        fetchTasks();
    }, [refreshTrigger]);

    const handleEditClick = (task) => {
        setSelectedTask(task);
        setIsEditModalOpen(true);
    };

    const handleUpdateTask = async (updatedTask) => {
        try {
            const response = await fetch(`/api/boss/tasks/${updatedTask.taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTask),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            // Refresh the task list
            const updatedTasks = tasks.map(task =>
                task.taskId === updatedTask.taskId ? updatedTask : task
            );
            setTasks(updatedTasks);
            setIsEditModalOpen(false);
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const response = await fetch(`/api/boss/tasks/${taskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            // Remove the deleted task from the local state
            setTasks(tasks.filter(task => task.taskId !== taskId));
            toast.success('Task deleted successfully');
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Error deleting task');
        }
    };

    const handleDeleteMainTask = async (taskId) => {
        try {
            const res = await fetch(`/api/boss/tasks`, {
                method: 'DELETE',
                body: JSON.stringify({ taskId }),
            });
            if (!res.ok) {
                throw new Error('Failed to delete task');
            }
            toast.success('Task deleted successfully');
            fetchTasks();
        } catch (error) {
            console.error('Error deleting main task:', error);
            toast.error('Error deleting task');
        }
    }

    const handleSubTaskEdit = (subtask) => {
        setSelectedTask(subtask);
        setIsEditModalOpen(true);
        setIsSubTasksModalOpen(false);
    };

    return (
        <>
            <div className="overflow-x-auto">
                {isLoading ? <div className="flex justify-center items-center h-screen"><div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-t-blue-500 border-b-transparent border-r-transparent border-l-transparent rounded-full" role="status"></div></div> :
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Tasks</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">









                            {tasks.map((task) => (
                                <tr key={task.taskId}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {task.icon && <img className="h-8 w-8" src={task.icon} alt="" />}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{task.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{task.subTasks.length || 0}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {task.subTasks.reduce((sum, subtask) => sum + (Number(subtask.value) || 0), 0)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${task.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {task.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {task.category.toUpperCase()}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                            <button
                                                className="text-blue-600 hover:text-blue-800"
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                    setIsSubTasksModalOpen(true);
                                                }}
                                            >
                                                <TbSubtask className="h-5 w-5" />
                                            </button>
                                            <button
                                                className="text-gray-600 hover:text-gray-800"
                                                onClick={() => handleEditClick(task)}
                                            >
                                                <FiEdit className="h-5 w-5" />
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-800"
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this task?')) {
                                                        handleDeleteMainTask(task.taskId);
                                                    }
                                                }}
                                            >
                                                <MdDeleteOutline className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                }
            </div>

            <EditTaskModal
                isOpen={isEditModalOpen}
                task={selectedTask}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={handleUpdateTask}
            />

            <SubTasksModal
                isOpen={isSubTasksModalOpen}
                task={selectedTask}
                onClose={() => setIsSubTasksModalOpen(false)}
                onEditSubTask={handleSubTaskEdit}
            />
        </>
    );
}
