# Aurelia Hotel & Resort — Luxury Booking Web Application

A world-class, ultra-luxury hotel and resort web application featuring real-time suite management, Pay-at-Hotel reservations, interactive amenities, fine dining showcase, and a dedicated executive admin portal.

---

## 🚀 One-Click GitHub Deployment (GitHub Pages)

This repository includes a pre-configured GitHub Actions CI/CD workflow located at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g. `aurelia-hotel`).
2. Do **not** initialize it with a README, .gitignore, or license (they are already included).

### Step 2: Push Your Code
Open your terminal in this directory and run:
```bash
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub -> **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
3. That's it! GitHub Actions will automatically build and publish your website.
4. Your live link will be: `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`

---

## 💻 Running Locally

### Prerequisites
- Node.js (version 18, 20, or newer)
- npm

### Quick Start
Double-click `Start-Aurelia-Hotel.bat` or run:
```bash
# 1. Install dependencies
npm install

# 2. Start the local server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
The Executive Admin Portal is available at [http://localhost:3000/admin](http://localhost:3000/admin).
