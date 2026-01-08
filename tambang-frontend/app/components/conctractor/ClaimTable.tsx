"use client";

import { FC, useState, useEffect } from "react";
import { PencilSquareIcon, EyeIcon, TrashIcon, DocumentArrowDownIcon } from "@heroicons/react/24/solid";
import SkeletonRow from "../ui/Skeleton";
import ConfirmModal from "../ui/ConfirmModal";
import Toast from "../ui/Toast";
import ClaimDetailRow from "./ClaimDetailRow";
import { useRouter } from "next/navigation";
import { Fragment } from "react";

type ClaimSummaryRow = {
  created_at: string;
  id: number;
  claim_number: string;
  period: string;
  date: string;
  job_type: string;
  total_bcm: string;
  total_block: string;
  status: string;
  bcm: string;
  total_amount: string;
  amount: string;
  file_url?: string;
};

type ClaimTableProps = {
  claims: any[];
  loading: boolean;
  onEdit?: (id: number) => void;
  onDetail?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export const ClaimTable: FC<ClaimTableProps> = ({
  claims,
  loading,
  onEdit,
  onDetail,
  onDelete,
}) => {
  const [rows, setRows] = useState<ClaimSummaryRow[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [claimToDelete, setClaimToDelete] = useState<ClaimSummaryRow | null>(null);
  const [openClaimId, setOpenClaimId] = useState<number | null>(null);

  useEffect(() => {
    const summaryRows: ClaimSummaryRow[] = claims.flatMap((claim) =>
      claim.blocks.map((block: any) => ({
        id: block.id,
        claim_number: claim.claim_number,
        period: claim.period,
        date: block.date,
        total_amount: claim.total_amount,
        job_type: claim.job_type,
        total_bcm: claim.total_bcm,
        total_block: claim.total_block,
        status: claim.status,
        bcm: block.bcm,
        amount: block.amount,
         file_url: block.file_url,
      }))
    );
    setRows(summaryRows);
  }, [claims]);

  const router = useRouter();

  const handleDelete = () => {
    if (!claimToDelete || !onDelete) return;
    try {
      onDelete(claimToDelete.id);
      setToast({ message: "Klaim berhasil dihapus!", type: "success" });
      setClaimToDelete(null);
    } catch (err: any) {
      setToast({ message: err.message || "Gagal menghapus klaim", type: "error" });
      setClaimToDelete(null);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
        <table className="w-full text-[14px] bg-white border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-blue-50 text-gray-700 border-b border-gray-200 ">
            <tr className="hover:bg-blue-50/40 transition-colors text-gray-700">
              <th className="px-4 py-3 text-left">Claim Number</th>
              <th className="px-4 py-3 text-left">Periode</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Job Type</th>
              <th className="px-4 py-3 text-left">Total Amount</th>
              <th className="px-4 py-3 text-center">Total Bcm</th>
              <th className="px-4 py-3 text-center">Total Block</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
  {loading ? (
    Array.from({ length: 5 }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: 9 }).map((_, j) => (
          <td key={j} className="px-4 py-2">
            <div className="animate-pulse w-full h-4 bg-gray-200 rounded-md" />
          </td>
        ))}
      </tr>
    ))
  ) : claims.length > 0 ? (
    claims.map((claim) => (
        <Fragment key={claim.id}>
      <>
        {/* ROW UTAMA */}
        <tr key={claim.id} className="hover:bg-gray-50 text-gray-500 text-[12px]">
          <td className="px-4 py-2">{claim.claim_number}</td>
          <td className="px-4 py-2">{claim.period}</td>
          <td className="px-4 py-2">{claim.created_at}</td>
          <td className="px-4 py-2">{claim.job_type}</td>
          <td className="px-4 py-2">{claim.total_amount}</td>
          <td className="px-4 py-2 text-center">{claim.total_bcm}</td>
          <td className="px-4 py-2 text-center">{claim.total_block}</td>
          <td className="px-4 py-2 text-center">
            <span
              className={`px-2 py-1.5 rounded-full text-[12px] ${
                claim.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : claim.status === "rejected_system"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {claim.status}
            </span>
          </td>
          <td className="px-4 py-2 text-center flex justify-center gap-2">
            <button
              onClick={() =>
                setOpenClaimId(
                  openClaimId === claim.id ? null : claim.id
                )
              }
              title="Detail"
              className="p-2 cursor-pointer text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition"
            >
              <EyeIcon className="w-5 h-5" />
            </button>

            <button
              onClick={() => router.push(`/contractor/claim/create?id=${claim.id}`)}
              title="Edit"
              className="p-2 cursor-pointer text-yellow-600 bg-yellow-100 rounded-md hover:bg-yellow-200 transition"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>

            <button onClick={() => setClaimToDelete(claim)} title="Hapus" className="p-2 cursor-pointer text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition"> <TrashIcon className="w-5 h-5 " /> </button>
          </td>
        </tr>

        {/* DETAIL ROW */}
        {openClaimId === claim.id && (
          <ClaimDetailRow claim={claim} />
        )}
      </>
      </Fragment>
    ))
  ) : (
    <tr>
      <td colSpan={9} className="text-center text-gray-500 p-4">
        Belum ada pengajuan klaim.
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>

      {claimToDelete && (
        <ConfirmModal
          title={`Hapus klaim "${claimToDelete.claim_number}"?`}
          description={`Klaim dengan periode "${claimToDelete.period}" dan tanggal "${claimToDelete.created_at}" akan dihapus permanen.`}
          onConfirm={handleDelete}
          onCancel={() => setClaimToDelete(null)}
        />
      )}
    </>
  );
};
