import { NextResponse } from 'next/server'
import connectToDatabase from '@/db/mongodb'
import User from '@/db/User'
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, { params }) {
    try {
        await connectToDatabase()

        const { telegramId } = await params





        let user = await User.findOne({ telegramId })


        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }


        return NextResponse.json({
            user
        })
    } catch (error) {
        console.error('User fetch error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

