"use client";
import { useState, useEffect } from "react";
import {
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

import {
  getActiveThreshold,
  createThreshold,
  updateThreshold,
} from "@/lib/api/claim-limit";

export default function ThresholdSettingsModal({ open, onClose, onSave,  editData, }: any) {
  const [name, setName] = useState("");
  const [limit_value, setlimit_value] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  const [currentId, setCurrentId] = useState<number | null>(null);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // ================= Load Active Threshold =================
useEffect(() => {
  if (!open) return;

  if (editData) {
    setName(editData.name);
    setlimit_value(String(editData.limit_value));
    setDescription(editData.description ?? "");
    setActive(Boolean(editData.active));
    setCurrentId(editData.id);
    return;
  }

  // fallback: create baru
  setName("");
  setlimit_value("0");
  setDescription("");
  setActive(true);
  setCurrentId(null);
}, [open, editData]);


  if (!open) return null;

  // ================= Save =================
  const handleSave = async () => {
    const numericlimit_value = Number(limit_value);

    if (!name.trim()) {
      alert("Nama threshold wajib diisi");
      return;
    }

    if (isNaN(numericlimit_value) || numericlimit_value < 0) {
      alert("Nilai limit_value tidak valid");
      return;
    }

    try {
      setLoadingSave(true);

      const payload = {
        name,
        limit_value: numericlimit_value,
        description,
        active,
      };

      let res;
      if (currentId) {
        res = await updateThreshold(currentId, payload);
      } else {
        res = await createThreshold(payload);
      }

      onSave(res?.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan threshold");
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[480px] rounded-xl shadow-2xl border p-6 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <AdjustmentsHorizontalIcon className="w-7 h-7 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-700">
            Pengaturan Threshold Klaim
          </h2>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="text-sm font-semibold mb-1 block text-gray-500">
            Nama Threshold
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-gray-500"
            placeholder="Contoh: Threshold Januari"
          />
        </div>

        {/* limit_value */}
        <div className="mb-4">
          <label className="text-sm font-semibold mb-1 flex items-center gap-2 text-gray-500">
            <FunnelIcon className="w-5 h-5" />
            Ambang Batas (BCM) - (M²)
          </label>
          <input
            type="number"
            min={0}
            value={limit_value}
            onChange={(e) => setlimit_value(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-gray-500"
            placeholder="Contoh: 1200 m2"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-sm font-semibold mb-1 block text-gray-500">
            Deskripsi
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-gray-500"
            placeholder="Contoh: ini kolom opsional"
            rows={3}
          />
        </div>

        {/* Active */}
        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <span className="text-sm text-gray-500">Jadikan threshold aktif</span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loadingSave || loadingFetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {loadingSave ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
