"use client";
import { useEffect, useState, DragEvent } from "react";
import { createUser, updateUser } from "../../../lib/api/users";
import { XMarkIcon, PhotoIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  photo?: string | null;
  status: "active" | "inactive";
}

interface AddUserModalProps {
  setModalOpen: (open: boolean) => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  editUser?: User | null;
  setToast: React.Dispatch<React.SetStateAction<{ message: string; type?: "success" | "error" } | null>>;
}

interface FormState {
  name: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
  photo: File | null;
  status: "active" | "inactive";
}

export default function AddUserModal({ setModalOpen, setUsers, editUser, setToast }: AddUserModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    photo: null,
    status: "inactive",
  });

  useEffect(() => {
    if (editUser) {
      setForm({
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        password: "",
        confirmPassword: "",
        photo: null,
         status: editUser.status || "inactive",
      });
    } else {
      setForm({
        name: "",
        email: "",
        role: "",
        password: "",
        confirmPassword: "",
        photo: null,
        status: "inactive",
      });
    }
  }, [editUser]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setForm({ ...form, photo: e.dataTransfer.files[0] });
    }
  };

const handleSubmit = async () => {
  if (!form.name || !form.email || !form.role) {
    setToast(null);
    return setToast({ message: "Field required!", type: "error" });
  }

  if (!editUser) {
    if (!form.password || form.password !== form.confirmPassword) {
      setToast(null);
      return setToast({ message: "Password required / mismatch!", type: "error" });
    }
  } else if (form.password && form.password !== form.confirmPassword) {
    setToast(null);
    return setToast({ message: "Password mismatch!", type: "error" });
  }

  try {
    setLoading(true);
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("role", form.role);
    formData.append("status", form.status);
    if (form.password) formData.append("password", form.password);
    if (form.photo) formData.append("photo", form.photo);

    let savedUser: User | null = null;

    if (editUser) {
      const res = await updateUser(editUser.id, formData);

      const updatedUser = {
        ...res.user,
        role: res.role,
        photo_url: res.photo_url
      };

      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? updatedUser : u))
      );

      setToast(null);
      setTimeout(() => {
        setToast({ message: "User updated successfully!", type: "success" });
      }, 50);
    } else {
      const res = await createUser(formData);

      const newUser = {
        ...res.user,
        role: res.role,
        photo_url: res.photo_url
      };

      setUsers((prev) => [...prev, newUser]);
      setToast(null);
      setTimeout(() => {
        setToast({ message: "User created successfully!", type: "success" });
      }, 50);
    }

    setModalOpen(false);
  } catch (err: any) {
    console.error(err);
    setToast(null);
    setTimeout(() => {
      setToast({ message: err.message || "Failed to save user", type: "error" });
    }, 50);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="relative bg-white p-6 rounded-xl shadow-lg w-full max-w-lg space-y-4 animate-fade-in">
        <button
          onClick={() => setModalOpen(false)}
          className="absolute right-1 top-1 p-0 hover:bg-gray-200 rounded-full transition cursor-pointer"
        >
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </button>

        <h2 className="text-xl font-semibold text-gray-700">
          {editUser ? "Edit User" : "Add New User"}
        </h2>

        <div className="space-y-3">
          <input
            placeholder="Name"
            className="w-full p-2 border rounded-md text-gray-700"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Email"
            type="email"
            className="w-full p-2 border rounded-md text-gray-700"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <select
            className="w-full p-2 border rounded-md text-gray-700"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="">Select Role</option>
            <option value="contractor">Contractor</option>
            <option value="surveyor">Surveyor</option>
            <option value="finance">Finance</option>
            <option value="managerial">Managerial</option>
            <option value="owner">Owner</option>
          </select>

          {/* Password */}
          {editUser ? (
            <>
              {/* New Password */}
              <div className="relative">
                <input
                  placeholder="New Password (optional)"
                  type={showPassword ? "text" : "password"}
                  className="w-full p-2 border rounded-md text-gray-700"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative mt-2">
                <input
                  placeholder="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  className="w-full p-2 border rounded-md text-gray-700"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Password */}
              <div className="relative">
                <input
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  className="w-full p-2 border rounded-md text-gray-700"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative mt-2">
                <input
                  placeholder="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  className="w-full p-2 border rounded-md text-gray-700"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </>
          )}

          {/* Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition bg-slate-200 ${
              dragActive ? "border-blue-500" : "border-gray-300"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("uploadPhoto")?.click()}
          >
            {form.photo ? (
              <img
                src={URL.createObjectURL(form.photo)}
                className="w-20 h-20 object-cover rounded-full mx-auto"
              />
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <PhotoIcon className="w-10 h-10 text-gray-400" />
                <p className="text-gray-500 text-sm">Drag & Drop or Click to Upload</p>
              </div>
            )}
            <input
              id="uploadPhoto"
              type="file"
              className="hidden"
              onChange={(e) =>
                setForm({ ...form, photo: e.target.files?.[0] || null })
              }
            />
          </div>

          {/* Status Slider */}
            <div className="flex flex-col mt-4">
              <div className="flex items-center">
                <span className="text-gray-600 font-medium mr-4">Status:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.status === "active"}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.checked ? "active" : "inactive" })
                    }
                  />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 transition-colors"></div>
                  <div
                    className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform peer-checked:translate-x-5"
                  ></div>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                User baru dibuat default statusnya inactive (tidak bisa login).
              </p>
            </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={() => setModalOpen(false)}
            className="text-white px-4 py-2 border rounded-md bg-gray-400 hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-md transition cursor-pointer ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Saving..." : editUser ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
