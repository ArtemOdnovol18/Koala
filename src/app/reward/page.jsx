"use client"

import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import Splash from "@/components/Splash";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { useUserStore } from "@/stores/userStore";
import { useSocket } from "@/providers/SocketProvider";
export default function Reward() {
    const [activeTab, setActiveTab] = useState("in-game");
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const { loading, tasks } = useAppStore();
    const socket = useSocket();
    const { userTasks } = useUserStore();

    const selectedTask = selectedTaskId ? tasks.find(task => task._id === selectedTaskId) : null;

    if (loading) {
        return <Splash />
    }

    const closeModal = () => setSelectedTaskId(null);

    const handleTaskStart = (task) => {
        //url open
        window.open(task.url, "_blank");
        socket.emit("taskStart", task);
    }

    const handleTaskCheck = (task) => {
        socket.emit("taskCheck", task);
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black/75 to-black">
            <div className="relative z-10 flex flex-col h-screen">
                <Header />

                <div className="flex flex-col flex-1 p-4 overflow-hidden">
                    {/* Tab buttons - Fixed at top */}
                    <div className="bg-[#1A1B1A] p-1 rounded-xl flex gap-2 mb-4 shrink-0">
                        <button
                            onClick={() => setActiveTab("in-game")}
                            className={`flex-1 py-3 rounded-lg text-center transition-all duration-300 ${activeTab === "in-game"
                                ? "bg-[#262626] text-white"
                                : "text-white/50"
                                }`}
                        >
                            In-game
                        </button>
                        <button
                            onClick={() => setActiveTab("partner")}
                            className={`flex-1 py-3 rounded-lg text-center transition-all duration-300 ${activeTab === "partner"
                                ? "bg-[#262626] text-white"
                                : "text-white/50"
                                }`}
                        >
                            Partner
                        </button>
                    </div>

                    {/* Scrollable task list */}
                    <div className="space-y-3 pb-24 overflow-y-auto flex-1">
                        {tasks
                            .filter(task => task.category === activeTab && task.status === true)
                            .length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-white/50">
                                <p>There is not any task</p>
                            </div>
                        ) : (
                            tasks
                                .filter(task => task.category === activeTab && task.status === true)
                                .map((task) => (
                                    <div
                                        key={task._id}
                                        className="flex items-center justify-between bg-[#1A1B1A] rounded-xl p-4 cursor-pointer"
                                        onClick={() => setSelectedTaskId(task._id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-[45px] h-[45px] bg-[#262626] rounded-md">
                                                <img src={task.icon} alt="task" className="w-full h-full object-cover p-1 rounded-lg" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white">{task.name}</span>
                                                <div className="flex items-center gap-1">
                                                    <img src="/images/leaf-card.png" alt="leaf" className="w-[12px] h-[17px]" />
                                                    <span className="text-white">{task.value}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                className={`px-6 py-2 rounded-full ${task.isCompleted
                                                    ? 'bg-white text-black'
                                                    : 'bg-white/10 text-white'
                                                    }`}
                                            >
                                                {task.subTasks?.every(subTask => subTask.state === "done") ? (
                                                    <div className="flex items-center gap-2">
                                                        Done
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                ) : "Start"}
                                            </button>
                                            <img src="/images/right-arrow.png" alt="arrow" className="w-[8px] h-[14px] opacity-40" />
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                <TabBar activeTab={"reward"} />

                {/* Modal */}
                <AnimatePresence>
                    {selectedTask && (
                        <>
                            {/* Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={closeModal}
                                className="fixed inset-0 bg-black/60 z-40"
                            />

                            {/* Modal */}
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed bottom-0 left-0 right-0 bg-[#1A1B1A] rounded-t-[32px] z-50 max-h-[85vh]"
                            >
                                {/* Header */}
                                <div className="sticky top-0 bg-[#1A1B1A] p-4">
                                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3" />

                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-center flex-1">
                                            <h2 className="text-white text-lg font-medium">{selectedTask.name}</h2>
                                            <p className="text-white/50 text-sm">{selectedTask.description}</p>
                                        </div>
                                        <button
                                            onClick={closeModal}
                                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center ml-2"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <path d="M1 1L13 13M1 13L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Subtasks */}
                                <div className="overflow-y-auto px-4 pb-4">
                                    <div className="space-y-2">
                                        {selectedTask.subTasks
                                            .filter(subTask => subTask.status === true)
                                            .map((subTask) => (
                                                <div
                                                    key={subTask.taskId}
                                                    className="flex items-center justify-between bg-[#262626] rounded-lg p-3"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-[#1A1B1A] rounded-lg p-1">
                                                            <img src={subTask.icon} alt="subtask" className="w-full h-full object-cover rounded-md" />
                                                        </div>
                                                        <div>
                                                            <span className="text-white text-sm">{subTask.name}</span>
                                                            <div className="flex items-center gap-1">
                                                                <img src="/images/leaf-card.png" alt="leaf" className="w-3 h-3" />
                                                                <span className="text-white text-sm">{subTask.value}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => subTask.state === "check" ? handleTaskCheck(subTask) : handleTaskStart(subTask)}
                                                        className={`px-4 py-1.5 rounded-full text-sm ${subTask.state === "check" ? 'bg-white text-black' :
                                                            subTask.state === "done" ? 'bg-white/10 text-white/50 cursor-default' :
                                                                'bg-white/10 text-white'
                                                            }`}
                                                        disabled={subTask.state === "done"}
                                                    >
                                                        {subTask.state === "done" ? (
                                                            <div className="flex items-center gap-1">
                                                                Done
                                                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                                                    <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </div>
                                                        ) : subTask.state === "check" ? "Check" : "Start"}
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}




