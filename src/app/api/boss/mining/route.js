import { NextResponse } from "next/server";
import Mining from "@/db/Mining";

export async function POST(req) {
    try {
        const { settings } = await req.json();

        console.log(settings);

        // Önce tüm kayıtları sil
        await Mining.deleteMany({});

        // Yeni settings'i ekle
        const mining = await Mining.create(settings);

        return NextResponse.json({ success: true, data: mining });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    const mining = await Mining.find({});
    console.log(mining);
    return NextResponse.json(mining);
}