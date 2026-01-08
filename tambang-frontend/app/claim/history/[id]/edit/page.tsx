"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { usePageTitle } from "../../../../../context/PageTitleContext";
import {
  updateSurveyorClaim,
  getSurveyorClaimDetail
} from "@/lib/api/ClaimSurveyor";
import Toast from "@/app/components/ui/Toast";
import ClaimForm from "../../../../components/surveyor/ClaimForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { getSites } from "@/lib/api/sites";

const MapView = dynamic(() => import("../../../../components/maps/MapView"), { ssr: false });

export default function EditKlaimPage() {
  const router = useRouter();
  const { id } = useParams();
  const { setTitle } = usePageTitle();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);

  const [form, setForm] = useState<any>({
    site_id: "",
    pit_id: "",
    site_name: "",
    pit_name: "",
    period_month: "",
    period_year: "",
    job_type: "",
    total_bcm: "",
    total_amount: "",
    blocks: [],
  });

  /* ================= INIT ================= */
  useEffect(() => {
    setTitle("Edit Klaim Surveyor");

    getSites().then(setSites);
    fetchClaim();
  }, []);

const fetchClaim = async () => {
  try {
    const res = await getSurveyorClaimDetail(String(id));

    // console.log("RAW RESPONSE:", res);
    // console.log("RESPONSE DATA:", res.data);

    const c = res.data;

    // console.log("CLAIM OBJECT:", c);
    // console.log("BLOCKS RAW:", c.blocks);

setForm({
  site_id: String(c.site_id),
  pit_id: String(c.pit_id),
  site_name: c.site_name,
  pit_name: c.pit_name,
  period_month: c.period_month,
  period_year: c.period_year,
  job_type: c.job_type,
  total_bcm: c.total_bcm,
  total_amount: c.total_amount,

  blocks: c.blocks.map((b: any) => ({
    surveyor_claim_block_id: b.surveyor_claim_block_id,
    block_id: b.block_id,
    block_name: b.block_name,
    bcm: b.bcm,
    amount: b.amount,
    date: b.date
      ? b.date.split("/").reverse().join("-") 
      : "",
    note: b.note,
    materials: b.materials?.length
      ? b.materials
      : [{ material_name: "" }],
    file: null,
  })),
});


  } catch (err) {
    console.error("FETCH CLAIM ERROR:", err);
    setToast({ message: "Gagal mengambil data klaim", type: "error" });
  }
};


  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();

      fd.append("site_id", form.site_id);
      fd.append("pit_id", form.pit_id);
      fd.append("job_type", form.job_type);
      fd.append("period_month", form.period_month);
      fd.append("period_year", form.period_year);

      form.blocks.forEach((b: any, i: number) => {
        fd.append(`blocks[${i}][surveyor_claim_block_id]`, b.surveyor_claim_block_id);
        fd.append(`blocks[${i}][block_id]`, b.block_id);
        fd.append(`blocks[${i}][bcm]`, b.bcm);
        fd.append(`blocks[${i}][amount]`, b.amount || "0");
        fd.append(`blocks[${i}][date]`, b.date || "");
        fd.append(`blocks[${i}][note]`, b.note || "");

        b.materials.forEach((m: any, mi: number) =>
          fd.append(`blocks[${i}][materials][${mi}][material_name]`, m.material_name)
        );

        if (b.file) fd.append(`blocks[${i}][file]`, b.file);
      });

      await updateSurveyorClaim(String(id), fd);

      setToast({ message: "Klaim berhasil diperbarui", type: "success" });
      setTimeout(() => router.push("/claim/history"), 2000);
    } catch (err: any) {
      setToast({ message: err.message || "Update gagal", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
        <div className="mx-auto mt-12 overflow-hidden bg-white p-4 rounded-md">
      {toast && <Toast {...toast} />}

    <div className="flex items-center mb-4">
      <button onClick={() => router.back()}  
          className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-gray-50 text-gray-600 hover:bg-blue-500/20 hover:text-blue-800 transition shadow-sm"
          title="Back">
        <ArrowLeftIcon className="h-5 w-5" />
      </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-[2fr_3fr] gap-6">
           <div className="max-h-[450px] overflow-y-auto pr-2">
          <ClaimForm form={form} setForm={setForm} 
          />

          
          </div>
          <div className="h-[450px] border rounded">
            <MapView sites={sites} />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/claim/history")}
            className="w-full bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {loading ? "Menyimpan..." : "Update Klaim"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
