import { Site, Pit, Block, Coordinate } from "../site-setup/SitePitBlockTable";
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, MapPinIcon, CubeIcon, MapIcon } from "@heroicons/react/24/outline";

interface DataListProps {
  sites: Site[];
}

export default function DataList({ sites }: DataListProps) {
  const [expandedSites, setExpandedSites] = useState<number[]>([]);
  const [expandedPits, setExpandedPits] = useState<number[]>([]);

  const toggleSite = (id: number) => {
    setExpandedSites(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const togglePit = (id: number) => {
    setExpandedPits(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatCoords = (coords?: Coordinate[]) =>
    coords?.map(c => `Point ${c.point_order}${c.point_code ? ` (${c.point_code})` : ""}: ${c.easting} / ${c.northing}`) || ["-"];

  return (
    <div className="overflow-auto max-h-screen p-4 w-full space-y-4">
      {sites.map(site => (
        <div key={site.id} className="border rounded-lg shadow bg-white p-4 hover:shadow-lg transition">
          
          {/* Header Site */}
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleSite(site.id)}
          >
            <h2 className="font-bold text-lg text-gray-700">
              {site.name} ({site.no_site})
            </h2>
            {expandedSites.includes(site.id) ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-600" />
            )}
          </div>

          {/* Site Info */}
          <div className="mt-2 flex flex-col gap-2 text-gray-600 text-sm">
            <div className="flex items-center gap-1">
              <CubeIcon className="w-4 h-4" /> Volume: {site.luas_m2 ?? 0} m²
            </div>
            <div className="flex items-center gap-1">
              <MapIcon className="w-4 h-4" /> UTM Zone: {site.utm_zone || "-"}
            </div>
            <div className="flex items-start gap-1">
              <MapPinIcon className="w-4 h-4 mt-1" />
              <div>
                <span>Koordinat (Easting / Northing):</span>
                <div className="mt-1 text-gray-600 ml-1">
                  {formatCoords(site.coordinates).map((c, i) => (
                    <div key={i}>{c}</div>
                  ))}
                </div>
              </div>
            </div>
            <div>PIT Count: {site.pit_count ?? site.pits?.length ?? 0}</div>
          </div>

          {/* PIT List */}
          {expandedSites.includes(site.id) &&
            site.pits?.map(pit => (
              <div key={pit.id} className="mt-3 border-l-2 pl-3 ml-2">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => togglePit(pit.id)}
                >
                  <h3 className="font-semibold text-gray-700">
                    {pit.name} ({pit.no_pit})
                  </h3>
                  {expandedPits.includes(pit.id) ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-600" />
                  )}
                </div>

                {expandedPits.includes(pit.id) && (() => {
  const blocks: Block[] = pit.blocks ?? []; // selalu array
  return (
    <div className="mt-2 flex flex-col gap-1 text-gray-600 text-sm">
      <div>Volume PIT: {pit.luas_m2 ?? 0} m²</div>
      <div>Material: {pit.jenis_material || "-"}</div>
      <div>Status: {pit.status_aktif ? "Aktif" : "Tidak Aktif"}</div>
      <div>
        <MapPinIcon className="w-4 h-4 inline-block mr-1" /> Koordinat PIT:
        <div className="ml-5 mt-1">
          {formatCoords(pit.coordinates).map((c, i) => (
            <div key={i}>{c}</div>
          ))}
        </div>
      </div>

      {blocks.length > 0 && (
        <div className="mt-2 border-l-2 pl-2 ml-2 text-xs space-y-1">
          {blocks.map(block => (
            <div key={block.id}>
              <div>
                <b>Block:</b> {block.name} - {block.status || "-"}
              </div>
              <div>Volume: {block.volume ?? 0}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
})()}



                {/* {expandedPits.includes(pit.id) && (
                  <div className="mt-2 flex flex-col gap-1 text-gray-600 text-sm">
                    <div>Volume PIT: {pit.luas_m2 ?? 0} m²</div>
                    <div>Material: {pit.jenis_material || "-"}</div>
                    <div>Status: {pit.status_aktif ? "Aktif" : "Tidak Aktif"}</div>
                    <div>
                      <MapPinIcon className="w-4 h-4 inline-block mr-1" /> Koordinat PIT:
                      <div className="ml-5 mt-1">
                        {formatCoords(pit.coordinates).map((c, i) => (
                          <div key={i}>{c}</div>
                        ))}
                      </div>
                    </div>

                    {(pit.blocks?.length ?? 0) > 0 && (
                      <div className="mt-2 border-l-2 pl-2 ml-2 text-xs space-y-1">
                        {pit.blocks.map(block => (
                          <div key={block.id}>
                            <div>
                              <b>Block:</b> {block.name} - {block.status || "-"}
                            </div>
                            <div>Volume: {block.volume ?? 0}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )} */}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
