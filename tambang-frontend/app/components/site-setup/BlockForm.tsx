"use client";

import { useEffect, useMemo, useState } from "react";
import { getPits } from "@/lib/api/pit";
import { useRouter } from "next/navigation";
import Toast from "../ui/Toast";
import * as XLSX from "xlsx";
import { saveBlocks } from "@/lib/api/block";

export type BlockItem = {
  id?: number;
  pit_id: number;
  name: string;
  description?: string;
  volume?: number;
  status: "active" | "inactive";
};

export type Pit = {
  id: number;
  site_id: number;
  name: string;
  blocks: BlockItem[];
};


type Mode = "create" | "edit";

interface Props {
  siteId: number;
  mode?: Mode;
}

// ================= COMPONENT =================
export default function BlockSetup({ siteId, mode = "create" }: Props) {
  const router = useRouter();

  const [pits, setPits] = useState<Pit[]>([]);
  const [selectedPitId, setSelectedPitId] = useState<number | undefined>();
  const [blocks, setBlocks] = useState<BlockItem[]>([]);

  // ================= FETCH PIT =================
  useEffect(() => {
    if (!siteId) return;

    getPits(siteId)
      .then(res => {
        const pitsData: Pit[] = res?.data ?? res ?? [];
        setPits(pitsData);
      })
      .catch(() => setPits([]));
  }, [siteId]);

  // ================= FILTER PIT =================
  const editablePits = useMemo(() => {
    if (mode === "edit") {
      return pits.filter(p => p.blocks && p.blocks.length > 0);
    }
    return pits;
  }, [pits, mode]);

  // ================= MODE HANDLING =================
  useEffect(() => {
    if (mode === "create") {
      setSelectedPitId(undefined);
      setBlocks([]);
      return;
    }

    if (mode === "edit" && editablePits.length > 0) {
      setSelectedPitId(editablePits[0].id);
    }
  }, [mode, editablePits]);

  // ================= LOAD BLOCK =================
  useEffect(() => {
    if (!selectedPitId) return;

    const pit = pits.find(p => p.id === selectedPitId);

    if (mode === "edit") {
      setBlocks(pit?.blocks ?? []);
    }
  }, [selectedPitId, pits, mode]);


  
  const addBlock = () => {
    if (!selectedPitId) return;

    setBlocks((prev) => [
      ...prev,
      {
        pit_id: selectedPitId,
        name: "",
        description: "",
        volume: undefined,
        status: "active",
      },
    ]);
  };

  const [blockDragActive, setBlockDragActive] = useState(false);
  const [blockExcelName, setBlockExcelName] = useState<string | null>(null);

  const handleBlockExcelImport = async (file: File | undefined) => {
    if (!file || !selectedPitId) return;

    const parsedBlocks = await parseExcelBlocks(file, selectedPitId);

    if (!parsedBlocks.length) {
      alert("Data blok tidak ditemukan");
      return;
    }

    setBlocks(parsedBlocks);
    setBlockExcelName(file.name);
  };

  const handleBlockDragEnter = () => setBlockDragActive(true);
  const handleBlockDragLeave = () => setBlockDragActive(false);

  const handleBlockDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setBlockDragActive(false);

    const file = e.dataTransfer.files?.[0];
    handleBlockExcelImport(file);
  };
  function parseVolume(value: any): number | undefined {
    if (!value) return undefined;

    let str = value.toString().trim();
    str = str.replace(/,/g, "");

    const num = Number(str);
    if (isNaN(num) || Math.abs(num) >= 1e13) return undefined;

    return num;
  }

  function parseExcelBlocks(file: File, pitId: number): Promise<BlockItem[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const blocks: BlockItem[] = [];

        rows.forEach((row) => {
          const label = row[0]?.toString().toLowerCase();

          // hanya ambil baris "blok"
          if (label?.startsWith("blok")) {
            blocks.push({
              pit_id: pitId,
              name: row[0],
              volume: parseVolume(row[1]),
              status: "active",
            });
          }
        });

        resolve(blocks);
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  const [toast, setToast] = useState<{
    id: number;
    message: string;
    type?: "success" | "error";
  } | null>(null);
  let toastId = 0;

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    toastId++;
    setToast({ id: toastId, message, type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blocks.length) return;

    try {
      await saveBlocks(siteId, blocks);

      // simpan toast ke localStorage sebelum redirect
      localStorage.setItem(
        "toast",
        JSON.stringify({ message: "Block berhasil disimpan", type: "success" })
      );

      setBlocks([]);
      setSelectedPitId(undefined);

      // arahkan ke halaman Site Setup
      router.push("/site-setup");
    } catch (err: any) {
      // simpan toast error ke localStorage
      localStorage.setItem(
        "toast",
        JSON.stringify({
          message: err.message || "Gagal menyimpan block",
          type: "error",
        })
      );

      router.push("/site-setup");
    }
  };

  const hasBlocks = blocks.length > 0;

  return (
    <div className="flex justify-center min-h-[80vh]">
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} />
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {/* SELECT PIT */}
        <div className="flex justify-center items-center gap-2 mt-1">
        <select
    value={selectedPitId ?? ""}
    onChange={(e) =>
      setSelectedPitId(
        e.target.value ? Number(e.target.value) : undefined
      )
    }
    className="border border-gray-400 p-2 text-sm rounded w-full max-w-lg text-gray-600
               focus:outline-none focus:border-blue-900 transition shadow-sm"
  >
    <option value="" disabled>
      -- Pilih PIT --
    </option>

    {(mode === "edit"
      ? pits.filter(p => p.blocks && p.blocks.length > 0)
      : pits
    ).map((pit) => (
      <option key={pit.id} value={pit.id}>
        {pit.name}
      </option>
    ))}
  </select>
        </div>

        {selectedPitId && (
          <div className="flex justify-center -mt-1">
            <label
              onDragEnter={handleBlockDragEnter}
              onDragLeave={handleBlockDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleBlockDrop}
              className={`flex flex-col items-center justify-center w-full max-w-lg h-38
        border-2 border-dashed rounded-lg cursor-pointer text-center
        transition-all duration-200
        ${
          blockDragActive
            ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-md"
            : "border-gray-300 bg-gray-50 hover:bg-blue-50"
        }`}
            >
              <div className="space-y-1">
                <p
                  className={`text-sm font-semibold ${
                    blockDragActive ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {blockDragActive
                    ? "Lepaskan file di sini"
                    : blockExcelName ?? "Upload Excel Block"}
                </p>
                <p className="text-xs text-gray-500">
                  Drag & drop atau klik (.xls / .xlsx)
                </p>
              </div>

              <input
                type="file"
                accept=".xls,.xlsx"
                onChange={(e) => handleBlockExcelImport(e.target.files?.[0])}
                className="hidden"
              />
            </label>
          </div>
        )}
        {selectedPitId && blocks.length === 0 && (
          <div className="flex justify-center mt-3">
            <button
              type="button"
              onClick={addBlock}
              className="w-full max-w-lg bg-blue-100 border border-blue-300
                 text-blue-800 cursor-pointer hover:bg-blue-200
                 px-4 py-2 rounded text-sm font-semibold"
            >
              + Block Baru
            </button>
          </div>
        )}

        <div
          className={`grid gap-4
        -mt-1
            ${
              blocks.length === 1
                ? "grid-cols-1"
                : blocks.length === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-3 sm:grid-cols-2"
            }
          `}
        >
          {blocks.map((block, i) => (
            <div
              key={i}
              className={`p-4 pt-10 border rounded space-y-2 bg-white w-full relative
              ${
                blocks.length === 1
                  ? "max-w-lg mx-auto"
                  : blocks.length === 2
                  ? ""
                  : "max-w-lg"
              }
            `}
            >
              {/* HEADER NAMA & HAPUS */}
              <div className="absolute top-2 left-4 right-4 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-500">
                  {block.name || `Block 0${i + 1}`}
                </span>
              </div>

              <input
                placeholder="Nama Block (ex: BLOCK 01)"
                value={block.name}
                onChange={(e) => {
                  const c = [...blocks];
                  c[i].name = e.target.value;
                  setBlocks(c);
                }}
                className="border text-sm border-gray-400 p-2 rounded w-full focus:outline-none focus:border-blue-900 transition shadow-sm text-gray-500"
                required
              />

              <textarea
                placeholder="Deskripsi Block"
                value={block.description ?? ""}
                onChange={(e) => {
                  const c = [...blocks];
                  c[i].description = e.target.value;
                  setBlocks(c);
                }}
                rows={4}
                className="border p-2 text-sm rounded w-full text-gray-500 border-gray-400 focus:outline-none focus:border-blue-900 transition shadow-sm"
              />

              <input
                type="number"
                placeholder="Volume (m³)"
                step="0.00001" // memungkinkan 5 desimal
                value={
                  block.volume !== undefined ? block.volume.toFixed(5) : ""
                }
                onChange={(e) => {
                  const c = [...blocks];
                  const value = e.target.value;
                  if (!value) {
                    c[i].volume = undefined;
                  } else {
                    // ubah string ke number dan bulatkan ke 5 desimal
                    c[i].volume = Math.round(Number(value) * 100000) / 100000;
                  }
                  setBlocks(c);
                }}
                className="border text-sm border-gray-400 p-2 -mt-2 rounded w-full focus:outline-none focus:border-blue-900 transition shadow-sm text-gray-500"
              />

              <label className="flex items-center gap-2 text-sm pt-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={block.status === "active"}
                  onChange={(e) => {
                    const c = [...blocks];
                    c[i].status = e.target.checked ? "active" : "inactive";
                    setBlocks(c);
                  }}
                  className="cursor-pointer"
                />
                <span
                  className={
                    block.status === "active"
                      ? "text-blue-600 text-xs font-reguler"
                      : "text-red-500 text-xs font-reguler"
                  }
                >
                  {block.status === "active" ? "Active" : "Inactive"}
                </span>
              </label>
              {selectedPitId && (
                <div className="border-t pt-3 border-gray-500">
                  <div className="flex items-center gap-2">
                    {/* KIRI */}
                    <button
                      type="button"
                      onClick={() =>
                        setBlocks((prev) => prev.filter((_, x) => x !== i))
                      }
                      className="flex-1 bg-red-100 border border-red-500 text-red-700 cursor-pointer
                 hover:bg-red-200 px-2 py-2 rounded text-sm"
                    >
                      - Hapus
                    </button>

                    {/* KANAN - ADD HANYA DI CARD TERAKHIR */}
                    {i === blocks.length - 1 && (
                      <button
                        type="button"
                        onClick={addBlock}
                        className="flex-1 bg-blue-100 border border-blue-300 text-blue-800 cursor-pointer
                 hover:bg-blue-200 px-2 py-2 rounded text-sm"
                      >
                        + Block Baru
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* ACTIONS */}
        {blocks.length > 0 && (
          <div
            className={`mt-4
              ${
                blocks.length === 1
                  ? "flex justify-center gap-4"
                  : "grid grid-cols-2 gap-4"
              }
            `}
          >
            <button
              type="button"
              onClick={() => window.history.back()}
              className={`bg-gray-200 border border-gray-300 cursor-pointer
                          text-gray-700 py-2 rounded hover:bg-gray-300 transition
                          ${blocks.length === 1 ? "w-62" : "w-full"}
              `}
            >
              Cancel
            </button>

<button
  type="submit"
  className={`bg-blue-400 text-white py-2 rounded border border-blue-500 cursor-pointer
              hover:bg-blue-500 transition
              ${blocks.length === 1 ? "w-62" : "w-full"}`}
>
  {mode === "edit" ? "Update Block" : "Save Block"}
</button>

          </div>
        )}
      </form>
    </div>
  );
}
