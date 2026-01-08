import axios from "axios";

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

/**
 * Submit signature (base64 / file)
 */
export async function submitSignature(
  claimId: number,
  payload: {
    role: "surveyor" | "managerial" | "finance" | "contractor";
    signature_base64?: string;
    signature_file?: File;
  }
) {
  try {
    let data: any;
    let headers: any = {};

    if (payload.signature_file) {
      data = new FormData();
      data.append("role", payload.role);
      data.append("signature_file", payload.signature_file);
      headers["Content-Type"] = "multipart/form-data";
    } else {
      data = {
        role: payload.role,
        signature_base64: payload.signature_base64,
      };
    }

    const res = await API.post(`/signatures/${claimId}`, data, { headers });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Gagal menyimpan tanda tangan");
  }
}

/**
 * Get my signature (untuk preload / edit)
 */
export async function getMySignature(
  claimId: number,
  role: "surveyor" | "managerial" | "finance" | "contractor"
) {
  try {
    const res = await API.get(`/signatures/${claimId}/my-signature`, {
      params: { role },
    });

    return res.data?.data ?? null;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Gagal mengambil tanda tangan"
    );
  }
}

