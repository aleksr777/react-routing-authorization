import type { AuthSession } from '../../features/auth/api/session-api';
import { formatSessionDate, getSessionDeviceLabel } from '../my-profile/session-device';
import styles from '../my-profile/active-sessions.module.css';

type Props = {
  session: AuthSession;
  revoking: boolean;
  disabled: boolean;
  onRevoke: (sessionId: string) => void;
};

const UserManagementSessionCard = ({ session, revoking, disabled, onRevoke }: Props) => (
  <article className={styles.card}>
    <div className={styles.cardHeader}>
      <strong>{getSessionDeviceLabel(session.user_agent)}</strong>
    </div>
    <span>IP: {session.ip_address ?? 'Unknown'}</span>
    <span>Signed in: {formatSessionDate(session.created_at)}</span>
    <span>Last used: {formatSessionDate(session.last_used_at)}</span>
    <span>Expires: {formatSessionDate(session.expires_at)}</span>
    <button
      className={styles.terminateButton}
      type="button"
      onClick={() => onRevoke(session.id)}
      disabled={disabled}
    >
      {revoking ? 'Terminating...' : 'Terminate session'}
    </button>
  </article>
);

export default UserManagementSessionCard;
