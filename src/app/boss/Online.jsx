'use client'

import io from 'socket.io-client';
import { useState, useEffect } from 'react';
export default function Online() {
    const [onlineCount, setOnlineCount] = useState(0);


    useEffect(() => {
        const socket = io('tapkoala.ru');
        socket.on('online', (data) => {
            setOnlineCount(data.online);
        });
    }, []);
    return onlineCount;
}