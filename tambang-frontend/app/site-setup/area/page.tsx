"use client";

import { useState, useEffect } from "react";
import { MapPinIcon, Squares2X2Icon, CubeIcon } from "@heroicons/react/24/solid";
import SiteForm from "../../components/site-setup/SiteForm";
import PitForm from "../../components/site-setup/PitForm";
import BlockForm from "../../components/site-setup/BlockForm";
import { getSites } from "../../../lib/api/sites";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import { usePageTitle } from "../../../context/PageTitleContext";

export default function SiteSetupTabs() {
  const { setTitle } = usePageTitle();
  const [active, setActive] = useState("site");
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [selectedSite, setSelectedSite] = useState<any | null>(null);

  useEffect(() => {
     setTitle("Site Setup Form"); 
    const fetchSites = async () => {
      try {
        const data = await getSites();
        setSites(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, []);

  const tabs = [
    { key: "site", label: "Site", icon: MapPinIcon },
    { key: "pit", label: "Pit", icon: Squares2X2Icon },
    { key: "block", label: "Block", icon: CubeIcon },
  ];

  useEffect(() => {
    if (!loading && sites.length > 0 && !selectedSite) {
      setSelectedSite(sites[0]);
    }
  }, [loading, sites]);

  return (
    <div className="p-6 w-full bg-gray-100 min-h-screen overflow-hidden">
      <div className="mt-12 w-full bg-white p-4 rounded overflow-x-hidden overflow-y-hidden">
        {/* TABS HEADER */}
        <div className="flex items-center mb-3">
          {/* BACK BUTTON */}
          <button
            onClick={() => router.back()}
            className="
              flex items-center justify-center cursor-pointer
              w-12 h-12
              rounded-md border border-gray-200
              bg-gray-50 text-gray-600
              hover:bg-blue-500/20 hover:text-blue-800
              transition shadow-sm
            "
            title="Back"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>

          {/* SPACER */}
          <div className="flex-1 flex justify-center ">
            {/* TABS WRAPPER */}
            <div className="inline-flex flex-wrap justify-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-1 shadow-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = active === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActive(tab.key)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-md
                      text-sm font-semibold transition-all duration-200
                      border
                      ${isActive
                        ? "bg-blue-500/20 text-blue-900 border-blue-500/40 shadow-md"
                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-500/20 hover:text-blue-800 shadow-md"
                      }
                      cursor-pointer
                    `}
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
          {active === "site" && <SiteForm />}
          {active === "pit" && !loading && (
            <PitForm sites={sites.map(site => ({ ...site, id: Number(site.id) }))} />
          )}
          {active === "block" && !loading && selectedSite && (
            <BlockForm siteId={Number(selectedSite.id)} />
          )}
        </div>
      </div>
    </div>
  );
}
