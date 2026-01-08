"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "../../../context/PageTitleContext";
import SurveyorClaimHistoryCard from "@/app/components/surveyor/SurveyorClaimHistoryTable";
import { getSurveyorClaims } from "@/lib/api/ClaimSurveyor";
import SurveyorClaimHistoryCardSkeleton from "@/app/components/ui/SurveyorClaimHistoryCardSkeleton";

export default function SurveyorClaimHistoryPage() {
  const { setTitle } = usePageTitle();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  setTitle("History Klaim Surveyor");

  async function fetchClaims() {
    try {
      const data = await getSurveyorClaims();

      // console.log("Raw API response:", data); 

      // Pastikan data array
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      // console.log("Data array yang akan disimpan:", list);

      setClaims(list);
    } catch (err: any) {
      console.error("Error fetch surveyor claims:", err);
      setError(err.message || "Gagal mengambil data klaim");
    } finally {
      setLoading(false);
    }
  }

  fetchClaims();
}, []);

return (
  <div className="p-6 w-full bg-gray-100 min-h-screen">
    <h1 className="text-xl font-semibold mb-6 mt-12">History Klaim Surveyor</h1>

    {loading ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 -mt-2">
        {Array(3).fill(0).map((_, idx) => (
          <SurveyorClaimHistoryCardSkeleton key={idx} />
        ))}
      </div>
    ) : error ? (
      <div className="text-center text-red-500 py-10">{error}</div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 -mt-2">
        {claims.map((claim) => (
          <SurveyorClaimHistoryCard key={claim.id} claims={[claim]} />
        ))}
      </div>
    )}

  </div>
);

}
