# Jansevak ward 26 - Mobile App Store Deployment Guide

## 🎯 Overview
This guide will help you deploy **Jansevak ward 26** to Google Play Store (Android) and Apple App Store (iOS).

---

## ✅ What's Already Configured

Your app is now a **Progressive Web App (PWA)** with:
- ✅ App manifest (`manifest.json`) with proper branding
- ✅ Service Worker (`sw.js`) for offline functionality
- ✅ App icons (192x192 and 512x512)
- ✅ Installable on mobile devices via browser
- ✅ Optimized metadata and SEO

---

## 📱 Option 1: Deploy as Native App using Capacitor (Recommended)

**Capacitor** by Ionic wraps your PWA into native Android and iOS apps.

### Step 1: Install Capacitor

```bash
# In your project directory /app
npm install @capacitor/core @capacitor/cli
npx cap init "Jansevak ward 26" "com.kdmc.jansevak.ward26"

# Add platforms
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

### Step 2: Build your Next.js app

```bash
npm run build
npx cap sync
```

### Step 3: Open in Android Studio / Xcode

**For Android:**
```bash
npx cap open android
```
- In Android Studio, sign your app with a keystore
- Build APK/AAB for Play Store submission
- Upload to Google Play Console

**For iOS:**
```bash
npx cap open ios
```
- In Xcode, configure signing certificates
- Build for App Store
- Upload to App Store Connect via Xcode

---

## 📱 Option 2: Use PWABuilder (Easiest)

**PWABuilder** automatically generates store-ready packages.

### Steps:

1. **Deploy your app to a live URL** (Vercel, Netlify, or your own server)
   - Your app must be accessible via HTTPS
   
2. **Visit PWABuilder**
   - Go to: https://www.pwabuilder.com/
   - Enter your app URL: `https://your-domain.com`
   - Click "Start"

3. **Generate Packages**
   - PWABuilder will analyze your PWA
   - Click "Package for Stores"
   - Download Android Package (for Play Store)
   - Download iOS Package (for App Store)

4. **Submit to Stores**
   - **Google Play Store**: Upload the Android package to Play Console
   - **Apple App Store**: Upload the iOS package to App Store Connect

---

## 📱 Option 3: Trusted Web Activity (TWA) for Android Only

Google's **TWA (Trusted Web Activity)** allows you to publish your PWA directly to Play Store without Capacitor.

### Tool: Bubblewrap

```bash
npm install -g @bubblewrap/cli

# Initialize TWA
bubblewrap init --manifest https://your-domain.com/manifest.json

# Build APK
bubblewrap build

# Generate signing key
keytool -genkey -v -keystore jansevak-release-key.keystore -alias jansevak -keyalg RSA -keysize 2048 -validity 10000

# Sign and build
bubblewrap build --signing-keystore jansevak-release-key.keystore
```

Upload the generated `.aab` file to Google Play Console.

---

## 🚀 Quick Deployment Checklist

### Before Submitting to Stores:

- [ ] **Deploy to production URL** (HTTPS required)
  - Recommended: Vercel (free), Netlify, or Railway
  - Connect your Supabase database to production

- [ ] **Test PWA Installation**
  - Visit your site on mobile Chrome/Safari
  - Check if "Add to Home Screen" prompt appears
  - Install and test offline functionality

- [ ] **Prepare Store Assets**
  - App screenshots (mobile + desktop)
  - App description (already in manifest)
  - Privacy policy URL (required by both stores)
  - Category: Government / Utilities

- [ ] **Play Store Requirements**
  - Developer account ($25 one-time fee)
  - Privacy policy page
  - App content rating
  - Target API level 34+ (Android 14)

- [ ] **App Store Requirements**
  - Apple Developer account ($99/year)
  - Privacy policy page
  - App review guidelines compliance
  - Certificates and provisioning profiles

---

## 🌐 Recommended Hosting for Production

### Option A: Vercel (Easiest for Next.js)
1. Create account at https://vercel.com
2. Import your GitHub repository
3. Add environment variables (NEXT_PUBLIC_SUPABASE_URL, etc.)
4. Deploy - you'll get a URL like: `https://jansevak-ward26.vercel.app`

### Option B: Netlify
Similar to Vercel, excellent for Next.js apps.

### Option C: Your Own Server
- Deploy on Railway, DigitalOcean, or AWS
- Ensure HTTPS is configured
- Point a custom domain: `jansevakward26.com`

---

## 📞 Support & Next Steps

### After Production Deployment:

1. **Update Supabase Settings**
   - Add production URL to Supabase allowed origins
   - Update authentication redirect URLs

2. **Test All Features**
   - User registration and login
   - Complaint submission with AI categorization
   - Janasevak notice board
   - Admin panel (desktop only)

3. **App Store Submission Timeline**
   - **Google Play Store**: 1-3 days review
   - **Apple App Store**: 1-2 weeks review

---

## 🎉 Current PWA Capabilities

Your app is **already installable** on mobile devices:

**Android (Chrome):**
- Visit the app → Tap 3 dots → "Add to Home Screen"

**iOS (Safari):**
- Visit the app → Tap Share button → "Add to Home Screen"

**Desktop (Chrome/Edge):**
- Click install icon in address bar

---

## 📄 Additional Resources

- Capacitor Docs: https://capacitorjs.com/docs
- PWABuilder: https://www.pwabuilder.com/
- Google Play Console: https://play.google.com/console
- Apple App Store Connect: https://appstoreconnect.apple.com/
- Bubblewrap (TWA): https://github.com/GoogleChromeLabs/bubblewrap

---

**Need Help?** Contact your development team or refer to the platform-specific documentation above.

**App Name**: Jansevak ward 26
**Package ID**: com.kdmc.jansevak.ward26 (suggested)
**Current Status**: PWA Ready ✅ | Store Submission Pending ⏳
