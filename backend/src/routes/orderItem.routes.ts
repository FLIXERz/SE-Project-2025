import { Router } from "express"
import { prisma } from "../lib/prisma"
import { authenticate, requireAdmin } from "../middleware/auth.middleware"
import { allowedTrackingStatus } from "../constants/trackingStatus"

const router = Router()

//Admin - Update Tracking Status
router.post("/:id/tracking", authenticate, requireAdmin, async (req, res) => {
  try {
    const orderItemId = Number(req.params.id)
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: "Status is required" })
    }

    if (!allowedTrackingStatus.includes(status)) {
      return res.status(400).json({
        error: `Invalid tracking status. Allowed: ${allowedTrackingStatus.join(", ")}`
      })
    }

    const updatedItem = await prisma.$transaction(async (tx) => {

      const orderItem = await tx.orderItem.findUnique({
        where: { orderItem_id: orderItemId }
      })

      if (!orderItem) {
        throw new Error("Order item not found")
      }

      const currentStatus =
        orderItem.tracking_status[orderItem.tracking_status.length - 1]

      const workflow = [
        "order_received",
        "preparing",
        "packed",
        "shipping",
        "delivered"
      ]

      const currentIndex = workflow.indexOf(currentStatus)
      const nextIndex = workflow.indexOf(status)

      if (currentStatus === "delivered") {
        throw new Error("Tracking already completed.")
      }

      if (nextIndex <= currentIndex) {
        throw new Error(`Cannot move from ${currentStatus} to ${status}`)
      }

      if (nextIndex !== currentIndex + 1) {
        throw new Error(
          `Invalid tracking transition from ${currentStatus} to ${status}`
        )
      }

      //Update tracking
      const updated = await tx.orderItem.update({
        where: { orderItem_id: orderItemId },
        data: {
          tracking_status: {
            push: status
          }
        }
      })

      //Auto complete order if all delivered
      if (status === "delivered") {

        const allItems = await tx.orderItem.findMany({
          where: { order_id: updated.order_id }
        })

        const allDelivered = allItems.every(item => {
          const last =
            item.tracking_status[item.tracking_status.length - 1]
          return last === "delivered"
        })

        if (allDelivered) {
          const order = await tx.order.findUnique({
            where: { order_id: updated.order_id }
          })

          const currentOrderStatus =
            order?.order_status[order.order_status.length - 1]

          if (currentOrderStatus !== "completed") {
            await tx.order.update({
              where: { order_id: updated.order_id },
              data: {
                order_status: {
                  push: "completed"
                }
              }
            })
          }
        }
      }

      return updated
    })

    res.json({
      message: "Tracking status updated",
      tracking_status: updatedItem.tracking_status
    })

  } catch (error: any) {
    console.error("UPDATE TRACKING ERROR:", error.message)
    res.status(400).json({ error: error.message })
  }
})
export default router