import { cookies } from 'next/headers'

export async function GET() {
    const session = cookies().has('admin_session')

    return new Response(JSON.stringify({
        authenticated: session
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    })
} 