import type { AdminLoginChallenge } from '../../features/auth/api/auth-api';

export type AdminLoginConfirmProps = {
  challenge: AdminLoginChallenge;
  onChallenge: (challenge: AdminLoginChallenge) => void;
  onConfirmed: () => void;
  onBack: () => void;
};
