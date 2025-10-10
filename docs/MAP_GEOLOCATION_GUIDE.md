# 🗺️ Leaflet Map & Geolocation - Complete Guide

## ✅ Features

- ✅ **Interactive Maps** - Zoom, pan, and explore with OpenStreetMap
- ✅ **Geolocation** - Get user's current location with high accuracy
- ✅ **Reverse Geocoding** - Convert coordinates to human-readable addresses
- ✅ **Forward Geocoding** - Search for addresses and get coordinates
- ✅ **Draggable Markers** - Let users select locations by dragging
- ✅ **Distance Calculation** - Calculate distance between two points
- ✅ **Error Handling** - Comprehensive error messages and fallbacks
- ✅ **SSR Compatible** - Works with Next.js server-side rendering
- ✅ **No API Key Required** - Uses free OpenStreetMap services

## 🚀 Quick Start

### Basic Map Display

```tsx
import Map from "@/components/shared/Map";

<Map 
  lat={28.6139} 
  lng={77.2090} 
  location="New Delhi, India" 
/>
```

### Interactive Map with Location Selection

```tsx
import Map from "@/components/shared/Map";

const handleLocationSelect = (lat: number, lng: number, address: string) => {
  console.log(`Selected: ${address} at ${lat}, ${lng}`);
};

<Map 
  lat={28.6139} 
  lng={77.2090} 
  location="Drag marker to select location"
  onLocationSelect={handleLocationSelect}
/>
```

### Get User's Current Location

```tsx
import { getCurrentLocation } from "@/lib/geolocation";

const handleGetLocation = async () => {
  const result = await getCurrentLocation();
  
  if (result.success) {
    console.log(`Location: ${result.lat}, ${result.lng}`);
    console.log(`Accuracy: ${result.accuracy}m`);
  } else {
    console.error(result.error);
  }
};

<button onClick={handleGetLocation}>Get My Location</button>
```

## 📚 API Reference

### Map Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lat` | `number` | No | Latitude (default: 28.6139 - Delhi) |
| `lng` | `number` | No | Longitude (default: 77.2090 - Delhi) |
| `location` | `string` | No | Location name for popup |
| `className` | `string` | No | CSS class for container |
| `style` | `React.CSSProperties` | No | Inline styles |
| `onLocationSelect` | `function` | No | Callback when marker is dragged |

### Geolocation Functions

#### `getCurrentLocation(options?)`

Get user's current location using browser Geolocation API.

```tsx
import { getCurrentLocation } from "@/lib/geolocation";

const result = await getCurrentLocation({
  enableHighAccuracy: true,  // Use GPS if available
  timeout: 10000,            // Wait up to 10 seconds
  maximumAge: 0,             // Don't use cached position
});

if (result.success) {
  console.log(result.lat, result.lng, result.accuracy);
} else {
  console.error(result.error);
}
```

**Returns:**
```typescript
{
  success: boolean;
  lat?: number;
  lng?: number;
  accuracy?: number;  // Accuracy in meters
  error?: string;
}
```

#### `reverseGeocode(lat, lng)`

Convert coordinates to a human-readable address.

```tsx
import { reverseGeocode } from "@/lib/geolocation";

const result = await reverseGeocode(28.6139, 77.2090);

if (result.success) {
  console.log(result.address);
  console.log(result.details); // city, state, country, etc.
} else {
  console.error(result.error);
}
```

**Returns:**
```typescript
{
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
```

#### `forwardGeocode(address)`

Search for an address and get its coordinates.

```tsx
import { forwardGeocode } from "@/lib/geolocation";

const result = await forwardGeocode("Times Square, New York");

if (result.success) {
  console.log(result.lat, result.lng);
  console.log(result.address); // Full formatted address
} else {
  console.error(result.error);
}
```

**Returns:**
```typescript
{
  success: boolean;
  lat?: number;
  lng?: number;
  address?: string;
  error?: string;
}
```

#### `calculateDistance(lat1, lng1, lat2, lng2)`

Calculate distance between two coordinates in kilometers.

```tsx
import { calculateDistance } from "@/lib/geolocation";

const distance = calculateDistance(
  28.6139, 77.2090,  // Delhi
  19.0760, 72.8777   // Mumbai
);

console.log(`Distance: ${distance} km`);
```

## 💡 Complete Example

See the full working example with all features:

```tsx
import MapWithGeolocationExample from "@/components/examples/MapWithGeolocationExample";

<MapWithGeolocationExample />
```

This includes:
- ✅ Current location button
- ✅ Address search
- ✅ Draggable marker
- ✅ Error handling
- ✅ Success messages

## 🔧 Advanced Usage

### Custom Map Height

```tsx
<Map 
  lat={28.6139} 
  lng={77.2090} 
  style={{ height: "500px" }}
/>
```

### Handle Location Selection with State

```tsx
const [selectedLat, setSelectedLat] = useState(28.6139);
const [selectedLng, setSelectedLng] = useState(77.2090);
const [selectedAddress, setSelectedAddress] = useState("");

<Map 
  lat={selectedLat} 
  lng={selectedLng} 
  location={selectedAddress}
  onLocationSelect={(lat, lng, address) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setSelectedAddress(address);
  }}
/>
```

### Combine with Form

```tsx
import { useForm } from "react-hook-form";
import { getCurrentLocation, reverseGeocode } from "@/lib/geolocation";

const form = useForm({
  defaultValues: {
    latitude: 0,
    longitude: 0,
    address: "",
  }
});

const handleUseCurrentLocation = async () => {
  const location = await getCurrentLocation();
  
  if (location.success && location.lat && location.lng) {
    const geocode = await reverseGeocode(location.lat, location.lng);
    
    form.setValue("latitude", location.lat);
    form.setValue("longitude", location.lng);
    form.setValue("address", geocode.address || "");
  }
};

<Map 
  lat={form.watch("latitude")} 
  lng={form.watch("longitude")} 
  location={form.watch("address")}
  onLocationSelect={(lat, lng, address) => {
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
    form.setValue("address", address);
  }}
/>
```

## ⚠️ Error Handling

### Geolocation Permission Denied

```tsx
const result = await getCurrentLocation();

if (!result.success) {
  if (result.error?.includes("permission denied")) {
    alert("Please enable location permissions in your browser settings");
  }
}
```

### Network Errors

```tsx
const geocode = await reverseGeocode(lat, lng);

if (!geocode.success) {
  // Will still return coordinates as fallback
  console.log(geocode.address); // "28.6139, 77.2090"
}
```

### Invalid Coordinates

All functions validate coordinates:
- Latitude: -90 to 90
- Longitude: -180 to 180
- Must be valid numbers (not NaN or undefined)

## 🌍 Nominatim (OpenStreetMap) Usage

The geolocation functions use Nominatim, which is free but has usage limits:

- **Rate Limit**: 1 request per second
- **User-Agent**: Required (automatically set to "Uvani Tailor App")
- **Caching**: Results are not cached - implement your own if needed

### Best Practices

1. **Cache Results**: Store geocoded addresses to avoid repeated requests
2. **Debounce Search**: Wait for user to finish typing before searching
3. **Fallback**: Always provide coordinates as fallback if geocoding fails
4. **Respect Limits**: Don't spam requests - add delays between searches

## 🎨 Styling

### Custom Map Container

```tsx
<Map 
  className="border-2 border-blue-500 shadow-lg"
  style={{ 
    height: "400px",
    borderRadius: "12px",
  }}
/>
```

### Loading State

The map shows a loading message while initializing:

```
Loading map...
```

You can customize this in `Map.tsx` dynamic import options.

## 🐛 Troubleshooting

### Map not showing?

1. Check browser console for errors
2. Ensure `lat` and `lng` are valid numbers
3. Verify internet connection (loads tiles from OpenStreetMap)
4. Check if leaflet CSS is loading

### Geolocation not working?

1. **HTTPS Required**: Geolocation API only works on HTTPS (or localhost)
2. **Permission**: User must grant location permission
3. **Device**: Some devices don't have GPS
4. **Settings**: Location services must be enabled

### Marker not draggable?

Make sure you pass the `onLocationSelect` prop:

```tsx
<Map 
  onLocationSelect={(lat, lng, address) => {
    // This makes marker draggable
  }}
/>
```

### Reverse geocoding slow?

Nominatim can be slow sometimes:
- Consider caching results
- Show a loading indicator
- Provide fallback to coordinates
- Consider upgrading to paid geocoding service for production

## 📦 Dependencies

Required packages (already installed):
- `leaflet`: ^1.9.4
- `react-leaflet`: ^4.2.1 (optional, not used in current implementation)
- `@types/leaflet`: ^1.9.20

## 🔐 Privacy & Security

- **No Tracking**: OpenStreetMap doesn't track users
- **No API Key**: No registration or API key needed
- **User Consent**: Always ask before accessing location
- **HTTPS**: Geolocation API requires secure context

## 📝 License

- **Leaflet**: BSD 2-Clause License
- **OpenStreetMap**: Open Data Commons Open Database License (ODbL)
- **Nominatim**: Must follow Nominatim Usage Policy

---

**Need Help?**

Check the example component: `src/components/examples/MapWithGeolocationExample.tsx`

For more details on Nominatim:
- [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
- [Nominatim API Documentation](https://nominatim.org/release-docs/latest/api/Overview/)
