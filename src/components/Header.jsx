import React from 'react'
import { useUserStore } from "@/stores/userStore";

export default function Header() {
    const { user } = useUserStore();
    return (
        <div className="flex justify-between items-center px-4 py-2 max-w-md mx-auto w-full">

            <div className="flex flex-row justify-center items-center gap-2" >

                <img src="/images/avatar.png" alt="logo" className="w-[45px] h-[45px]" />

                <div className="flex flex-col">
                    <div className="text-white text-lg font-bold leading-tight">{user?.username}</div>
                    <div className="text-white text-md leading-tight">{user?.hourlyEarn}/hour</div>
                </div>
            </div>



            <div className="flex items-center gap-2">
                <img src="/images/leaf-small.png" alt="logo" className="w-[17px] h-[23px]" />
                <span className="text-white text-2xl font-bold">
                    {user?.coin >= 1000000000 ? (user?.coin / 1000000000).toFixed(2) + 'B' :
                        user?.coin >= 1000000 ? (user?.coin / 1000000).toFixed(2) + 'M' :
                            user?.coin >= 1000 ? (user?.coin / 1000).toFixed(2) + 'K' :
                                user?.coin.toFixed(2)}
                </span>
            </div>


        </div>
    )
}
