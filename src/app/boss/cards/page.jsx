"use client"
import { useState } from 'react'
import CardList from './CardList'
import AddCard from './AddCard'

export default function Page() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleCardAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen gap-2">
            <div className="w-full md:w-2/5">
                <AddCard onCardAdded={handleCardAdded} />
            </div>
            <div className="w-full md:w-3/5">
                <CardList refreshTrigger={refreshTrigger} />
            </div>
        </div>
    )
}
