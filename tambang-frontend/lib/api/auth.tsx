// /lib/auth.ts
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const login = async (email: string, password: string) => {
  try {
    const res = await axios.post(
      `${API_BASE}/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    return res.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Login gagal" };
  }
};

export const logout = async () => {
  try {
    const res = await axios.post(
      `${API_BASE}/auth/logout`,
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Logout gagal" };
  }
};

export const refreshToken = async () => {
  try {

    const res = await axios.post(
      `${API_BASE}/auth/refresh`,
      {},
      { withCredentials: true } 
    );

    return res.data;
  } catch (error: any) {
    console.error("Refresh token error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Refresh token gagal" };
  }
};


export const me = async () => {
  try {
    const res = await axios.get(`${API_BASE}/auth/me`, {
      withCredentials: true,
    });
    console.log("me response:", res.data);
    return res.data;
  } catch (error: any) {
    console.log("me error:", error.response?.status, error.response?.data);
    throw error.response?.data || { message: "Gagal mengambil data user" };
  }
};

export const updateProfile = async (formData: any) => {
  try {
    const res = await axios.put(
      `${API_BASE}/auth/update-profile`,
      formData,
      { withCredentials: true }
    );
    return res.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Gagal update profil" };
  }
};
