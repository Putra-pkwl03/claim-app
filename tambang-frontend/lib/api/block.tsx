import axios from "axios";

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

// ===================== BLOCK ENDPOINTS =====================

// Get all blocks for a site
export async function getBlocks(siteId: number | string) {
  try {
    const res = await API.get(`/sites/${siteId}/blocks`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to fetch blocks");
  }
}

// Get block details
export async function getBlock(siteId: number | string, blockId: number | string) {
  try {
    const res = await API.get(`/sites/${siteId}/blocks/${blockId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to fetch block");
  }
}

// Create or update block(s) (batch)
export async function saveBlocks(siteId: number | string, blocks: any[]) {
  try {
    const res = await API.post(`/sites/${siteId}/blocks`, blocks);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to save blocks");
  }
}

// Soft delete block
export async function deleteBlock(siteId: number | string, blockId: number | string) {
  try {
    const res = await API.delete(`/sites/${siteId}/blocks/${blockId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to delete block");
  }
}

// Get active blocks by pit
export async function getBlocksByPit(siteId: number | string, pitId: number | string) {
  try {
    const res = await API.get(`/sites/${siteId}/blocks-by-pit/${pitId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to fetch blocks by pit");
  }
}
