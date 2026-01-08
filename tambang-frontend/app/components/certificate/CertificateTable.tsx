"use client";

import React, { useState } from "react";
import { XMarkIcon, DocumentCheckIcon } from "@heroicons/react/24/outline";
import { generateCertificatePDF } from "@/lib/pdf/generateCertificate";
import { getClaimForCertificate } from "@/lib/api/certificate";

interface Claim {
  claim_id: number;
  status: string;
  claim_number: string;
  contractor: string;
  project: string;
  period_month: number;
  period_year: number;
  grand_total_bcm: number;
}

interface CertificateTableProps {
  claims: Claim[];
  loading: boolean;
}

export default function CertificateTable({ claims, loading }: CertificateTableProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
const [isLoadingPreview, setIsLoadingPreview] = useState(false);

const handlePreview = async (claimId: number) => {
  try {
    setIsLoadingPreview(true); // mulai loading
    const claimData = await getClaimForCertificate(claimId);
    const pdf = await generateCertificatePDF(claimData);
    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  } catch (err) {
    console.error(err);
    alert("Failed to generate PDF preview");
  } finally {
    setIsLoadingPreview(false); // selesai loading
  }
};


  return (
    <>
      {loading ? (
        <div className="text-center py-8 text-gray-500 font-medium">Loading...</div>
      ) : claims.length === 0 ? (
        <div className="text-center py-8 text-gray-400 font-medium">No auto-approved claims found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
          <table className="w-full text-[14px] bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <thead className="bg-blue-50 text-gray-700 border-b border-gray-200">
              <tr className="hover:bg-blue-50/40 transition-colors text-gray-700">
                <th className="py-3 px-4 text-left text-sm">Claim Number</th>
                <th className="py-3 px-4 text-left text-sm">PT</th>
                <th className="py-3 px-4 text-left text-sm">Project</th>
                <th className="py-3 px-4 text-left text-sm">Period</th>
                <th className="py-3 px-4 text-left text-sm">Grand Total BCM</th>
                <th className="py-3 px-4 text-left text-sm">Status</th>
                <th className="py-3 px-4 text-left text-sm">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {claims.map((claim, idx) => (
                <tr
                  key={claim.claim_id}
                  className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition-colors duration-200`}
                >
                  <td className="py-3 px-4 text-gray-700 font-medium">{claim.claim_number}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{claim.contractor}</td>
                  <td className="py-3 px-4 text-gray-700">{claim.project}</td>
                  <td className="py-3 px-4 text-gray-700">{claim.period_month}/{claim.period_year}</td>
                  <td className="py-3 px-4 text-gray-700 font-semibold">{claim.grand_total_bcm.toLocaleString()}</td>
                  <td>
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                      {claim.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                   <button
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded flex items-center gap-1 cursor-pointer"
                        onClick={() => handlePreview(claim.claim_id)}
                        title="Preview Certificate"
                        disabled={isLoadingPreview} 
                        >
                        {isLoadingPreview ? (
                            <svg
                            className="animate-spin h-5 w-5 text-blue-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                            />
                            </svg>
                        ) : (
                            <DocumentCheckIcon className="h-5 w-5" />
                        )}
                        </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Preview */}
      {previewUrl && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white w-[90%] max-w-6xl h-[90%] rounded-lg overflow-hidden relative">
            <button
              className="absolute -top-2 -right-2 text-blue-400 hover:text-blue-600 cursor-pointer hover:bg-blue-50 rounded-full px-2 py-2"
              onClick={() => setPreviewUrl(null)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <iframe src={previewUrl} className="w-full h-full" />
          </div>
        </div>
      )}
    </>
  );
}
