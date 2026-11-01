"use client";

import { useEffect, useRef, useState } from "react";
import { acquireSocket, releaseSocket } from "./socket";

export type SocketStatus = "connecting" | "connected" | "disconnected";

/** Subscribe to one server event for as long as the component is mounted. */
export function useSocketEvent<T>(token: string | null, event: string, handler: (payload: T) => void) {
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });

  useEffect(() => {
    if (!token) return;
    const socket = acquireSocket(token);
    const listener = (payload: T) => latest.current(payload);
    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
      releaseSocket();
    };
  }, [token, event]);
}

/** Connection state for the "live" dot. onReconnect fires on every connect AFTER the first one. */
export function useSocketStatus(token: string | null, onReconnect?: () => void): SocketStatus {
  const [status, setStatus] = useState<SocketStatus>("connecting");
  const latest = useRef(onReconnect);
  useEffect(() => {
    latest.current = onReconnect;
  });

  useEffect(() => {
    if (!token) return;
    const socket = acquireSocket(token);
    let seenConnect = socket.connected;
    const up = () => {
      setStatus("connected");
      if (seenConnect) latest.current?.();
      seenConnect = true;
    };
    const down = () => setStatus("disconnected");
    socket.on("connect", up);
    socket.on("disconnect", down);
    socket.on("connect_error", down);
    if (socket.connected) setStatus("connected");
    return () => {
      socket.off("connect", up);
      socket.off("disconnect", down);
      socket.off("connect_error", down);
      releaseSocket();
    };
  }, [token]);

  return token ? status : "disconnected";
}
