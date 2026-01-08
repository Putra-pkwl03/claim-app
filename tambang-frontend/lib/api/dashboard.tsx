import axios from "axios";

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
});

/* ================= DASHBOARD ================= */

/**
 * 📊 USER DASHBOARD SUMMARY
 * GET /dashboard
 */
export async function getDashboardSummary() {
  try {
    const res = await API.get("/dashboard");
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Gagal mengambil data dashboard"
    );
  }
}
