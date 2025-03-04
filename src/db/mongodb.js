// lib/mongodb.js
const mongoose = require('mongoose');

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    console.log("Connecting to MongoDB...");
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = connectToDatabase;