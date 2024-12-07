export const SessionStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const;

export type SessionStatus = typeof SessionStatus[keyof typeof SessionStatus]; 