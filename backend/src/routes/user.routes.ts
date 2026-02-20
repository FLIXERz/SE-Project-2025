import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware"

const router = Router()

router.get("/profile", authenticate, (req: any, res) => {
  res.json({
    message: "Protected route success",
    user: req.user
  })
})

export default router