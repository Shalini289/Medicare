"use client";

import { useEffect, useState } from "react";

export default function Toast({ message, type = "success", duration = 3000, onClose }) {
  const [show, setShow] = useState(true);

  // Auto close
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setShow(false);
      onClose && onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, message, onClose]);

  if (!message || !show) return null;

  return (
    <div className={`toast toast--${type}`}>
      {message}
    </div>
  );
}
