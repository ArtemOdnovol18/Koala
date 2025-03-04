"use client"
import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Result({ refreshTrigger }) {
    const [mining, setMining] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetch('/api/boss/mining')
            .then(res => res.json())
            .then(data => setMining(data))
            .catch(err => console.log(err))
            .finally(() => setIsLoading(false));
    }, [refreshTrigger])

    // Pasta grafiği için renkler
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];



    if (isLoading) {
        return <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    }


    return (
        <div style={{ width: '100%', height: 400 }}>
            <h1 className="text-2xl font-bold mb-6">Mining Status</h1>

            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={mining}
                        dataKey="percentage"
                        nameKey="reward"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                        label={({ reward, percentage }) => `${reward}: ${percentage}%`}
                    >
                        {mining.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}