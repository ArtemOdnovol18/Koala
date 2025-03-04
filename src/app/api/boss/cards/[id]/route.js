import { NextResponse } from "next/server";

import Cards from "@/db/Cards";

export async function POST(req, { params }) {
    const { name, description, perHour, price, image } = await req.json();
    const card = await Cards.findByIdAndUpdate(params.id, { name, description, perHour, price, image });
    return NextResponse.json(card);
}

export async function DELETE(req, { params }) {
    const card = await Cards.findByIdAndDelete(params.id);
    return NextResponse.json(card);
}