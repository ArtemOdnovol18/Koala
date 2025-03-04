import React, { useState, useEffect } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { toast } from 'react-hot-toast';

export default function EditTaskModal({ isOpen, task, onClose, onUpdate }) {
    if (!isOpen || !task) return null;

    const [mainTasks, setMainTasks] = useState([]);
    const [editedTask, setEditedTask] = useState(task);

    const fetchMainTasks = async () => {
        const res = await fetch('/api/boss/tasks');
        const data = await res.json();
        const mainTasks = data.filter(task => task.isMainTask);
        setMainTasks(mainTasks);
    };

    useEffect(() => {
        fetchMainTasks();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'isMainTask') {
            setEditedTask(prev => ({
                ...prev,
                isMainTask: checked
            }));
            return;
        }

        if (name === 'mainTaskId' && !editedTask.isMainTask) {
            const selectedMainTask = mainTasks.find(t => t.taskId === value);
            setEditedTask(prev => ({
                ...prev,
                mainTaskId: value,
                category: selectedMainTask.category,
                description: selectedMainTask.description
            }));
            return;
        }

        setEditedTask(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleIconUpload = (result) => {
        const uploadedUrl = result?.info?.secure_url || result?.info?.url;
        if (!uploadedUrl) {
            return toast.error('Image URL not received');
        }
        setEditedTask(prev => ({
            ...prev,
            icon: uploadedUrl
        }));
        toast.success('Icon uploaded successfully!');
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-[32rem] shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium mb-4">Edit Task</h3>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        await onUpdate(editedTask);
                        await fetchMainTasks();
                        onClose();
                    }}>
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="isMainTask"
                                        checked={editedTask.isMainTask}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Is this a main task?</span>
                                </label>
                            </div>

                            <div>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="telegramFollow"
                                        checked={editedTask.telegramFollow}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Telegram Follow Required</span>
                                </label>
                            </div>

                            {!editedTask.isMainTask && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Main Task:</label>
                                    <select
                                        name="mainTaskId"
                                        value={editedTask.mainTaskId || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 text-sm border border-gray-300 rounded-md"
                                        required={!editedTask.isMainTask}
                                    >
                                        {mainTasks.map((mainTask) => (
                                            <option key={mainTask.taskId} value={mainTask.taskId}>
                                                {mainTask.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {editedTask.telegramFollow && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telegram Chat ID:</label>
                                    <input
                                        type="text"
                                        name="telegramChatId"
                                        value={editedTask.telegramChatId}
                                        onChange={handleChange}
                                        className="w-full p-2 text-sm border border-gray-300 rounded-md"
                                        required={editedTask.telegramFollow}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    name="category"
                                    value={editedTask.category}
                                    onChange={handleChange}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-md"
                                >
                                    <option value="in-game">In-game</option>
                                    <option value="partner">Partner</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editedTask.name}
                                    onChange={handleChange}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={editedTask.description}
                                    onChange={handleChange}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-md"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reward</label>
                                <input
                                    type="number"
                                    name="value"
                                    value={editedTask.value}
                                    onChange={handleChange}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                <input
                                    type="url"
                                    name="url"
                                    value={editedTask.url}
                                    onChange={handleChange}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <div className="flex items-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="status"
                                            checked={editedTask.status}
                                            onChange={(e) => {
                                                setEditedTask(prev => ({
                                                    ...prev,
                                                    status: e.target.checked
                                                }));
                                            }}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        <span className="ms-3 text-sm font-medium text-gray-700">
                                            {editedTask.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                <CldUploadWidget
                                    uploadPreset="ml_default"
                                    onSuccess={handleIconUpload}
                                    options={{
                                        maxFiles: 1,
                                        resourceType: "image",
                                        clientAllowedFormats: ["png", "jpg", "jpeg", "gif"],
                                        maxFileSize: 10000000,
                                        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                                    }}
                                >
                                    {({ open }) => (
                                        <div className="space-y-2">
                                            <button
                                                type="button"
                                                onClick={() => open()}
                                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                {editedTask.icon ? 'Change Icon' : 'Upload Icon'}
                                            </button>
                                            {editedTask.icon && (
                                                <div className="mt-2">
                                                    <img
                                                        src={editedTask.icon}
                                                        alt="Icon preview"
                                                        className="h-16 w-16 object-cover rounded-md"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CldUploadWidget>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 