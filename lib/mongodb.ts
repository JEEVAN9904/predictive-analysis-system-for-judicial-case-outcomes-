import { MongoClient, type Db } from "mongodb"

const uri =
  process.env.MONGODB_URI || "mongodb+srv://test:jeevan%403434@cluster0.fot00us.mongodb.net/"
const dbName = process.env.MONGODB_DB || "judicial_prediction_db"

let client: MongoClient
let db: Db

export async function connectToDatabase() {
  try {
    if (!client) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })
      await client.connect()
      console.log("[v0] Connected to MongoDB successfully")
    }

    if (!db) {
      db = client.db(dbName)
    }

    return { client, db }
  } catch (error) {
    console.error("[v0] MongoDB connection error:", error)
    throw new Error("Failed to connect to MongoDB")
  }
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close()
  }
}
