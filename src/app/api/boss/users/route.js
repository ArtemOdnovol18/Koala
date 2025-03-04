import connectToDatabase from '@/db/mongodb';
import User from '@/db/User';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page')) || 1
        const limit = parseInt(searchParams.get('limit')) || 10
        const search = searchParams.get('search') || ''

        const skip = (page - 1) * limit

        // Arama sorgusu
        const query = search ? {
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { telegramId: { $regex: search, $options: 'i' } }
            ]
        } : {}

        // Toplam kayıt sayısı
        const total = await User.countDocuments(query)

        // Kullanıcıları ve stake bilgilerini getir
        const users = await User.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'stakes',
                    localField: '_id',
                    foreignField: 'userId',
                    pipeline: [
                        {
                            $group: {
                                _id: '$userId',
                                totalUsdAmount: { $sum: '$usdAmount' }
                            }
                        }
                    ],
                    as: 'stakeInfo'
                }
            },
            {
                $addFields: {
                    totalUsdAmount: {
                        $ifNull: [{ $arrayElemAt: ['$stakeInfo.totalUsdAmount', 0] }, 0]
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ])


        return NextResponse.json({
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}