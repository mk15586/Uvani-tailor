# 🚀 Quick Start: MapmyIndia Setup (5 Minutes)

## Step 1: Get Your API Key (2 minutes)

1. Go to **[https://apis.mappls.com/](https://apis.mappls.com/)**
2. Click **Sign Up** (or **Login** if you have an account)
3. Fill in basic details and verify email
4. In dashboard, click **"Create New Project"**
5. Enable **Map SDK** and **Reverse Geocoding**
6. Copy your **API Key** (looks like: `abc123xyz456def789...`)

## Step 2: Add to Your Project (1 minute)

1. Create a file named `.env.local` in your project root (if it doesn't exist)
2. Add this line:

```bash
NEXT_PUBLIC_MAPMYINDIA_API_KEY=paste_your_key_here
```

Replace `paste_your_key_here` with your actual API key.

## Step 3: Restart Dev Server (30 seconds)

Stop your current server (Ctrl+C) and restart:

```bash
npm run dev
```

## Step 4: Test It! (30 seconds)

Open your app and navigate to any page with a map:
- Settings page (location section)
- Orders page (if it shows maps)

You should see a MapmyIndia map instead of the old OpenStreetMap!

## ✅ Verification

Your map should:
- ✅ Load without errors
- ✅ Show a marker
- ✅ Be interactive (zoom, pan, drag)
- ✅ Display Indian locations accurately

## ❌ Troubleshooting

**Map shows "API key not configured"?**
- Check `.env.local` file exists in project root
- Variable name is exactly `NEXT_PUBLIC_MAPMYINDIA_API_KEY`
- Restart your dev server

**Map doesn't load at all?**
- Check browser console for errors
- Verify API key is correct (no extra spaces)
- Check internet connection

## 🎉 That's It!

Your maps are now powered by MapmyIndia!

**Need more details?** Read `MAPMYINDIA_SETUP.md` for complete documentation.

**Need help?** Check `MIGRATION_SUMMARY.md` for troubleshooting guide.
