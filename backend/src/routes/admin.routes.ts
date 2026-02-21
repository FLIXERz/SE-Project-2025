import { Router } from "express"
import { authenticate, requireAdmin } from "../middleware/auth.middleware"
import { prisma } from "../lib/prisma"

const router = Router()

// example route เฉพาะ admin
router.get("/dashboard", authenticate, requireAdmin, (req, res) => {
  res.json({
    message: "Welcome Admin!"
  })
})

// promote user ให้เป็น admin
router.post("/promote/:userId", authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.userId)

    const admin = await prisma.admin.create({
      data: {
        user_id: userId
      }
    })

    res.json(admin)
  } catch (error) {
    res.status(400).json({ error: "Cannot promote user" })
  }
})

export default router