import connectToDatabase from "@/db/mongodb";

export async function register() {
    await connectToDatabase();
}
