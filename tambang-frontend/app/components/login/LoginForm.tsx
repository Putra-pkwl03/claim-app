"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setUser, refresh } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(form.email, form.password);

      setUser(data.user || null);

      await refresh();

      router.replace("/"); 
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Login gagal, cek email & password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[440px] max-w-full p-10 sm:p-6 xs:p-4 rounded-2xl bg-white/10 border border-white/20 shadow-2xl backdrop-blur-lg">
      <div className="text-white text-center">
        <div className="mb-4 flex flex-col items-center">
          <div className="relative w-60 h-60 sm:w-40 sm:h-40 xs:w-28 xs:h-28 overflow-hidden mb-4">
            <img
              src="/img/logonobg.png"
              alt="logo"
              className="w-full h-full object-cover scale-155"
            />
          </div>
          <h1 className="mb-2 text-2xl sm:text-xl xs:text-lg font-semibold">
           Survey Calculation Claims
          </h1>
          <p className="text-gray-300 text-base sm:text-sm">
            Please log in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-lg sm:text-base">
            <input
              name="email"
              onChange={handleChange}
              value={form.email}
              type="email"
              placeholder="email@example.com"
              className="w-[300px] max-w-full px-6 py-3 sm:py-2 xs:py-1 rounded-3xl border-none text-center bg-blue-400/50 placeholder-slate-200 shadow-lg outline-none backdrop-blur-md text-white focus:bg-white focus:text-gray-900 focus:placeholder-gray-600 focus:ring-2 focus:ring-white/80 transition duration-100"
            />
          </div>

          <div className="mb-4 text-lg sm:text-base">
            <input
              name="password"
              onChange={handleChange}
              value={form.password}
              type="password"
              placeholder="#PassWord$##21"
              className="w-[300px] max-w-full px-6 py-3 sm:py-2 xs:py-1 rounded-3xl border-none text-center bg-blue-400/50 placeholder-slate-200 shadow-lg outline-none backdrop-blur-md text-white focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 focus:ring-2 focus:ring-white/80 transition duration-100"
            />
          </div>

          {error && <p className="text-red-500 mb-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="py-3 mt-4 w-[120px] max-w-full rounded-3xl bg-blue-400/50 text-white text-lg sm:text-base shadow-xl backdrop-blur-md hover:bg-blue-600 transition duration-300"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
