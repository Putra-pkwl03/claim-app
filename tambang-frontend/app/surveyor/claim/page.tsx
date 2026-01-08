"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "../../../context/PageTitleContext";
import { getContractorClaimsForSurveyor } from "@/lib/api/ClaimSurveyor";
import ContractorClaimCard from "@/app/components/surveyor/ContractorClaimCard";
import ContractorClaimCardSkeleton from "@/app/components/ui/ContractorClaimCardSkeleton";

export default function SurveyorContractorClaimPage() {
  const { setTitle } = usePageTitle();

  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  setTitle("Referensi Klaim Contractor");

  async function fetchData() {
    try {
      const res = await getContractorClaimsForSurveyor();

      // console.log("Raw API response:", res);

      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      // console.log("Data array yang akan disimpan:", data);

      setClaims(data);
    } catch (err) {
      console.error("Error fetch contractor claims:", err);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, []);


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6 mt-12">
        <h1 className="text-xl font-semibold text-gray-800">
          Klaim Contractor (Referensi)
        </h1>
        <p className="text-sm text-gray-500">
          Data ini bersifat read-only sebagai pembanding pengajuan klaim surveyor
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ContractorClaimCardSkeleton key={i} />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          Tidak ada data klaim contractor
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {claims.map((claim) => (
            <ContractorClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      )}
    </div>
  );
}
