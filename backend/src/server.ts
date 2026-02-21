import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import adminRoutes from "./routes/admin.routes"
import productRoutes from "./routes/product.routes"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ message: "Backend is running!!!!" })
})

app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/products", productRoutes)

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})