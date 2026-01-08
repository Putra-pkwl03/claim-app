"use client";

import { useState, useEffect } from "react";
import { MapPinIcon, Squares2X2Icon, CubeIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { usePageTitle } from "../../../context/PageTitleContext";

import SiteForm from "../../components/site-setup/SiteForm";
import PitForm from "../../components/site-setup/PitForm";
import BlockForm from "../../components/site-setup/BlockForm";

export default function EditSiteTabs() {
  const { setTitle } = usePageTitle();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const rawSiteId = params?.id;
  const siteId =
    rawSiteId && !Array.isArray(rawSiteId) ? Number(rawSiteId) :
    Array.isArray(rawSiteId) && rawSiteId[0] ? Number(rawSiteId[0]) :
    null;

  const [active, setActive] = useState("site");

const tab = searchParams?.get("tab");

useEffect(() => {
  setActive(tab ?? "site");
}, [tab]);


  useEffect(() => {
    setTitle("Edit Site Form");
  }, []);

  const tabs = [
    { key: "site", label: "Site", icon: MapPinIcon },
    { key: "pit", label: "Pit", icon: Squares2X2Icon },
    { key: "block", label: "Block", icon: CubeIcon },
  ];

  const switchTab = (tabKey: string) => {
    if (!siteId) return;
    router.replace(`/site-setup/${siteId}?tab=${tabKey}`);
  };

  if (!siteId) return <p className="p-6">Site ID tidak valid.</p>;

  return (
    <div className="p-6 w-full bg-gray-100 min-h-screen overflow-hidden">
      <div className="mt-12 w-full bg-white p-4 rounded overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center mb-3">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-md border bg-gray-50 text-gray-600 hover:bg-blue-500/20 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-5 h-5 mx-auto" />
          </button>

          <div className="flex-1 flex justify-center">
            <div className="inline-flex gap-2 rounded-md border bg-gray-50 p-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = active === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => switchTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border ${
                      isActive
                        ? "bg-blue-500/20 text-blue-900 border-blue-500/40"
                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-500/20"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="animate-fade-in max-h-[486px] overflow-y-auto">
       {active === "site" && <SiteForm siteId={String(siteId)} />}
          {active === "pit" && <PitForm siteId={siteId} />}
          {active === "block" && (
            <BlockForm siteId={siteId} mode="edit" />
          )}
        </div>
      </div>
    </div>
  );
}
