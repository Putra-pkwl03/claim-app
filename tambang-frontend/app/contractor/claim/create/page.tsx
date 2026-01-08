"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "../../../../context/PageTitleContext";
import { createClaim,  updateClaim, getClaimById } from "@/lib/api/klaim";
import { getSites } from "@/lib/api/sites";
import Toast from "@/app/components/ui/Toast";
import ClaimForm from "../../../components/conctractor/ClaimForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

/* ================= MAP ================= */
const MapView = dynamic(
  () => import("../../../components/maps/MapView"),
  { ssr: false }
);

/* ================= TYPES ================= */
interface Material {
  material_name: string;
}

interface BlockForm {
  block_id: number;
  bcm: string;
  amount: string;
  date: string;
  note: string;
  materials: Material[];
  file: File | null;
}

interface FormState {
  site_id: string;
  pit_id: string;
  period_month: number;
  period_year: number;
  job_type: string;
  total_bcm: string;
  pt_name: string;
  total_amount: string;
  blocks: BlockForm[];
}

export default function CreateKlaimPage() {
  const router = useRouter();
  const { setTitle } = usePageTitle();

  const [isEdit, setIsEdit] = useState(false);
  const [claimId, setClaimId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [sites, setSites] = useState<any[]>([]);
  const [pits, setPits] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);

  const [form, setForm] = useState<FormState>({
    site_id: "",
    pit_id: "",
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    job_type: "",
    total_bcm: "0",
    pt_name: "",
    total_amount: "0",
    blocks: [],
  });



const searchParams = useSearchParams();

useEffect(() => {
  const id = searchParams.get("id");

  if (id) {
    setIsEdit(true);
    setClaimId(Number(id));
    setTitle("Edit Klaim");

    fetchClaimDetail(Number(id));
  } else {
    setIsEdit(false);
    setTitle("Form Pengajuan Klaim");
  }
}, [searchParams]);

const fetchClaimDetail = async (id: number) => {
  try {
    const res = await getClaimById(id);
    // console.log("DETAIL CLAIM:", res);

    const claim = res.data ?? res;

    const blocks = Array.isArray(claim.blocks) ? claim.blocks : [];

    let month = "";
    let year = "";

    if (typeof claim.period === "string") {
      const parts = claim.period.split("/");
      month = parts[0];
      year = parts[1];
    }

    setForm({
      site_id: String(claim.site?.id ?? ""),
      pit_id: String(claim.pit?.id ?? ""),
      period_month: Number(month),
      period_year: Number(year),
      job_type: claim.job_type ?? "",
      total_bcm: String(claim.total_bcm ?? "0"),
      pt_name: claim.pt_name ?? "",
      total_amount: String(claim.total_amount ?? "0"),
      blocks: blocks.map((b: any) => ({
        block_id: b.block_id,
        bcm: String(b.bcm),
        amount: String(b.amount),
        date: b.date ?? "",
        note: b.note ?? "",
        materials: Array.isArray(b.materials) && b.materials.length
          ? b.materials
          : [{ material_name: "" }],
        file: null,
      })),
    });
  } catch (err) {
    console.error("FETCH CLAIM ERROR:", err);
  }
};





  /* ================= INIT ================= */
  useEffect(() => {
    setTitle("Form Pengajuan Klaim");
    getSites().then(setSites);
  }, []);

  /* ================= SITE CHANGE ================= */
  useEffect(() => {
    if (!form.site_id) {
      setPits([]);
      setBlocks([]);
      return;
    }
    const site = sites.find(s => s.id === Number(form.site_id));
    setPits(site?.pits || []);
    setBlocks([]);
  }, [form.site_id, sites]);

  /* ================= PIT CHANGE ================= */
  useEffect(() => {
    if (!form.pit_id) {
      setBlocks([]);
      return;
    }
    const pit = pits.find(p => p.id === Number(form.pit_id));
    setBlocks(pit?.blocks || []);
  }, [form.pit_id, pits]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!form.site_id || !form.pit_id || !form.job_type) {
        throw new Error("Field wajib belum lengkap");
      }

      if (form.blocks.length === 0) {
        throw new Error("Minimal pilih 1 block");
      }

      const fd = new FormData();
      fd.append("site_id", form.site_id);
      fd.append("pit_id", form.pit_id);
      fd.append("period_month", String(form.period_month));
      fd.append("period_year", String(form.period_year));
      fd.append("job_type", form.job_type);
      fd.append("pt_name", form.pt_name); 

      form.blocks.forEach((b, i) => {
        fd.append(`blocks[${i}][block_id]`, String(b.block_id));
        fd.append(`blocks[${i}][bcm]`, b.bcm);
        fd.append(`blocks[${i}][amount]`, b.amount);
        fd.append(`blocks[${i}][date]`, b.date || "");
        fd.append(`blocks[${i}][note]`, b.note || "");

        b.materials.forEach((m, mi) => {
          fd.append(
            `blocks[${i}][materials][${mi}][material_name]`,
            m.material_name
          );
        });

        if (b.file) {
          fd.append(`blocks[${i}][file]`, b.file);
        }
      });

      if (isEdit && claimId) {
        await updateClaim(claimId, fd);
        router.push("/contractor/claim?success=update");
      } else {
        await createClaim(fd);
        router.push("/contractor/claim?success=create");
      }
    } catch (err: any) {
      setToast({
        message: err.message || "Terjadi kesalahan",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="bg-white p-5 rounded shadow mt-12">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <ArrowLeftIcon className="h-5 w-5" />

        </button>

        <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-[2fr_3fr] gap-6">
      {/* FORM (SCROLLABLE) */}
      <div className="max-h-[450px] overflow-y-auto pr-2">
        <ClaimForm
          form={form}
          setForm={setForm}
          sites={sites}
          pits={pits}
          blocks={blocks}
        />
      </div>
        {/* MAP (READ ONLY) */}
      <div className="h-[450px] border rounded overflow-hidden">
          <MapView sites={sites} />
        </div>
      </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-blue-100  text-blue-800  px-2 py-2 rounded cursor-pointer hover:bg-blue-500/40 hover:text-blue-800 transition font-medium"
            >
              Cencel
            </button>
            <button
              disabled={loading}
              className={`bg-blue-400 text-white justify-center px-2 py-2 rounded flex items-center gap-1 transition
                ${loading ? "bg-gray-400 cursor-not-allowed" : "cursor-pointer hover:bg-blue-500/40 hover:text-blue-800"}`}
            >
              {loading
                ? "Menyimpan..."
                : isEdit
                ? "Update Claim"
                : "Submit Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
