"use client"
import React, { useCallback } from 'react'
import { useRouter } from 'next/navigation'

const TabBar = React.memo(({ activeTab }) => {
    const router = useRouter()

    const handleTabClick = useCallback((path) => {
        router.push(path)
    }, [router])

    const tabs = [
        {
            id: 'main',
            name: 'Main',
            icon: "/images/main.png",
            path: '/'


        },
        {
            id: 'frens',
            name: 'Frens',
            icon: "/images/frens.png",
            path: '/frens'

        },
        {
            id: 'cards',
            name: 'Cards',
            icon: "/images/cards.png",
            path: '/cards'

        },
        {
            id: 'mining',
            name: 'Mining',
            icon: "/images/mining.png",
            path: '/mining'

        },
        {
            id: 'reward',
            name: 'Reward',
            icon: "/images/reward.png",
            path: '/reward'

        }
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md px-4 py-4">
            <div className="flex justify-between items-center px-3 py-5 bg-white/10 rounded-[15px] max-w-md mx-auto">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => handleTabClick(tab.path)}
                    >
                        <div className={activeTab === tab.id ? "text-primary" : "text-gray-400"}>
                            <div>
                                <img
                                    src={tab.icon}
                                    alt={tab.name}
                                    className={`w-[22px] h-[22px] ${activeTab === tab.id
                                        ? "brightness-100 filter [filter:brightness(0)_saturate(100%)_invert(61%)_sepia(93%)_saturate(401%)_hue-rotate(93deg)_brightness(93%)_contrast(91%)]"
                                        : "brightness-50 filter"
                                        }`}
                                />
                            </div>
                        </div>
                        <span className={`text-xs mt-1 ${activeTab === tab.id ? "text-primary" : "text-gray-400"}`}>
                            {tab.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
})

TabBar.displayName = 'TabBar'

export default TabBar
