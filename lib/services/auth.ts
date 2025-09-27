import { connectToDatabase } from "@/lib/mongodb"
import type { User, UserSession } from "@/lib/models/case"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

export class AuthService {
  private async getDatabase() {
    try {
      const { db } = await connectToDatabase()
      return db
    } catch (error) {
      console.error("[v0] Database connection failed in auth service:", error)
      throw new Error("Database connection failed")
    }
  }

  async createUser(userData: {
    email: string
    password: string
    name: string
    role: "administrator" | "legal_professional" | "analyst"
    organization?: string
    department?: string
  }): Promise<User> {
    try {
      const db = await this.getDatabase()
      const usersCollection = db.collection<User>("users")

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email: userData.email })
      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12)

      // Set permissions based on role
      let permissions: string[] = []
      switch (userData.role) {
        case "administrator":
          permissions = ["read", "write", "delete", "manage_users", "view_analytics", "export_data"]
          break
        case "legal_professional":
          permissions = ["read", "write", "view_analytics", "predict_cases"]
          break
        case "analyst":
          permissions = ["read", "view_analytics", "predict_cases"]
          break
      }

      const newUser: User = {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        permissions,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        organization: userData.organization,
        department: userData.department,
      }

      const result = await usersCollection.insertOne(newUser)
      return { ...newUser, _id: result.insertedId.toString() }
    } catch (error) {
      console.error("[v0] Error creating user:", error)
      throw error
    }
  }

  async authenticateUser(email: string, password: string): Promise<{ user: User; sessionToken: string } | null> {
    try {
      const db = await this.getDatabase()
      const usersCollection = db.collection<User>("users")

      // Find user by email
      const user = await usersCollection.findOne({ email, isActive: true })
      if (!user) {
        return null
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return null
      }

      // Create session
      const sessionToken = await this.createSession(user._id!.toString())

      // Update last login
      await usersCollection.updateOne({ _id: user._id }, { $set: { lastLogin: new Date(), updatedAt: new Date() } })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user
      return { user: userWithoutPassword as User, sessionToken }
    } catch (error) {
      console.error("[v0] Error authenticating user:", error)
      throw error
    }
  }

  async createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
    try {
      const db = await this.getDatabase()
      const sessionsCollection = db.collection<UserSession>("user_sessions")

      const sessionToken = randomBytes(32).toString("hex")
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

      const session: UserSession = {
        userId,
        sessionToken,
        expiresAt,
        createdAt: new Date(),
        ipAddress,
        userAgent,
      }

      await sessionsCollection.insertOne(session)
      return sessionToken
    } catch (error) {
      console.error("[v0] Error creating session:", error)
      throw error
    }
  }

  async validateSession(sessionToken: string): Promise<User | null> {
    try {
      const db = await this.getDatabase()
      const sessionsCollection = db.collection<UserSession>("user_sessions")
      const usersCollection = db.collection<User>("users")

      // Find valid session
      const session = await sessionsCollection.findOne({
        sessionToken,
        expiresAt: { $gt: new Date() },
      })

      if (!session) {
        return null
      }

      // Get user
      const user = await usersCollection.findOne({ _id: session.userId, isActive: true })
      if (!user) {
        return null
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword as User
    } catch (error) {
      console.error("[v0] Error validating session:", error)
      return null
    }
  }

  async logout(sessionToken: string): Promise<void> {
    try {
      const db = await this.getDatabase()
      const sessionsCollection = db.collection<UserSession>("user_sessions")

      await sessionsCollection.deleteOne({ sessionToken })
    } catch (error) {
      console.error("[v0] Error logging out:", error)
      throw error
    }
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const db = await this.getDatabase()
      const usersCollection = db.collection<User>("users")

      const user = await usersCollection.findOne({ _id: userId, isActive: true })
      return user ? user.permissions.includes(permission) : false
    } catch (error) {
      console.error("[v0] Error checking permission:", error)
      return false
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const db = await this.getDatabase()
      const usersCollection = db.collection<User>("users")

      const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray()
      return users
    } catch (error) {
      console.error("[v0] Error fetching users:", error)
      throw error
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const db = await this.getDatabase()
      const usersCollection = db.collection<User>("users")

      const updateData = { ...updates, updatedAt: new Date() }
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12)
      }

      await usersCollection.updateOne({ _id: userId }, { $set: updateData })
    } catch (error) {
      console.error("[v0] Error updating user:", error)
      throw error
    }
  }

  async deactivateUser(userId: string): Promise<void> {
    try {
      const db = await this.getDatabase()
      const usersCollection = db.collection<User>("users")
      const sessionsCollection = db.collection<UserSession>("user_sessions")

      // Deactivate user
      await usersCollection.updateOne({ _id: userId }, { $set: { isActive: false, updatedAt: new Date() } })

      // Remove all sessions
      await sessionsCollection.deleteMany({ userId })
    } catch (error) {
      console.error("[v0] Error deactivating user:", error)
      throw error
    }
  }
}
