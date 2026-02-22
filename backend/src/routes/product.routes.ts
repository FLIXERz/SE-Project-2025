import { Router } from "express"
import { authenticate, requireAdmin } from "../middleware/auth.middleware"
import { prisma } from "../lib/prisma"
import { allowedStats, StatType } from "../constants/stats"

const router = Router()

//Get Products with Filters + Pagination + Sorting
router.get("/", async (req, res) => {
  try {
    const {
      category,
      stat,
      min,
      max,
      active,
      page = "1",
      limit = "10",
      sort = "newest"
    } = req.query

    const where: any = {}

    // Default active
    if (active === undefined) {
      where.isActive = true
    } else {
      where.isActive = active === "true"
    }

    if (category) {
      where.category = category
    }

    if (stat) {
      where.main_stat = {
        has: stat
      }
    }

    if (min || max) {
      where.price = {}
      if (min) where.price.gte = Number(min)
      if (max) where.price.lte = Number(max)
    }

    // Pagination protection
    let pageNumber = Number(page)
    let limitNumber = Number(limit)

    if (pageNumber < 1) pageNumber = 1
    if (limitNumber < 1) limitNumber = 10
    if (limitNumber > 100) limitNumber = 100

    const skip = (pageNumber - 1) * limitNumber

    // Sorting logic
    let orderBy: any = { createdAt: "desc" }

    if (sort === "price_asc") {
      orderBy = { price: "asc" }
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" }
    } else if (sort === "oldest") {
      orderBy = { createdAt: "asc" }
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" }
    }

    const total = await prisma.product.count({ where })

    const products = await prisma.product.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy
    })

    res.json({
      data: products,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    })

  } catch (error) {
    console.error("PRODUCT PAGINATION ERROR:", error)
    res.status(500).json({ error: "Cannot fetch products" })
  }
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

// add product with main_stat validation (admin only)
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

    // validate main_stat
    if (main_stat && !Array.isArray(main_stat)) {
      return res.status(400).json({
        error: "main_stat must be an array"
      })
    }

    // validate each stat in main_stat
    if (main_stat) {
  const invalidStat = (main_stat as string[]).find(
    (stat) => !allowedStats.includes(stat as StatType)
  )

  if (invalidStat) {
    return res.status(400).json({
      error: `Invalid stat: ${invalidStat}`
    })
  }
}
    // create product
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

export default router


