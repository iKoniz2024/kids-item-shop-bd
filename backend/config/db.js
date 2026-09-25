const { MongoClient, ServerApiVersion } = require("mongodb");
const { setupIndexes } = require("../utils/setupIndexes");
const { warmUpCache } = require("../utils/cache");

if (!process.env.VERCEL) {
    try {
        const dns = require('dns');
        dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (e) {
        // Ignore DNS resolver override in restricted runtimes
    }
}

const dbUser = encodeURIComponent(process.env.DB_USER || "");
const dbPass = encodeURIComponent(process.env.DB_PASS || "");

const uri = process.env.MONGODB_URI || `mongodb://${dbUser}:${dbPass}@cluster0-shard-00-00.bb41v.mongodb.net:27017,cluster0-shard-00-01.bb41v.mongodb.net:27017,cluster0-shard-00-02.bb41v.mongodb.net:27017/?authSource=admin&replicaSet=atlas-imfz1t-shard-0&tls=true`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    },
});

let db;
let isInitialized = false;
let cachedPromise = null;

async function connectDB() {
    if (db) return db;

    if (!cachedPromise) {
        cachedPromise = client.connect().then(() => {
            db = client.db("KidsItemShopBD");
            console.log("MongoDB Connected");

            // Only run index setup locally, NOT on every serverless function cold boot in Vercel
            if (!process.env.VERCEL && !isInitialized) {
                isInitialized = true;
                setupIndexes(db).catch(err => console.error("Setup indexes error:", err.message));
                warmUpCache(db).catch(err => console.error("Startup warmup error:", err.message));
            }
            return db;
        }).catch(err => {
            cachedPromise = null;
            throw err;
        });
    }

    return cachedPromise;
}

function getDB() {
    return db;
}

module.exports = { connectDB, getDB };
