import { io, type Socket } from 'socket.io-client';

// Backend Socket.IO chạy cùng host với REST nhưng KHÔNG có tiền tố /api.
const SOCKET_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/api\/?$/, '');

let socket: Socket | null = null;

/** Trả về socket singleton; cập nhật token khi đăng nhập/đăng xuất. */
export function getSocket(token?: string | null): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: token ? { token } : {},
      transports: ['websocket'],
      autoConnect: true,
    });
  } else if (token && (socket.auth as { token?: string })?.token !== token) {
    socket.auth = { token };
    socket.disconnect().connect();
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
