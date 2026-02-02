export const AVAILABILITY_THRESHOLDS = {
  HIGH: 0.8,
  PARTIAL: 0.5,
}

export const TRIP_ROLES = {
  CREATOR: 'creator',
  RESPONDENT: 'respondent',
} as const

export type TripRole = (typeof TRIP_ROLES)[keyof typeof TRIP_ROLES]
