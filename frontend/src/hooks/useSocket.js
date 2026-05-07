"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { getApiUrl } from "@/utils/runtimeConfig";

export default function useSocket(event, handler) {
  useEffect(() => {
    const apiUrl = getApiUrl();
    if (!apiUrl) return;

    const socket = io(apiUrl);

    socket.on(event, handler);

    return () => socket.disconnect();
  }, [event, handler]);
}
