"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MapIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { getSites } from "../../../lib/api/sites";
import { getDashboardSummary } from "../../../lib/api/dashboard";
import { Site, Pit, Block } from "../site-setup/SitePitBlockTable";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import router from "next/router";

/* ===== DYNAMIC MAP ===== */
const MapView = dynamic(() => import("../maps/MapView"), {
  ssr: false,
});

/* ===== TYPES ===== */
type UserSummary = {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_role: Record<string, number>;
};

type DashboardSummary = {
  users: {
    total: number;
    active: number;
    inactive: number;
    by_role: Record<string, number>;
  };
  claim: {
    total: number;
    this_month: number;
    this_year: number;
    by_status: Record<string, number>;
    by_site: {
      site_id: number;
      site_name: string;
      total: number;
    }[];
    by_pit: {
      pit_id: number;
      pit_name: string;
      no_pit: string;
      total: number;
    }[];
    by_block: {
      id: number;
      name: string;
      total_claim: number;
      total_bcm: string;
    }[];
    claim_surveyor_info: {
      surveyor_name: string;
    }[];
  };
  production: {
    total_bcm: number;
    bcm_this_month: number;
    avg_bcm_per_claim: number;
  };
};

export default function DashboardOverlay() {
  const [sites, setSites] = useState<Site[]>([]);
  const [pits, setPits] = useState<Pit[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [showClaimDetail, setShowClaimDetail] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [siteData, summaryData] = await Promise.all([
          getSites(),
          getDashboardSummary(),
        ]);

        const pitMap = new Map<string | number, Pit>();
        const blockMap = new Map<string | number, Block>();

        siteData.forEach((site: any) => {
          site.pits?.forEach((pit: any) => {
            pitMap.set(pit.id, { ...pit, site_id: site.id });
            pit.blocks?.forEach((block: any) => {
              blockMap.set(block.id, { ...block, pit });
            });
          });
        });

        setSites(siteData);
        setPits([...pitMap.values()]);
        setBlocks([...blockMap.values()]);
        setSummary(summaryData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();
  }, []);

  const COLORS = ["#1e40af", "#22c55e", "#f97316", "#a855f7"];

  return (
    <>
      {/* ===== MAP BACKGROUND ===== */}
      <div className="absolute inset-0 z-0">
        <MapView sites={sites} hideControls={true} />
      </div>

      {/* ===== OVERLAY PANEL ===== */}
      <div className="absolute top-6 left-4 z-10 space-y-3 mt-8">
        <div className="w-80 bg-white/20 backdrop-blur-md shadow-xl rounded-md p-5 space-y-6">
          {/* ===== USER OVERVIEW ===== */}
          <Section title="User Overview">
            <div className="bg-blue-500/20 rounded-md shadow-md p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <Stat label="Total" value={summary?.users.total} />
                <Stat
                  label="Active"
                  value={summary?.users.active}
                  color="text-green-900"
                />
                <Stat
                  label="Inactive"
                  value={summary?.users.inactive}
                  color="text-red-800"
                />
              </div>
              <div className="border-t" />
              <div className="space-y-1">
                {summary?.users.by_role &&
                  Object.entries(summary.users.by_role).map(([role, count]) => (
                    <div key={role} className="flex justify-between text-sm">
                      <span className="capitalize text-gray-900">{role}</span>
                      <span className="font-semibold text-gray-300">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </Section>
        </div>
        <div className="w-80 bg-white/20 backdrop-blur-md shadow-xl rounded-md p-5">
          <Section title="Site Overview">
            <div className="bg-blue-500/20 rounded-md shadow-md  p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900 text-sm">
                  <MapIcon className="w-4 h-4 text-blue-900" />
                  <span>Total Sites</span>
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {sites.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900 text-sm">
                  <Cog6ToothIcon className="w-4 h-4 text-indigo-800" />
                  <span>Total Pits</span>
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {pits.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900 text-sm">
                  <Cog6ToothIcon className="w-4 h-4 text-purple-800" />
                  <span>Total Blocks</span>
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {blocks.length}
                </span>
              </div>
            </div>
          </Section>
        </div>

        <div className="w-80 bg-white/20 backdrop-blur-md shadow-xl rounded-md p-5">
          {/* ===== TEXT ACTION BUTTONS ===== */}

          <div className="flex items-center justify-between text-sm font-semibold">
            {/* LEFT */}
            <button
              // onClick={() => router.push("#")}
              className="text-blue-800 hover:text-blue-500 hover:underline transition cursor-pointer"
            >
              Maps Detail →
            </button>

            {/* RIGHT */}
            <button
              onClick={() => setShowClaimDetail((v) => !v)}
              className="text-blue-800 hover:text-blue-500 hover:underline transition cursor-pointer"
            >
              Claim Detail →
            </button>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 mt-8">
        <div
          className={`
    absolute top-6 right-4 
    w-80
    transition-transform duration-500 ease-in-out
${showClaimDetail ? "-translate-x-[320px]" : "translate-x-0"}

  `}
        >
          <div className="bg-white/20 backdrop-blur-md shadow-xl rounded-md p-5 space-y-6 h-[85vh]">
            <Section title="Claim Overview">
              <div className="bg-blue-400/20 rounded-md shadow-md  p-4 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <Stat label="Total" value={summary?.claim.total} />
                  <Stat
                    label="Month"
                    value={summary?.claim.this_month}
                    color="text-blue-800"
                  />
                  <Stat
                    label="Year"
                    value={summary?.claim.this_year}
                    color="text-purple-800"
                  />
                </div>

                <div className="border-t" />

                <div className="space-y-1">
                  {summary?.claim.by_status &&
                    Object.entries(summary.claim.by_status).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex justify-between text-sm"
                        >
                          <span className="capitalize text-gray-900">
                            {status}
                          </span>
                          <span className="font-semibold text-gray-300">
                            {count}
                          </span>
                        </div>
                      )
                    )}
                </div>
              </div>

              {/* ===== PIE BY SITE ===== */}
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-900 mb-2">
                  By Site
                </p>

                <div className="flex gap-3">
                  <div className="w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary?.claim.by_site}
                          dataKey="total"
                          nameKey="site_name"
                          innerRadius={45}
                          outerRadius={65}
                        >
                          {summary?.claim.by_site.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex-1 space-y-1">
                    {summary?.claim.by_site.map((site, i) => (
                      <div
                        key={site.site_id}
                        className="flex justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                          <span className="text-gray-900">
                            {site.site_name}
                          </span>
                        </div>
                        <span className="font-semibold">{site.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t pt-3 space-y-1">
                <p className="text-xs font-semibold text-gray-900">By PIT</p>

                <div
                  className="
                    flex gap-4
                    overflow-x-auto
                    overflow-y-hidden
                    pb-2
                    scrollbar-thin
                    scrollbar-thumb-blue-400/40
                    scrollbar-track-transparent
                  "
                >
                  {summary?.claim.by_pit.map((pit) => (
                    <div
                      key={pit.pit_id}
                      className="
                        min-w-[280px]
                        bg-white/30
                        backdrop-blur-sm
                        rounded-md
                        p-3
                        text-sm
                        shadow
                      "
                    >
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-medium truncate">
                          {pit.pit_name}
                        </span>
                        <span className="font-semibold">
                          {pit.total}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-500 truncate">
                        {pit.no_pit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </Section>
          </div>
        </div>

        <div
          className={`
                absolute top-6 right-0
                w-80
                transition-transform duration-3 ease-in-out
                ${showClaimDetail ? "translate-x-0" : "translate-x-full"}
              `}
        >
          <div className="bg-white/20 backdrop-blur-md shadow-xl rounded-md p-5 space-y-4 h-[65vh]">
            <div className="max-h-80 overflow-y-auto space-y-1 text-sm mb-2">
                <p className="text-xs font-semibold text-gray-900">By Block</p>
  {summary?.claim.by_block.map((block) => (
    <div key={block.id} className="flex justify-between">
      <span className="text-gray-900">{block.name}</span>
      <span className="font-semibold">
        {Number(block.total_bcm).toLocaleString()}
      </span>
    </div>
  ))}
</div>


            {/* ===== PRODUCTION ===== */}
            <div className="bg-blue-400/20 rounded-md shadow-md  p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-900">Total BCM</span>
                <span className="font-bold text-yellow-700 ">
                  {summary?.production.total_bcm.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-900">BCM This Month</span>
                <span className="font-bold text-blue-900">
                  {summary?.production.bcm_this_month.toLocaleString()}
                </span>
              </div>

              <div className="border-t" />

              <div className="flex justify-between text-sm">
                <span className="text-gray-900">Avg / Claim</span>
                <span className="font-bold text-green-900">
                  {summary?.production.avg_bcm_per_claim.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          {/* ===== SURVEYOR CLAIM INFO ===== */}
          <div className="bg-white/20 backdrop-blur-md shadow-xl rounded-md p-5 space-y-4 mt-3">
            <p className="text-xs font-semibold text-gray-900">
              Surveyor Claim
            </p>

            {summary?.claim.claim_surveyor_info?.length ? (
              <div className="bg-blue-400/20 rounded-md shadow-md  p-4 space-y-3">
                {summary.claim.claim_surveyor_info.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-900 truncate">
                      {s.surveyor_name}
                    </span>
                    <span className="text-[11px] text-green-700 font-semibold">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Belum ada surveyor</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== REUSABLE UI ===== */

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <p className="text-sm font-semibold text-gray-200 mb-3">{title}</p>
    <div className="space-y-4">{children}</div>
  </div>
);

const Stat = ({
  label,
  value = 0,
  color = "",
}: {
  label: string;
  value?: number;
  color?: string;
}) => (
  <div>
    <p className="text-xs text-gray-900">{label}</p>
    <p className={`text-2xl font-bold ${color || "text-gray-900"}`}>{value}</p>
  </div>
);

const Item = ({
  label,
  value,
  icon,
  color = "",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs text-gray-900">{label}</p>
      <p className={`text-2xl font-bold ${color || "text-gray-900"}`}>
        {value}
      </p>
    </div>
    <div className="w-6 h-6 text-gray-900">{icon}</div>
  </div>
);
