"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

export default function ContractorClaimCard({ claim }: { claim: any }) {
  const [showDetail, setShowDetail] = useState(false);
  const router = useRouter();

  const handleCreateClaim = () => {
    router.push(`/surveyor/claim/create?ref=${claim.id}`);
  };

  const isImage = (type?: string) =>
    ["jpg", "jpeg", "png", "webp"].includes((type ?? "").toLowerCase());

  return (
    <div className="bg-white rounded-md border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
      
      {/* ===== Header ===== */}
      <div className="flex justify-between items-start gap-4">
        {/* Left */}
        <div>
          <h3 className="font-semibold text-md text-gray-600">
            {claim.no_site} / {claim.no_pit}
          </h3>
          <p className="text-sm text-gray-500">
            {claim.site_name} • {claim.pit_name}
          </p>
          <p className="text-xs text-gray-400">
            Job: {claim.job_type} • Period: {claim.period_month}/{claim.period_year}
          </p>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2">
       <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            claim.status === "auto_approved" ||
            claim.status === "approved_managerial" ||
            claim.status === "approved_finance"
              ? "bg-green-100 text-green-800"
              : claim.status === "submitted"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-700"
          }`}
        >
          {claim.status.toUpperCase()}
        </span>
          {/* Block Summary */}
          <div className="text-xs text-right space-y-0.5">
            <p className="text-yellow-700">
              <strong>Total Block:</strong> {claim.total_block}
            </p>
            <p className="text-blue-700">
              <strong>Surveyed:</strong> {claim.surveyed_block}
            </p>
            <p className="text-red-700">
              <strong>Not Surveyed:</strong> {claim.not_surveyed_block}
            </p>
          </div>
        </div>
      </div>

      {/* ===== Actions ===== */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          {showDetail ? "Hide Details" : "See Details"}
          {showDetail ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={handleCreateClaim}
          className="flex items-center gap-1 text-sm px-3 py-2 rounded-md
            border border-blue-500 bg-blue-100 text-blue-800
            font-medium hover:bg-blue-200 transition"
        >
          <PlusCircleIcon className="w-5 h-5" />
          Company’s Claim
        </button>
      </div>

      {/* ===== Detail ===== */}
      {showDetail && (
        <div className="mt-4 border-t border-gray-200 pt-4 space-y-4 text-gray-600">
        {/* Summary */}
          <div className="bg-gray-50 p-3 text-sm flex justify-between -mt-4 text-gray-500">
            <p>
              <strong>Total BCM:</strong> {claim.total_bcm}
            </p>
            <p>
              <strong>Total Amount:</strong>{" "}
              Rp {Number(claim.total_amount).toLocaleString()}
            </p>
          </div>
          {/* Blocks */}
          <div className="space-y-6">
            {claim.blocks.map((b: any) => (
              <div
                key={b.claim_block_id}
                className={`p-4 rounded-md bg-white border -mt-4 shadow shadow-gray-500 ${
                  b.is_surveyed ? "border-blue-800" : "border-red-800"
                }`}
              >
                {/* Block Header */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-600">
                      {b.block_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {b.date}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-reguler px-2 py-1 rounded-full ${
                      b.is_surveyed
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {b.is_surveyed ? "Surveyed" : "Not Surveyed"}
                  </span>
                </div>

                {/* Block Content */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-2 text-gray-500">
                  <p>
                    <strong>BCM:</strong> {b.bcm_contractor}
                  </p>
                  <p>
                    <strong>Amount:</strong>{" "}
                    Rp {Number(b.amount).toLocaleString()}
                  </p>
                </div>

                <p className="text-sm mb-1 text-gray-500">
                  <strong>Description:</strong> {b.note}
                </p>

                <p className="text-sm text-gray-500">
                  <strong>Materials:</strong>{" "}
                  {b.materials?.map((m: any) => m.material_name).join(", ")}
                </p>

                {/* File */}
                {b.file_url && (
                  <div className="mt-3">
                    <a
                      href={b.file_url}
                      target="_blank"
                      className="text-sm text-blue-700 hover:underline flex items-center gap-1"
                    >
                      {isImage(b.file_type) ? (
                        <PhotoIcon className="w-4 h-4" />
                      ) : (
                        <DocumentIcon className="w-4 h-4" />
                      )}
                      File ({b.file_type})
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
