import { MongoClient, Db } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "progress-tracker";

if (!MONGODB_URI) {
  // Intentionally throw at import time to ensure visibility during dev
  throw new Error("Missing MONGODB_URI environment variable");
}

export async function getDb(): Promise<Db> {
  if (cachedDb && cachedClient) {
    return cachedDb;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  cachedDb = client.db(MONGODB_DB);
  return cachedDb;
}
