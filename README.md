# Eravauly Vintage 👕✨

A beautiful, mobile-first **Vintage Clothing Inventory Management System** designed for Fleek sellers. Track your sourcing, listings, sales, and profits with a modern PWA that works offline!

![Eravauly Vintage](https://img.shields.io/badge/Eravauly-Vintage-amber)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-green)

## ✨ Features

### 📱 Mobile-First PWA
- **Installable** on iOS & Android as a native-like app
- **Works offline** - data stored locally
- **Responsive design** - perfect for checking inventory on the go

### 📦 Inventory Management
- Full CRUD operations for vintage items
- Categories: Jeans, Polo Shirts, Hoodies, Jackets, Tees, Knits, Others
- Status tracking: Sourced → Active on Fleek → Sold → Shipped
- Condition grades: Deadstock, Excellent, Gently Used, Thrifted
- Track sourcing costs, selling prices, and profit margins
- Add Fleek listing links and notes

### 📊 Dashboard & Analytics
- Quick stats: Total Items, Active Listings, Total Sold, Investment, Revenue, Profit
- Sales trend charts
- Category breakdown visualization
- Condition analysis
- Recent activity feed

### 🎨 Beautiful UI
- Clean, modern design with warm amber/orange theme
- Shadcn-inspired components
- Smooth animations and transitions
- Skeleton loading states
- Mobile-optimized tables and cards

## 🚀 Quick Start

### Run Locally

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/eravauly-vintage.git
cd eravauly-vintage

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Deploy! (no environment variables needed)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📲 Install as App

### iOS (iPhone/iPad)
1. Open the app in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**

### Android
1. Open the app in Chrome
2. Tap the **menu** (three dots)
3. Tap **"Install app"** or **"Add to Home screen"**
4. Follow the prompts

## 📁 Project Structure

```
eravauly-vintage/
├── public/
│   ├── icons/           # PWA icons
│   ├── manifest.json    # PWA manifest
│   ├── sw.js           # Service worker
│   └── offline.html    # Offline fallback
├── src/
│   ├── app/            # Next.js app router
│   │   ├── (dashboard)/ # Protected dashboard routes
│   │   ├── login/      # Login page
│   │   └── signup/     # Signup page
│   ├── components/     # React components
│   │   ├── ui/         # Base UI components
│   │   ├── dashboard/  # Dashboard components
│   │   └── inventory/  # Inventory components
│   └── lib/            # Utilities
│       ├── local-storage.ts  # Data persistence
│       └── utils.ts    # Helper functions
```

## 🗄️ Data Storage

Currently uses **localStorage** for data persistence. This means:
- ✅ Works completely offline
- ✅ No backend setup required
- ✅ Data stays on your device
- ⚠️ Data is browser/device specific
- ⚠️ Clearing browser data will delete inventory

### Export Your Data
Go to **Settings → Export to CSV** to download a backup of your inventory.

## 🔧 Customization

### Change Store Name
Edit the branding in:
- `src/components/dashboard/dashboard-shell.tsx`
- `public/manifest.json`
- `src/app/layout.tsx`

### Add Categories
Edit `src/components/inventory/item-form.tsx` and `src/app/(dashboard)/inventory/page.tsx`

## 🛣️ Roadmap

- [ ] Google Sheets sync for cloud backup
- [ ] Multi-device sync
- [ ] Photo uploads for items
- [ ] Barcode/SKU scanning
- [ ] Sales analytics by time period
- [ ] Bulk import from CSV

## 📄 License

MIT License - feel free to use for your vintage business!

---

Built with ❤️ for vintage sellers everywhere

**Eravauly Vintage** - *Track your vintage, grow your business*
