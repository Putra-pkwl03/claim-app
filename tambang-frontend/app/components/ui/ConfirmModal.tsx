"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ConfirmModalProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title = "Delete Item?",
  description = "Item ini akan dihapus permanen. Yakin ingin melanjutkan?",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-11/12 max-w-md animate-fade-in flex flex-col items-center text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">{title}</h2>
        <p className="text-gray-500 text-sm mb-6">{description}</p>
        <div className="flex justify-center gap-4 w-full">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-full bg-gray-500 hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
