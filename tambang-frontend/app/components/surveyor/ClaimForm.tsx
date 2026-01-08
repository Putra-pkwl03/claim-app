"use client";

import { Dispatch, SetStateAction } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Material {
  material_name: string;
}

interface Block {
  surveyor_claim_block_id?: number;
  block_name: string;
  block_id: number;
  bcm: string;
  amount?: string;       
  date?: string; 
  note?: string;
  materials: Material[];
  file?: File | null;
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
  total_amount: string; 
  pt_name: string,
  blocks: Block[];
}

interface ClaimFormProps {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  sites?: any[];
  pits?: any[];
  blocks?: any[];
  onSelectSite?: (id: any) => void;
  onSelectPit?: (id: any) => void;
}


export default function ClaimForm({ form, setForm }: ClaimFormProps) {
  const updateTotalBcm = (blocks: Block[]) => {
    const total = blocks.reduce((sum, b) => sum + Number(b.bcm || 0), 0);
    setForm(prev => ({ ...prev, total_bcm: String(total) }));
  };

  return (
    <div className="space-y-4">
      {/* ================= FORM HEADER ================= */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Informasi Klaim</h3>

        <div className="grid md:grid-cols-2 gap-2">
          {/* SITE */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Site</label>
            <input
              type="text"
              value={form.site_name ?? ""}
              readOnly
              className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* PIT */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Pit</label>
            <input
              type="text"
              value={form.pit_name ?? ""}
              readOnly
              className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* JOB TYPE */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Job Type</label>
            <input
              type="text"
              value={form.job_type}
              onChange={e => setForm({ ...form, job_type: e.target.value })}
              placeholder="Contoh: OB, Coal Getting"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* TOTAL BCM */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">Total Volume</label>
            <div className="relative">
              <input
                readOnly
                value={form.total_bcm}
                className="w-full rounded-lg border bg-blue-50 text-right border-blue-300 font-semibold text-blue-700 pr-10 px-2 py-2"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600">
                BCM
              </span>
            </div>
          </div>
        </div>
          {/* PT */}
          <div className="space-y-1.5 mt-1">
            <label className="text-xs font-medium text-gray-500">
              PT
            </label>
            <input
              type="text"
              value={form.pt_name}
              onChange={e => setForm({ ...form, pt_name: e.target.value })}
              placeholder="Masukkan nama PT"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
      </div>

      {/* ================= BLOCK DETAIL ================= */}
      <div className="space-y-4">
        {form.blocks.map((b, idx) => (
          <div key={b.block_id} className="bg-white border rounded-lg p-5 shadow-sm space-y-3">
            <div className="font-semibold text-gray-700">Block: {b.block_name}</div>

            <div className="grid md:grid-cols-2 gap-3">
              <input
                placeholder="BCM"
                value={b.bcm}
                onChange={e => {
                  const newBlocks = [...form.blocks];
                  newBlocks[idx].bcm = e.target.value;
                  setForm({ ...form, blocks: newBlocks });
                  updateTotalBcm(newBlocks);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <input
                placeholder="Amount"
                value={b.amount || ""}
                onChange={e => {
                  const newBlocks = [...form.blocks];
                  newBlocks[idx].amount = e.target.value;
                  setForm({ ...form, blocks: newBlocks });
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="date"
                value={b.date || ""}
                onChange={e => {
                  const newBlocks = [...form.blocks];
                  newBlocks[idx].date = e.target.value;
                  setForm({ ...form, blocks: newBlocks });
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <input
                placeholder="Note"
                value={b.note || ""}
                onChange={e => {
                  const newBlocks = [...form.blocks];
                  newBlocks[idx].note = e.target.value;
                  setForm({ ...form, blocks: newBlocks });
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* MATERIALS */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Materials</span>
              {b.materials.map((m, mi) => (
                <div key={mi} className="flex gap-2 items-center">
                  <input
                    placeholder={`Material ${mi + 1}`}
                    value={m.material_name}
                    onChange={e => {
                      const newBlocks = [...form.blocks];
                      newBlocks[idx].materials[mi].material_name = e.target.value;
                      setForm({ ...form, blocks: newBlocks });
                    }}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  {mi === b.materials.length - 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newBlocks = [...form.blocks];
                        newBlocks[idx].materials.push({ material_name: "" });
                        setForm({ ...form, blocks: newBlocks });
                      }}
                      className="h-9 w-9 flex items-center justify-center rounded-lg border border-blue-300 bg-blue-100 text-blue-600 hover:bg-blue-50"
                    >
                      +
                    </button>
                  )}

                  {b.materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newBlocks = [...form.blocks];
                        newBlocks[idx].materials.splice(mi, 1);
                        setForm({ ...form, blocks: newBlocks });
                      }}
                      className="h-9 w-9 flex items-center justify-center rounded-lg border border-red-300 bg-red-100 text-red-500 hover:bg-red-50"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* ================= FILE UPLOAD ================= */}
            <div className="w-full">
              <input
                id={`file-${idx}`}
                type="file"
                accept=".pdf,.jpg,.png"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0] || null;
                  const newBlocks = [...form.blocks];
                  newBlocks[idx].file = file;
                  setForm({ ...form, blocks: newBlocks });
                }}
              />

              <label
                htmlFor={`file-${idx}`}
                className="flex flex-col items-center justify-center w-full min-h-[110px] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer text-gray-600 transition hover:border-blue-400 hover:bg-blue-50 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">📎</span>
                  <span className="text-sm font-medium">
                    {b.file ? "Ganti File" : "Klik untuk upload file"}
                  </span>
                  <span className="text-xs text-gray-400">PDF, JPG, PNG</span>
                </div>
              </label>

              {b.file && (
                <div className="mt-2 text-xs text-gray-500 truncate">
                  File: {b.file.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
