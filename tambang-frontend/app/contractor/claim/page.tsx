"use client";

import { useEffect, useState} from "react";
import Link from "next/link";
import { usePageTitle } from "../../../context/PageTitleContext";
import { getClaims } from "@/lib/api/klaim";
import { ClaimTable } from "../../components/conctractor/ClaimTable";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useSearchParams, useRouter } from "next/navigation";
import Toast from "@/app/components/ui/Toast";


export default function ContractorKlaimPage() {
  const { setTitle } = usePageTitle();
  const [claims, setClaims] = useState<any[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

const searchParams = useSearchParams();
const successMessage = searchParams.get("success");

const [toast, setToast] = useState<{
  message: string;
  type: "success" | "error";
} | null>(null);


const router = useRouter();

useEffect(() => {
  if (successMessage) {
    const timer = setTimeout(() => {
      router.replace("/contractor/claim", { scroll: false });
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [successMessage]);

  useEffect(() => {
    setTitle("Pengajuan Klaim");

async function fetchData() {
  try {
    const res = await getClaims();

    const data = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
      ? res.data
      : [];

    // console.log("FINAL DATA SET:", data);

    setClaims(data);
    setFilteredClaims(data);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    setClaims([]);
    setFilteredClaims([]);
  } finally {
    setLoading(false);
  }
}




    fetchData();
  }, []);

  // Apply filters
useEffect(() => {
  if (!Array.isArray(claims)) {
    setFilteredClaims([]);
    return;
  }

  let data = [...claims];

  if (search) {
    data = data.filter((c) =>
      (c.job_site_id ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.work_description ?? "").toLowerCase().includes(search.toLowerCase())
    );
  }

  if (statusFilter) {
    data = data.filter(c => c.status === statusFilter);
  }

  if (dateFilter) {
    data = data.filter(c =>
      new Date(c.work_date).toLocaleDateString() ===
      new Date(dateFilter).toLocaleDateString()
    );
  }

  setFilteredClaims(data);
}, [search, statusFilter, dateFilter, claims]);


useEffect(() => {
  const success = searchParams.get("success");

  if (success) {
    setToast({
      message:
        success === "update"
          ? "Claim berhasil diperbarui"
          : "Claim berhasil diajukan",
      type: "success",
    });
  }
}, [searchParams]);


  return (
    <div className="p-6 w-full bg-gray-100 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} />}
      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-12 gap-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search Input */}
          <div className="relative w-full md:w-auto flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-auto bg-white pl-10 pr-3 py-1.5 text-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white text-gray-600 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 transition"
          >
            <option value="">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white px-3 py-1.5 text-gray-600 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 transition"
          />
        </div>

        {/* Add Button */}
        <Link
          href="/contractor/claim/create"
          className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-md text-blue-900 
            border border-blue-500/40 px-4 py-2 rounded-md 
            hover:bg-blue-500/30 hover:text-blue-800 transition shadow-md cursor-pointer mt-2 md:mt-0"
        >
          <PlusIcon className="w-5 h-5" />
          Ajukan Klaim
        </Link>
      </div>

      <ClaimTable
  claims={Array.isArray(filteredClaims) ? filteredClaims : []}
  loading={loading}
/>

        {successMessage && (
          <Toast
            type="success"
            message={
              successMessage === "updated"
                ? "Klaim berhasil diperbarui, Mohon Menunggu Validasi Selanjutnya!"
                : "Klaim berhasil diajukan, Mohon Menunggu Validasi Selanjutnya!"
            }
          />
        )}
    </div>
  );
}
