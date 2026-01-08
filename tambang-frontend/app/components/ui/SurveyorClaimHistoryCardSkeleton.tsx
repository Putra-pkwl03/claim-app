"use client";

import React from "react";

export default function SurveyorClaimHistoryCardSkeleton() {
  return (
    <div className="space-y-4">
      {[1].map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-md border border-gray-200 p-5 shadow-sm animate-pulse"
        >
          {/* HEADER */}
          <div className="flex justify-between items-start gap-4">
            {/* Kiri: Claim info */}
            <div className="space-y-2 flex-1">
              <div className="h-5 w-1/2 bg-gray-300 rounded"></div>
              <div className="h-3 w-1/3 bg-gray-300 rounded"></div>
              <div className="h-3 w-1/4 bg-gray-300 rounded"></div>
              <div className="h-3 w-1/2 bg-gray-300 rounded"></div>
              <div className="space-y-1">
                <div className="h-2 w-1/3 bg-gray-300 rounded"></div>
                <div className="h-2 w-1/4 bg-gray-300 rounded"></div>
              </div>
            </div>

            {/* Kanan: status + aksi */}
            <div className="flex flex-col items-end space-y-2">
              {/* Baris atas: status + tombol aksi */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-12 bg-gray-300 rounded"></div>
                <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
              </div>

              {/* Baris bawah: tombol See Details */}
              <div className="h-4 w-24 bg-gray-300 rounded mt-18"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
