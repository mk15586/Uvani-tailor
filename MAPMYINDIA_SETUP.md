# MapmyIndia Integration Setup Guide

This project now uses **MapmyIndia APIs** (formerly MapmyIndia, now Mappls) instead of Leaflet/OpenStreetMap for maps and location services.

## 🔑 Getting Your API Key

### Step 1: Create MapmyIndia Account
1. Visit [MapmyIndia Maps Portal](https://apis.mappls.com/)
2. Click on **Sign Up** or **Get Started**
3. Fill in your details and create an account
4. Verify your email address

### Step 2: Get API Credentials
1. Log in to your MapmyIndia account
2. Go to **API Console** or **Dashboard**
3. Click on **Create New Project** or **Add Credentials**
4. Select the following APIs:
   - **Map SDK**
   - **Reverse Geocoding API** (for address lookup)
   - **Place Search API** (optional, for location search)
5. Copy your **REST API Key** or **Map SDK Key**

### Step 3: Configure in Your Project

#### Option 1: Using Environment Variables (Recommended)
Create or update `.env.local` file in the root directory:

```env
NEXT_PUBLIC_MAPMYINDIA_API_KEY=your_api_key_here
```

Then update `MapmyIndiaMap.tsx`:

```typescript
// Replace YOUR_API_KEY with environment variable
const API_KEY = process.env.NEXT_PUBLIC_MAPMYINDIA_API_KEY;
```

#### Option 2: Direct Configuration
Open `src/components/shared/MapmyIndiaMap.tsx` and replace `YOUR_API_KEY` with your actual API key:

```typescript
// Line ~100 - Update the reverse geocode URL
const response = await fetch(
  `https://apis.mappls.com/advancedmaps/v1/YOUR_API_KEY_HERE/rev_geocode?lat=${newLat}&lng=${newLng}`
);
```

Also add your key to the map initialization if required by MapmyIndia.

## 📦 Features

### Current Implementation
- ✅ Map display with markers
- ✅ Custom location pinning
- ✅ Draggable markers (when `onLocationSelect` is provided)
- ✅ Reverse geocoding (coordinates to address)
- ✅ Default location (Delhi, India)

### Usage Examples

#### Basic Map Display
```tsx
import Map from "@/components/shared/Map";

<Map lat={28.6139} lng={77.2090} location="New Delhi, India" />
```

#### Interactive Map with Location Selection
```tsx
import Map from "@/components/shared/Map";

const handleLocationSelect = (lat: number, lng: number, address: string) => {
  console.log(`Selected: ${address} at ${lat}, ${lng}`);
  // Update your state or form
};

<Map 
  lat={28.6139} 
  lng={77.2090} 
  location="Drag to select location"
  onLocationSelect={handleLocationSelect}
/>
```

## 🛠️ Migration from Leaflet

### What Changed
- ❌ Removed: `leaflet` and `react-leaflet` packages
- ❌ Removed: OpenStreetMap tile layers
- ✅ Added: MapmyIndia SDK integration
- ✅ Added: Native reverse geocoding support

### Optional: Clean Up Old Dependencies
You can remove Leaflet packages if not used elsewhere:

```bash
npm uninstall leaflet react-leaflet @types/leaflet
```

Or keep them if you need backward compatibility.

## 🌍 MapmyIndia API Features Available

### 1. Reverse Geocoding
Convert coordinates to addresses:
```javascript
GET https://apis.mappls.com/advancedmaps/v1/{API_KEY}/rev_geocode?lat={lat}&lng={lng}
```

### 2. Forward Geocoding (Place Search)
Search for places by name:
```javascript
GET https://apis.mappls.com/advancedmaps/v1/{API_KEY}/geocode?address={query}
```

### 3. Nearby Search
Find nearby places (restaurants, ATMs, etc.):
```javascript
GET https://apis.mappls.com/advancedmaps/v1/{API_KEY}/nearby?lat={lat}&lng={lng}&keywords={keyword}
```

### 4. Route Planning
Get directions between two points:
```javascript
GET https://apis.mappls.com/advancedmaps/v1/{API_KEY}/route?start={lat1},{lng1}&end={lat2},{lng2}
```

## 🔧 Troubleshooting

### Map not loading?
1. Check if your API key is correct
2. Verify your API key has Map SDK enabled
3. Check browser console for errors
4. Ensure you're not exceeding API rate limits

### Marker not showing?
1. Verify lat/lng values are valid numbers
2. Check if coordinates are within India (MapmyIndia works best in India)
3. Ensure the map container has proper dimensions

### Reverse geocoding not working?
1. Confirm Reverse Geocoding API is enabled in your MapmyIndia account
2. Check if you've replaced `YOUR_API_KEY` with actual key
3. Verify you haven't exceeded API quotas

## 📚 Additional Resources

- [MapmyIndia Documentation](https://docs.mappls.com/)
- [MapmyIndia API Console](https://apis.mappls.com/console/)
- [MapmyIndia GitHub Examples](https://github.com/mappls-api)
- [Pricing & Plans](https://apis.mappls.com/pricing)

## 💡 Tips

1. **Free Tier**: MapmyIndia offers a free tier with limited requests per month
2. **Caching**: Consider caching reverse geocoding results to reduce API calls
3. **India Focus**: MapmyIndia provides the best coverage for Indian locations
4. **Support**: MapmyIndia provides excellent support for Indian addresses and landmarks

## 🔐 Security Note

⚠️ **Never commit your API key to version control!**

Add `.env.local` to your `.gitignore`:
```
.env.local
.env*.local
```

For production, set environment variables in your hosting platform (Vercel, Netlify, etc.).
