# 🚀 Deploy Eravauly Vintage to Vercel

## Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it: `eravauly-vintage`
3. Set to **Public** or **Private**
4. Click **Create repository**

## Step 2: Push Code to GitHub

Open terminal in this project folder and run:

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Eravauly Vintage Inventory"

# Add your GitHub repo as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/eravauly-vintage.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your `eravauly-vintage` repository
4. Keep all defaults (no env variables needed!)
5. Click **Deploy**

Your app will be live at: `https://eravauly-vintage.vercel.app`

## Step 4: Install on Phone

Once deployed, open the Vercel URL on your phone and install:

**iPhone:** Safari → Share → Add to Home Screen
**Android:** Chrome → Menu → Install App

---

## 🔄 Future Updates

To update the app after making changes:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy!

---

## ⚠️ Important Security Note

**NEVER share your GitHub Personal Access Tokens publicly!**

If you accidentally shared a token:
1. Go to GitHub → Settings → Developer Settings
2. Personal Access Tokens → Tokens (classic)
3. Delete/Regenerate the compromised token

---

Built with ❤️ by Eravauly Vintage
