import axios from "axios";

const API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true, 
});

// Get Users
export async function getUsers() {
  try {
    const res = await API.get("/users");
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Gagal mengambil data users");
  }
}

// Create User (pakai FormData)
export async function createUser(formData: FormData) {
  try {
    const res = await API.post("/users/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Gagal membuat user");
  }
}

// Update User
export async function updateUser(id: number, formData: FormData) {
  try {
    const res = await API.post(`/users/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Gagal memperbarui user"
    );
  }
}

// Delete User
export async function deleteUser(id: number) {
  try {
    const res = await API.delete(`/users/delete/${id}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Gagal menghapus user");
  }
}

export default API;
