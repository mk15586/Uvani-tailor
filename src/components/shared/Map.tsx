"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Dynamically import leaflet to avoid SSR issues
const loadLeaflet = async () => {
  if (typeof window === "undefined") return null;
  
  const L = await import("leaflet");
  
  // Import CSS dynamically
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
  
  // Fix default marker icon issue with webpack
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
  
  return L;
};

interface MapProps {
  lat?: number;
  lng?: number;
  location?: string;
  className?: string;
  style?: React.CSSProperties;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

const MapComponent: React.FC<MapProps> = ({ 
  lat, 
  lng, 
  location = "", 
  className, 
  style,
  onLocationSelect 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        const L = await loadLeaflet();
        if (!L || !mapRef.current) return;

        const defaultLat = lat || 28.6139; // Default to Delhi
        const defaultLng = lng || 77.2090;

        // Guard: check if lat/lng are valid numbers
        if (typeof defaultLat !== 'number' || typeof defaultLng !== 'number' || 
            isNaN(defaultLat) || isNaN(defaultLng)) {
          console.error('Invalid coordinates provided to Map component');
          return;
        }

        // Remove existing map instance if any
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }

        // Clear the container's _leaflet_id to allow re-initialization
        if (mapRef.current) {
          (mapRef.current as any)._leaflet_id = undefined;
        }

        // Initialize map
        mapInstance.current = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView([defaultLat, defaultLng], 13);

        // Add OpenStreetMap tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstance.current);

        // Add marker
        markerRef.current = L.marker([defaultLat, defaultLng], {
          draggable: !!onLocationSelect,
        }).addTo(mapInstance.current);

        // Add popup if location provided
        if (location) {
          markerRef.current.bindPopup(location).openPopup();
        }

        // Handle marker drag for location selection
        if (onLocationSelect && markerRef.current) {
          markerRef.current.on('dragend', async (e: any) => {
            const position = e.target.getLatLng();
            const newLat = position.lat;
            const newLng = position.lng;
            
            // Reverse geocode using Nominatim (OpenStreetMap)
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&zoom=18&addressdetails=1`,
                {
                  headers: {
                    'Accept-Language': 'en',
                  }
                }
              );
              const data = await response.json();
              const address = data?.display_name || `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`;
              onLocationSelect(newLat, newLng, address);
              
              // Update popup
              markerRef.current.bindPopup(address).openPopup();
            } catch (err) {
              console.error('Reverse geocoding error:', err);
              const fallbackAddress = `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`;
              onLocationSelect(newLat, newLng, fallbackAddress);
            }
          });
        }

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
          mapInstance.current = null;
        } catch (err) {
          console.error('Error removing map:', err);
        }
      }
    };
  }, []);

  // Update map when coordinates change
  useEffect(() => {
    if (!mapInstance.current || !markerRef.current) return;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;
    if (isNaN(lat) || isNaN(lng)) return;

    const updateMap = async () => {
      try {
        // Update map center
        mapInstance.current.setView([lat, lng], mapInstance.current.getZoom());
        
        // Update marker position
        markerRef.current.setLatLng([lat, lng]);
        
        // Update popup if location provided
        if (location) {
          markerRef.current.bindPopup(location).openPopup();
        }
      } catch (error) {
        console.error('Error updating map:', error);
      }
    };

    updateMap();
  }, [lat, lng, location]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ 
        height: "200px", 
        width: "100%", 
        borderRadius: 8, 
        position: 'relative',
        zIndex: 0,
        ...(style || {}) 
      }}
    />
  );
};

// Export with dynamic loading to prevent SSR issues
const Map = dynamic(() => Promise.resolve(MapComponent), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "200px",
        width: "100%",
        borderRadius: 8,
        backgroundColor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#666",
      }}
    >
      Loading map...
    </div>
  ),
});

export default Map;
