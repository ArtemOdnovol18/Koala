"use client"

import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import Splash from "@/components/Splash";
import { useAppStore } from "@/stores/appStore";
import { useUserStore } from "@/stores/userStore";
import { toast } from "react-hot-toast";


export default function Frens() {
    const { frens } = useUserStore();
    const { loading } = useAppStore();
    const { user } = useUserStore();
    const REF_LINK = `${process.env.NEXT_PUBLIC_APP_URL}?startapp=${user.telegramId}`


    if (loading) {
        return <Splash />
    }



    const handleCopyLink = () => {
        navigator.clipboard.writeText(REF_LINK)
            .then(() => {
                toast.success('Link copied to clipboard!', {
                    duration: 2000,
                    position: 'bottom-center',
                    style: {
                        background: '#27272A',
                        color: '#fff',
                        borderRadius: '12px',
                    },
                });
            })
            .catch(() => toast.error('Failed to copy link'));
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: 'Join the Koala App!',
                text: 'Use my referral link to join and we both get bonuses!',
                url: REF_LINK
            });
        } catch (error) {
            // Kullanıcı paylaşımı iptal ederse veya tarayıcı desteklemiyorsa
            //toast.error('Sharing failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-black/75 to-black">
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 p-4 pb-[140px]">
                    <h1 className="text-2xl font-semibold mb-2 text-center text-white">Invite Frens!</h1>
                    <p className="text-sm mb-6 text-center text-white/80">You and your friend will receive bonuses</p>

                    <div className="bg-zinc-900 rounded-xl p-4 flex items-center mb-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                            <img src="/images/user.png" alt="" className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-lg text-white">Invite friend</div>
                            <div className="text-sm text-white/50">+10% of the token mined by the user</div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 rounded-xl p-4 mb-6 text-center">
                        <div className="text-white mb-1">Two-level referral system</div>
                        <div className="text-xs text-white/50">
                            You will receive 4% of the tokens of users invited by your friends
                        </div>
                    </div>

                    <section className="mb-4">
                        <h2 className="text-white mb-4">Your friends list ({frens.length})</h2>
                        <div className="h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                            {frens.map((fren, index) => (
                                <div key={index} className="bg-[#1A1B1A] rounded-xl p-4 flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                            <img src="/images/user.png" alt="" className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white">{fren.username}</span>
                                            <span className="text-xs text-white/50">
                                                {fren.level === 1 ? "1st" : "2nd"} Level Referral
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-white">+{fren.reward >= 1000000000 ? `${(fren.reward / 1000000000).toFixed(1)}b` : fren.reward >= 1000000 ? `${(fren.reward / 1000000).toFixed(1)}m` : fren.reward >= 1000 ? `${(fren.reward / 1000).toFixed(1)}k` : fren.reward.toFixed(2)}</span>
                                        <img src="/images/leaf-small.png" alt="Token" className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                <div className="fixed bottom-[100px] inset-x-0 px-4 pb-4">
                    <div className="flex gap-2 max-w-md mx-auto">
                        <button
                            onClick={handleCopyLink}
                            className="flex-1 bg-primary text-white py-4 text-xl font-bold rounded-xl"
                        >
                            Copy link
                        </button>
                        <button
                            onClick={handleShare}
                            className="bg-primary p-4 rounded-xl"
                        >
                            <img src="/images/share.png" alt="Share" className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <TabBar activeTab="frens" />
            </div>
        </div>
    );
}




