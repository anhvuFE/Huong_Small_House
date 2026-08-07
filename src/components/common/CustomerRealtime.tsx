import { useEffect } from 'react';
import { getSocket } from '../../lib/socket';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from './Toast';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  delivered: 'Đã giao',
};

/** Lắng nghe thông báo real-time cho khách đã đăng nhập (đổi trạng thái đơn). */
export const CustomerRealtime: React.FC = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { showToast } = useToast();

  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket(accessToken);
    const onStatus = (p: { orderId?: number; status?: string }) => {
      showToast({
        title: `Đơn #${p.orderId ?? ''} đã cập nhật`,
        message: `Trạng thái: ${STATUS_LABEL[p.status ?? ''] ?? p.status ?? ''}`,
        variant: 'success',
      });
    };
    socket.on('order:status', onStatus);
    return () => {
      socket.off('order:status', onStatus);
    };
  }, [accessToken, showToast]);

  return null;
};

export default CustomerRealtime;
