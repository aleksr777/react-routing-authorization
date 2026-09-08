import { useCallback, useEffect, useState } from 'react';
import { getAdminTransferStatusRequest, type AdminTransferStatus } from '../api/admin-api';

const EMPTY_STATUS: AdminTransferStatus = {
  pending: false,
  target_user_id: null,
};

export const useAdminTransferStatus = () => {
  const [status, setStatus] = useState<AdminTransferStatus>(EMPTY_STATUS);

  const refresh = useCallback(async () => {
    setStatus(await getAdminTransferStatusRequest());
  }, []);

  const markPending = useCallback((targetUserId: number) => {
    setStatus({ pending: true, target_user_id: targetUserId });
  }, []);

  useEffect(() => {
    void refresh().catch(() => undefined);

    const intervalId = window.setInterval(() => {
      void refresh().catch(() => undefined);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [refresh]);

  return { status, refresh, markPending };
};
