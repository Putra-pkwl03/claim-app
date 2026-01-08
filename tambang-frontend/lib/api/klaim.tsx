import axios from "axios";

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

// ===================== CLAIM (CONTRACTOR) =====================

// Buat klaim baru (FormData + upload file)
export async function createClaim(formData: FormData) {
  try {
    const res = await API.post(
      "/contractor/claims",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Gagal mengajukan klaim"
    );
  }
}

// Update klaim contractor (FormData + upload file)
export async function updateClaim(id: number | string, formData: FormData) {
  try {
    const res = await API.put(
      `/contractor/claims/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Gagal memperbarui klaim"
    );
  }
}

// Ambil semua klaim contractor
export async function getClaims() {
  try {
    const res = await API.get("/contractor/claims");
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Gagal mengambil daftar klaim"
    );
  }
}

// Ambil detail klaim contractor
export async function getClaimById(id: number | string) {
  try {
    const res = await API.get(`/contractor/claims/${id}`);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Gagal mengambil detail klaim"
    );
  }
}

// Hapus klaim contractor
export async function deleteClaim(id: number | string) {
  try {
    const res = await API.delete(`/contractor/claims/${id}`);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Gagal menghapus klaim"
    );
  }
}

export default API;
