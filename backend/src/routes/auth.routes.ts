import { Router } from "express"
import { registerUser, loginUser } from "../services/auth.service"

const router = Router()

router.post("/register", async (req, res) => {
  try {
    const { name, surname, email, password, address, telephone } = req.body

    if (!name || !surname || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const user = await registerUser(
      name,
      surname,
      email,
      password,
      address,
      telephone
    )

    res.status(201).json(user)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" })
    }

    const result = await loginUser(email, password)

    res.json(result)
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
})

export default router