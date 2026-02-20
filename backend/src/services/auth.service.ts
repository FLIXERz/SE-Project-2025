import { prisma } from "../lib/prisma"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


// Service function to register a new user
export const registerUser = async (
  name: string,
  surname: string,
  email: string,
  password: string,
  address?: string,
  telephone?: string
) => {

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error("Email already exists")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      surname,
      email,
      password: hashedPassword,
      address,
      telephone
    }
  })

  return {
    user_id: user.user_id,
    email: user.email
  }
}

// Service function to login a user
export const loginUser = async (
  email: string,
  password: string
) => {

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error("Invalid credentials")
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    throw new Error("Invalid credentials")
  }

  // Check if the user is an admin
  const admin = await prisma.admin.findUnique({
    where: { user_id: user.user_id }
  })

  const token = jwt.sign(
    {
      user_id: user.user_id,
      isAdmin: !!admin
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  )

  return {
    token,
    user: {
      user_id: user.user_id,
      email: user.email,
      isAdmin: !!admin
    }
  }
}


