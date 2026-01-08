import axios from "axios";

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

// ===================== SITE ENDPOINTS =====================

// Get all sites with related pits
export async function getSites() {
  try {
    const res = await API.get("/sites");
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to fetch sites");
  }
}

// Get a single site by ID
// export async function getSite(id: string) {
//   try {
//     const res = await API.get(`/sites/${id}`);
//     return res.data;
//   } catch (err: any) {
//     throw new Error(err.response?.data?.message || "Failed to fetch site details");
//   }
// }

export async function getSite(id: number | string) {
  try {
    const res = await API.get(`/sites/${id.toString()}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to fetch site details");
  }
}


// Type payload sesuai BE
export interface SitePayload {
  name: string;
  description?: string;
  utm_zone: string;
  coordinates: {
    point_order: number;
    easting: number;
    northing: number;
    point_code?: string;
    elevation?: number;
  }[];
}

// Create a new site
export async function createSite(siteData: SitePayload) {
  try {
    const res = await API.post("/sites", siteData);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to create site");
  }
}

// Update an existing site
export async function updateSite(id: string, siteData: Partial<SitePayload>) {
  try {
    const res = await API.put(`/sites/${id}`, siteData);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to update site");
  }
}

// Delete a site
export async function deleteSite(id: number | string) {
  try {
    const res = await API.delete(`/sites/${id.toString()}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to delete site");
  }
}
