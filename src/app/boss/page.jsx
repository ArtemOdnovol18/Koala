//import connectToDatabase from '@/db/mongodb';
import Link from 'next/link';
import dayjs from 'dayjs';
import Online from './Online';

import User from '@/db/User';
import Frens from '@/db/Frens';
import TaskStats from '@/db/TaskStats';


export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-US').format(num);
}

export default async function BossPanel() {

    const totalUsers = await User.countDocuments();

    const recentUsers = await User.find({})
        .select('createdAt telegramId username fullname ref')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .then(async users => {
            const populatedUsers = await Promise.all(users.map(async user => {
                let refUser = null;
                if (user.ref) {
                    refUser = await User.findOne({ telegramId: user.ref })
                        .select('username')
                        .lean();
                }
                return {
                    ...user,
                    refName: refUser?.username || '-'
                };
            }));
            return populatedUsers;
        });

    const topReferrers = await Frens.aggregate([
        {
            $group: {
                _id: "$ref",
                totalCount: { $sum: 1 },
                level1Count: {
                    $sum: {
                        $cond: [{ $eq: ["$level", 1] }, 1, 0]
                    }
                },
                level2Count: {
                    $sum: {
                        $cond: [{ $eq: ["$level", 2] }, 1, 0]
                    }
                },
                totalReward: { $sum: "$reward" }
            }
        },
        { $sort: { totalCount: -1 } },
        { $limit: 10 }
    ]).then(async results => {
        return Promise.all(results.map(async item => {
            if (!item._id) return null;
            const user = await User.findOne({ telegramId: item._id })
                .select('username telegramId')
                .lean();
            return {
                username: user?.username || 'Unknown',
                telegramId: user?.telegramId,
                totalCount: item.totalCount,
                level1Count: item.level1Count,
                level2Count: item.level2Count,
                totalReward: Number(item.totalReward.toFixed(2))
            };
        }));
    }).then(results => results.filter(item => item !== null));

    const topCoinOwners = await User.find({})
        .select('username telegramId coin')
        .sort({ coin: -1 })
        .limit(10)
        .lean();

    const topCardOwners = await User.aggregate([
        {
            $addFields: {
                totalPerHour: {
                    $sum: "$cards.perHour"
                }
            }
        },
        {
            $sort: { totalPerHour: -1 }
        },
        {
            $limit: 10
        },
        {
            $project: {
                username: 1,
                telegramId: 1,
                cardCount: { $size: { $ifNull: ["$cards", []] } },
                totalSpent: {
                    $sum: "$cards.price"
                },
                totalPerHour: 1
            }
        }
    ]).then(users => users.map(user => ({
        username: user.username,
        telegramId: user.telegramId,
        cardCount: user.cardCount || 0,
        totalSpent: user.totalSpent || 0,
        totalPerHour: user.totalPerHour || 0
    })));

    const topSpinners = await User.find({})
        .select('username telegramId totalSpin')
        .sort({ totalSpin: -1 })
        .limit(10)
        .lean();

    const taskStats = await TaskStats.aggregate([
        {
            $group: {
                _id: null,
                totalCount: { $sum: "$count" },
                totalReward: { $sum: "$reward" }
            }
        }
    ]).then(results => results[0] || { totalCount: 0, totalReward: 0 });

    const totalSpins = await User.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$totalSpin" }
            }
        }
    ]).then(results => results[0]?.total || 0);

    //online users - 5 minutes



    return (
        <div className="h-screen overflow-y-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatNumber(totalUsers)}</dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Online Users</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900"><Online /></dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {formatNumber(taskStats.totalCount)}
                            <div className="text-sm text-gray-500">
                                {taskStats.totalReward >= 1000000000
                                    ? (taskStats.totalReward / 1000000000).toFixed(1) + 'b'
                                    : taskStats.totalReward >= 1000000
                                        ? (taskStats.totalReward / 1000000).toFixed(1) + 'm'
                                        : taskStats.totalReward >= 1000
                                            ? (taskStats.totalReward / 1000).toFixed(1) + 'k'
                                            : taskStats.totalReward
                                } rewards distributed
                            </div>
                        </dd>
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Spins</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatNumber(totalSpins)}</dd>
                    </div>
                </div>
            </div>



            {/* Users Table */}
            <div className="mt-2 mb-2">
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Users</h3>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created At
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Telegram ID
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Username
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fullname
                                        </th>

                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ref Username
                                        </th>

                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                                                {dayjs(user.createdAt).format('DD.MM.YYYY HH:mm')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.telegramId}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.username}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.fullname}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.refName}
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Lists Section */}
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Top Referrers */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Referrers</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level 1</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level 2</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {topReferrers.map((user) => (
                                        <tr key={user.telegramId}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(user.totalCount)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(user.level1Count)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(user.level2Count)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(user.totalReward)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Top Coin Owners */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Coin Owners</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coins</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {topCoinOwners.map((user) => (
                                        <tr key={user.telegramId}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(user.coin)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Top Card Owners */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Card Owners</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cards</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income/Hour</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {topCardOwners.map((user) => (
                                        <tr key={user.telegramId}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(user.cardCount)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(user.totalSpent)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(user.totalPerHour)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Top Spinners */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Top Spinners</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spins</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {topSpinners.map((user) => (
                                        <tr key={user.telegramId}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(user.totalSpin)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

