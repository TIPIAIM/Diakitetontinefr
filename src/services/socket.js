import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_SOCKET_URL ||
  "http://localhost:2026";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: false,
    });
  }

  return socket;
};

export const connectSocketForCurrentUser = () => {
  const currentSocket = getSocket();
  const user = useAuthStore.getState().user;

  if (!user?.id && !user?._id) return currentSocket;

  if (!currentSocket.connected) {
    currentSocket.connect();
  }

  currentSocket.emit("auth:join", user.id || user._id);

  return currentSocket;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};