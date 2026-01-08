import axios from "axios";

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

// ===================== MANAGERIAL CLAIM =====================

// Ambil semua klaim contractor + surveyor
export async function getAllClaimsForFinance() {
  try {
    const res = await API.get("/finance/claims");
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Gagal mengambil klaim untuk finance"
    );
  }
}


export async function updateContractorClaimStatus(
  claimId: number,
  status: "approved_finance" | "rejected_finance"
) {
  try {
    const res = await API.patch(`/finance/claims/${claimId}/status`, {
      status,
    });
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Gagal mengubah status claim contractor"
    );
  }
}