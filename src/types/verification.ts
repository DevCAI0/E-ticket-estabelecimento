// types/verification.ts

export const VerificationStates = {
  PREPARING: 'preparing',
  POSITIONING: 'positioning',
  SCANNING: 'scanning',
  APPROVED: 'approved',
  DENIED: 'denied',
  NOT_REGISTERED: 'not_registered',
  READY: 'ready'
} as const;

export type VerificationState = typeof VerificationStates[keyof typeof VerificationStates];

export type ProcessingStates = 
  | typeof VerificationStates.PREPARING 
  | typeof VerificationStates.POSITIONING 
  | typeof VerificationStates.SCANNING;

export const isValidVerificationState = (state: unknown): state is VerificationState => {
  return Object.values(VerificationStates).includes(state as VerificationState);
};