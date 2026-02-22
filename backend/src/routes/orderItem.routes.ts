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

    const orderItem = await prisma.orderItem.update({
      where: { orderItem_id: orderItemId },
      data: {
        tracking_status: {
          push: status
        }
      }
    })

    res.json({
      message: "Tracking status updated",
      tracking_status: orderItem.tracking_status
    })

  } catch (error) {
    console.error("UPDATE TRACKING ERROR:", error)
    res.status(500).json({ error: "Cannot update tracking" })
  }
})

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

    const orderItem = await prisma.orderItem.findUnique({
      where: { orderItem_id: orderItemId }
    })

    if (!orderItem) {
      return res.status(404).json({ error: "Order item not found" })
    }

    const currentStatus =
      orderItem.tracking_status[orderItem.tracking_status.length - 1]

    //Tracking Workflow Definition
    const workflow = [
      "order_received",
      "preparing",
      "packed",
      "shipping",
      "delivered"
    ]

    const currentIndex = workflow.indexOf(currentStatus)
    const nextIndex = workflow.indexOf(status)

    // if order is already delivered, no further updates allowed
    if (currentStatus === "delivered") {
      return res.status(400).json({
        error: "Tracking already completed."
      })
    }

    // cannot move backwards or repeat same status
    if (nextIndex <= currentIndex) {
      return res.status(400).json({
        error: `Cannot move from ${currentStatus} to ${status}`
      })
    }

    // enforce sequential updates
    if (nextIndex !== currentIndex + 1) {
      return res.status(400).json({
        error: `Invalid tracking transition from ${currentStatus} to ${status}`
      })
    }

    const updatedItem = await prisma.orderItem.update({
      where: { orderItem_id: orderItemId },
      data: {
        tracking_status: {
          push: status
        }
      }
    })

    res.json({
      message: "Tracking status updated",
      tracking_status: updatedItem.tracking_status
    })

  } catch (error) {
    console.error("UPDATE TRACKING ERROR:", error)
    res.status(500).json({ error: "Cannot update tracking" })
  }
})

export default router