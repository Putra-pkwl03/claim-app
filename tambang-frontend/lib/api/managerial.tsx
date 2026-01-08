import axios from "axios";

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

// ===================== MANAGERIAL CLAIM =====================

// Ambil semua klaim contractor + surveyor
export async function getAllClaimsForManagerial() {
  try {
    const res = await API.get("/managerial/claims");
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Gagal mengambil klaim untuk managerial"
    );
  }
}


export async function updateContractorClaimStatus(
  claimId: number,
  status: "approved_managerial" | "rejected_managerial"
) {
  try {
    const res = await API.patch(`/managerial/claims/${claimId}/status`, {
      status,
    });
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Gagal mengubah status claim contractor"
    );
  }
}