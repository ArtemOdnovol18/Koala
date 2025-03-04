"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import io from "socket.io-client";
import { init } from '@/lib/Telegram'
import {
    initData
} from '@telegram-apps/sdk-react';
const SocketContext = createContext({});

export function useSocket() {
    return useContext(SocketContext);
};

const TEST = process.env.NEXT_PUBLIC_TEST;

export default function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState({});



    const startApp = async () => {
        if (process.env.NEXT_PUBLIC_TEST === "false") {
            console.log("App is running on PROD mode");
            await init();
            const userState = initData.state();
            console.log("userState", userState);
            setUser(userState);
        }

    }

    useEffect(() => {
        const start = async () => {
            await init();
            const userState = initData.state();
            console.log("userState", userState);
            setUser(userState);
        }
        start();
    }, []);




    useEffect(() => {
        try {
            if (user.chatInstance) {
                const newSocket = io("tapkoala.ru", {
                    auth: {
                        initData: user,
                    }
                });

                newSocket.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                });

                setSocket(newSocket);

                return () => newSocket.close();
            }

        } catch (error) {
            console.error('Socket initialization error:', error);
        }
    }, [user]);

    return (
        <>
            {
                socket &&
                <SocketContext.Provider value={socket}>
                    {children}
                </SocketContext.Provider>
            }
        </>
    )
};