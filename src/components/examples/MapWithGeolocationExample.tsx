/**
 * Example component showing how to use the Map with geolocation
 * This can be used as reference or directly in your pages
 */

"use client";

import { useState } from "react";
import Map from "@/components/shared/Map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  getCurrentLocation, 
  reverseGeocode, 
  forwardGeocode,
  type GeolocationResult 
} from "@/lib/geolocation";
import { MapPin, Navigation, Search, Loader2 } from "lucide-react";

export default function MapWithGeolocationExample() {
  const [lat, setLat] = useState<number>(28.6139); // Default: Delhi
  const [lng, setLng] = useState<number>(77.2090);
  const [address, setAddress] = useState<string>("New Delhi, India");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get user's current location
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setError(null);
    setSuccess(null);

    try {
      const result: GeolocationResult = await getCurrentLocation();
      
      if (result.success && result.lat && result.lng) {
        setLat(result.lat);
        setLng(result.lng);
        
        // Get address for the location
        const geocodeResult = await reverseGeocode(result.lat, result.lng);
        if (geocodeResult.success && geocodeResult.address) {
          setAddress(geocodeResult.address);
        }
        
        setSuccess(`Location found! Accuracy: ${result.accuracy?.toFixed(0)}m`);
      } else {
        setError(result.error || "Failed to get location");
      }
    } catch (err) {
      setError("An unexpected error occurred while getting your location");
      console.error(err);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Search for an address
  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await forwardGeocode(searchQuery);
      
      if (result.success && result.lat && result.lng) {
        setLat(result.lat);
        setLng(result.lng);
        if (result.address) {
          setAddress(result.address);
        }
        setSuccess("Location found!");
      } else {
        setError(result.error || "Location not found");
      }
    } catch (err) {
      setError("An unexpected error occurred while searching");
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location selection from map (dragging marker)
  const handleLocationSelect = (newLat: number, newLng: number, newAddress: string) => {
    setLat(newLat);
    setLng(newLng);
    setAddress(newAddress);
    setSuccess("Location updated!");
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Map with Geolocation</h2>
        <p className="text-muted-foreground">
          Click "Get My Location" to find your current position, or search for an address.
          You can also drag the marker on the map to select a location.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchAddress} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for an address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search
            </>
          )}
        </Button>
      </form>

      {/* Get Current Location Button */}
      <Button
        onClick={handleGetCurrentLocation}
        disabled={isLoadingLocation}
        variant="outline"
        className="w-full"
      >
        {isLoadingLocation ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Getting your location...
          </>
        ) : (
          <>
            <Navigation className="mr-2 h-4 w-4" />
            Get My Location
          </>
        )}
      </Button>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {/* Map */}
      <div className="border rounded-lg overflow-hidden">
        <Map
          lat={lat}
          lng={lng}
          location={address}
          onLocationSelect={handleLocationSelect}
          style={{ height: "400px" }}
        />
      </div>

      {/* Location Info */}
      <div className="bg-muted p-4 rounded-lg space-y-2">
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Selected Location</p>
            <p className="text-sm text-muted-foreground break-words">{address}</p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Latitude: {lat.toFixed(6)}</p>
          <p>Longitude: {lng.toFixed(6)}</p>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
        <h3 className="font-semibold text-sm">How to use:</h3>
        <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
          <li>Click "Get My Location" to use your device's GPS</li>
          <li>Search for any address in the search bar</li>
          <li>Drag the marker on the map to select a precise location</li>
          <li>Zoom in/out and pan the map to explore</li>
        </ul>
      </div>
    </div>
  );
}
