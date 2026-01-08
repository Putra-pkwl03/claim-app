"use client";

export default function ContractorClaimCardSkeleton() {
  return (
    <div className="bg-white rounded-md border border-gray-200 p-5 shadow-sm animate-pulse overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        {/* Left */}
        <div className="space-y-2">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-3 w-56 bg-gray-200 rounded" />
          <div className="h-3 w-48 bg-gray-200 rounded" />
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="h-6 w-24 bg-gray-200 rounded-full" />
          <div className="space-y-1">
            <div className="h-3 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-5">
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-9 w-40 bg-gray-200 rounded-md" />
      </div>
    </div>
  );
}
