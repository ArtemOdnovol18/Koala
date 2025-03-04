"use client"
import { useState } from 'react';
import { FiEdit } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import EditTaskModal from './EditTaskModal';

export default function SubTasksModal({ isOpen, task, onClose, onEditSubTask }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSubTask, setSelectedSubTask] = useState(null);

    if (!isOpen || !task) return null;

    const handleEditSubTask = (subtask) => {
        onEditSubTask(subtask);
    };

    const handleUpdateSubTask = async (updatedSubTask) => {
        try {
            const response = await fetch(`/api/boss/tasks/${task.taskId}/subtasks/${updatedSubTask.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedSubTask),
            });

            if (!response.ok) {
                throw new Error('Failed to update subtask');
            }

            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating subtask:', error);
        }
    };

    const handleDeleteSubTask = async (subtaskId) => {
        if (window.confirm('Are you sure you want to delete this subtask?')) {
            try {
                const response = await fetch(`/api/boss/tasks/${subtaskId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ mainTaskId: task.taskId }),
                });

                if (!response.ok) {
                    throw new Error('Failed to delete subtask');
                }

                // Refresh the page or update the UI
                window.location.reload();
            } catch (error) {
                console.error('Error deleting subtask:', error);
            }
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Sub Tasks for {task.name}
                        </h3>

                        <div className="mt-4">
                            {task.subTasks.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon & Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {task.subTasks.map((subtask) => (
                                                <tr key={subtask.taskId}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10">
                                                                {subtask.icon && (
                                                                    <img
                                                                        className="h-8 w-8"
                                                                        src={subtask.icon}
                                                                        alt=""
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {subtask.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {subtask.value}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subtask.status
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {subtask.status ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                className="text-gray-600 hover:text-gray-800"
                                                                onClick={() => handleEditSubTask(subtask)}
                                                            >
                                                                <FiEdit className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                className="text-red-600 hover:text-red-800"
                                                                onClick={() => handleDeleteSubTask(subtask.taskId)}
                                                            >
                                                                <MdDeleteOutline className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500">No sub tasks found.</p>
                            )}
                        </div>

                        <div className="mt-6">
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <EditTaskModal
                isOpen={isEditModalOpen}
                task={selectedSubTask}
                onClose={() => setIsEditModalOpen(false)}
                onUpdate={handleUpdateSubTask}
            />
        </>
    )
} 