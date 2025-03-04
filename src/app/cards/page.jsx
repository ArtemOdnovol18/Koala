"use client"

import { useState, useMemo, Suspense } from "react";
import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import Splash from "@/components/Splash";
import { toast } from "react-hot-toast";
import { useAppStore } from "@/stores/appStore";
import { useUserStore } from "@/stores/userStore";
import { useSocket } from "@/providers/SocketProvider";
import Link from "next/link";


// Add a loading component for images
const ImageWithSuspense = ({ src, alt, className }) => {
    return (
        <Suspense fallback={<div className={`animate-pulse bg-zinc-800 ${className}`} />}>
            <img src={src} alt={alt} className={className} />
        </Suspense>
    );
};

export default function Cards() {
    const [activeTab, setActiveTab] = useState("new");
    const [loadingCards, setLoadingCards] = useState({});
    const { gameCards } = useAppStore();
    const { loading } = useAppStore();
    const socket = useSocket();
    const { user, setUser } = useUserStore();
    if (loading) {
        return <Splash />
    }

    const handleBuyCard = (card) => {
        if (user.coin < card.price) {
            toast.error('Insufficient coins!', {
                duration: 2000,
                position: 'bottom-center',
                style: {
                    background: '#27272A',
                    color: '#fff',
                    borderRadius: '12px',
                },
            });
            return;
        }
        setLoadingCards(prev => ({ ...prev, [card.id]: true }));
        socket.emit("buyCard", card);
        socket.on("user", (user) => {
            setUser(user);
            setLoadingCards(prev => ({ ...prev, [card.id]: false }));
            toast.success('Card bought successfully!', {
                duration: 2000,
                position: 'bottom-center',
                style: {
                    background: '#27272A',
                    color: '#fff',
                    borderRadius: '12px',
                },
            });
        });
    }


    return (
        <div className="min-h-screen bg-gradient-to-b from-black/75 to-black">
            <div className="flex flex-col min-h-screen">
                <Header />

                <div className="flex-1  p-4 overflow-hidden flex flex-col">
                    {/* Tab buttons */}
                    <div className="bg-[#1A1B1A] p-1 rounded-xl flex gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab("new")}
                            className={`flex-1 py-3 rounded-lg text-center transition-all duration-300 ${activeTab === "new"
                                ? "bg-[#262626] text-white"
                                : "text-white/50"
                                }`}
                        >
                            New Cards
                        </button>
                        <button
                            onClick={() => setActiveTab("your")}
                            className={`flex-1 py-3 rounded-lg text-center transition-all duration-300 ${activeTab === "your"
                                ? "bg-[#262626] text-white"
                                : "text-white/50"
                                }`}
                        >
                            Your Cards
                        </button>
                    </div>

                    {/* Tab contents */}
                    <div className="flex-1">
                        {activeTab === "new" ? (
                            <>
                                {/* Legendary Card - fixed */}
                                <div className="rounded-2xl p-[2px] bg-gradient-to-b from-[#2A9D58] to-[#175128] mb-6">
                                    <div className="bg-[#000000]/60 rounded-2xl p-4">
                                        <div className="relative flex justify-center mb-2">
                                            <div className="rounded-[15px] p-[1px] bg-gradient-to-b from-[#2A9D58] to-[rgba(23,81,40,0)]">
                                                <div id="card-image" className="w-[120px] h-[80px] bg-zinc-800 rounded-[15px]">
                                                    <ImageWithSuspense
                                                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt6VCPBzmpg5LwKHeICF5s_OTNnBUb2qzidA&s"
                                                        alt="card"
                                                        className="w-full h-full object-cover rounded-[15px]"
                                                    />
                                                </div>
                                            </div>
                                            <div id="card-price" className="absolute top-0 right-0 flex items-end flex-col">
                                                <div className="flex flex-row items-center">
                                                    <ImageWithSuspense
                                                        src="/images/leaf-small.png"
                                                        alt="leaf"
                                                        className="w-[12px] h-[17px] mr-1"
                                                    />
                                                    <span className="text-white">1000.00</span>
                                                </div>
                                                <span className="text-white/50 text-xs">per hour</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <div className="text-white text-lg mb-1">Legendary Card</div>
                                            <div className="text-white/50 text-sm mb-4">
                                                Play game for get legendary card.
                                            </div>
                                            <Link href="/mining" className="bg-primary text-white font-bold py-2 px-8 rounded-full">Play</Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Regular Cards Grid - scrollable */}
                                <div className="h-[calc(100vh-500px)] overflow-y-auto pb-20">
                                    <div className="grid grid-cols-2 gap-4">
                                        {gameCards.map((card, index) => {
                                            // Check if user owns this card
                                            const isOwned = user.cards.some(userCard => userCard._id === card._id);

                                            return (
                                                <div key={index} className="bg-[#1A1B1A] rounded-xl p-4">
                                                    <div className="w-[80%] h-[80px] bg-zinc-800 rounded-[15px] mb-3 mx-auto flex justify-center items-center">
                                                        <ImageWithSuspense
                                                            src={card.image}
                                                            alt="card"
                                                            className="w-16 h-16 object-cover"
                                                        />
                                                    </div>
                                                    <div className="text-white mb-1 text-center font-bold">{card.name}</div>
                                                    <div className="text-white text-[10px] mb-3 opacity-50">{card.description}</div>
                                                    <div className="flex items-center justify-between">
                                                        <button
                                                            onClick={() => handleBuyCard(card)}
                                                            disabled={loadingCards[card.id] || isOwned}
                                                            className={`rounded-full py-1 px-3 flex items-center ${isOwned ? 'bg-gray-500 cursor-not-allowed' : 'bg-white'
                                                                }`}
                                                        >
                                                            {loadingCards[card.id] ? (
                                                                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin mr-1" />
                                                            ) : (
                                                                <img src="/images/leaf-small.png" alt="leaf" className="w-3 h-3 mr-1" />
                                                            )}
                                                            <span className={`text-sm font-bold ${isOwned ? 'text-white' : 'text-black'}`}>
                                                                {isOwned ? 'Owned' : card.price >= 1000000000 ? (card.price / 1000000000) + 'B' :
                                                                    card.price >= 1000000 ? (card.price / 1000000) + 'M' :
                                                                        card.price >= 1000 ? (card.price / 1000) + 'K' :
                                                                            card.price}
                                                            </span>
                                                        </button>
                                                        <div className="flex items-center flex-col">
                                                            <div className="flex items-center flex-row">
                                                                <img src="/images/leaf-small.png" alt="leaf" className="w-3 h-3 mr-1" />
                                                                <span className="text-white text-sm">{card.perHour}</span>
                                                            </div>
                                                            <span className="text-white/50 text-[10px]">per hour</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-[calc(100vh-500px)] overflow-y-auto pb-20">
                                <div className="grid grid-cols-2 gap-4">
                                    {user.cards.map((card, index) => (
                                        <div key={index} className="bg-[#1A1B1A] rounded-xl p-4">
                                            <div className="w-[80%] h-[80px] bg-zinc-800 rounded-[15px] mb-3 mx-auto flex justify-center items-center">
                                                <ImageWithSuspense
                                                    src={card.image}
                                                    alt="card"
                                                    className="w-16 h-16 object-cover"
                                                />
                                            </div>
                                            <div className="text-white mb-1 text-center font-bold">{card.name}</div>
                                            <div className="text-white text-[10px] mb-3 opacity-50">{card.description}</div>
                                            <div className="flex items-center justify-between">
                                                <button

                                                    disabled={loadingCards[card.id]}
                                                    className="rounded-full py-1 px-3 flex items-center bg-gray-500 cursor-not-allowed"
                                                >
                                                    {loadingCards[card.id] ? (
                                                        <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin mr-1" />
                                                    ) : (
                                                        <img src="/images/leaf-small.png" alt="leaf" className="w-3 h-3 mr-1" />
                                                    )}
                                                    <span className="text-white text-sm font-bold">Owned</span>
                                                </button>
                                                <div className="flex items-center flex-col">
                                                    <div className="flex items-center flex-row">
                                                        <img src="/images/leaf-small.png" alt="leaf" className="w-3 h-3 mr-1" />
                                                        <span className="text-white text-sm">{card.perHour}</span>
                                                    </div>
                                                    <span className="text-white/50 text-[10px]">per hour</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <TabBar activeTab={"cards"} />
            </div>
        </div >
    );
}