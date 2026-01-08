"use client";

import React from "react";

interface SkeletonClaimTableProps {
  rows?: number; // jumlah baris skeleton, default 5
}

export default function SkeletonClaimTable({ rows = 5 }: SkeletonClaimTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 shadow">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-blue-50">
          <tr className="text-gray-600">
            <th className="px-3 py-3 border-b">No</th>
            <th className="px-3 py-3 border-b">Claim</th>
            <th className="px-3 py-3 border-b">Site / PIT</th>
            <th className="px-3 py-3 border-b">Period</th>
            <th className="px-3 py-3 border-b">Job</th>
            <th className="px-3 py-3 border-b">Contractor</th>
            <th className="px-3 py-3 border-b">Surveyor</th>
            <th className="px-3 py-3 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, idx) => (
            <tr key={idx} className="border-b border-b-gray-300 bg-white text-center animate-pulse">
              <td className="px-3 py-2">
                <div className="h-4 w-4 mx-auto bg-gray-200 rounded"></div>
              </td>
              <td className="px-3 py-2">
                <div className="h-4 w-20 mx-auto bg-gray-200 rounded"></div>
              </td>
              <td className="px-3 py-2">
                <div className="h-4 w-32 mx-auto bg-gray-200 rounded"></div>
              </td>
              <td className="px-3 py-2">
                <div className="h-4 w-14 mx-auto bg-gray-200 rounded"></div>
              </td>
              <td className="px-3 py-2">
                <div className="h-4 w-16 mx-auto bg-gray-200 rounded"></div>
              </td>
              <td className="px-3 py-2">
                <div className="h-4 w-24 mx-auto bg-gray-200 rounded"></div>
              </td>
              <td className="px-3 py-2">
                <div className="h-4 w-24 mx-auto bg-gray-200 rounded"></div>
              </td>
              <td className="px-3 py-2">
                <div className="h-4 w-16 mx-auto bg-gray-200 rounded"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
