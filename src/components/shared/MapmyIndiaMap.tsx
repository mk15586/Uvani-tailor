"use client";

import { useEffect, useRef, useState } from "react";

interface MapmyIndiaMapProps {
  lat?: number;
  lng?: number;
  location?: string;
  className?: string;
  style?: React.CSSProperties;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

// Add MapmyIndia types
declare global {
  interface Window {
    mappls?: any;
  }
}

// Get API key from environment variable
const MAPMYINDIA_API_KEY = process.env.NEXT_PUBLIC_MAPMYINDIA_API_KEY || '';

const MapmyIndiaMap: React.FC<MapmyIndiaMapProps> = ({ 
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!MAPMYINDIA_API_KEY) {
      setError('MapmyIndia API key not configured. Please add NEXT_PUBLIC_MAPMYINDIA_API_KEY to your .env.local file.');
      setIsLoading(false);
      return;
    }

    // Load MapmyIndia script
    const loadMapmyIndiaScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script already loaded
        if (window.mappls) {
          resolve(window.mappls);
          return;
        }

        // Add MapmyIndia CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://apis.mappls.com/advancedmaps/api/v1.0/css/mappls-map.min.css';
        document.head.appendChild(cssLink);

        // Add MapmyIndia Script
        const script = document.createElement('script');
        script.src = `https://apis.mappls.com/advancedmaps/api/${MAPMYINDIA_API_KEY}/map_sdk?layer=vector&v=3.0&callback=initMap1`;
        script.async = true;
        
        // Set up callback
        (window as any).initMap1 = () => {
          if (window.mappls) {
            resolve(window.mappls);
          } else {
            reject(new Error('MapmyIndia failed to load'));
          }
        };

        script.onerror = () => reject(new Error('Failed to load MapmyIndia script. Please check your API key.'));
        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        await loadMapmyIndiaScript();
        
        const defaultLat = lat || 28.6139; // Default to Delhi
        const defaultLng = lng || 77.2090;

        // Initialize MapmyIndia map
        if (!mapInstance.current && window.mappls) {
          const mapProps = {
            center: [defaultLat, defaultLng],
            zoom: 13,
            zoomControl: true,
            hybrid: false,
          };

          mapInstance.current = new window.mappls.Map(mapRef.current, mapProps);

          // Add marker
          if (window.mappls.Marker) {
            markerRef.current = new window.mappls.Marker({
              map: mapInstance.current,
              position: { lat: defaultLat, lng: defaultLng },
              draggable: !!onLocationSelect,
            });

            // Add popup if location text provided
            if (location && window.mappls.InfoWindow) {
              const infoWindow = new window.mappls.InfoWindow({
                content: location,
                position: { lat: defaultLat, lng: defaultLng },
                map: mapInstance.current,
              });
            }

            // Handle marker drag if callback provided
            if (onLocationSelect && markerRef.current) {
              markerRef.current.addListener('dragend', async (e: any) => {
                const position = markerRef.current.getPosition();
                const newLat = position.lat();
                const newLng = position.lng();
                
                // Reverse geocode to get address
                try {
                  const response = await fetch(
                    `https://apis.mappls.com/advancedmaps/v1/${MAPMYINDIA_API_KEY}/rev_geocode?lat=${newLat}&lng=${newLng}`
                  );
                  const data = await response.json();
                  const address = data?.results?.[0]?.formatted_address || `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`;
                  onLocationSelect(newLat, newLng, address);
                } catch (err) {
                  console.error('Reverse geocoding error:', err);
                  onLocationSelect(newLat, newLng, `${newLat.toFixed(4)}, ${newLng.toFixed(4)}`);
                }
              });
            }
          }
        } else if (mapInstance.current && lat && lng) {
          // Update existing map
          mapInstance.current.setCenter({ lat, lng });
          
          if (markerRef.current) {
            markerRef.current.setPosition({ lat, lng });
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('MapmyIndia initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map. Please check your internet connection.');
        setIsLoading(false);
      }
    };

    initializeMap();

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
  }, [lat, lng, location, onLocationSelect]);

  if (error) {
    return (
      <div
        className={className}
        style={{ 
          height: "200px", 
          width: "100%", 
          borderRadius: 8, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fee',
          color: '#c33',
          padding: '20px',
          textAlign: 'center',
          fontSize: '14px',
          ...(style || {}) 
        }}
      >
        <div>
          <strong>Map Error</strong>
          <br />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', ...(style || {}) }}>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px'
            }} />
            <div>Loading map...</div>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className={className}
        style={{ height: "200px", width: "100%", borderRadius: 8, ...(style || {}) }}
      />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MapmyIndiaMap;
