import { Router } from "express"
import { authenticate, requireAdmin } from "../middleware/auth.middleware"
import { prisma } from "../lib/prisma"

const router = Router()

/* =======================================================
   📊 Admin Dashboard Summary
======================================================= */
router.get("/dashboard", authenticate, requireAdmin, async (req, res) => {
  try {

    const orders = await prisma.order.findMany()

    const totalOrders = orders.length

    const totalRevenue = orders
      .filter(order => {
        const last =
          order.order_status[order.order_status.length - 1]
        return last === "completed"
      })
      .reduce((sum, order) => sum + order.total_price, 0)

    const statusCount: any = {
      paid: 0,
      preparing: 0,
      shipping: 0,
      completed: 0,
      cancelled: 0
    }

    orders.forEach(order => {
      const last =
        order.order_status[order.order_status.length - 1]

      if (statusCount[last] !== undefined) {
        statusCount[last]++
      }
    })

    res.json({
      totalOrders,
      totalRevenue,
      statusCount
    })

  } catch (error) {
    console.error("DASHBOARD ERROR:", error)
    res.status(500).json({ error: "Cannot fetch dashboard data" })
  }
})


/* =======================================================
   👮 Promote User to Admin
======================================================= */
router.post("/promote/:userId", authenticate, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.userId)

    const existing = await prisma.admin.findUnique({
      where: { user_id: userId }
    })

    if (existing) {
      return res.status(400).json({
        error: "User is already admin"
      })
    }

    const admin = await prisma.admin.create({
      data: { user_id: userId }
    })

    res.json({
      message: "User promoted to admin",
      admin
    })

  } catch (error) {
    res.status(400).json({ error: "Cannot promote user" })
  }
})

/* =======================================================
   💳 Admin - Pending Payment Slips
======================================================= */
router.get("/pending-payments", authenticate, requireAdmin, async (req, res) => {
  try {

    const orders = await prisma.order.findMany({
      where: {
        payment_bill: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            user_id: true,
            name: true,
            surname: true,
            email: true
          }
        }
      },
      orderBy: {
        createOrder: "desc"
      }
    })

    // filter เฉพาะ status ล่าสุด = paid
    const pending = orders.filter(order => {
      const last =
        order.order_status[order.order_status.length - 1]
      return last === "paid"
    })

    res.json(pending)

  } catch (error) {
    console.error("PENDING PAYMENTS ERROR:", error)
    res.status(500).json({ error: "Cannot fetch pending payments" })
  }
})

export default router