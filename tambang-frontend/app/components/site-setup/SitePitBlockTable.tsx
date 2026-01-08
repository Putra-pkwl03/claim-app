// ================= SitePitBlockTable.tsx =================
"use client";

import React, { useState, useEffect } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";



// ================== TYPES ==================
// SitePitBlockTable.tsx
export interface Coordinate {
  id: number;
  site_id?: number;
  pit_id?: number;
  point_order: number;
  point_code?: string | null;
  easting: string;
  northing: string;
  elevation?: number | null;
  created_at: string;
  updated_at: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Block {
  pit: any;
  id: number;
  name: string;
  description?: string;
  volume: number;
  status?: string;
}

export interface Pit {
  jenis_material: string;
  id: number;
  site_id: number;
  no_pit: string;
  name: string;
  description?: string;
  // jenis_material?: string;
  status_aktif?: boolean;
  luas_m2?: number;
  coordinates?: Coordinate[];
  coordinates_latlng?: LatLng[];
  blocks?: Block[];
}

export interface Site {
  block_count: number;
  id: number;
  no_site: string;
  name: string;
  description?: string;
  luas_m2?: number;
  utm_zone?: string;
  coordinates?: Coordinate[];
  coordinates_latlng?: LatLng[];
  pit_count?: number;
  pits?: Pit[];
}

// ================== PROPS ==================
interface SitePitBlockTableProps {
 sites: Site[];
  pits: Pit[];
  blocks: Block[];

  expandedSites: (string | number)[];
  expandedPits: (string | number)[];
  setExpandedSites: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  setExpandedPits: React.Dispatch<React.SetStateAction<(string | number)[]>>;

  onDeleteSite: (siteId: number) => void;
  onDeletePit: (siteId: number, pitId: number) => void;
  onDeleteBlock: (siteId: number, blockId: number) => void;
  onToggleMapMode?: () => void;
}

// ================== COMPONENT ==================
export default function SitePitBlockTable({
  sites,
  pits,
  blocks,
  expandedSites,
  expandedPits,
  setExpandedSites,
  setExpandedPits,
  onToggleMapMode,
    onDeleteSite,
  onDeletePit,
  onDeleteBlock,
}: SitePitBlockTableProps) {
  const toggleSite = (siteId: string | number) => {
    setExpandedSites((prev) =>
      prev.includes(siteId)
        ? prev.filter((id) => id !== siteId)
        : [...prev, siteId]
    );
  };

  const togglePit = (pitId: string | number) => {
    setExpandedPits((prev) =>
      prev.includes(pitId)
        ? prev.filter((id) => id !== pitId)
        : [...prev, pitId]
    );
  };

  const router = useRouter();

  const handleEdit = (
    type: "site" | "pit" | "block",
    id: number,
    siteId?: number
  ) => {
    let targetSiteId = siteId ?? id;
    router.push(`/site-setup/${targetSiteId}?tab=${type}`);
  };

  // const [showDeleteModal, setShowDeleteModal] = useState(false);
  // const [deleteTarget, setDeleteTarget] = useState<{ type: "site" | "pit" | "block"; id: number } | null>(null);


  // const handleDelete = (type: "site" | "pit" | "block", id: number) => {
  //   setDeleteTarget({ type, id });
  //   setShowDeleteModal(true);
  // };




  // const cancelDelete = () => {
  //   setShowDeleteModal(false);
  //   setDeleteTarget(null);
  // };


  // const [toastMessage, setToastMessage] = useState<{ message: string; type?: "success" | "error" } | null>(null);

  return (
    <>
      {/* ====== SITES ====== */}
      <div>
        <h3
          className="text-md font-semibold text-gray-600 cursor-pointer"
          onClick={() =>
            setExpandedSites(expandedSites.length ? [] : sites.map((s) => s.id))
          }
        >
          Sites ({sites.length})
        </h3>
        <table className="mb-2 min-w-full divide-y divide-gray-200 text-sm bg-white rounded-md shadow border">
          <thead className="bg-blue-50 text-gray-700 border border-gray-200">
            <tr className="text-gray-500">
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">No Site</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Volume</th>
              <th className="px-4 py-2 text-center">UTM Zone</th>
              <th className="px-4 py-2 text-center">Pit</th>
              <th className="px-4 py-2 text-center">Block</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-500">
            {sites.map((site, idx) => (
              <tr
                key={site.id}
                className="hover:bg-gray-50 cursor-pointer transition"
                onClick={() => toggleSite(site.id)}
              >
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{site.no_site}</td>
                <td className="px-4 py-2">{site.name}</td>
                <td className="px-4 py-2">{site.description || "-"}</td>
                <td className="px-4 py-2">
                  {Number(site.luas_m2)?.toFixed(2) || "-"}
                </td>
                <td className="px-4 py-2 text-center">{site.utm_zone}</td>
                <td className="px-4 py-2 text-center">{site.pit_count ?? 0}</td>
                <td className="px-4 py-2 text-center">
                  {site.block_count ?? 0}
                </td>
                <td
                  className="px-4 py-2 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit("site", site.id)}
                      className="text-blue-600 hover:text-blue-800 bg-blue-100 border border-blue-300 rounded cursor-pointer hover:bg-blue-200 p-1.5"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => onDeleteSite(site.id)}
                      className="text-red-600 hover:text-red-800 bg-red-100 border-red-300 border rounded cursor-pointer hover:bg-red-200 p-1.5"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ====== PITS ====== */}
      {expandedSites.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-gray-600">Pits</h3>
          <table className="mb-2 min-w-full divide-y divide-gray-200 text-sm bg-white rounded-md shadow border">
            <thead className="bg-blue-500/10 text-gray-700 border-b border-gray-200">
              <tr className="text-gray-500">
                <th className="px-4 py-2 text-left">No</th>
                <th className="px-4 py-2 text-left">No PIT</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Description</th>
                {/* <th className="px-4 py-2 text-left">Material</th> */}
                <th className="px-4 py-2 text-left">Volume</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-500">
              {pits
                .filter((pit) => expandedSites.includes(pit.site_id))
                .map((pit, idx) => (
                  <tr
                    key={pit.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => togglePit(pit.id)}
                  >
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{pit.no_pit}</td>
                    <td className="px-4 py-2">{pit.name}</td>
                    <td className="px-4 py-2">{pit.description || "-"}</td>
                    {/* <td className="px-4 py-2">{pit.jenis_material || "-"}</td> */}
                    <td className="px-4 py-2">
                      {Number(pit.luas_m2)?.toFixed(2) || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {pit.status_aktif ? "Aktif" : "Nonaktif"}
                    </td>
                    <td
                      className="px-4 py-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit("pit", pit.id, pit.site_id)}
                          className="bg-blue-100 border border-blue-300 rounded cursor-pointer hover:bg-blue-200 p-1.5 text-blue-600 hover:text-blue-700"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>

                        <button
                           onClick={() => onDeletePit(pit.site_id, pit.id)}
                          className="text-red-600 hover:text-red-800 bg-red-100 border border-red-300 rounded cursor-pointer hover:bg-red-200 p-1.5"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ====== BLOCKS ====== */}
      {expandedPits.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-gray-600">Blocks</h3>
          <table className="min-w-full divide-y divide-gray-200 text-sm bg-white rounded-md shadow border">
            <thead className="bg-blue-400/10 text-gray-700 border-b border-gray-200">
              <tr className="text-gray-500">
                <th className="px-4 py-2 text-left">No</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Volume</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-500">
              {blocks
                .filter((block) => expandedPits.includes(block.pit.id))
                .map((block, idx) => (
                  <tr key={block.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{block.name}</td>
                    <td className="px-4 py-2">{block.volume}</td>
                    <td className="px-4 py-2">{block.status || "-"}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            handleEdit("block", block.id, block.pit.site_id)
                          }
                        className="bg-blue-100 border border-blue-300 rounded cursor-pointer hover:bg-blue-200 p-1.5 text-blue-700 hover:text-blue-800"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>

                        <button
                           onClick={() => onDeleteBlock(block.pit.site_id, block.id)}
                          className="text-red-600 hover:text-red-800 bg-red-100 border border-red-300 rounded cursor-pointer hover:bg-red-200 p-1.5"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
    )}
    </>
  );
}
