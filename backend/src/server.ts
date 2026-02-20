import { prisma } from "./lib/prisma"
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { registerUser } from "./services/auth.service"

console.log("SERVER FILE LOADED")

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Test route to check if server is running
app.get("/", (req, res) => {
  res.json({ message: "Backend is running!" })
})

// Test route to check database connection
app.get("/test-db", async (req, res) => {
  try {
    const users = await prisma.user.findMany()
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Database error" })
  }
})

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Auth routes
app.post("/register", async (req, res) => {
  try {
    const { name, surname, email, password, address, telephone } = req.body

    if (!name || !surname || !email || !password) {
      return res.status(400).json({ error: "Missing fields" })
    }

    const user = await registerUser(name, surname, email, password, address, telephone)

    res.status(201).json(user)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})