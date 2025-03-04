import { NextResponse } from "next/server";

import Cards from "@/db/Cards";

export async function POST(req) {
    const { name, description, perHour, price, image } = await req.json();
    const card = await Cards.create({ name, description, perHour, price, image });
    return NextResponse.json(card);
}

export async function GET(req) {
    const cards = await Cards.find();
    return NextResponse.json(cards);
}