import { cookies } from 'next/headers'

export async function POST(request) {
    const { username, password } = await request.json()

    // Compare with admin credentials from ENV
    if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    ) {
        // Create session cookie
        cookies().set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 24 hours
        })

        return new Response(JSON.stringify({ success: true }), {
            status: 200
        })
    }

    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401
    })
} 