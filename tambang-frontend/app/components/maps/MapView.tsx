"use client";

import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Site, LatLng } from "../site-setup/SitePitBlockTable";
import Script from "next/script";

// ganti default icon supaya tidak 404
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// helper untuk center polygon/marker
const getCenter = (coords: LatLng[]) => {
  const latSum = coords.reduce((sum, c) => sum + c.lat, 0);
  const lngSum = coords.reduce((sum, c) => sum + c.lng, 0);
  return [latSum / coords.length, lngSum / coords.length] as [number, number];
};

// updater untuk bounds + fullscreen control
const MapBoundsUpdater = ({ sites, hideControls }: { sites: Site[]; hideControls?: boolean }) => {
  const map = useMap();
  const fullscreenAdded = React.useRef(false);

  useEffect(() => {
    if (!sites || sites.length === 0) return;

    const allCoords: LatLng[] = [];
    sites.forEach((site) => {
      if (site.coordinates_latlng) allCoords.push(...site.coordinates_latlng);
      site.pits?.forEach((pit) => {
        if (pit.coordinates_latlng) allCoords.push(...pit.coordinates_latlng);
      });
    });

    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords.map((c) => [c.lat, c.lng]));
      map.flyToBounds(bounds, {
        padding: [200, 200],
        maxZoom: 10,
        animate: true,
        duration: 1.5,
      });
    }

    // fullscreen hanya jika hideControls=false
    if (!hideControls && !fullscreenAdded.current && (L.control as any).fullscreen) {
      (L.control as any).fullscreen({ position: "topright" }).addTo(map);
      fullscreenAdded.current = true;
    }
  }, [sites, map, hideControls]);

  return null;
};



interface MapViewProps {
  sites: Site[];
  hideControls?: boolean; 
}

export default function MapView({ sites, hideControls = false }: MapViewProps) {
  const defaultCenter: [number, number] =
    sites.length && sites[0].coordinates_latlng?.length
      ? [sites[0].coordinates_latlng[0].lat, sites[0].coordinates_latlng[0].lng]
      : [0, 115];

  return (
    <>
      {/* Import Fullscreen via CDN */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/leaflet.fullscreen/Control.FullScreen.min.css"
      />
      <Script src="https://cdn.jsdelivr.net/npm/leaflet.fullscreen/Control.FullScreen.min.js" />

      <MapContainer
        center={defaultCenter}
        zoom={6}
        minZoom={6}
        maxZoom={18}
        style={{ height: "100%", width: "100%" }}
        zoomControl={!hideControls}
      >
        {/* Base layers */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxNativeZoom={18}
        />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.2}
        />
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          maxNativeZoom={18}
          opacity={0.9}
        />

        {/* Polygon Sites */}
        {sites.map(
          (site) =>
            site.coordinates_latlng && (
              <Polygon
                key={`site-${site.id}`}
                positions={site.coordinates_latlng.map((c) => [c.lat, c.lng])}
                pathOptions={{ color: "#2563eb", fillOpacity: 0.3, weight: 2 }}
              >
                <Tooltip sticky>{site.name}</Tooltip>
              </Polygon>
            )
        )}

        {/* Polygon Pits */}
        {sites.map((site) =>
          site.pits?.map(
            (pit) =>
              pit.coordinates_latlng && (
                <Polygon
                  key={`pit-${pit.id}`}
                  positions={pit.coordinates_latlng.map((c) => [c.lat, c.lng])}
                  pathOptions={{ color: "#f59e0b", fillOpacity: 0.4, weight: 2 }}
                >
                  <Tooltip sticky>{pit.name}</Tooltip>
                </Polygon>
              )
          )
        )}

        {/* Marker Sites */}
        {sites.map(
          (site) =>
            site.coordinates_latlng && (
              <Marker
                key={`marker-site-${site.id}`}
                position={getCenter(site.coordinates_latlng)}
              >
                <Popup>
                  <strong>
                    {site.name} ({site.no_site})
                  </strong>
                  <br />
                  PIT Count: {site.pit_count ?? site.pits?.length ?? 0}
                  <br />
                  Volume: {site.luas_m2 ?? 0} m²
                  <br />
                  UTM Zone: {site.utm_zone ?? "-"}
                  <br />
                  Koordinat:
                  <div style={{ maxHeight: 100, overflowY: "auto" }}>
                    {site.coordinates?.map((c, i) => (
                      <div key={i}>
                        Point {c.point_order}: {c.easting} / {c.northing}
                      </div>
                    )) || "-"}
                  </div>
                </Popup>
              </Marker>
            )
        )}

        {/* Marker Pits */}
        {sites.map((site) =>
          site.pits?.map(
            (pit) =>
              pit.coordinates_latlng && (
                <Marker
                  key={`marker-pit-${pit.id}`}
                  position={getCenter(pit.coordinates_latlng)}
                >
                  <Popup>
                    <strong>
                      {pit.name} ({pit.no_pit})
                    </strong>
                    <br />
                    Material: {pit.jenis_material ?? "-"}
                    <br />
                    Status: {pit.status_aktif ? "Aktif" : "Tidak Aktif"}
                    <br />
                    Luas PIT: {pit.luas_m2 ?? 0} m²
                    <br />
                    Koordinat:
                    <div style={{ maxHeight: 80, overflowY: "auto" }}>
                      {pit.coordinates?.map((c, i) => (
                        <div key={i}>
                          Point {c.point_order}: {c.easting} / {c.northing}
                        </div>
                      )) || "-"}
                    </div>
                  </Popup>
                </Marker>
              )
          )
        )}
<MapBoundsUpdater sites={sites} hideControls={hideControls} />

      </MapContainer>
    </>
  );
}
