"use client";

import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState } from "react";
import ConfirmModal from "../ui/ConfirmModal";

export default function UserTable({ users, onDelete, onEdit }: any) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
   <div className="overflow-x-auto rounded-md shadow border border-gray-200">
  <table className="w-full text-sm bg-white ">
    <thead className="bg-blue-300/10 text-gray-700 border-b border-blue-300/10 rounded-md">
      <tr className="hover:bg-blue-50/40 transition-colors text-gray-700">
        <th className="px-4 py-3 text-left">No</th>
        <th className="px-4 py-3 text-left">Photo</th>
        <th className="px-4 py-3 text-left">Name</th>
        <th className="px-4 py-3 text-left">Email</th>
        <th className="px-4 py-3 text-left">Role</th>
        <th className="px-4 py-3 text-center">Status</th> 
        <th className="px-4 py-3 text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.map((u: any, index: number) => {
        const photoUrl = u.photo_url || `https://ui-avatars.com/api/?name=${u.name}`;
        const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-50";

        return (
          <tr
            key={u.id}
            className={`${rowBg} hover:bg-gray-100 transition text-gray-600`}
          >
            {/* No urut */}
            <td className="px-4 py-2">{index + 1}</td>
            <td className="px-4 py-2">
              <img
                src={photoUrl}
                alt={u.name}
                width={45}
                height={45}
                className="rounded-full object-cover border border-gray-200"
              />
            </td>
            <td className="px-4 py-2">{u.name}</td>
            <td className="px-4 py-2">{u.email}</td>
            <td className="px-4 py-2 capitalize">{u.role}</td>

            {/* Status Slider */}
            <td className="px-4 py-2 text-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={u.status === "active"}
                  onChange={async (e) => {
                    const newStatus = e.target.checked ? "active" : "inactive";
                    try {
                      await onEdit({ ...u, status: newStatus }); 
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition-colors"></div>
                <div
                  className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform peer-checked:translate-x-5"
                ></div>
              </label>
            </td>

            {/* Actions */}
            <td className="px-4 py-2 text-center">
              <div className="flex items-center justify-center gap-3">
                <button
                  className="p-2 rounded-md bg-blue-100 hover:bg-blue-200 transition"
                  onClick={() => onEdit(u)}
                >
                  <PencilSquareIcon className="w-5 h-5 text-blue-600" />
                </button>

                <button
                  className="p-2 rounded-md bg-red-100 hover:bg-red-200 transition"
                  onClick={() => setSelectedId(u.id)}
                >
                  <TrashIcon className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>

  {selectedId && (
    <ConfirmModal
      title="Delete User?"
      onCancel={() => setSelectedId(null)}
      onConfirm={() => {
        onDelete(selectedId!);
        setSelectedId(null);
      }}
    />
  )}
</div>

  );
}
