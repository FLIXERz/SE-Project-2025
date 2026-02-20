import { prisma } from "../lib/prisma"
import bcrypt from "bcrypt"

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
