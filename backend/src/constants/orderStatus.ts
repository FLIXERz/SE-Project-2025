export const allowedOrderStatus = [
  "paid",
  "preparing",
  "shipping",
  "completed", 
  "cancelled"
] as const

export type OrderStatusType =
  typeof allowedOrderStatus[number]