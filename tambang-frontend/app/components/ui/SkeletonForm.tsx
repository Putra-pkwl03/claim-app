// components/ui/SkeletonForm.tsx
"use client";

export default function SkeletonForm() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Grid utama: kiri form & kanan map */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10">
        {/* Form kiri */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Site ID */}
            <div className="h-12 bg-gray-300 rounded-lg"></div>
            {/* Job Type */}
            <div className="h-12 bg-gray-300 rounded-lg"></div>
            {/* Work Date */}
            <div className="h-12 bg-gray-300 rounded-lg"></div>
            {/* Claim Amount */}
            <div className="h-12 bg-gray-300 rounded-lg"></div>
            {/* Volume Klaim */}
            <div className="h-12 bg-gray-300 rounded-lg"></div>
            {/* Koordinat */}
            <div className="h-12 bg-gray-300 rounded-lg"></div>
          </div>

          {/* Work Description */}
          <div className="h-48 bg-gray-300 rounded-lg"></div>
        </div>

        {/* Map kanan */}
        <div className="h-[500px] bg-gray-300 rounded-lg"></div>
      </div>

      {/* Tombol */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="h-12 bg-gray-300 rounded-lg"></div>
        <div className="h-12 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  );
}



