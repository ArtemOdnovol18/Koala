'use client'

import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useParams } from 'next/navigation'
import Link from 'next/link'

dayjs.extend(relativeTime)

export default function UserDetail() {
    const params = useParams();
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)




    const fetchUser = async () => {
        try {
            const response = await fetch(`/api/boss/users/${params.telegramId}`)
            const { user } = await response.json()
            setUser(user)



        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [params.telegramId])



    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    if (!user) {
        return <div className="flex items-center justify-center min-h-screen">User not found</div>
    }

    return (
        <div className="mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - 1/3 width */}
                <div className="space-y-8">
                    {/* User Information Card */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h4 className="text-xl font-semibold">User Information</h4>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-gray-600">Telegram ID:</div>
                                <div>{user.telegramId}</div>

                                <div className="text-gray-600">Name:</div>
                                <div>{user.firstName} {user.fullname}</div>

                                <div className="text-gray-600">Username:</div>
                                <div>{user.username}</div>

                                <div className="text-gray-600">Coin:</div>
                                <div>{Number(user.coin).toFixed(2)}</div>

                                <div className="text-gray-600">Join Date:</div>
                                <div>{dayjs(user.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column - 2/3 width */}
                <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow-md">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h4 className="text-xl font-semibold">Detail</h4>
                    </div>
                    <div className="p-6">

                        <div className="text-gray-500 text-center">No data found</div>

                    </div>
                </div>
            </div>
        </div>
    )
}
