export const allowedStats = [
  "Protection",
  "Purity",
  "Telluric",
  "Ethereality",
  "Ominiscience",
  "Healing",
  "Wealth",
  "Abundance",
  "Intelligence",
  "Creativity",
  "Affection",
  "Passion"
] as const

export type StatType = typeof allowedStats[number]