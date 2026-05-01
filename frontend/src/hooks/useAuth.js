"use client";

import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    queueMicrotask(() => {
      const token = localStorage.getItem("token");

      if (token) {
        setUser({ loggedIn: true });
      }
    });
  }, []);

  return user;
}
