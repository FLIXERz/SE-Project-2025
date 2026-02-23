import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"


import authRoutes from "./routes/auth.routes"
import userRoutes from "./routes/user.routes"
import adminRoutes from "./routes/admin.routes"
import productRoutes from "./routes/product.routes"
import orderRoutes from "./routes/order.routes"
import orderItemRoutes from "./routes/orderItem.routes"


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
app.use("/api/orders", orderRoutes)
app.use("/api/order-items", orderItemRoutes)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})