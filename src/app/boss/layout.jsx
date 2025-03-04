'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'



export default function BossLayout({ children }) {
    const pathname = usePathname()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isLayoutMounted, setIsLayoutMounted] = useState(false)
    const isLoginPage = pathname === '/boss/login'

    useEffect(() => {
        setIsLayoutMounted(true)
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/admin/check-auth')
                const data = await res.json()
                setIsAuthenticated(data.authenticated)
            } catch (err) {
                setIsAuthenticated(false)
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth()
    }, [])

    // Layout henüz mount edilmediyse loading göster
    if (!isLayoutMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    const handleLogout = async (e) => {
        e.preventDefault()
        try {
            await fetch('/api/admin/logout')
            // Cookie'yi client tarafında da sil
            document.cookie = 'admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
            // Tam sayfa yenilemesi yap
            window.location.href = '/boss/login'
            window.location.reload()
        } catch (err) {
            console.error('Logout failed:', err)
        }
    }

    // Loading durumunda veya login sayfasındaysa sadece children'ı göster
    if (isLoading || isLoginPage) {
        return <>{children}</>
    }

    // Authenticate olmamışsa login'e yönlendir
    if (!isAuthenticated) {
        window.location.href = '/boss/login'
        return null
    }

    // Admin girişi yapılmışsa normal layout'u göster
    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">

                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage users, view statistics and control platform settings
                        </p>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="mt-2 mb-2">
                    <nav className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex flex-wrap gap-4">
                            <a href="/boss"
                                className="flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                                        bg-gray-50 text-gray-700 hover:bg-gray-900 hover:text-white
                                        border border-gray-200 hover:border-gray-600">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Home
                            </a>
                            <a href="/boss/users"
                                className="flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                                        bg-gray-50 text-gray-700 hover:bg-gray-900 hover:text-white
                                        border border-gray-200 hover:border-gray-600">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Users
                            </a>
                            <a href="/boss/cards"
                                className="flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                                        bg-gray-50 text-gray-700 hover:bg-gray-900 hover:text-white
                                        border border-gray-200 hover:border-gray-600">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Cards
                            </a>
                            <a href="/boss/mining"
                                className="flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                                        bg-gray-50 text-gray-700 hover:bg-gray-900 hover:text-white
                                        border border-gray-200 hover:border-gray-600">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Mining
                            </a>
                            <a href="/boss/tasks"
                                className="flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                                        bg-gray-50 text-gray-700 hover:bg-gray-900 hover:text-white
                                        border border-gray-200 hover:border-gray-600">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                Tasks
                            </a>
                            <a href="#"
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                                        bg-gray-50 text-gray-700 hover:bg-gray-900 hover:text-white
                                        border border-gray-200 hover:border-gray-900">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </a>
                        </div>
                    </nav>
                </div>

                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}
