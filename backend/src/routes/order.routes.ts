import { Router } from "express"
import { prisma } from "../lib/prisma"
import { authenticate, requireAdmin } from "../middleware/auth.middleware"
import { allowedOrderStatus } from "../constants/orderStatus"
import multer from "multer"
import path from "path"
// Order routes for both users and admins
const router = Router()

// Multer setup for slip uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/slips")
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueName + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png"
    ) {
      cb(null, true)
    } else {
      cb(new Error("Only JPG and PNG allowed"))
    }
  }
})


/* =======================================================
  Admin - Get All Orders
======================================================= */
router.get("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createOrder: "desc" },
      include: {
        user: {
          select: {
            user_id: true,
            email: true,
            name: true,
            surname: true
          }
        },
        orderItems: {
          include: {
            product: true,
            fateResult: true
          }
        }
      }
    })

    const formattedOrders = orders.map(order => ({
      ...order,
      latestOrderStatus:
        order.order_status[order.order_status.length - 1]
    }))

    res.json(formattedOrders)

  } catch (error) {
    console.error("ADMIN GET ORDERS ERROR:", error)
    res.status(500).json({ error: "Cannot fetch orders" })
  }
})


/* =======================================================
  User - My Orders  (ต้องมาก่อน /:id)
======================================================= */
router.get("/my", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.user_id

    const orders = await prisma.order.findMany({
      where: { user_id: userId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createOrder: "desc"
      }
    })

    const formattedOrders = orders.map(order => ({
      ...order,
      latestOrderStatus:
        order.order_status[order.order_status.length - 1]
    }))

    res.json(formattedOrders)

  } catch (error) {
    console.error("USER ORDER HISTORY ERROR:", error)
    res.status(500).json({ error: "Cannot fetch orders" })
  }
})


/* =======================================================
  Order Detail
======================================================= */
router.get("/:id", authenticate, async (req: any, res) => {
  try {
    const orderId = Number(req.params.id)
    const userId = req.user.user_id
    const isAdmin = req.user.isAdmin

    const order = await prisma.order.findUnique({
      where: { order_id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
            fateResult: true
          }
        },
        user: {
          select: {
            user_id: true,
            email: true,
            name: true,
            surname: true
          }
        }
      }
    })

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    if (!isAdmin && order.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" })
    }

    const latestOrderStatus =
      order.order_status[order.order_status.length - 1]

    res.json({
      ...order,
      latestOrderStatus
    })

  } catch (error) {
    console.error("ORDER DETAIL ERROR:", error)
    res.status(500).json({ error: "Cannot fetch order" })
  }
})


/* =======================================================
  Create Order
======================================================= */

type OrderItemInput = {
  product_id: number
  quantity: number
  price: number
}

router.post("/", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.user_id
    const { items } = req.body

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid items format" })
    }

    let totalPrice = 0
    const orderItemsData: OrderItemInput[] = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { product_id: item.product_id }
      })

      if (!product || !product.isActive) {
        return res.status(400).json({
          error: `Product ${item.product_id} not available`
        })
      }

      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({
          error: `Not enough stock for ${product.product_name}`
        })
      }

      totalPrice += product.price * item.quantity

      orderItemsData.push({
        product_id: product.product_id,
        quantity: item.quantity,
        price: product.price
      })
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          user_id: userId,
          total_price: totalPrice
        }
      })

      for (const item of orderItemsData) {
        await tx.orderItem.create({
          data: {
            order_id: newOrder.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          }
        })

        await tx.product.update({
          where: { product_id: item.product_id },
          data: {
            stock_quantity: {
              decrement: item.quantity
            }
          }
        })
      }

      return newOrder
    })

    res.status(201).json(order)

  } catch (error) {
    console.error("ORDER ERROR:", error)
    res.status(500).json({ error: "Order failed" })
  }
})

/* =======================================================
   User - Cancel Order
======================================================= */
router.post("/:id/cancel", authenticate, async (req: any, res) => {
  try {
    const orderId = Number(req.params.id)
    const userId = req.user.user_id
    const isAdmin = req.user.isAdmin

    const result = await prisma.$transaction(async (tx) => {

      const order = await tx.order.findUnique({
        where: { order_id: orderId },
        include: { orderItems: true }
      })

      if (!order) {
        throw new Error("Order not found")
      }

      //Owner check
      if (!isAdmin && order.user_id !== userId) {
        throw new Error("Access denied")
      }

      const currentStatus =
        order.order_status[order.order_status.length - 1]

      //ไม่ให้ cancel ถ้าเกิน paid แล้ว
      if (currentStatus !== "paid") {
        throw new Error(
          `Cannot cancel order with status ${currentStatus}`
        )
      }

      // 1️⃣ Restore stock
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { product_id: item.product_id },
          data: {
            stock_quantity: {
              increment: item.quantity
            }
          }
        })
      }

      //Push cancelled
      const updatedOrder = await tx.order.update({
        where: { order_id: orderId },
        data: {
          order_status: {
            push: "cancelled"
          }
        }
      })

      return updatedOrder
    })

    res.json({
      message: "Order cancelled successfully",
      order_status: result.order_status
    })

  } catch (error: any) {
    console.error("CANCEL ORDER ERROR:", error.message)
    res.status(400).json({ error: error.message })
  }
})

/* =======================================================
  User - Upload Payment Slip
======================================================= */
router.post(
  "/:id/payment",
  authenticate,
  upload.single("slip"),
  async (req: any, res) => {
    try {
      const orderId = Number(req.params.id)
      const userId = req.user.user_id

      if (!req.file) {
        return res.status(400).json({
          error: "Slip image is required"
        })
      }

      const order = await prisma.order.findUnique({
        where: { order_id: orderId }
      })

      if (!order) {
        return res.status(404).json({ error: "Order not found" })
      }

      if (order.user_id !== userId) {
        return res.status(403).json({ error: "Access denied" })
      }

      const currentStatus =
        order.order_status[order.order_status.length - 1]

      if (currentStatus !== "paid") {
        return res.status(400).json({
          error: "Cannot upload slip for this status"
        })
      }

      const imagePath = `/uploads/slips/${req.file.filename}`

      const updatedOrder = await prisma.order.update({
        where: { order_id: orderId },
        data: { payment_bill: imagePath }
      })

      res.json({
        message: "Slip uploaded successfully",
        payment_bill: updatedOrder.payment_bill
      })

    } catch (error: any) {
      console.error("SLIP UPLOAD ERROR:", error.message)
      res.status(500).json({ error: "Upload failed" })
    }
  }
)

/* =======================================================
  Admin - Update Order Status (Workflow Guard)
======================================================= */
router.post("/:id/status", authenticate, requireAdmin, async (req, res) => {
  try {
    const orderId = Number(req.params.id)
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: "Status is required" })
    }

    if (!allowedOrderStatus.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed: ${allowedOrderStatus.join(", ")}`
      })
    }

    const order = await prisma.order.findUnique({
      where: { order_id: orderId }
    })

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    const currentStatus =
      order.order_status[order.order_status.length - 1]

    const workflow = ["paid", "preparing", "shipping", "completed"]

    const currentIndex = workflow.indexOf(currentStatus)
    const nextIndex = workflow.indexOf(status)

    if (currentStatus === "completed") {
      return res.status(400).json({
        error: "Order already completed. Cannot update."
      })
    }

    if (nextIndex <= currentIndex) {
      return res.status(400).json({
        error: `Cannot move from ${currentStatus} to ${status}`
      })
    }

    if (nextIndex !== currentIndex + 1) {
      return res.status(400).json({
        error: `Invalid workflow transition from ${currentStatus} to ${status}`
      })
    }

    const updatedOrder = await prisma.order.update({
      where: { order_id: orderId },
      data: {
        order_status: {
          push: status
        }
      }
    })

    res.json({
      message: "Order status updated",
      order_status: updatedOrder.order_status
    })

  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error)
    res.status(500).json({ error: "Cannot update status" })
  }
})


export default router