"use client";

import { useEffect, useState } from "react";
import {
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { createPit, updatePits, getPit, deletePit } from "../../../lib/api/pit";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { getSite } from "@/lib/api/sites";

// ================= TYPES =================
type PitCoordinate = {
  point_order: number;
  easting: number;
  northing: number;
  elevation?: number;
};

type PitItem = {
  id?: number;
  site_id: number;
  name: string;
  description: string;
  utm_zone: string;
  status_aktif: boolean;
  coordinates: PitCoordinate[];
};

interface Site {
  id: number;
  name: string;
}

interface PitFormProps {
  siteId?: number;
  pitId?: number;
  siteName?: string;
  sites?: Site[];
}

export default function PitForm({
  siteId,
  pitId,
  siteName,
  sites = [],
}: PitFormProps) {
  const [pits, setPits] = useState<PitItem[]>([]);
  const [usedSiteIds, setUsedSiteIds] = useState<number[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(
    siteId ?? null
  );
  const router = useRouter();

  const defaultCoordinates = (): PitCoordinate[] => [
    { point_order: 1, easting: 0, northing: 0 },
    { point_order: 2, easting: 0, northing: 0 },
    { point_order: 3, easting: 0, northing: 0 },
    { point_order: 4, easting: 0, northing: 0 },
  ];

  const currentSiteId = pitId ? siteId! : selectedSiteId;
  useEffect(() => {
    if (pitId && sites.length > 0) {
      setSelectedSiteId(siteId ?? null);
    }
  }, [pitId, siteId, sites]);

  // ================= FETCH PIT =================
  const [siteData, setSiteData] = useState<{ id: number; name: string } | null>(
    null
  );
  useEffect(() => {
    if (!siteId) return;

    const fetchSite = async () => {
      try {
        const data = await getSite(siteId);

        setSiteData({ id: data.id, name: data.name });

        const pitList: PitItem[] = (data.pits || []).map((pit: any) => ({
          id: pit.id,
          site_id: pit.site_id,
          name: pit.name,
          description: pit.description ?? "",
          utm_zone: pit.utm_zone ?? "50S",
          status_aktif: pit.status_aktif ?? true,
          coordinates: (pit.coordinates || []).map((c: any, i: number) => ({
            point_order: i + 1,
            easting: c.easting,
            northing: c.northing,
            elevation: c.elevation ?? 0,
          })),
        }));

        setPits(pitList);
      } catch (err) {
        console.error("Gagal fetch PIT:", err);
        setPits([]);
      }
    };

    fetchSite();
  }, [siteId]); // ⬅️ CUKUP INI

  const handlePitExcelImport = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    const sid = siteId || selectedSiteId;
    if (!file || !sid) return;

    setPitExcelName(file.name);

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const importedPits: PitItem[] = [];
    let currentPit: PitItem | null = null;

    rows.forEach((row) => {
      const firstCell = String(row[0] ?? "");

      // ===== HEADER PIT =====
      if (firstCell.toLowerCase().includes("koordinat pit")) {
        if (currentPit) importedPits.push(currentPit);

        currentPit = {
          // site_id: siteId,
           site_id: siteId!,
          name: firstCell.trim(),
          description: "",
          utm_zone: "50S",
          status_aktif: true,
          coordinates: [],
        };
        return;
      }

      // ===== DATA KOORDINAT =====
      const easting = Number(row[2]);
      const northing = Number(row[3]);

      if (
        currentPit &&
        !isNaN(easting) &&
        !isNaN(northing) &&
        currentPit.coordinates.length < 6
      ) {
        currentPit.coordinates.push({
          point_order: currentPit.coordinates.length + 1,
          easting,
          northing,
        });
      }
    });

    if (currentPit) importedPits.push(currentPit);

    // VALIDASI
    const invalid = importedPits.find(
      (p) => p.coordinates.length < 4 || p.coordinates.length > 6
    );
    if (invalid) {
      alert(`PIT "${invalid.name}" harus 4–6 titik`);
      return;
    }

    setPits((prev) => [...prev, ...importedPits]);
  };

  // ================= PIT =================
  const addPit = (sid = siteId, first = false) => {
    if (!sid) return;

    setPits((prev) => [
      ...prev,
      {
        site_id: sid,
        name: `PIT ${first ? 1 : prev.length + 1}`,
        description: "PIT Area Description",
        utm_zone: "50S",
        status_aktif: true,
        coordinates: defaultCoordinates(),
      },
    ]);
  };

  const removePoint = (pitIndex: number, pointIndex: number) => {
    const copy = [...pits];

    if (copy[pitIndex].coordinates.length <= 4) {
      // alert("Minimal 4 titik");
      return;
    }

    copy[pitIndex].coordinates.splice(pointIndex, 1);
    copy[pitIndex].coordinates.forEach((c, i) => (c.point_order = i + 1));
    setPits(copy);
  };

  const removePit = (pitIndex: number) => {
    const copy = [...pits];
    copy.splice(pitIndex, 1);
    setPits(copy);
  };

  // ================= COORDINATE =================
  const addPoint = (pitIndex: number) => {
    const copy = [...pits];

    if (copy[pitIndex].coordinates.length >= 6) {
      // alert("Maksimal 6 titik");
      return;
    }

    copy[pitIndex].coordinates.push({
      point_order: copy[pitIndex].coordinates.length + 1,
      easting: 0,
      northing: 0,
    });

    setPits(copy);
  };

  const updatePoint = (
    pitIndex: number,
    pointIndex: number,
    key: keyof PitCoordinate,
    value: number
  ) => {
    const copy = [...pits];
    copy[pitIndex].coordinates[pointIndex][key] = value;
    setPits(copy);
  };

  const [pitDragActive, setPitDragActive] = useState(false);
  const [pitExcelName, setPitExcelName] = useState<string | null>(null);

  const handlePitDragEnter = () => setPitDragActive(true);
  const handlePitDragLeave = () => setPitDragActive(false);
  const handlePitDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setPitDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setPitExcelName(file.name);
      const fakeEvent = {
        target: {
          files: {
            0: file,
            length: 1,
            item: (index: number) => (index === 0 ? file : null),
          } as unknown as FileList,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      handlePitExcelImport(fakeEvent);
    }
  };

  // ================= SUBMIT =================
  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
  const currentSiteId = siteId ?? selectedSiteId;
  // console.log("Submitting PITs", currentSiteId, pits);
  if (!currentSiteId) return;

    // VALIDASI
    for (const pit of pits) {
      if (pit.coordinates.length < 4) {
        showToast(`PIT "${pit.name}" minimal 4 titik`, "error");
        return;
      }
    }

    try {
      const newPits = pits.filter((p) => !p.id);
      const existingPits = pits.filter((p) => p.id);

if (newPits.length)
  await createPit(
    currentSiteId,
    newPits.map((p) => ({
      name: p.name,
      description: p.description,
      utm_zone: p.utm_zone,
      status_aktif: p.status_aktif,
      coordinates: p.coordinates,
    }))
  );

if (existingPits.length)
  await updatePits(
    currentSiteId,
    existingPits.map((p) => ({
      id: p.id!,
      name: p.name,
      description: p.description,
      utm_zone: p.utm_zone,
      status_aktif: p.status_aktif,
      coordinates: p.coordinates,
    }))
  );

     setUsedSiteIds((prev) => [...prev, currentSiteId]);

      localStorage.setItem(
        "toast",
        JSON.stringify({
          message: "Semua PIT berhasil disimpan",
          type: "success",
        })
      );

      router.push("/site-setup");
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan PIT", "error");
    }
  };

  // ================= RENDER =================
  return (
    <div className="flex justify-center min-h-[80vh]">
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {/* SITE SELECT */}
        <div className="flex justify-center items-center gap-2 mt-1">
          <select
            className="border border-gray-400 p-2 text-sm rounded w-full max-w-lg text-gray-600 focus:outline-none focus:border-blue-900 transition shadow-sm"
            value={selectedSiteId ?? ""}
            onChange={(e) => setSelectedSiteId(Number(e.target.value))}
          >
            <option value="">
              {selectedSiteId && siteData ? siteData.name : "-- Pilih Site --"}
            </option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {selectedSiteId && (
          <div className="flex justify-center -mt-3">
            <label
              onDragEnter={() => handlePitDragEnter()}
              onDragLeave={() => handlePitDragLeave()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handlePitDrop(e)}
              className={`flex flex-col items-center justify-center w-full max-w-lg h-38
        border-2 border-dashed rounded-lg cursor-pointer text-center
        transition-all duration-200
        ${
          pitDragActive
            ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-md"
            : "border-gray-300 bg-gray-50 hover:bg-blue-50"
        }`}
            >
              <div className="space-y-1">
                <p
                  className={`text-sm font-semibold ${
                    pitDragActive ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {pitDragActive
                    ? "Lepaskan file di sini"
                    : pitExcelName ?? "Upload Excel PIT"}
                </p>
                <p className="text-xs text-gray-500">
                  Drag & drop atau klik (.xls / .xlsx)
                </p>
              </div>

              <input
                type="file"
                accept=".xls,.xlsx"
                onChange={handlePitExcelImport}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Tombol + PIT Baru sebelum ada PIT */}
        {selectedSiteId && pits.length === 0 && (
          <div className="flex justify-center -mt-3 w-full">
            <button
              type="button"
              onClick={() => addPit(selectedSiteId!, true)}
              className="w-full max-w-lg bg-blue-100 border border-blue-300 text-blue-800 cursor-pointer
              hover:bg-blue-200 px-4 py-2 rounded text-sm"
            >
              + PIT Baru
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 -mt-3">
          {pits.map((pit, pitIndex) => (
            <div
              key={pitIndex}
              className={`p-4 border rounded bg-white ${
                pits.length === 1 ? "lg:col-span-2 w-full" : ""
              }`}
            >
              {/* HEADER */}
              <div className="flex justify-between mb-1">
                <h3 className="font-bold text-lg text-gray-500">{pit.name}</h3>
              </div>

              {/* GRID UTAMA (2 KOLOM) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ================= KIRI ================= */}
                <div className="flex flex-col space-y-2 text-sm text-gray-500">
                  {/* NAME */}
                  <input
                    className="border border-gray-400 p-2 rounded w-full focus:outline-none focus:border-blue-900 transition shadow-sm"
                    value={pit.name}
                    onChange={(e) => {
                      const copy = [...pits];
                      copy[pitIndex].name = e.target.value;
                      setPits(copy);
                    }}
                  />

                  {/* UTM */}
                  <input
                    className="border border-gray-400 p-2 rounded w-full focus:outline-none focus:border-blue-900 transition shadow-sm"
                    value={pit.utm_zone}
                    onChange={(e) => {
                      const copy = [...pits];
                      copy[pitIndex].utm_zone = e.target.value;
                      setPits(copy);
                    }}
                  />

                  {/* DESKRIPSI */}
                  <textarea
                    className="border p-2 rounded w-full text-gray-500 h-21 border-gray-400 focus:outline-none focus:border-blue-900 transition shadow-sm"
                    placeholder="Deskripsi (opsional)"
                    value={pit.description}
                    onChange={(e) => {
                      const copy = [...pits];
                      copy[pitIndex].description = e.target.value;
                      setPits(copy);
                    }}
                  />

                  {/* STATUS */}
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      checked={pit.status_aktif}
                      onChange={(e) => {
                        const copy = [...pits];
                        copy[pitIndex].status_aktif = e.target.checked;
                        setPits(copy);
                      }}
                    />
                    <span
                      className={`text-xs ${
                        pit.status_aktif ? "text-blue-600" : "text-red-500"
                      }`}
                    >
                      {pit.status_aktif ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* ================= KANAN ================= */}
                <div className="space-y-2 text-gray-500 text-sm">
                  {pit.coordinates.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        disabled
                        value={c.point_order}
                        className="w-6 border p-1 text-center text-gray-500 bg-gray-100"
                      />
                      <input
                        type="number"
                        placeholder="Easting"
                        value={c.easting}
                        onChange={(e) =>
                          updatePoint(pitIndex, i, "easting", +e.target.value)
                        }
                        className="border border-gray-400 p-2 rounded w-full focus:outline-none focus:border-blue-900 transition shadow-sm"
                      />
                      <input
                        type="number"
                        placeholder="Northing"
                        value={c.northing}
                        onChange={(e) =>
                          updatePoint(pitIndex, i, "northing", +e.target.value)
                        }
                        className="border border-gray-400 p-2 rounded w-full focus:outline-none focus:border-blue-900 transition shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removePoint(pitIndex, i)}
                        className="text-red-500 bg-red-100 border rounded p-2 border-red-500 cursor-pointer
                 hover:bg-red-200 transition"
                        title="Hapus Titik"
                      >
                        x
                      </button>
                    </div>
                  ))}

                  {/* Tombol + Titik Baru */}
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => addPoint(pitIndex)}
                      disabled={pit.coordinates.length >= 4}
                      className={`text-sm font-medium flex items-center gap-1 ${
                        pit.coordinates.length >= 4
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-blue-700 hover:text-blue-800 cursor-pointer"
                      }`}
                    >
                      + Titik Baru
                    </button>
                  </div>
                </div>
              </div>
              {/* Tombol Hapus PIT & + PIT Baru */}
              <div className="pt-2 border-t flex gap-3 w-full mt-2 border-gray-500">
                {pits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePit(pitIndex)}
                    className="flex-1 bg-red-100 border border-red-500 text-red-700 cursor-pointer
                 hover:bg-red-200 px-2 py-2 rounded text-sm"
                  >
                    − Hapus PIT
                  </button>
                )}

                {pitIndex === pits.length - 1 && (
                  <button
                    type="button"
                    onClick={() => addPit(selectedSiteId!)}
                    className="flex-1 bg-blue-100 border border-blue-300 text-blue-800 cursor-pointer
         hover:bg-blue-200 px-2 py-2 rounded text-sm"
                  >
                    + PIT Baru
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ACTION */}
        {pits.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="w-full bg-gray-200 border border-gray-300 cursor-pointer
                          text-gray-700 py-2 rounded
                          hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-blue-400 text-white py-2 rounded border border-blue-500 cursor-pointer
                      hover:bg-blue-500 transition"
            >
              {pits.some((p) => p.id) ? "Update PIT" : "Save PIT"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
