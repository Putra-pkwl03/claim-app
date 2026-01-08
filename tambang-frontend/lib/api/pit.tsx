import axios from "axios";

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

// =====================
// GET ALL PITS BY SITE
// =====================
export async function getPits(siteId: number | string) {
  try {
    const res = await API.get(`/sites/${siteId}/pits`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to fetch pits");
  }
}

// =====================
// GET SINGLE PIT
// =====================
export async function getPit(siteId: number | string, pitId: number | string) {
  try {
    const res = await API.get(`/sites/${siteId}/pits/${pitId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to fetch pit");
  }
}

// =====================
// CREATE PIT (SINGLE / BULK)
// =====================
export async function createPit(
  siteId: number | string,
  pitOrPits: any | any[]
) {
  try {
    const payload = Array.isArray(pitOrPits)
      ? {
          site_id: siteId,
          pits: pitOrPits,
        }
      : {
          site_id: siteId,
          ...pitOrPits,
        };

    const res = await API.post(`/sites/${siteId}/pits`, payload);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to create pit");
  }
}

// =====================
// UPDATE PIT (BULK ONLY)
// =====================
export async function updatePits(siteId: number | string, pits: any[]) {
  try {
    const res = await API.put(`/sites/${siteId}/pits`, {
      site_id: siteId,  
      pits,
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to update pits");
  }
}


// =====================
// DELETE PIT
// =====================
export async function deletePit(
  siteId: number | string,
  pitId: number | string
) {
  try {
    const res = await API.delete(`/sites/${siteId}/pits/${pitId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to delete pit");
  }
}
