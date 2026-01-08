"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePageTitle } from "../../../../context/PageTitleContext";
import { createSurveyorClaim, getContractorClaimDetailForSurveyor } from "@/lib/api/ClaimSurveyor";
import Toast from "@/app/components/ui/Toast";
import ClaimForm from "../../../components/surveyor/ClaimForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { getSites } from "@/lib/api/sites";

// ===== DYNAMIC MAP =====
const MapView = dynamic(() => import("../../../components/maps/MapView"), { ssr: false });

// ===== TYPES =====
interface Material {
  material_name: string;
}

interface Block {
  block_name: string;
  block_id: number;
  bcm: string;
  amount?: string;       
  date?: string; 
  note?: string;
  materials: Material[];
  file?: File | null;
  claim_block_id?: number;
}

interface FormState {
  pit_name: string;
  site_name: string | number | readonly string[] | undefined;
  site_id: string;
  pit_id: string;
  period_month: number;
  period_year: number;
  job_type: string;
  total_bcm: string;
  pt_name: string;
  total_amount: string; 
  blocks: Block[];
}

export default function CreateKlaimPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTitle } = usePageTitle();

  /* ================= STATE ================= */
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [pits, setPits] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);

  const [form, setForm] = useState<FormState>({
    site_id: "",
    pit_id: "",
    site_name: "",
    pit_name: "",
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    job_type: "",
    total_bcm: "",
    pt_name: "",
    total_amount: "0",
    blocks: [],
  });

  /* ================= INIT ================= */
  useEffect(() => {
    setTitle("Form Pengajuan Klaim");

    async function fetchSites() {
      try {
        const data = await getSites();
        setSites(data);
      } catch (err) {
        console.error("Fetch sites error:", err);
      }
    }

    fetchSites();

    const ref = searchParams.get("ref");
    if (ref) {
      fetchClaimForReference(ref);
    }
  }, []);

const fetchClaimForReference = async (id: string) => {
  try {
    const res = await getContractorClaimDetailForSurveyor(id);
    const claim = res.data;

    if (!claim) return;

    // ===== MAP BLOCKS =====
    const mappedBlocks: Block[] = claim.blocks?.map((b: any, idx: number) => {
      // console.log(`Block[${idx}] raw data:`, b); 
      return {
        block_id: b.block_id,
        claim_block_id: b.claim_block_id ?? null,
        bcm: b.bcm_contractor || "",
        amount: b.amount || "",
        date: b.date ? b.date.split("/").reverse().join("-") : "",
        note: b.note || "",
        materials: b.materials || [],
        block_name: b.block_name || "",
        file: null,
      };
    }) || [];

    // console.log("Mapped blocks:", mappedBlocks);

    setForm(prev => ({
      ...prev,
      site_id: claim.site?.id ? String(claim.site.id) : "",
      pit_id: claim.pit?.id ? String(claim.pit.id) : "",
      site_name: claim.site?.name || "",
      pit_name: claim.pit?.name || "",
      job_type: claim.job_type || "",
      total_bcm: claim.total_bcm || "",
       pt_name: claim.pt_name ?? prev.pt_name,
       total_amount: claim.total_amount || "0",
       blocks: mappedBlocks,
      }));
  } catch (err) {
    console.error("Fetch claim reference error:", err);
  }
};

  /* ================= SITE / PIT CHANGE ================= */
  useEffect(() => {
    if (!form.site_id) {
      setPits([]);
      return;
    }

    const site = sites.find(s => s.id === Number(form.site_id));
    setPits(site?.pits || []);
    setBlocks([]);
  }, [form.site_id, sites]);

  useEffect(() => {
    if (!form.pit_id) {
      setBlocks([]);
      return;
    }

    const pit = pits.find(p => p.id === Number(form.pit_id));
    setBlocks(pit?.blocks || []);
  }, [form.pit_id, pits]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: any) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (!form.site_id || !form.pit_id || !form.job_type)
      throw new Error("Site, Pit, dan Job Type wajib diisi");
    if (!form.total_bcm || isNaN(Number(form.total_bcm)))
      throw new Error("Total BCM tidak valid");
    if (form.blocks.length === 0)
      throw new Error("Pilih minimal 1 block");

    const formData = new FormData();
    formData.append("site_id", form.site_id);
    formData.append("pit_id", form.pit_id);
    formData.append("job_type", form.job_type);
    formData.append("total_bcm", form.total_bcm);
    formData.append("pt_name", form.pt_name);
    formData.append("period_month", String(form.period_month));
    formData.append("period_year", String(form.period_year));

    form.blocks.forEach((b, idx) => {
      if (b.claim_block_id) formData.append(`blocks[${idx}][claim_block_id]`, String(b.claim_block_id));
      formData.append(`blocks[${idx}][block_id]`, String(b.block_id));
      formData.append(`blocks[${idx}][bcm]`, b.bcm);
      formData.append(`blocks[${idx}][amount]`, b.amount || "0");
      formData.append(`blocks[${idx}][date]`, b.date || "");
      formData.append(`blocks[${idx}][note]`, b.note || "");
      b.materials?.forEach((m, mi) => {
        formData.append(`blocks[${idx}][materials][${mi}][material_name]`, m.material_name);
      });
      if (b.file) formData.append(`blocks[${idx}][file]`, b.file);
    });

    // ===== DEBUG =====
    // console.log("===== FormData Debug =====");
    for (let pair of formData.entries()) {
      // console.log(pair[0], pair[1]);
    }
    // console.log("==========================");

    // Mengirim data klaim
    await createSurveyorClaim(formData, { headers: { "Content-Type": "multipart/form-data" } });

    // Tampilkan Toast dan delay sebelum redirect
    setToast({ message: "Claim berhasil dibuat", type: "success" });
    setTimeout(() => {
      router.push("/claim/history?success=created");
    }, 3000); // Delay selama 3 detik sebelum redirect
  } catch (err: any) {
    setToast({ message: err.message || "Gagal submit klaim", type: "error" });
  } finally {
    setLoading(false);
  }
};

  /* ================= RENDER ================= */
  return (
    <div className="p-6 bg-gray-100 min-h-screen w-full overflow-hidden">
      <div className="mx-auto mt-12 overflow-hidden bg-white p-4 rounded-md">
        {toast && <Toast message={toast.message} type={toast.type} />}
        <div className="flex items-center mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-gray-50 text-gray-600 hover:bg-blue-500/20 hover:text-blue-800 transition shadow-sm"
            title="Back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[2fr_3fr] gap-6">
            <div className="max-h-[450px] overflow-y-auto pr-2">
              <ClaimForm
                form={form}
                setForm={setForm}
                sites={sites}
                pits={pits}
                blocks={blocks}
                onSelectSite={(id: any) =>
                  setForm(prev => ({ ...prev, site_id: String(id), pit_id: "", blocks: [] }))
                }
                onSelectPit={(id: any) =>
                  setForm(prev => ({ ...prev, pit_id: String(id) }))
                }
              />
            </div>

            <div className="h-[450px] w-full border rounded overflow-hidden">
              <MapView sites={sites} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-blue-100  text-blue-800  px-2 py-2 rounded cursor-pointer hover:bg-blue-500/40 hover:text-blue-800 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`cursor-pointer ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-400 text-white justify-center px-2 py-2 rounded cursor-pointer hover:bg-blue-500/40 hover:text-blue-800 transition flex items-center gap-1"} px-4 py-2 rounded w-full`}
            >
              {loading ? "Mengirim..." : "Submit Klaim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
