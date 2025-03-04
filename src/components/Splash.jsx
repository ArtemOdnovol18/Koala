"use client"

import { motion } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { useUserStore } from "@/stores/userStore";
import { useSocket } from "@/providers/SocketProvider";
import { useEffect, useState } from "react";
export default function Splash() {

    const socket = useSocket();
    const { setLoading, setGameCards, setMiningCards, setTasks } = useAppStore();
    const { setUsername, setFrens, setTelegramId, setUser, setEarnSinceLastLogin, setCollectPopup, setUserTasks } = useUserStore();
    const [socketLoading, setSocketLoading] = useState({
        user: false,
        frens: false,
        cards: false,
        miningCards: false,
        tasks: false,
        userTasks: false
    });

    useEffect(() => {
        console.log("socketLoading", socketLoading);
        if (socketLoading.user && socketLoading.frens && socketLoading.cards && socketLoading.miningCards) {
            setLoading(false);
        }
    }, [socketLoading]);



    useEffect(() => {
        socket.emit("getUser");
        socket.emit("getFrens");
        socket.emit("getCards");
        socket.emit("getMining");
        socket.emit("getTasks");
        socket.emit("getUserTasks");

        socket.on("user", (user) => {
            console.log("user", user);
            setUsername(user.username);
            setTelegramId(user.telegramId);
            setUser(user);

            // Calculate earn since last login using minutes
            const lastLogin = new Date(user.lastLogin);
            const now = new Date();
            const diffTime = Math.abs(now - lastLogin);
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            const hourlyRate = user.hourlyEarn;
            const minuteRate = hourlyRate / 60;
            const earn = diffMinutes * minuteRate;
            console.log("lastLogin", lastLogin);
            console.log("earn (minutes calculation)", earn);

            setEarnSinceLastLogin(earn);
            if (earn > 0) {
                setCollectPopup(true);
            }


            setSocketLoading(prev => { prev["user"] = true; return { ...prev } })
        });



        socket.on("frens", (frens) => {
            console.log("frens", frens);
            setFrens(frens.frens);
            setSocketLoading(prev => { prev["frens"] = true; return { ...prev } })
        });

        socket.on("cards", (cards) => {
            console.log("cards", cards);
            setGameCards(cards.cards);
            setSocketLoading(prev => { prev["cards"] = true; return { ...prev } })
        });

        socket.on("mining", (miningCards) => {
            let miningCardsArray = [];
            for (let i = 0; i < miningCards.miningCards.length; i++) {
                for (let j = 0; j < miningCards.miningCards[i].percentage; j++) {
                    miningCardsArray.push(miningCards.miningCards[i]);
                }
            }
            setMiningCards(miningCardsArray);
            console.log("miningCards", miningCardsArray);
            setSocketLoading(prev => { prev["miningCards"] = true; return { ...prev } })
        });

        socket.on("tasks", (tasks) => {
            console.log("tasks", tasks);
            setTasks(tasks.tasks);
            setSocketLoading(prev => { prev["tasks"] = true; return { ...prev } })
        });


        socket.on("userTasks", (userTasks) => {
            console.log("userTasks", userTasks);
            setUserTasks(userTasks.userTasks);
            setSocketLoading(prev => { prev["userTasks"] = true; return { ...prev } })
        });


    }, []);


    const floatingAnimation = {
        animate: {
            y: [0, -20, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const loadingTextVariants = {
        animate: {
            opacity: [1, 0.3, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const letterVariants = {
        initial: { opacity: 0, y: 20 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    const dotsVariants = {
        animate: {
            scale: [1, 1.2, 1],
            transition: {
                duration: 0.6,
                repeat: Infinity
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black/60 to-black relative">
            <div className="absolute inset-0 bg-[url('/images/bg.png')] opacity-90 mix-blend-overlay bg-cover bg-center">
            </div>
            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="flex-1 relative flex flex-col justify-center items-center">
                    <motion.div
                        variants={floatingAnimation}
                        animate="animate"
                        className="w-64 h-64"
                    >
                        <img
                            src="/images/koala.png"
                            alt="Splash"
                            className="w-full h-full object-contain"
                        />
                    </motion.div>

                    {/* Loading Text Animation */}
                    <motion.div
                        className="flex items-center mt-8"
                        variants={loadingTextVariants}
                        animate="animate"
                    >
                        {['L', 'O', 'A', 'D', 'I', 'N', 'G'].map((letter, index) => (
                            <motion.span
                                key={index}
                                variants={letterVariants}
                                initial="initial"
                                animate="animate"
                                className="text-white text-3xl font-bold"
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}




