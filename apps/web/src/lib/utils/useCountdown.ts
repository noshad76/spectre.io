"use client";

import { useEffect, useState } from "react";

export const useCountdown = (expireAt?: string) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!expireAt) return;

    const target = new Date(expireAt).getTime();

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft(diff);
    };

    update();

    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [expireAt]);

  return timeLeft;
};

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hStr = hours.toString().padStart(2, "0");
  const mStr = minutes.toString().padStart(2, "0");
  const sStr = seconds.toString().padStart(2, "0");

  return `${hStr}:${mStr}:${sStr}`;
};
