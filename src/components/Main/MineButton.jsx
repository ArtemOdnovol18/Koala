"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from "framer-motion";
import { TonConnectButton } from '@tonconnect/ui-react';
import { useUserStore } from "@/stores/userStore";
import { useSocket } from "@/providers/SocketProvider";



export default function MineButton() {
    const socket = useSocket();
    const [clicks, setClicks] = useState([]);
    const decreaseInterval = useRef(null);
    const increaseInterval = useRef(null);
    const clickCountRef = useRef(0);
    const clickTimeoutRef = useRef(null);
    const increaseTimeoutRef = useRef(null);
    const { progress, setProgress, updateProgress } = useUserStore();
    const linePositions = [
        -44, -26, -8, 10, 28, 46, 64, 82, 100, 118,
        136, 154, 172, 190, 208, 226, 244, 262, 280, 298,
        316, 334, 352, 370
    ];

    // Her render'da progress'i güncelle
    useEffect(() => {
        updateProgress();

        // Her saniye progress'i kontrol et
        const progressInterval = setInterval(() => {
            updateProgress();
        }, 1000);

        return () => clearInterval(progressInterval);
    }, [updateProgress]);

    // Progress 0'a ulaştığında interval'i temizle
    useEffect(() => {
        if (progress <= 0 && decreaseInterval.current) {
            clearInterval(decreaseInterval.current);
            decreaseInterval.current = null;
        }
    }, [progress]);

    // Progress'i azaltma fonksiyonu
    const startDecreasing = () => {
        if (increaseTimeoutRef.current) {
            clearTimeout(increaseTimeoutRef.current);
        }
        clearInterval(increaseInterval.current);

        if (!decreaseInterval.current) {
            decreaseInterval.current = setInterval(() => {
                setProgress((prev) => {
                    const newProgress = Math.max(0, prev - 1);
                    return newProgress;
                });
            }, 1000);
        }
    };


    // Progress'i artırma fonksiyonu
    const startIncreasing = () => {
        if (clickCountRef.current > 0) {
            socket.emit('updateCoin', clickCountRef.current);
            clickCountRef.current = 0;
        }

        if (decreaseInterval.current) {
            clearInterval(decreaseInterval.current);
            decreaseInterval.current = null;
        }

        if (increaseInterval.current) {
            clearInterval(increaseInterval.current);
        }

        increaseInterval.current = setInterval(() => {
            setProgress(prev => Math.min(100, prev + 1));
        }, 1000);
    };

    const handleClick = () => {
        setClicks(prev => [...prev, Date.now()]);
        clickCountRef.current += 1;
        startDecreasing();

        // Clear previous timeouts
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
        }
        if (increaseTimeoutRef.current) {
            clearTimeout(increaseTimeoutRef.current);
        }

        // Set timeout for coin update
        clickTimeoutRef.current = setTimeout(() => {
            if (clickCountRef.current > 0) {
                console.log(`Toplam tıklama: ${clickCountRef.current}`);
                socket.emit('updateCoin', clickCountRef.current);
                clickCountRef.current = 0;
            }
        }, 1000);

        // Set timeout for progress increase
        increaseTimeoutRef.current = setTimeout(() => {
            startIncreasing();
        }, 1000);
    };

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
            if (increaseTimeoutRef.current) {
                clearTimeout(increaseTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className='fixed inset-0 flex flex-col'>
            <div className="flex items-center gap-2 justify-center w-full mt-32">
                <TonConnectButton />
            </div>

            <div className="flex-1 flex items-center justify-center relative">
                <AnimatePresence>
                    {clicks.map((id) => (
                        <motion.div
                            key={id}
                            initial={{ opacity: 1, y: -20 }}
                            animate={{ opacity: 0, y: -350 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute left-[42%] -translate-x-1/2 -translate-y-full text-green-400 font-bold text-xl"
                        >
                            <div className="flex items-center gap-2 justify-center w-full">
                                <img src="/images/leaf-small.png" alt="Plus" className="" />
                                <span className="text-white font-bold text-xl">+1</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <motion.div
                    className={`cursor-${progress <= 0 ? 'not-allowed' : 'pointer'}`}
                    whileTap={progress > 0 ? { scale: 0.98 } : {}}
                    transition={{ duration: 0.1 }}
                    style={{ transformOrigin: 'center center' }}
                    onClick={progress > 0 ? handleClick : undefined}
                >
                    <div className="relative w-[312px] h-[312px]">
                        <div id="bg-gradient" className={`absolute w-full h-full rounded-full bg-gradient-to-b ${progress <= 0 ? 'from-gray-500 to-gray-700' : 'from-[#2BBE56] to-[#0E2615]'
                            }`} />
                        <div id="bg-gradient-inner" className={`absolute w-[264px] h-[264px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${progress <= 0 ? 'bg-gray-600' : 'bg-[radial-gradient(59.42%_53.02%_at_50%_46.98%,#2BBE56_38.7%,#0E2615_100%)]'
                            }`} />
                        <img
                            src="/images/koala-button.png"
                            alt="Koala"
                            className={`absolute w-[245px] h-[245px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-cover z-[1] rounded-full overflow-hidden mt-3 ${progress <= 0 ? 'opacity-50' : ''
                                }`}
                        />
                    </div>
                </motion.div>
            </div>

            <div className="mb-32 px-4 relative z-20">
                <div className="relative">
                    <div className="absolute -top-6 left-1 flex items-center gap-1 text-white">
                        <img src="/images/power.png" alt="Plus" className="" />
                        <span className="text-sm font-medium">{progress}/100</span>
                    </div>

                    <div className="relative w-full h-[15px]">
                        <div className="absolute w-full h-full bg-white/20 rounded-[73px]" />

                        <div className="absolute h-full rounded-[73px] overflow-hidden" style={{ width: `${progress}%` }}>
                            <div className="absolute h-full w-full bg-gradient-to-r from-[#175128] to-[#2BBE56]" />

                            <div className="absolute inset-0 overflow-hidden mix-blend-overlay opacity-20">
                                {linePositions.map((left, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-[73.54px] h-0 border-t-[5px] border-white rotate-[-45deg]"
                                        style={{
                                            left: `${left}px`,
                                            top: '5px'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
