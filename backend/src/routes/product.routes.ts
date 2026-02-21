import { Router } from "express"
import { authenticate, requireAdmin } from "../middleware/auth.middleware"
import { prisma } from "../lib/prisma"

const router = Router()

// Get all active products
router.get("/", async (req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true }
  })
  res.json(products)
})

// add product (admin only)
router.post("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      product_name,
      category,
      price,
      stock_quantity,
      description,
      main_stat
    } = req.body

    const product = await prisma.product.create({
      data: {
        product_name,
        category,
        price: Number(price),
        stock_quantity: Number(stock_quantity),
        description,
        main_stat
      }
    })

    res.status(201).json(product)
  } catch (error) {
    res.status(400).json({ error: "Cannot create product" })
  }
})

// update product (admin only)
router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)

    const product = await prisma.product.update({
      where: { product_id: id },
      data: req.body
    })

    res.json(product)
  } catch (error) {
    res.status(400).json({ error: "Cannot update product" })
  }
})

// soft delete product (admin only)
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)

    await prisma.product.update({
      where: { product_id: id },
      data: { isActive: false }
    })

    res.json({ message: "Product deactivated" })
  } catch (error) {
    res.status(400).json({ error: "Cannot delete product" })
  }
})

export default router