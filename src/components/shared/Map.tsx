"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface MapProps {
  lat?: number;
  lng?: number;
  location?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Map: React.FC<MapProps> = ({ lat, lng, location = "", className, style }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // guard if lat/lng not provided
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      // show empty container until coords available
      return;
    }

    // create map once
    if (!mapInstance.current) {
      // ensure the container doesn't stack above header
      mapRef.current.style.position = mapRef.current.style.position || 'relative';
      mapRef.current.style.zIndex = mapRef.current.style.zIndex || '0';

  mapInstance.current = L.map(mapRef.current).setView([lat, lng], 13);

      // Lower the z-index of leaflet panes so they don't overlap sticky headers
      try {
        const panes = mapInstance.current.getPanes();
        Object.values(panes).forEach((p: any) => {
          try { if (p && p.style) p.style.zIndex = '0'; } catch (e) { /* ignore */ }
        });
      } catch (e) {
        // ignore
      }

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance.current);

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInstance.current).bindPopup(location) as L.Marker;
      markerRef.current.openPopup();
      return;
    }

    // update map view and marker when props change
    try {
      mapInstance.current.setView([lat, lng], mapInstance.current.getZoom());
    } catch (e) {
      // ignore
    }

    // remove previous marker if exists
    if (markerRef.current && mapInstance.current) {
      try {
        mapInstance.current.removeLayer(markerRef.current);
      } catch (e) {
        // ignore
      }
      markerRef.current = null;
    }

    const icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    if (mapInstance.current) {
      markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInstance.current).bindPopup(location) as L.Marker;
      markerRef.current.openPopup();
    }
  }, [lat, lng, location]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ height: "200px", width: "100%", borderRadius: 8, ...(style || {}) }}
    />
  );
};

export default Map;
