import React, { useState, useEffect } from 'react'
import { CldUploadWidget } from 'next-cloudinary';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export default function AddTask({ onTaskAdded }) {

    const [task, setTask] = useState({
        taskId: uuidv4(),
        name: '',
        description: '',
        value: 0,
        url: '',
        isMainTask: true,
        category: 'in-game',
        icon: '',
        subTasks: [],
        telegramFollow: false,
        telegramChatId: '',
        mainTaskId: ''
    });

    const [mainTasks, setMainTasks] = useState([]);

    useEffect(() => {
        const fetchMainTasks = async () => {
            const res = await fetch('/api/boss/tasks');
            const data = await res.json();
            const mainTasks = data.filter(task => task.isMainTask);
            setMainTasks(mainTasks);
        };
        fetchMainTasks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!task.name.trim()) {
            return toast.error('Please enter a task name');
        }

        if (!task.isMainTask && !task.mainTaskId) {
            return toast.error('Please select a main task');
        }

        if (!task.icon) {
            return toast.error('Please upload an icon for the task');
        }

        const taskToSubmit = { ...task };
        if (taskToSubmit.isMainTask) {
            delete taskToSubmit.mainTaskId;
        }
        else if (!taskToSubmit.mainTaskId) {
            return toast.error('Please select a main task');
        }

        const res = await fetch('/api/boss/tasks', {
            method: 'POST',
            body: JSON.stringify(taskToSubmit)
        });

        if (res.ok) {
            const data = await res.json();
            onTaskAdded(data);
            setTask({
                taskId: uuidv4(),
                name: '',
                description: '',
                value: 0,
                url: '',
                isMainTask: true,
                category: 'in-game',
                icon: '',
                subTasks: [],
                telegramFollow: false,
                telegramChatId: '',
                mainTaskId: ''
            });
            toast.success('Task added successfully');
        } else {
            toast.error('Error adding task');
        }



    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'isMainTask') {
            setTask(prev => ({
                ...prev,
                isMainTask: checked
            }));
            return;
        }

        if (name === 'mainTaskId' && !task.isMainTask) {
            const selectedMainTask = mainTasks.find(t => t.taskId === value);
            setTask(prev => ({
                ...prev,
                mainTaskId: value,
                category: selectedMainTask.category,
                description: selectedMainTask.description
            }));
            return;
        }

        if (name === 'icon') {
            const iconUrl = value.includes('upload/v')
                ? value
                : `https://res.cloudinary.com/dvmyf8w7o/image/upload/v1/${value}`;
            setTask(prev => ({
                ...prev,
                icon: iconUrl
            }));
        } else {
            setTask(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleIconUpload = (result) => {
        const uploadedUrl = result?.info?.secure_url || result?.info?.url;

        if (!uploadedUrl) {
            console.error('Upload result structure:', result);
            return toast.error('Image URL not received');
        }

        try {
            setTask(prev => ({
                ...prev,
                icon: uploadedUrl
            }));
            toast.success('Icon uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error saving icon URL');
        }
    };



    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4 text-left text-gray-800">Add New Task</h2>
                <form onSubmit={handleSubmit} className="space-y-4">



                    <div className="md:col-span-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="isMainTask"
                                checked={task.isMainTask}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Is this a main task?</span>
                        </label>
                    </div>

                    <div className="md:col-span-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="telegramFollow"
                                checked={task.telegramFollow}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Telegram Follow Required</span>
                        </label>
                    </div>


                    {!task.isMainTask && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Main Task:</label>
                            <select
                                name="mainTaskId"
                                value={task.mainTaskId || ''}
                                onChange={handleChange}
                                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required={!task.isMainTask}
                            >
                                <option value="">Select a main task</option>
                                {mainTasks.map((mainTask) => (
                                    <option key={mainTask.taskId} value={mainTask.taskId}>
                                        {mainTask.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}



                    {task.telegramFollow && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telegram Chat ID:</label>
                            <input
                                type="text"
                                name="telegramChatId"
                                value={task.telegramChatId}
                                onChange={handleChange}
                                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required={task.telegramFollow}
                                placeholder="Enter Telegram Chat ID"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                        </label>
                        <select
                            value={task.category}
                            onChange={(e) => setTask({ ...task, category: e.target.value })}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="in-game">In-game</option>
                            <option value="partner">Partner</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Task Name *
                        </label>
                        <input
                            type="text"
                            value={task.name}
                            onChange={(e) => setTask({ ...task, name: e.target.value })}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                        <textarea
                            name="description"
                            value={task.description}
                            onChange={handleChange}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                            rows="3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reward:</label>
                        <input
                            type="number"
                            name="value"
                            value={task.value}
                            onChange={handleChange}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL:</label>
                        <input
                            type="url"
                            name="url"
                            value={task.url}
                            onChange={handleChange}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon:</label>
                        <CldUploadWidget
                            uploadPreset="ml_default"
                            onError={(error) => console.error('Upload error:', error)}
                            onSuccess={(result) => handleIconUpload(result)}
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
                                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {task.icon ? 'Change Icon' : 'Upload Icon'}
                                    </button>
                                    {task.icon && (
                                        <div className="mt-2">
                                            <img
                                                src={task.icon}
                                                alt="Icon preview"
                                                className="h-16 w-16 object-cover rounded-md"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </CldUploadWidget>
                    </div>




                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            Add Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
