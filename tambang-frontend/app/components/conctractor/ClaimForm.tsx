"use client";

import { Dispatch, SetStateAction } from "react";

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
  total_amount: string;
  pt_name: string;
  blocks: BlockForm[];
}

interface Props {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  sites: any[];
  pits: any[];
  blocks: any[];
}

export default function ClaimForm({
  form,
  setForm,
  sites,
  pits,
  blocks,
}: Props) {
  const updateTotalBcm = (list: BlockForm[]) => {
    const total = list.reduce(
      (s, b) => s + Number(b.bcm || 0),
      0
    );
    setForm(p => ({ ...p, total_bcm: String(total) }));
  };

  return (
    <div className="space-y-4">
      {/* ================= FORM HEADER ================= */}
      <div className="bg-white rounded border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Informasi Klaim
      </h3>

      <div className="grid md:grid-cols-2 gap-3">
        {/* SITE */}
        <div className="space-y-1.5">
          <label className="text-md font-medium text-gray-500">
            Site
          </label>
          <select
            value={form.site_id}
            onChange={e =>
              setForm(p => ({
                ...p,
                site_id: e.target.value,
                pit_id: "",
                blocks: [],
                total_bcm: "0",
              }))
            }
          className="
              w-full
              rounded-lg
              border border-gray-300
              bg-white
              px-3 py-2
              text-sm text-gray-700

              shadow-sm
              transition

              focus:outline-none
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-100
            "
          >
            <option value="">Pilih Site</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

      {/* PIT */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500">
          Pit
        </label>
        <select
          value={form.pit_id}
          disabled={!form.site_id}
          onChange={e =>
            setForm(p => ({
              ...p,
              pit_id: e.target.value,
              blocks: [],
              total_bcm: "0",
            }))
          }
          className="
              w-full
              rounded-lg
              border border-gray-300
              bg-white
              px-3 py-2
              text-sm text-gray-700

              shadow-sm
              transition

              focus:outline-none
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-100
            "
          >
          <option value="">Pilih Pit</option>
          {pits.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* JOB TYPE */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500">
          Job Type
        </label>
        <input
          value={form.job_type}
          onChange={e =>
            setForm(p => ({ ...p, job_type: e.target.value }))
          }
          placeholder="Contoh: OB, Coal Getting"
          className="
              w-full
              rounded-lg
              border border-gray-300
              bg-white
              px-3 py-2
              text-sm text-gray-700

              shadow-sm
              transition

              focus:outline-none
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-100
            "
        />
      </div>

          {/* TOTAL BCM (HIGHLIGHT) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">
              Total BCM
            </label>
            <div className="relative">
              <input
                readOnly
                value={form.total_bcm}
                className="w-full rounded-lg border bg-blue-50 text-right border-blue-300 
                          font-semibold text-blue-700 pr-10 px-2 py-1.5"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600">
                BCM
              </span>
            </div>
          </div>
        </div>
        
        {/* PT */}
        <div className="space-y-1.5 mt-2">
          <label className="text-xs font-medium text-gray-500">
            PT
          </label>
          <input
            value={form.pt_name}
            onChange={e =>
              setForm(p => ({ ...p, pt_name: e.target.value }))
            }
            placeholder="Masukkan nama PT"
            className="
                w-full
                rounded-lg
                border border-gray-300
                bg-white
                px-3 py-2
                text-sm text-gray-700

                shadow-sm
                transition

                focus:outline-none
                focus:border-blue-500
                focus:ring-2 focus:ring-blue-100
              "
          />
        </div>
      </div>


      {/* ================= BLOCK SELECT ================= */}
      <div className="bg-white border rounded p-5 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-2">
          Pilih Block
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {blocks.map(block => {
            const exists = form.blocks.find(
              b => b.block_id === block.id
            );

            return (
              <label
                key={block.id}
                className={`flex gap-2 items-center border rounded-lg p-1 cursor-pointer text-gray-600
                  ${
                    exists
                      ? "bg-blue-50 border-blue-300"
                      : "hover:bg-gray-50"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={!!exists}
                  onChange={e => {
                    let list = [...form.blocks];

                    if (e.target.checked) {
                      list.push({
                        block_id: block.id,
                        bcm: "",
                        amount: "",
                        date: "",
                        note: "",
                        materials: [{ material_name: "" }],
                        file: null,
                      });
                    } else {
                      list = list.filter(
                        b => b.block_id !== block.id
                      );
                    }

                    setForm(p => ({ ...p, blocks: list }));
                    updateTotalBcm(list);
                  }}
                />
                <span className="text-xs font-reguler text-gray-600">
                  {block.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ================= BLOCK DETAIL ================= */}
      {form.blocks.map((b, i) => (
        <div
          key={b.block_id}
          className="bg-white border rounded p-5 shadow-sm space-y-3"
        >
          <div className="font-semibold text-gray-700">
            Block{" "}
            {blocks.find(x => x.id === b.block_id)?.name}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <input
              placeholder="BCM"
              value={b.bcm}
              onChange={e => {
                const list = [...form.blocks];
                list[i].bcm = e.target.value;
                setForm(p => ({ ...p, blocks: list }));
                updateTotalBcm(list);
              }}
               className="
              w-full
              rounded-lg
              border border-gray-300
              bg-white
              px-3 py-2
              text-sm text-gray-700

              shadow-sm
              transition

              focus:outline-none
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-100
            "
            />

            <input
              placeholder="Amount"
              value={b.amount}
              onChange={e => {
                const list = [...form.blocks];
                list[i].amount = e.target.value;
                setForm(p => ({ ...p, blocks: list }));
              }}
               className="
              w-full
              rounded-lg
              border border-gray-300
              bg-white
              px-3 py-2
              text-sm text-gray-700

              shadow-sm
              transition

              focus:outline-none
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-100
            "
            />

            <input
              type="date"
              value={b.date}
              onChange={e => {
                const list = [...form.blocks];
                list[i].date = e.target.value;
                setForm(p => ({ ...p, blocks: list }));
              }}
               className="
              w-full
              rounded-lg
              border border-gray-300
              bg-white
              px-3 py-2
              text-sm text-gray-700

              shadow-sm
              transition

              focus:outline-none
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-100
            "
            />

            <input
              placeholder="Note"
              value={b.note}
              onChange={e => {
                const list = [...form.blocks];
                list[i].note = e.target.value;
                setForm(p => ({ ...p, blocks: list }));
              }}
               className="
              w-full
              rounded-lg
              border border-gray-300
              bg-white
              px-3 py-2
              text-sm text-gray-700

              shadow-sm
              transition

              focus:outline-none
              focus:border-blue-500
              focus:ring-2 focus:ring-blue-100
            "
            />
          </div>

          {/* ================= MATERIALS ================= */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-600">
            Materials
          </span>

          {b.materials.map((m, mi) => (
            <div key={mi} className="flex gap-2 items-center">
              <input
                placeholder={`Material ${mi + 1}`}
                value={m.material_name}
                onChange={e => {
                  const list = [...form.blocks];
                  list[i].materials[mi].material_name = e.target.value;
                  setForm(p => ({ ...p, blocks: list }));
                }}
                className="
                  flex-1
                  rounded-lg
                  border border-gray-300
                  bg-white
                  px-3 py-2
                  text-sm text-gray-700
                  shadow-sm
                  transition
                  focus:outline-none
                  focus:border-blue-500
                  focus:ring-2 focus:ring-blue-100
                "
              />

              {/* ADD */}
              {mi === b.materials.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const list = [...form.blocks];
                    list[i].materials.push({ material_name: "" });
                    setForm(p => ({ ...p, blocks: list }));
                  }}
                  className="
                    h-9 w-9
                    flex items-center justify-center
                    rounded-lg
                    border border-blue-300 bg-blue-100
                    text-blue-600
                    hover:bg-blue-50
                  "
                >
                  +
                </button>
              )}

              {/* REMOVE */}
              {b.materials.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const list = [...form.blocks];
                    list[i].materials.splice(mi, 1);
                    setForm(p => ({ ...p, blocks: list }));
                  }}
                  className="
                    h-9 w-9
                    flex items-center justify-center
                    rounded-lg
                    border border-red-300 bg-red-100
                    text-red-500
                    hover:bg-red-50
                  "
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="w-full">
          {/* Hidden input */}
          <input
            id={`file-${i}`}
            type="file"
            accept=".pdf,.jpg,.png"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0] || null;
              const list = [...form.blocks];
              list[i].file = file;
              setForm(p => ({ ...p, blocks: list }));
            }}
          />

          {/* Upload Area */}
          <label
            htmlFor={`file-${i}`}
            className="
              flex flex-col items-center justify-center
              w-full min-h-[110px]
              rounded-xl
              border-2 border-dashed border-gray-300
              bg-gray-50
              cursor-pointer

              text-gray-600
              transition

              hover:border-blue-400
              hover:bg-blue-50

              focus-within:border-blue-500
              focus-within:ring-2
              focus-within:ring-blue-100
            "
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl">📎</span>
              <span className="text-sm font-medium">
                {form.blocks[i].file
                  ? "Ganti File"
                  : "Klik untuk upload file"}
              </span>
              <span className="text-xs text-gray-400">
                PDF, JPG, PNG
              </span>
            </div>
          </label>

          {/* File name */}
          {form.blocks[i].file && (
            <div className="mt-2 text-xs text-gray-500 truncate">
              File: {form.blocks[i].file.name}
            </div>
          )}
        </div>


        </div>
      ))}
    </div>
  );
}
