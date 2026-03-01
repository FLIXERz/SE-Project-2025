export const allowedTrackingStatus = [
  "order_received",
  "preparing",
  "packed",
  "shipping"
] as const

export type TrackingStatusType =
  typeof allowedTrackingStatus[number]