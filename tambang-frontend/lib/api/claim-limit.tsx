import axios from "axios";

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

// ===================== THRESHOLD API =====================

export type ThresholdPayload = {
  name: string;
  limit_value: number;
  description?: string;
  active: boolean;
};

// Ambil semua threshold
export async function getThresholds() {
  const res = await API.get("/thresholds");
  return res.data; 
}

// Ambil threshold aktif
export async function getActiveThreshold() {
  const res = await API.get("/thresholds/active");
  return res.data; 
}

// Simpan threshold baru
export async function createThreshold(payload: ThresholdPayload) {
  const res = await API.post("/thresholds", payload);
  return res.data; 
}

// Update threshold
export async function updateThreshold(
  id: number,
  payload: ThresholdPayload
) {
  const res = await API.put(`/thresholds/${id}`, payload);
  return res.data; 
}

// Update STATUS threshold saja (aktif / nonaktif)
export async function patchThresholdStatus(
  id: number,
  active: boolean
) {
  const res = await API.patch(`/thresholds/${id}/status`, {
    active,
  });

  return res.data; 
}

// Hapus threshold
export async function deleteThreshold(id: number) {
  const res = await API.delete(`/thresholds/${id}`);
  return res.data;
}
