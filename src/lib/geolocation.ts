/**
 * Geolocation utility functions for getting user location
 */

export interface GeolocationResult {
  success: boolean;
  lat?: number;
  lng?: number;
  error?: string;
  accuracy?: number;
}

export interface ReverseGeocodeResult {
  success: boolean;
  address?: string;
  error?: string;
  details?: {
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    road?: string;
  };
}

/**
 * Get user's current location using browser Geolocation API
 * @param options Geolocation options
 * @returns Promise with location data or error
 */
export const getCurrentLocation = (
  options?: PositionOptions
): Promise<GeolocationResult> => {
  return new Promise((resolve) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: "Geolocation is not supported by your browser",
      });
      return;
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please check your device settings.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }

        resolve({
          success: false,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    );
  });
};

/**
 * Reverse geocode coordinates to get address using Nominatim (OpenStreetMap)
 * @param lat Latitude
 * @param lng Longitude
 * @returns Promise with address data or error
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> => {
  try {
    // Validate coordinates
    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return {
        success: false,
        error: "Invalid coordinates provided",
      };
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "Uvani Tailor App", // Required by Nominatim usage policy
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error,
      };
    }

    const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    
    return {
      success: true,
      address,
      details: {
        city: data.address?.city || data.address?.town || data.address?.village,
        state: data.address?.state,
        country: data.address?.country,
        postcode: data.address?.postcode,
        road: data.address?.road,
      },
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get address",
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, // Fallback to coordinates
    };
  }
};

/**
 * Forward geocode an address to get coordinates using Nominatim
 * @param address Address string to search
 * @returns Promise with coordinates or error
 */
export const forwardGeocode = async (
  address: string
): Promise<GeolocationResult & { address?: string }> => {
  try {
    if (!address || address.trim().length === 0) {
      return {
        success: false,
        error: "Address cannot be empty",
      };
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "Uvani Tailor App",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return {
        success: false,
        error: "Address not found. Please try a different search.",
      };
    }

    const result = data[0];
    
    return {
      success: true,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    };
  } catch (error) {
    console.error("Forward geocoding error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to find address",
    };
  }
};

/**
 * Calculate distance between two coordinates in kilometers
 * @param lat1 First latitude
 * @param lng1 First longitude
 * @param lat2 Second latitude
 * @param lng2 Second longitude
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};
