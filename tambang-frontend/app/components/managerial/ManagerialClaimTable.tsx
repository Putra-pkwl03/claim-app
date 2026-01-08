"use client";

import React, { ReactNode, useState } from "react";
import {
  CheckCircleIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CheckIcon,
  DocumentIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { updateContractorClaimStatus } from "@/lib/api/managerial";
import SignatureModal from "../../components/certificate/SignatureModal";
import Toast from "../ui/Toast";

/* =======================
   Interfaces
======================= */

interface Material {
  material_name: string;
}

interface BlockParty {
  bcm: string;
  amount: string;
  date: string;
  surveyor_claim_id: string;
  note: string;
  materials: Material[];
  file: string | null;
}

interface Block {
  threshold_limit: any;
  within_threshold: any;
  selisih_persen: ReactNode;
  selisih_bcm: ReactNode;
  block_id: number;
  block_name: string;
  contractor: BlockParty;
  surveyor: BlockParty | null;
  is_surveyed: boolean;
}

interface Site {
  id: number;
  no: string;
  name: string;
}

interface Pit {
  id: number;
  no: string;
  name: string;
}

interface Props {
  claims: any[];
  setClaims: React.Dispatch<React.SetStateAction<any[]>>;
  onToast: React.Dispatch<
    React.SetStateAction<{
      message: string;
      type: "success" | "error";
    } | null>
  >;
}

/* =======================
   Component
======================= */

export default function ManagerialClaimTable({ claims, setClaims }: Props) {
  const [openModal, setOpenModal] = useState(false);
  const [expandedClaimIds, setExpandedClaimIds] = useState<number[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);

  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const handleSwitchClick = (claim: any) => {
    setSelectedClaim(claim);
    setSelectedStatus("");
    setOpenModal(true);
  };

  const handleSignatureClick = (claim: any) => {
    const surveyorClaim =
      claim.surveyor_claim_id || claim.surveyor_claim || claim.surveyorClaim;

    if (!surveyorClaim?.id) {
      console.error("Surveyor claim ID tidak ditemukan");
      return;
    }

    // console.log("SIGN SURVEYOR CLAIM ID:", surveyorClaim.id);

    setSelectedClaim({
      ...claim,
      surveyorClaimId: surveyorClaim.id,
    });

    setShowSignatureModal(true);
  };

  const [selectedStatus, setSelectedStatus] = useState<
    "" | "approved_managerial" | "rejected_managerial"
  >("");
  const [loadingSwitch, setLoadingSwitch] = useState(false);

  const handleSubmitStatus = async () => {
    if (!selectedClaim || !selectedStatus || loadingSwitch) return;

    setLoadingSwitch(true);

    try {
      await updateContractorClaimStatus(selectedClaim.id, selectedStatus);

      setClaims((prev) =>
        prev.map((c) =>
          c.id === selectedClaim.id
            ? {
                ...c,
                status_contractor_claim: selectedStatus,
                status: selectedStatus,
              }
            : c
        )
      );

      setToast(null);
      setTimeout(() => {
        setToast({
          message: "Status claim berhasil diperbarui",
          type: "success",
        });
      }, 100);
    } catch (err) {
      console.error("Gagal update status claim:", err);

      setToast(null);
      setTimeout(() => {
        setToast({
          message: "Gagal memperbarui status claim",
          type: "error",
        });
      }, 100);
    } finally {
      setLoadingSwitch(false);
      setOpenModal(false);
      setSelectedClaim(null);
      setSelectedStatus("");
    }
  };

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const statusBadgeMap: Record<string, string> = {
    approved_managerial: "bg-blue-100 text-blue-700",
    rejected_managerial: "bg-red-100 text-red-700",
    auto_approved: "bg-blue-100 text-blue-700",
    rejected_system: "bg-orange-100 text-orange-700",
    submitted: "bg-yellow-100 text-yellow-700",
    draft: "bg-gray-100 text-gray-600",
  };

  return (
    <div className=" rounded-md  border border-gray-200 shadow w-full overflow-x-auto">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <table className="min-w-full w-full text-sm border-collapse">
        <thead className="bg-blue-50">
          <tr className="text-gray-600">
            <th className="px-3 py-3 border-b">No</th>
            <th className="px-3 py-3 border-b">Claim</th>
            <th className="px-3 py-3 border-b  hidden md:table-cell">
              Site / PIT
            </th>
            <th className="px-3 py-3 border-b">Period</th>
            <th className="px-3 py-3 border-b">Job</th>
            {/* <th className="px-3 py-3 border-b hidden md:table-cell">Contractor</th>
            <th className="px-3 py-3 border-b hidden md:table-cell">Surveyor</th> */}
            <th className="px-3 py-3 border-b hidden md:table-cell">Status</th>
            <th className="px-3 py-3 border-b text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {claims.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-6 text-center text-gray-500">
                No claims available
              </td>
            </tr>
          ) : (
            claims.map((claim, idx) => (
              <React.Fragment key={claim.id}>
                {/* CLAIM ROW */}
                <tr
                  className="border-b border-b-gray-300 bg-white text-gray-600 text-center cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => {
                    setExpandedClaimIds((prev) =>
                      prev.includes(claim.id)
                        ? prev.filter((id) => id !== claim.id)
                        : [...prev, claim.id]
                    );
                  }}
                >
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2 font-medium">
                    {claim.claim_number}
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    {claim.site.name} - {claim.site.no}
                    <br />
                    {claim.pit.name} - {claim.pit.no}
                  </td>
                  <td className="px-3 py-2">
                    {claim.period_month}/{claim.period_year}
                  </td>
                  <td className="px-3 py-2">{claim.job_type}</td>
                  {/* <td className="px-3 py-2 text-left text-xs  hidden md:table-cell">
                    BCM: {claim.total_bcm_contractor} <br />
                    Amount: {claim.total_amount_contractor}
                  </td>
                  <td className="px-3 py-2 text-left text-xs  hidden md:table-cell">
                    BCM: {claim.total_bcm_surveyor} <br />
                    Amount: {claim.total_amount_surveyor}
                  </td> */}
                  <td className="px-3 py-2 text-xs hidden md:table-cell">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${
                          claim.status === "approved_managerial"
                            ? "bg-green-100 text-green-800"
                            : claim.status === "validated"
                            ? "bg-yellow-100 text-yellow-800"
                            : claim.status === "approved_managerial"
                            ? "bg-purple-100 text-purple-800"
                            : claim.status === "rejected_managerial"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                    >
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 flex items-center gap-2 text-center">
                    {claim.status === "approved_managerial" && (
                      <button
                        title="give a signature"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSignatureClick(claim);
                        }}
                        className="flex items-center justify-center w-8 h-8 text-xs rounded bg-yellow-100 text-yellow-600 border border-yellow-600 hover:text-yellow-600 hover:bg-yellow-200 transition cursor-pointer"
                      >
                        <DocumentTextIcon className="w-5 h-5" />
                      </button>
                    )}

                    <label className="cursor-pointer flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={
                          claim.status_contractor_claim ===
                          "approved_managerial"
                        }
                        onChange={() => handleSwitchClick(claim)}
                      />
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-md border transition-all duration-200 ${
                          claim.status_contractor_claim ===
                          "approved_managerial"
                            ? "border-green-600 bg-green-50"
                            : "border-blue-400 bg-white hover:border-blue-600"
                        } peer-focus:ring-2 peer-focus:ring-blue-500`}
                      >
                        {claim.status_contractor_claim ===
                          "approved_managerial" && (
                          <CheckIcon className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </label>
                  </td>
                </tr>
                {expandedClaimIds.includes(claim.id) &&
                  claim.blocks.map(
                    (block: {
                      block_id: React.Key | null | undefined;
                      block_name:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      selisih_bcm: null;
                      selisih_persen:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      threshold_limit:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined;
                      within_threshold: any;
                      contractor: {
                        date:
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactPortal
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        bcm:
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactPortal
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        amount:
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactPortal
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        note:
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactPortal
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        materials: any[];
                        file: string | undefined;
                      };
                      is_surveyed: any;
                      surveyor: {
                        date:
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactPortal
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        bcm:
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactPortal
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        amount:
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactPortal
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        note:
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactPortal
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        materials: any[];
                        file: string | undefined;
                      };
                    }) => (
                      <tr key={block.block_id} className="bg-gray-50 border-b">
                        <td
                          colSpan={9}
                          className="px-6 py-4 text-xs text-gray-600"
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
                            <span className="font-bold text-gray-700">
                              {block.block_name}
                            </span>

                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                              Selisih BCM:{" "}
                              {block.selisih_bcm != null
                                ? Number(block.selisih_bcm).toFixed(2)
                                : "-"}
                            </span>

                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                              {block.selisih_persen}%
                            </span>

                            {block.threshold_limit && (
                              <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                Threshold: {block.threshold_limit}
                              </span>
                            )}

                            <span
                              className={`px-2 py-0.5 rounded-full font-medium
                          ${
                            block.within_threshold
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                            >
                              {block.within_threshold
                                ? "Within Threshold"
                                : "Over Threshold"}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* CONTRACTOR */}
                            <div className="bg-white p-4 rounded shadow border border-gray-300 relative hover:shadow-lg transition-all">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-start justify-between gap-2">
                                  {/* Contractor Info */}
                                  <div className="flex flex-col font-semibold text-gray-600 text-[16px]">
                                    <span>Contractor</span>
                                    <span className="text-gray-400 font-medium text-xs">
                                      {claim.contractor_name}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-500 mb-2 gap-2 flex items-center justify-between">
                                  {/* Date */}
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <span>{block.contractor.date}</span>
                                  </div>
                                  -{" "}
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      statusBadgeMap[
                                        claim.status_contractor_claim
                                      ] ?? "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {claim.status_contractor_claim}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 text-gray-500 text-sm">
                                <div>
                                  <strong>BCM: </strong>
                                  <span className="font-medium text-gray-500">
                                    {block.contractor.bcm}
                                  </span>
                                </div>
                                <div>
                                  <strong>Amount: </strong>
                                  <span className="font-medium text-gray-500">
                                    {block.contractor.amount}
                                  </span>
                                </div>
                                <div>
                                  <strong>Desc: </strong>
                                  <span className="font-medium text-gray-500">
                                    {block.contractor.note}
                                  </span>
                                </div>
                                <div>
                                  <strong>Materials: </strong>
                                  <span className="font-medium text-gray-500">
                                    {block.contractor.materials
                                      .map((m) => m.material_name)
                                      .join(", ")}
                                  </span>
                                </div>
                              </div>
                              {block.contractor.file && (
                                <a
                                  href={block.contractor.file}
                                  target="_blank"
                                  className="absolute right-4 bottom-4 inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs"
                                >
                                  {block.contractor.file.endsWith(".pdf") ? (
                                    <DocumentIcon className="w-4 h-4" />
                                  ) : (
                                    <PhotoIcon className="w-4 h-4" />
                                  )}
                                  View File
                                </a>
                              )}
                            </div>

                            {/* SURVEYOR */}
                            <div
                              className={`p-4 rounded border border-gray-300 relative hover:shadow-lg transition-all ${
                                block.is_surveyed ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col font-semibold text-gray-600 text-[16px] mb-2">
                                  <span>Surveyor</span>
                                  <span className="text-gray-400 font-medium text-xs">
                                    {claim.surveyor_name}
                                  </span>
                                </div>
                                {block.surveyor && (
                                  <div className="text-sm text-gray-500 mb-2 gap-2 flex items-center justify-between">
                                    {/* Date */}
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                      <span>{block.surveyor.date}</span>
                                    </div>
                                    -{" "}
                                    <span className="text-green-700 text-xs font-semibold">
                                      {claim.status_surveyor_claim}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {block.surveyor ? (
                                <>
                                  <div className="flex flex-col gap-1 text-gray-500 text-sm">
                                    <div>
                                      <strong>BCM: </strong>
                                      <span className="font-medium text-gray-500">
                                        {block.surveyor.bcm}
                                      </span>
                                    </div>
                                    <div>
                                      <strong>Amount: </strong>
                                      <span className="font-medium text-gray-500">
                                        {block.surveyor.amount}
                                      </span>
                                    </div>
                                    <div>
                                      <strong>Desc: </strong>
                                      <span className="font-medium text-gray-500">
                                        {block.surveyor.note}
                                      </span>
                                    </div>
                                    <div>
                                      <strong>Materials: </strong>
                                      <span className="font-medium text-gray-500">
                                        {block.surveyor.materials
                                          .map((m) => m.material_name)
                                          .join(", ")}
                                      </span>
                                    </div>
                                  </div>

                                  {block.surveyor.file && (
                                    <a
                                      href={block.surveyor.file}
                                      target="_blank"
                                      className="absolute right-4 bottom-4 inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs"
                                    >
                                      {block.surveyor.file.endsWith(".pdf") ? (
                                        <DocumentIcon className="w-4 h-4" />
                                      ) : (
                                        <PhotoIcon className="w-4 h-4" />
                                      )}
                                      View File
                                    </a>
                                  )}
                                </>
                              ) : (
                                <span className="italic text-gray-400">
                                  Belum disurvey
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
      {openModal && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-fadeIn">
            <div className="flex flex-col items-center text-center">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full
                        border border-blue-500 bg-blue-50"
              >
                <CheckCircleIcon className="h-7 w-7 text-blue-600" />
              </div>

              {/* TITLE */}
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                Managerial Confirmation
              </h3>

              {/* DESCRIPTION */}
              <p className="text-gray-600 mb-6 items-center">
                Determine claim status:
                <br />
                <span className="font-semibold text-sm">
                  {" "}
                  {selectedClaim.claim_number}
                </span>
              </p>

              {/* DROPDOWN */}
              <div className="w-full mb-8 text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decision Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm text-gray-400
                            focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">— Choose a decision —</option>
                  <option value="approved_managerial">
                    Approved managerial
                  </option>
                  <option value="rejected_managerial">
                    Rejected managerial
                  </option>
                </select>
              </div>

              {/* ACTION BUTTON */}
              <div className="flex justify-center gap-4 w-full">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl
                            bg-gray-100 text-gray-700 font-medium
                            hover:bg-gray-200 transition"
                  onClick={() => {
                    setOpenModal(false);
                    setSelectedClaim(null);
                    setSelectedStatus("");
                  }}
                >
                  Cancel
                </button>

                <button
                  disabled={!selectedStatus || loadingSwitch}
                  onClick={handleSubmitStatus}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white transition
                    ${
                      !selectedStatus || loadingSwitch
                        ? "bg-gray-400 cursor-not-allowed"
                        : selectedStatus === "approved_managerial"
                        ? "bg-blue-400 hover:bg-blue-500"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                >
                  {loadingSwitch ? "Processing..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSignatureModal && selectedClaim && (
        <SignatureModal
          claim={{
            ...selectedClaim,
            surveyorClaimId:
              selectedClaim.surveyor_claim_id?.id ??
              selectedClaim.surveyor_claim?.id ??
              selectedClaim.surveyorClaim?.id,
          }}
          role="managerial"
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
    </div>
  );
}
