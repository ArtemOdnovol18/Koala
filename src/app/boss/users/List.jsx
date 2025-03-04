'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'

export default function List() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const limit = 10

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search.length >= 3 || search === '') {
                setDebouncedSearch(search)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        getUsers()
    }, [page, debouncedSearch])

    const getUsers = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/boss/users?page=${page}&search=${debouncedSearch}&limit=${limit}`)
            const data = await res.json()
            setUsers(data.users)
            setTotalPages(Math.ceil(data.total / limit))
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        setSearch(e.target.value)
        setPage(1)
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={handleSearch}
                className="p-2 border rounded mb-4 w-full max-w-xs"
            />

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Username
                            </th>

                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Telegram ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Coin
                            </th>

                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created At
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id}>

                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">

                                    {user.photoUrl ? (
                                        <img className="h-6 w-6 rounded-full" src={user.photoUrl} alt="" />
                                    ) : (
                                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-500 text-sm">{user.username?.charAt(0).toUpperCase() || 'U'}</span>
                                        </div>
                                    )}
                                    {user.fullname} ({user.username})
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.telegramId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {Number(user.coin).toFixed(2)}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {dayjs(user.createdAt).format('DD.MM.YYYY HH:mm')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link href={`/boss/users/${user.telegramId}`} className="text-blue-500 hover:text-blue-700">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex gap-2 justify-end mt-4">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 font-medium rounded-lg text-sm w-8 h-8 flex items-center justify-center disabled:opacity-50"
                    aria-label="Previous page"
                >
                    &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNum => {
                        if (window.innerWidth < 640) {
                            return Math.abs(pageNum - page) <= 2;
                        }
                        if (pageNum === 1 || pageNum === totalPages) return true;
                        return Math.abs(pageNum - page) <= 1;
                    })
                    .map((pageNum, i, array) => {
                        if (i > 0 && pageNum - array[i - 1] > 1) {
                            return (
                                <span key={`ellipsis-${pageNum}`} className="w-8 h-8 flex items-center justify-center">
                                    ...
                                </span>
                            );
                        }
                        return (
                            <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`${page === pageNum
                                    ? 'text-white bg-gray-700 hover:bg-gray-800'
                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                    } font-medium rounded-lg text-sm w-8 h-8 flex items-center justify-center`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 font-medium rounded-lg text-sm w-8 h-8 flex items-center justify-center disabled:opacity-50"
                    aria-label="Next page"
                >
                    &gt;
                </button>
            </div>
        </div>
    )
}
