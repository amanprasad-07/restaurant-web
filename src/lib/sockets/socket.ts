import { io, type Socket } from "socket.io-client";
import { API_URL } from "../api/client";

const SOCKET_ORIGIN = new URL(API_URL).origin; // "http://localhost:4000", with no /api/v1 path

// One shared connection per browser tab. Several components can "acquire" it;
// it closes shortly after the last one lets go (the delay survives React strict-mode remounts).
let socket: Socket | null = null;
let currentToken: string | null = null;
let refs = 0;
let closeTimer: ReturnType<typeof setTimeout> | undefined;

export function acquireSocket(token: string): Socket {
  clearTimeout(closeTimer);
  refs += 1;
  if (!socket || currentToken !== token) {
    socket?.disconnect();
    currentToken = token;
    socket = io(SOCKET_ORIGIN, { auth: { token }, transports: ["websocket"] });
  }
  return socket;
}

export function releaseSocket() {
  refs = Math.max(0, refs - 1);
  if (refs === 0) {
    closeTimer = setTimeout(() => {
      if (refs === 0) {
        socket?.disconnect();
        socket = null;
        currentToken = null;
      }
    }, 300);
  }
}
