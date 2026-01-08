"use client";
import { useState } from "react";
import { updateProfile } from "@/lib/api/auth";
import { useAuth } from "@/context/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export default function ProfileModal({ open, onClose, onSuccess, onError }: Props) {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!open) return null;

  const handleUpdate = async () => {
    if (password && password !== confirmPassword) {
      if (onError) onError("Password dan confirm password tidak sama");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (name) formData.append("name", name);
    if (email) formData.append("email", email);
    if (password.length >= 6) formData.append("password", password);
    if (photo) formData.append("photo", photo);

    try {
      const res = await updateProfile(formData);
      setUser(res.user);
      if (onSuccess) onSuccess("Profil berhasil diperbarui");
      onClose();
    } catch (err: any) {
      if (onError) onError(err?.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50 transition-opacity">
      <div className="bg-white w-[460px] rounded-xl shadow-xl p-6 relative animate-fadeIn">
        <h2 className="text-xl text-center font-bold text-gray-700 mb-2">My Account</h2>

        {/* Avatar */}
        <div className="flex justify-center mb-6 relative group">
          <label className="cursor-pointer relative">
            <img
              src={
                photo
                  ? URL.createObjectURL(photo)
                  : user?.photo
                  ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${user.photo}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=4b5563&color=fff`
              }
              alt={user?.name || "User"}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-lg">📷</span>
            </div>
            <input type="file" hidden onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          </label>
        </div>

        {/* Inputs */}
        <div className="space-y-2">
          <div>
            <label className="text-sm font-semibold text-gray-600">Name</label>
            <input
              className="text-gray-600 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Email</label>
            <input
              className="text-gray-600 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-sm font-semibold text-gray-600">Password (optional)</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Min 6 chars"
              className="text-gray-600 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-11 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="text-sm font-semibold text-gray-600">Confirm Password</label>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat password"
              className="text-gray-600 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-2 top-11 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-gray-300 hover:bg-gray-500 rounded transition"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleUpdate}
            className={`px-4 py-2 text-white rounded-lg transition ${
              loading ? "bg-gray-400" : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
