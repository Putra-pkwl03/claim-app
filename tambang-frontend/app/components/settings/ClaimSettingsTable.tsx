"use client";

import { useState } from "react";
import { patchThresholdStatus } from "@/lib/api/claim-limit";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";


interface Threshold {
  id: number;
  name: string;
  limit_value: number;
  description?: string;
  active: boolean;
  created_at: string;
}

export default function ClaimSettingsTable({
  data,
  onClose,
  onEdit,
  onDelete,
  onToggleSuccess,
  onToggleError,
}: {
  data: Threshold[];
  onClose: () => void;
  onEdit: (item: Threshold) => void;
  onDelete: (id: number) => void;
  onToggleSuccess: (msg: string) => void;
  onToggleError: (msg: string) => void;
})
{

  const [items, setItems] = useState<Threshold[]>(data);
  const [loadingId, setLoadingId] = useState<number | null>(null);

const handleToggle = async (item: Threshold) => {
  try {
    setLoadingId(item.id);

    await patchThresholdStatus(item.id, !item.active);

    setItems((prev) =>
      prev.map((t) =>
        t.id === item.id
          ? { ...t, active: !item.active }
          : { ...t, active: false }
      )
    );

    onToggleSuccess(
      item.active
        ? "Threshold berhasil dinonaktifkan"
        : "Threshold berhasil diaktifkan"
    );
  } catch (err) {
    console.error(err);
    onToggleError("Gagal mengubah status threshold");
  } finally {
    setLoadingId(null);
  }
};


  return (
    <div className="bg-white rounded shadow mb-6">
      <div className="flex justify-between items-center p-2">
        <h3 className="font-semibold text-gray-600">
          Threshold Claim List
        </h3>
        <button
          onClick={onClose}
          className="text-sm text-red-700 hover:underline cursor-pointer hover:text-red-600"
        >
          Close
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-300/10 text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left">Nama</th>
              <th className="px-3 py-2 text-center">Limit (M²)</th>
              <th className="px-3 py-2 text-center">Status</th>
              <th className="px-3 py-2 text-center">Created</th>
              <th className="px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="border">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-6 text-gray-500"
                >
                  Data tidak tersedia
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-500">
                    {item.name}
                  </td>

                  <td className="px-3 py-2 text-center text-gray-500">
                    {item.limit_value}
                  </td>

                  {/* SWITCH STATUS */}
                  <td className="px-3 py-2 text-center">
                    <button
                      disabled={loadingId === item.id}
                      onClick={() => handleToggle(item)}
                      className={`relative  cursor-pointer inline-flex h-6 w-11 items-center rounded-full transition ${
                        item.active
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      } ${
                        loadingId === item.id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          item.active
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>

                  <td className="px-3 py-2 text-center text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-3 py-2 text-center">
                    <div className="flex justify-center gap-3">
                        <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-100 border border-blue-300 rounded p-1.5 hover:bg-blue-200 cursor-pointer"
                        title="Edit"
                        >
                        <PencilSquareIcon className="w-5 h-5" />
                        </button>

                        <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-800  bg-red-100 border border-red-300 rounded p-1.5 hover:bg-red-200 cursor-pointer"
                        title="Hapus"
                        >
                        <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                    </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
