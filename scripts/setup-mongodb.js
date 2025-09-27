import { MongoClient } from "mongodb"

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://test:jeevan%403434@cluster0.fot00us.mongodb.net/"
const DB_NAME = process.env.MONGODB_DB || "judicial_prediction_db"

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(DB_NAME)

    // Create collections with validation
    await db.createCollection("cases", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["caseNumber", "title", "caseType", "filingDate"],
          properties: {
            caseNumber: { bsonType: "string" },
            title: { bsonType: "string" },
            caseType: { bsonType: "string" },
            filingDate: { bsonType: "string" },
            status: { bsonType: "string" },
          },
        },
      },
    })

    await db.createCollection("judges", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "experience", "specialization"],
          properties: {
            name: { bsonType: "string" },
            experience: { bsonType: "number" },
            specialization: { bsonType: "string" },
          },
        },
      },
    })

    await db.createCollection("predictions")
    await db.createCollection("users")

    // Create indexes for better performance
    await db.collection("cases").createIndex({ caseNumber: 1 }, { unique: true })
    await db.collection("cases").createIndex({ caseType: 1 })
    await db.collection("cases").createIndex({ status: 1 })
    await db.collection("judges").createIndex({ name: 1 }, { unique: true })
    await db.collection("predictions").createIndex({ caseId: 1 })
    await db.collection("users").createIndex({ email: 1 }, { unique: true })

    // Insert sample data
    const sampleJudges = [
      {
        name: "Justice Rajesh Kumar",
        experience: 15,
        specialization: "Criminal Law",
        totalCases: 1250,
        successRate: 0.78,
        averageDuration: 180,
      },
      {
        name: "Justice Priya Sharma",
        experience: 22,
        specialization: "Civil Law",
        totalCases: 2100,
        successRate: 0.85,
        averageDuration: 240,
      },
    ]

    const sampleCases = [
      {
        caseNumber: "CRL/2024/001",
        title: "State vs. Ramesh Singh",
        caseType: "Criminal",
        description: "Theft case involving stolen electronics worth ₹2,50,000",
        filingDate: "2024-01-15",
        judge: "Justice Rajesh Kumar",
        status: "Active",
        complexity: "Medium",
        estimatedDuration: 180,
        parties: ["State of Delhi", "Ramesh Singh"],
        outcome: "Pending",
      },
    ]

    await db.collection("judges").insertMany(sampleJudges)
    await db.collection("cases").insertMany(sampleCases)

    console.log("Database setup completed successfully!")
    console.log("Collections created: cases, judges, predictions, users")
    console.log("Sample data inserted")
  } catch (error) {
    console.error("Database setup failed:", error)
  } finally {
    await client.close()
  }
}

setupDatabase()
