"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ArrowDownOnSquareStackIcon,
  MapIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";

import TableSkeleton from "../components/ui/SkletonTableArea";
import ClaimSettingsModal from "../components/settings/ClaimSettingsModal";
import ClaimSettingsTable from "../components/settings/ClaimSettingsTable";

import DataList from "../components/site-setup/DataList";
import MapView from "../components/maps/MapView";
import Toast from "../components/ui/Toast";

import { deletePit } from "@/lib/api/pit";
import { deleteBlock } from "@/lib/api/block";

import ConfirmModal from "../components/ui/ConfirmModal";

import { getThresholds, deleteThreshold } from "../../lib/api/claim-limit";

import { usePageTitle } from "../../context/PageTitleContext";
import { getSites, deleteSite } from "../../lib/api/sites";

import SitePitBlockTable, {
  Site,
  Pit,
  Block,
} from "../components/site-setup/SitePitBlockTable";

/* ================= TYPE ================= */
type Threshold = {
  id: number;
  name: string;
  limit_value: number;
  description?: string;
  active: boolean;
  created_at: string;
};

export default function SiteSetupPage() {
  const { setTitle } = usePageTitle();
  const router = useRouter();

  /* ================= STATE ================= */
  const [sites, setSites] = useState<Site[]>([]);
  const [pits, setPits] = useState<Pit[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  const [loadingSite, setLoadingSite] = useState(true);
  const [loadingClaim, setLoadingClaim] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "site" | "pit" | "block">("all");

  const [expandedSites, setExpandedSites] = useState<(string | number)[]>([]);
  const [expandedPits, setExpandedPits] = useState<(string | number)[]>([]);

  /* ===== THRESHOLD STATE ===== */
  const [claimLimits, setClaimLimits] = useState<Threshold[]>([]);
  const [showClaimSettingTable, setShowClaimSettingTable] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Threshold | null>(null);
  const [showMapMode, setShowMapMode] = useState(false);

  /* ================= EFFECT ================= */
  useEffect(() => {
    setTitle("Site Setup View");

    const fetchData = async () => {
      try {
        setLoadingSite(true);
        const data = await getSites();

        // console.log("=== RAW DATA ===");
        // console.log(data); // tampilkan data dari API

        const pitMap = new Map<string | number, Pit>();
        const blockMap = new Map<string | number, Block>();

        data.forEach((site: any) => {
          // console.log("SITE:", site.id, site.name);
          // console.log("SITE PITS:", site.pits);

          site.pits?.forEach((pit: any) => {
            // console.log("PIT:", pit.id, pit.name);
            pitMap.set(pit.id, { ...pit, site_id: site.id });

            // console.log("PIT BLOCKS:", pit.blocks);
            pit.blocks?.forEach((block: any) => {
              // console.log("BLOCK:", block.id, block.name, "pit_id:", pit.id);
              blockMap.set(block.id, { ...block, pit });
            });
          });
        });

        setSites(data);
        setPits([...pitMap.values()]);
        setBlocks([...blockMap.values()]);

        // console.log("=== PIT MAP VALUES ===", [...pitMap.values()]);
        // console.log("=== BLOCK MAP VALUES ===", [...blockMap.values()]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSite(false);
      }
    };

    fetchData();
  }, [setTitle]);

  /* ================= HANDLER ================= */
  const handleGoSetup = () => router.push("/site-setup/area");

  const handleShowClaimSettings = async () => {
    setShowClaimSettingTable(true);

    if (claimLimits.length > 0) return;

    setLoadingClaim(true);
    try {
      const res = await getThresholds();
      setClaimLimits(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setClaimLimits([]);
    } finally {
      setLoadingClaim(false);
    }
  };

  const handleEdit = (item: Threshold) => {
    setEditData(item);
    setShowModal(true);
  };

const [deleteThresholdId, setDeleteThresholdId] = useState<number | null>(null);

const handleDelete = (id: number) => {
  setDeleteThresholdId(id);
  setShowDeleteModal(true);
};

const confirmDeleteThreshold = async () => {
  if (!deleteThresholdId) return;

  try {
    await deleteThreshold(deleteThresholdId);
    setClaimLimits((prev) =>
      prev.filter((t) => t.id !== deleteThresholdId)
    );
    showToast("Threshold berhasil dihapus", "success");
  } catch (err) {
    showToast("Gagal menghapus threshold", "error");
  } finally {
    setShowDeleteModal(false);
    setDeleteThresholdId(null);
  }
};


  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const savedToast = localStorage.getItem("toast");
    if (savedToast) {
      setToast(JSON.parse(savedToast));
      localStorage.removeItem("toast");
    }
  }, []);

  const handleDeleteSite = (siteId: number) => {
    setDeleteTarget({ type: "site", id: siteId });
    setShowDeleteModal(true);
  };

  const handleDeletePit = (siteId: number, pitId: number) => {
    setDeleteTarget({ type: "pit", siteId, id: pitId });
    setShowDeleteModal(true);
  };

  const handleDeleteBlock = (siteId: number, blockId: number) => {
    setDeleteTarget({ type: "block", siteId, id: blockId });
    setShowDeleteModal(true);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "site" | "pit" | "block";
    siteId?: number;
    id: number;
  } | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "site") {
        await deleteSite(deleteTarget.id.toString());
        setSites((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        setPits((prev) => prev.filter((p) => p.site_id !== deleteTarget.id));
        setBlocks((prev) =>
          prev.filter((b) => b.pit.site_id !== deleteTarget.id)
        );
        showToast("Site berhasil dihapus", "success");
      }

      if (deleteTarget.type === "pit") {
        await deletePit(deleteTarget.siteId!, deleteTarget.id);
        setPits((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setBlocks((prev) => prev.filter((b) => b.pit.id !== deleteTarget.id));
        showToast("Pit berhasil dihapus", "success");
      }

      if (deleteTarget.type === "block") {
        await deleteBlock(deleteTarget.siteId!, deleteTarget.id);
        setBlocks((prev) => prev.filter((b) => b.id !== deleteTarget.id));
        showToast("Block berhasil dihapus", "success");
      }
    } catch (err: any) {
      // PESAN SPESIFIK & EDUKATIF
      if (deleteTarget?.type === "block") {
        showToast(
          "Block tidak bisa dihapus karena masih digunakan oleh data claim. Hapus data claim terlebih dahulu.",
          "error"
        );
      } else if (deleteTarget?.type === "pit") {
        showToast(
          "Pit tidak bisa dihapus karena masih memiliki block atau data terkait.",
          "error"
        );
      } else if (deleteTarget?.type === "site") {
        showToast(
          "Site tidak bisa dihapus karena masih memiliki pit atau data terkait.",
          "error"
        );
      } else {
        showToast("Gagal menghapus data", "error");
      }
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ================= FILTER ================= */
  const keyword = search.trim().toLowerCase();
  const { filteredSites, filteredPits, filteredBlocks } = useMemo(() => {
    let fs = sites;
    let fp = pits;
    let fb = blocks;
    if (filter === "site") {
      fp = pits.filter((p) => fs.some((s) => s.id === p.site_id));
      fb = blocks.filter((b) => fp.some((p) => p.id === b.pit.id));
    }
    if (filter === "pit") {
      fs = sites.filter((s) => fp.some((p) => p.site_id === s.id));
      fb = blocks.filter((b) => fp.some((p) => p.id === b.pit.id));
    }
    if (filter === "block") {
      fp = pits.filter((p) => fb.some((b) => b.pit.id === p.id));
      fs = sites.filter((s) => fp.some((p) => p.site_id === s.id));
    }
    if (keyword) {
      fb = fb.filter((b) => b.name.toLowerCase().includes(keyword));
      fp = fp.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          fb.some((b) => b.pit.id === p.id)
      );
      fs = fs.filter(
        (s) =>
          s.name.toLowerCase().includes(keyword) ||
          fp.some((p) => p.site_id === s.id)
      );
    }
    return { filteredSites: fs, filteredPits: fp, filteredBlocks: fb };
  }, [keyword, filter, sites, pits, blocks]);

  useEffect(() => {
    if (!keyword && filter === "all") {
      setExpandedSites([]);
      setExpandedPits([]);
      return;
    }
    setExpandedSites((prev) => {
      const next = filteredSites.map((s) => s.id);
      return prev.length === next.length ? prev : next;
    });
    setExpandedPits((prev) => {
      const next = filteredPits.map((p) => p.id);
      return prev.length === next.length ? prev : next;
    });
  }, [keyword, filter, filteredSites.length, filteredPits.length]);
  /* ================= RENDER ================= */
  return (
    <div className="p-6 w-full min-h-screen bg-gray-100">
      <div className="mt-12">
        {toast && <Toast message={toast.message} type={toast.type} />}

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          {/* LEFT */}
          <div className="flex flex-wrap items-center gap-2">
            {/* SEARCH */}
            <div className="flex items-center gap-2 bg-white border px-3 py-2 rounded-md shadow-sm">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="outline-none text-sm text-gray-700"
              />
            </div>

            {/* FILTER */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-white border px-3 py-2 rounded-md text-sm text-gray-700 shadow-sm"
            >
              <option value="all">All</option>
              <option value="site">Site</option>
              <option value="pit">Pit</option>
              <option value="block">Block</option>
            </select>

            {/* THRESHOLD */}
            <button
              onClick={handleShowClaimSettings}
              className="flex items-center gap-2 px-3 py-2 text-blue-900 hover:text-blue-800 cursor-pointer text-sm"
            >
              <ArrowDownOnSquareStackIcon className="w-4 h-4" />
              Show Table Threshold
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoSetup}
              className="flex items-center gap-2 px-4 py-2 cursor-pointer  hover:bg-yellow-300/20 rounded-md border border-yellow-500/40 bg-yellow-500/20 text-yellow-900"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Setup Area
            </button>

            <button
              onClick={() => {
                setEditData(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-blue-300/20 rounded-md border border-blue-500/40 bg-blue-500/20 text-blue-900"
            >
              <Cog6ToothIcon className="w-5 h-5" />
              Claim Setting
            </button>
          </div>
        </div>

        {/* THRESHOLD TABLE */}
        {showClaimSettingTable && (
          <div className="mb-6">
            {loadingClaim ? (
              <div className="p-4 bg-white rounded shadow text-sm text-gray-500">
                Loading Threshold...
              </div>
            ) : (
              <ClaimSettingsTable
                data={claimLimits}
                onClose={() => setShowClaimSettingTable(false)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleSuccess={(msg) => showToast(msg, "success")}
                onToggleError={(msg) => showToast(msg, "error")}
              />
            )}
          </div>
        )}

        <div className="overflow-x-auto rounded shadow-sm border border-gray-200 space-y-4 bg-white p-4">
          {/* Tombol toggle Map/Table Mode */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setShowMapMode(!showMapMode)}
              className="flex items-center gap-1 text-sm font-semibold text-blue-900 cursor-pointer hover:text-blue-800"
            >
              {showMapMode ? (
                <>
                  <TableCellsIcon className="w-4 h-4" />
                  Table Mode
                </>
              ) : (
                <>
                  <MapIcon className="w-4 h-4" />
                  Map Mode
                </>
              )}
            </button>
          </div>

          {showMapMode ? (
            <div className="flex gap-4 h-[67vh] overflow-hidden">
              {/* LEFT: Data List */}
              <div className="w-2/4 ">
                <DataList sites={filteredSites} />
              </div>

              {/* RIGHT: Map */}
              <div className="w-3/4 mt-4">
                <MapView key={filteredSites.length} sites={filteredSites} />
              </div>
            </div>
          ) : (
             <div className="h-[67vh]">
            <SitePitBlockTable
              sites={filteredSites}
              pits={filteredPits}
              blocks={filteredBlocks}
              expandedSites={expandedSites}
              expandedPits={expandedPits}
              setExpandedSites={setExpandedSites}
              setExpandedPits={setExpandedPits}
              onToggleMapMode={() => setShowMapMode(true)}
              onDeleteSite={handleDeleteSite}
              onDeletePit={handleDeletePit}
              onDeleteBlock={handleDeleteBlock}
            />
            </div>
          )}
        </div>

        {/* MODAL */}
<ClaimSettingsModal
  open={showModal}
  editData={editData}
  onClose={() => {
    setShowModal(false);
    setEditData(null);
  }}
  onSave={(updated: Threshold) => {
    setClaimLimits((prev) => {
      const exists = prev.find((t) => t.id === updated.id);
      return exists
        ? prev.map((t) => (t.id === updated.id ? updated : t))
        : [...prev, updated];
    });

    showToast(
      editData
        ? "Threshold berhasil diperbarui"
        : "Threshold berhasil ditambahkan",
      "success"
    );

    setShowModal(false);
    setEditData(null);
  }}
  onError={() => {
    showToast("Gagal menyimpan threshold", "error");
  }}
/>

      </div>
      {showDeleteModal && (
        <ConfirmModal
          title={`Delete ${deleteTarget?.type}?`}
          description="Data yang dihapus tidak bisa dikembalikan"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
