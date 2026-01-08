"use client";

import { ChangeEvent, DragEvent, useEffect, useState } from "react";
import { createSite, getSite, updateSite } from "../../../lib/api/sites";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface Coordinate {
  point_order: number;
  easting: string;
  northing: string;
}

interface SiteData {
  name: string;
  description: string;
  utm_zone: string;
  coordinates: Coordinate[];
}
interface SiteFormProps {
  initialData?: SiteData[];
  siteId?: string;
}

export default function SiteForm({ initialData, siteId }: SiteFormProps) {
  const [sites, setSites] = useState<SiteData[]>(
    initialData ?? [
      {
        name: "",
        description: "",
        utm_zone: "",
        coordinates: [
          { point_order: 1, easting: "", northing: "" },
          { point_order: 2, easting: "", northing: "" },
          { point_order: 3, easting: "", northing: "" },
          { point_order: 4, easting: "", northing: "" },
          { point_order: 5, easting: "", northing: "" },
          { point_order: 6, easting: "", northing: "" },
        ],
      },
    ]
  );

  useEffect(() => {
    if (!siteId) return;

    const fetchSite = async () => {
      try {
        const data = await getSite(siteId);
        setSites([
          {
            name: data.name,
            description: data.description ?? "",
            utm_zone: data.utm_zone ?? "",
            coordinates: data.coordinates.map((c: any, i: number) => ({
              point_order: i + 1,
              easting: c.easting,
              northing: c.northing,
            })),
          },
        ]);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSite();
  }, [siteId]);

  const [dragActive, setDragActive] = useState<{ [key: number]: boolean }>({});

  const [excelNames, setExcelNames] = useState<{ [key: number]: string }>({});

  const handleExcelDrop = (
    e: DragEvent<HTMLLabelElement>,
    siteIndex: number
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    setExcelNames((prev) => ({ ...prev, [siteIndex]: file.name }));
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    handleExcelImport(
      {
        target: { files: dataTransfer.files },
      } as React.ChangeEvent<HTMLInputElement>,
      siteIndex
    );
  };

  const handleExcelChange = (
    e: ChangeEvent<HTMLInputElement>,
    siteIndex: number
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setExcelNames((prev) => ({ ...prev, [siteIndex]: file.name }));
    handleExcelImport(e, siteIndex);
  };

  const handleDragEnter = (siteIndex: any) => {
    setDragActive((prev) => ({ ...prev, [siteIndex]: true }));
  };

  const handleDragLeave = (siteIndex: any) => {
    setDragActive((prev) => ({ ...prev, [siteIndex]: false }));
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>, siteIndex: number) => {
    e.preventDefault();
    setDragActive((prev) => ({ ...prev, [siteIndex]: false }));
    handleExcelDrop(e, siteIndex);
  };

  const handleExcelImport = (
    e: React.ChangeEvent<HTMLInputElement>,
    siteIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
      });

      // 1️⃣ cari index "Koordinat Konsesi"
      const startIndex = rows.findIndex(
        (r) => typeof r[0] === "string" && r[0].includes("Koordinat Konsesi")
      );

      if (startIndex === -1) {
        alert("Header 'Koordinat Konsesi' tidak ditemukan");
        return;
      }

      // 2️⃣ ambil baris setelahnya sampai ketemu header baru
      const dataRows: any[][] = [];

      for (let i = startIndex + 1; i < rows.length; i++) {
        const row = rows[i];

        // berhenti kalau ketemu header blok lain
        if (typeof row[0] === "string" && row[0].includes("Koordinat")) {
          break;
        }

        // valid titik (punya easting & northing)
        if (!isNaN(Number(row[2])) && !isNaN(Number(row[3]))) {
          dataRows.push(row);
        }
      }

      if (dataRows.length < 4 || dataRows.length > 6) {
        alert(`Jumlah titik konsesi terbaca ${dataRows.length}, harus 4–6`);
        return;
      }

      const coordinates = dataRows.map((row, i) => ({
        point_order: i + 1,
        easting: String(row[2]), // EASTING
        northing: String(row[3]), // NORTHING
      }));

      const copy = [...sites];
      copy[siteIndex].coordinates = coordinates;
      setSites(copy);
    };

    reader.readAsBinaryString(file);
  };

  // Tambah site baru
  const addSite = () => {
    setSites([
      ...sites,
      {
        name: "",
        description: "",
        utm_zone: "",
        coordinates: [
          { point_order: 1, easting: "", northing: "" },
          { point_order: 2, easting: "", northing: "" },
          { point_order: 3, easting: "", northing: "" },
          { point_order: 4, easting: "", northing: "" },
          { point_order: 5, easting: "", northing: "" },
          { point_order: 6, easting: "", northing: "" },
        ],
      },
    ]);
  };

  // Hapus site
  const removeSite = (index: number) => {
    const copy = [...sites];
    copy.splice(index, 1);
    setSites(copy);
  };

  // Tambah titik di site tertentu
  const addPoint = (siteIndex: number) => {
    const copy = [...sites];
    const site = copy[siteIndex];

    if (site.coordinates.length >= 6) return;

    site.coordinates.push({
      point_order: site.coordinates.length + 1,
      easting: "",
      northing: "",
    });

    setSites(copy);
  };

  const removePoint = (siteIndex: number, pointIndex: number) => {
    const copy = [...sites];
    const site = copy[siteIndex];

    if (site.coordinates.length <= 4) return;

    site.coordinates.splice(pointIndex, 1);

    // re-order point_order
    site.coordinates.forEach((c, i) => (c.point_order = i + 1));

    setSites(copy);
  };

  // Update field string saja
  const updateSiteField = (
    siteIndex: number,
    field: "name" | "description" | "utm_zone",
    value: string
  ) => {
    const copy = [...sites];
    copy[siteIndex][field] = value;
    setSites(copy);
  };

  const updateCoordinate = (
    siteIndex: number,
    pointIndex: number,
    field: keyof Coordinate,
    value: string
  ) => {
    const copy = [...sites];
    copy[siteIndex].coordinates[pointIndex] = {
      ...copy[siteIndex].coordinates[pointIndex],
      [field]: value,
    };
    setSites(copy);
  };

  const router = useRouter();
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i];

      const payload = {
        name: site.name,
        description: site.description,
        utm_zone: site.utm_zone,
        coordinates: site.coordinates.map((c) => ({
          point_order: c.point_order,
          easting: Number(c.easting),
          northing: Number(c.northing),
        })),
      };

      // 🔹 EDIT MODE → site pertama di-update
      if (siteId && i === 0) {
        await updateSite(siteId, payload);
      } 
      // 🔹 site tambahan / create mode
      else {
        await createSite(payload);
      }
    }

    localStorage.setItem(
      "toast",
      JSON.stringify({ type: "success", message: "Data site berhasil disimpan" })
    );
    router.push("/site-setup");
  } catch {
    localStorage.setItem(
      "toast",
      JSON.stringify({ type: "error", message: "Gagal menyimpan site" })
    );
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full mt-1">
      <div
        className={`grid md:gap-4 sm:gap-2 ${
          sites.length === 1
            ? "grid-cols-1 justify-items-center"
            : "grid-cols-1 sm:grid-cols-2 justify-items-stretch"
        }`}
      >
        {sites.map((site, siteIndex) => (
          <div
            key={siteIndex}
            className="p-4 border border-gray-200 rounded-md bg-white  w-full"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-1 -mt-2">
              <h3 className="font-bold text-lg text-gray-600">
                Site {siteIndex + 1}
              </h3>
            </div>

            {/* GRID 2 KOLOM */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-sm text-gray-500 ">
              {/* ================= LEFT ================= */}
              <div className="md:col-span-3 space-y-2">
                <input
                  value={site.name}
                  onChange={(e) =>
                    updateSiteField(siteIndex, "name", e.target.value)
                  }
                  placeholder="Nama Site"
                  className="border border-gray-400 p-2 rounded w-full
           focus:outline-none focus:border-blue-900 transition shadow-sm"
                  required
                />

                <textarea
                  value={site.description}
                  onChange={(e) =>
                    updateSiteField(siteIndex, "description", e.target.value)
                  }
                  placeholder="Deskripsi Site"
                  className="border border-gray-400 p-2 rounded w-full
           focus:outline-none focus:border-blue-900 transition shadow-sm"
                  rows={4}
                />

                <input
                  value={site.utm_zone}
                  onChange={(e) =>
                    updateSiteField(siteIndex, "utm_zone", e.target.value)
                  }
                  placeholder="UTM Zone (contoh: 50S)"
                  className="border border-gray-400 p-2 rounded w-full -mt-1
           focus:outline-none focus:border-blue-900 transition shadow-sm"
                  required
                />

                <label
                  onDragEnter={() => handleDragEnter(siteIndex)}
                  onDragLeave={() => handleDragLeave(siteIndex)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, siteIndex)}
                  className={`flex flex-col items-center justify-center w-full h-37 mt-1
    border-2 border-dashed rounded-lg cursor-pointer text-center
    transition-all duration-200
    ${
      dragActive[siteIndex]
        ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-md"
        : "border-gray-300 bg-gray-50 hover:bg-blue-50"
    }`}
                >
                  <div className="space-y-1">
                    <p
                      className={`text-sm font-semibold
      ${dragActive[siteIndex] ? "text-blue-700" : "text-gray-700"}`}
                    >
                      {dragActive[siteIndex]
                        ? "Lepaskan file di sini"
                        : excelNames[siteIndex] ?? "Upload Koordinat Excel"}
                    </p>

                    <p className="text-xs text-gray-500">
                      Drag & drop atau klik (.xls / .xlsx)
                    </p>
                  </div>

                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleExcelChange(e, siteIndex)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* ================= RIGHT ================= */}
              <div className="md:col-span-3 space-y-2">
                {/* UPLOAD EXCEL */}

                {site.coordinates.map((c, pointIndex) => (
                  <div
                    key={pointIndex}
                    className="flex gap-2 items-center text-gray-500"
                  >
                    <input
                      disabled
                      value={pointIndex + 1}
                      className="w-6 border p-1 h-9 text-center text-gray-500 bg-gray-100"
                    />

                    <input
                      value={c.easting}
                      onChange={(e) =>
                        updateCoordinate(
                          siteIndex,
                          pointIndex,
                          "easting",
                          e.target.value
                        )
                      }
                      placeholder="Easting"
                      className="border border-gray-400 p-2 rounded w-full
           focus:outline-none focus:border-blue-900 transition shadow-sm"
                      required
                    />
                    <input
                      value={c.northing}
                      onChange={(e) =>
                        updateCoordinate(
                          siteIndex,
                          pointIndex,
                          "northing",
                          e.target.value
                        )
                      }
                      placeholder="Northing"
                      className="border border-gray-400 p-2 rounded w-full
           focus:outline-none focus:border-blue-900 transition shadow-sm"
                      required
                    />
                    {site.coordinates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePoint(siteIndex, pointIndex)}
                        className="text-red-500 bg-red-100 border border-red-500 rounded px-2 py-2 font-bold cursor-pointer hover:bg-red-200 transition"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => addPoint(siteIndex)}
                    disabled={site.coordinates.length >= 6}
                    className={`text-sm font-medium flex items-center gap-1
                    ${
                      site.coordinates.length >= 6
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-700 hover:text-blue-800 cursor-pointer"
                    }`}
                  >
                    + Titik Baru
                  </button>
                </div>
                <div className="pt-2 border-t flex gap-3">
                  {sites.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSite(siteIndex)}
                      className="flex-1 bg-red-100 border border-red-500 text-red-700 cursor-pointer
                              hover:bg-red-200 px-2 py-2 rounded"
                    >
                      − Hapus Site
                    </button>
                  )}

                  {siteIndex === sites.length - 1 && (
                    <button
                      type="button"
                      onClick={addSite}
                      className="flex-1 bg-blue-100 border border-blue-300 text-blue-800 cursor-pointer
                              hover:bg-blue-200 px-2 py-2 rounded"
                    >
                      + Site Baru
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          {siteId ? "Update Site" : "Save Site"}
        </button>
      </div>
    </form>
  );
}
