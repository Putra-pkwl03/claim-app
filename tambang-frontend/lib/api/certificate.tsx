import axios from "axios";

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

// ===================== CERTIFICATE ENDPOINTS =====================

/**
 * Get list of contractor claims dengan status auto_approved
 */
export async function getContractorClaims() {
  try {
    const res = await API.get(`/signatures/contractor-claims`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to fetch contractor claims");
  }
}

/**
 * Get claim beserta signatures
 * @param claimId string | number
 */
export async function getClaimSignatures(claimId: string | number) {
  try {
    const res = await API.get(`/signatures/${claimId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to fetch claim signatures");
  }
}

/**
 * Get claim detail untuk generate certificate PDF
 * @param claimId string | number
 */
export async function getClaimForCertificate(claimId: string | number) {
  try {
    const res = await API.get(`/signatures/contractor-claims/${claimId}/certificate`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to fetch claim for certificate");
  }
}
