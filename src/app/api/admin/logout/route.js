import { cookies } from 'next/headers'

export async function GET() {
    // Sadece cookie'yi sil
    cookies().delete('admin_session')

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    })
} 