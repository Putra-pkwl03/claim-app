"use client";
import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  duration?: number; 
}

export default function Toast({ message, type = "success", duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 50); 
    const fadeTimer = setTimeout(() => setFadeOut(true), duration);
    const removeTimer = setTimeout(() => setVisible(false), duration + 800);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-18 right-4 max-w-xs w-full px-4 py-2 rounded-lg shadow-lg text-gray-600 font-medium
        flex items-center justify-between gap-2 z-50
        transition-all duration-1000 ease-out transform
        ${fadeOut ? "opacity-0 translate-x-58" : "opacity-100 translate-x-0"}
        ${type === "success" ? "bg-green-100" : "bg-red-100"}`}
    >
      <span>{message}</span>
      <button
        onClick={() => setVisible(false)}
        className="ml-2 p-1 rounded hover:bg-white/40 transition"
      >
        <XMarkIcon className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}
