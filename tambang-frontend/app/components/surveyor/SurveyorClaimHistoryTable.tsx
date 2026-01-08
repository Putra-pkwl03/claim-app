"use client";

import React, { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import ConfirmModal from "../ui/ConfirmModal";
import Toast from "../ui/Toast";
import { useRouter } from "next/navigation";
import { deleteSurveyorClaim } from "@/lib/api/ClaimSurveyor";
import SignatureModal from "../../components/certificate/SignatureModal";

interface Props {
  claims: any[];
  onDeleted?: () => void;
}

export default function SurveyorClaimHistoryCard({ claims, onDeleted }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [expandedClaims, setExpandedClaims] = useState<number[]>([]);

  function getSurveyorClaimId(claim: any) {
    if (typeof claim.surveyor_claim_id === "number")
      return claim.surveyor_claim_id;
    return (
      claim.surveyor_claim_id?.id ??
      claim.surveyor_claim?.id ??
      claim.surveyorClaim?.id
    );
  }

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);

  const handleDeleteClick = (id: number) => {
    setSelectedClaimId(id);
    setShowConfirm(true);
  };

  const router = useRouter();

  const [localClaims, setLocalClaims] = useState(claims);

  const handleConfirmDelete = async () => {
    if (!selectedClaimId) return;
    try {
      await deleteSurveyorClaim(selectedClaimId);
      setToast({ message: "Claim berhasil dihapus", type: "success" });
      setShowConfirm(false);
      setSelectedClaimId(null);

      // Hapus langsung dari state lokal
      setLocalClaims((prev) => prev.filter((c) => c.id !== selectedClaimId));
    } catch (err: any) {
      setToast({
        message: err.message || "Gagal menghapus claim",
        type: "error",
      });
      setShowConfirm(false);
      setSelectedClaimId(null);
    }
  };

  if (claims.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400">No data available</div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    validated: "bg-blue-100 text-blue-700",
    default: "bg-gray-100 text-gray-700",
  };

  const toggleExpand = (id: number) => {
    setExpandedClaims((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="space-y-4">
        {localClaims.map((claim, idx) => {
          const isExpanded = expandedClaims.includes(claim.id);
          return (
            <div
              key={claim.id}
              className="bg-white rounded-md border border-gray-200 p-5 shadow-sm hover:shadow-md transition"
            >
              {/* ===== HEADER ===== */}
              <div className="flex justify-between items-start gap-4">
                {/* Kiri: Claim info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {idx + 1}. {claim.claim_number}
                  </h3>
                  <p className="text-xs text-gray-400 -mt-3">
                    {claim.period_month}/{claim.period_year} / {claim.job_type}
                  </p>
                  <p className="text-xs text-gray-400 -mt-2">
                    Total Block: {claim.total_block}
                  </p>
                  <div className="text-gray-500 text-sm">
                    {claim.site_name} / {claim.pit_name}
                  </div>
                  <div className="space-x-3 text-xs">
                    <span className="text-blue-700">
                      No Site: {claim.no_site}
                    </span>
                    <br />
                    <span className="text-yellow-700">
                      No PIT: {claim.no_pit}
                    </span>
                  </div>
                </div>

                {/* Kanan: tombol aksi + expand */}
                <div className="flex flex-col items-end space-y-2">
                  {/* Baris atas: status + aksi */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        statusColors[claim.status] || statusColors.default
                      }`}
                    >
                      {claim.status}
                    </span>

                    <button
                      title="give a signature"
                      onClick={() => {
                        setSelectedClaim(claim);
                        setShowSignatureModal(true);
                      }}
                      className="px-3 py-1 text-xs rounded bg-yellow-100 text-yellow-600 border border-yellow-600 hover:text-yellow-600 hover:bg-yellow-200 transition cursor-pointer"
                    >
                      <DocumentTextIcon className="w-5 h-5" />
                    </button>

                    <button
                      title="change surveyor claim data"
                      onClick={() =>
                        router.push(`/claim/history/${claim.id}/edit`)
                      }
                      className="px-3 py-1 text-xs rounded bg-blue-100 text-blue-400 border border-blue-300 hover:text-blue-500 hover:bg-blue-200 transition cursor-pointer"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>

                    <button
                      title="delete surveyor claim data"
                      onClick={() => handleDeleteClick(claim.id)}
                      className="px-3 py-1 text-xs rounded bg-red-100 text-red-400 border border-red-300 hover:text-red-500 hover:bg-red-200 transition cursor-pointer"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Baris bawah: toggle expand */}
                  <div>
                    <button
                      onClick={() => toggleExpand(claim.id)}
                      className="flex items-center text-gray-500 hover:text-gray-700 text-sm font-medium gap-1 mt-18"
                    >
                      {isExpanded ? "Hide Details" : "See Details"}
                      {isExpanded ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ===== DETAIL ===== */}
              {isExpanded && (
                <div className="mt-4 border-t border-gray-200 pt-4 space-y-4 text-gray-600">
                  {/* Summary */}
                  <div className="bg-gray-50 p-3 text-sm flex justify-between text-gray-500 -mt-4">
                    <p>
                      <strong>Total BCM:</strong> {claim.total_bcm}
                    </p>
                    <p>
                      <strong>Total Amount:</strong> Rp{" "}
                      {Number(claim.total_amount).toLocaleString()}
                    </p>
                  </div>

                  {/* Blocks */}
                  <div className="space-y-3 -mt-4">
                    {claim.blocks.map((block: any) => (
                      <div
                        key={block.claim_block_id}
                        className={`p-4 rounded-md bg-white border shadow shadow-gray-500 ${
                          block.is_surveyed
                            ? "border border-blue-800"
                            : "border border-red-800"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-gray-700">
                            {block.block_name}
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>
                              <span className="font-medium text-gray-600">
                                Surveyor:
                              </span>{" "}
                              {block.date_surveyor ?? "-"}
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">
                                Contractor:
                              </span>{" "}
                              {block.date_contractor ?? "-"}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5 text-sm text-gray-600">
                          <div>
                            <div className="text-gray-500">Surveyor BCM</div>
                            <div className="text-gray-400 text-xs">
                              {block.bcm_surveyor}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Contractor BCM</div>
                            <div className="text-gray-400 text-xs">
                              {block.bcm_contractor ?? "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Amount Surveyor</div>
                            <div className="text-gray-400 text-xs">
                              {block.amount_surveyor}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">
                              Amount Contractor
                            </div>
                            <div className="text-gray-400 text-xs">
                              {block.amount_contractor ?? "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Surveyor Note</div>
                            <div className="text-gray-400 text-xs">
                              {block.note_surveyor}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Contractor Note</div>
                            <div className="text-gray-400 text-xs">
                              {block.note_contractor ?? "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">
                              Surveyor Materials
                            </div>
                            <div className="text-gray-400 text-xs">
                              {block.materials_surveyor?.length
                                ? `[${block.materials_surveyor
                                    .map((m: any) => m.material_name)
                                    .join(", ")}]`
                                : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">
                              Contractor Materials
                            </div>
                            <div className="text-gray-400 text-xs">
                              {block.materials_contractor?.length
                                ? `[${block.materials_contractor
                                    .map((m: any) => m.material_name)
                                    .join(", ")}]`
                                : "-"}
                            </div>
                          </div>
                        </div>

                        {/* FILE LINKS */}
                        <div className="flex justify-end space-x-3 mt-4 text-xs">
                          {block.file_surveyor && (
                            <a
                              href={block.file_surveyor}
                              target="_blank"
                              className="text-blue-600 hover:underline"
                            >
                              {block.file_type_surveyor === "image"
                                ? "Image Surveyor"
                                : "PDF Surveyor"}
                            </a>
                          )}
                          {block.file_contractor && (
                            <a
                              href={block.file_contractor}
                              target="_blank"
                              className="text-green-600 hover:underline"
                            >
                              {block.file_type_contractor === "image"
                                ? "Image Contractor"
                                : "PDF Contractor"}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showSignatureModal && selectedClaim && (
        <SignatureModal
          claim={{
            ...selectedClaim,
            surveyorClaimId: getSurveyorClaimId(selectedClaim),
          }}
          role="surveyor"
          onClose={() => {
            setShowSignatureModal(false);
            setSelectedClaim(null);
          }}
          onToast={(toast) => {
            setToast(null);
            setTimeout(() => setToast(toast), 100);
          }}
        />
      )}
    </>
  );
}
