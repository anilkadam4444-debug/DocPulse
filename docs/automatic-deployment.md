# Automatic GitHub-to-Firebase Hosting Deployment Guide

This document details the CI/CD pipeline for **DocPulse India**, automatically building, testing, and deploying the application from GitHub to **Firebase Hosting** on every push to the production branch.

---

## 1. Pipeline Overview

| Parameter | Configuration |
|---|---|
| **Production Branch** | `main` (with fallback support for `master`) |
| **Workflow File** | `.github/workflows/deploy-production.yml` |
| **Preview PR Workflow** | `.github/workflows/deploy-preview.yml` |
| **Runtime Environment** | Node.js 22.x LTS on `ubuntu-latest` |
| **Package Manager** | npm (using `npm ci` with `package-lock.json`) |
| **Verification Checks** | `npm run lint` (`tsc --noEmit`) and `npm test` (`node --test`) |
| **Build Command** | `npm run build` (`vite build`) |
| **Build Artifact Directory** | `dist/` |
| **Firebase Project ID** | `docpulse-ff978` |
| **Hosting Channel** | `live` (Production) |

---

## 2. Authentication Methods: Setup Instructions

The workflow supports two authentication mechanisms. **Option A (Workload Identity Federation)** is the modern, keyless standard. **Option B (Dedicated Service Account Key)** is the fast, turnkey alternative.

---

### Option A: Workload Identity Federation (Recommended — 100% Keyless OIDC)

With Workload Identity Federation, no long-lived service account JSON keys or passwords are stored in GitHub. GitHub Actions uses short-lived OpenID Connect (OIDC) tokens.

#### Step 1: Create a Dedicated Service Account in Google Cloud
Open your Google Cloud Shell or terminal:

```bash
# Set your project ID
export PROJECT_ID="docpulse-ff978"
gcloud config set project $PROJECT_ID

# Create a dedicated, least-privileged service account for deployments
gcloud iam service-accounts create github-hosting-deployer \
    --description="CI/CD service account for Firebase Hosting deployment" \
    --display-name="GitHub Hosting Deployer"
```

#### Step 2: Grant Minimum Required IAM Roles
Grant only the permissions needed to deploy to Firebase Hosting:

```bash
# Grant Firebase Hosting Admin role
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-hosting-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/firebasehosting.admin"
```

*(Optional: If your project also requires Firebase API validation, grant `roles/serviceusage.serviceUsageConsumer`).*

#### Step 3: Create Workload Identity Pool & Provider
```bash
# Create the identity pool
gcloud iam workload-identity-pools create "github-pool" \
    --project="${PROJECT_ID}" \
    --location="global" \
    --display-name="GitHub Actions Pool"

# Get the full Pool ID
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe "github-pool" \
    --project="${PROJECT_ID}" \
    --location="global" \
    --format="value(name)")

# Create the Workload Identity Provider for GitHub (replace YOUR_GITHUB_ORG_OR_USERNAME)
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
    --project="${PROJECT_ID}" \
    --location="global" \
    --workload-identity-pool="github-pool" \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com"
```

#### Step 4: Allow GitHub Repo to Impersonate the Service Account
Replace `YOUR_GITHUB_ORG/YOUR_REPO` with your repository path (e.g. `anilkadam4444/DocPulse`):

```bash
gcloud iam service-accounts add-iam-policy-binding "github-hosting-deployer@${PROJECT_ID}.iam.gserviceaccount.com" \
    --project="${PROJECT_ID}" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/YOUR_GITHUB_ORG/YOUR_REPO"
```

#### Step 5: Add GitHub Repository Secrets
In your GitHub Repository → **Settings** → **Secrets and variables** → **Actions**, add:

| Secret Name | Value Example |
|---|---|
| `WIF_PROVIDER` | `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `WIF_SERVICE_ACCOUNT` | `github-hosting-deployer@docpulse-ff978.iam.gserviceaccount.com` |

---

### Option B: Dedicated Service Account Key (Fast Turnkey Setup)

If you prefer using GitHub Secrets with a service account key:

1. **Generate Service Account**:
   - Go to [Google Cloud Console → IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=docpulse-ff978).
   - Click **Create Service Account**:
     - Name: `github-hosting-deployer`
     - Role: **Firebase Hosting Admin** (`roles/firebasehosting.admin`)
   - Click on the created service account → **Keys** tab → **Add Key** → **Create new key** (JSON).
   - Download the JSON file to your computer.
2. **Add to GitHub Secrets**:
   - In GitHub: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
   - Name: `FIREBASE_SERVICE_ACCOUNT_DOCPULSE_FF978`
   - Value: Paste the full JSON content from the downloaded file.
   - Click **Add secret**.
3. *Security Note*: Never commit this JSON file to git. Add `*.json` to `.gitignore` if downloaded locally.

---

## 3. Workflow Execution Sequence

Every push to `main` (or manual trigger) runs the following steps:

```
[ Git Push to 'main' ]
         │
         ▼
[ Concurrency Check ] ── (Prevents simultaneous overwrites)
         │
         ▼
[ Checkout Source Code (v4) ]
         │
         ▼
[ Setup Node.js 22.x & Cache ]
         │
         ▼
[ npm ci / npm install ]
         │
         ▼
[ TypeScript Lint (tsc --noEmit) ] ── (Fails build if errors exist)
         │
         ▼
[ Unit Test Suite (node --test) ] ── (23 pure-logic domain tests)
         │
         ▼
[ Vite Production Build (npm run build) ]
         │
         ▼
[ Verify dist/ & dist/index.html ]
         │
         ▼
[ Authenticate to Firebase ]
  ├─ Path 1: Workload Identity Federation (if configured)
  └─ Path 2: Service Account Key (FIREBASE_SERVICE_ACCOUNT_DOCPULSE_FF978)
         │
         ▼
[ Deploy to Firebase Hosting ('live' channel) ]
         │
         ▼
[ Deployment Succeeded ]
```

---

## 4. How to Manually Trigger a Deployment

1. Go to your GitHub repository on GitHub.com.
2. Click on the **Actions** tab.
3. In the left sidebar, click **Deploy Production to Firebase Hosting**.
4. Click the **Run workflow** dropdown on the right.
5. Select branch `main`.
6. (Optional) Provide a reason (e.g. *"Redeploying after config change"*).
7. Click **Run workflow**.

---

## 5. How to Confirm Deployment Succeeded

1. **In GitHub Actions**:
   - The workflow run will have a green checkmark `✓`.
   - Click into the job log to see:
     ```
     Deploying to Firebase Hosting...
     ✔  Deploy complete!
     Hosting URL: https://docpulse-ff978.web.app
     ```
2. **In Firebase Console**:
   - Go to [Firebase Console → Hosting](https://console.firebase.google.com/project/docpulse-ff978/hosting).
   - Under **Release history**, you will see the latest release deployed by GitHub Actions with timestamp, version hash, and deployment author.
3. **In Your Browser**:
   - Visit: `https://docpulse-ff978.web.app` or `https://docpulse-ff978.firebaseapp.com`.
   - Hard refresh (`Ctrl + F5` or `Cmd + Shift + R`) to view the latest deployed build.

---

## 6. Investigating Failures & Rollback

### If a Build or Check Fails:
- GitHub Actions automatically stops execution **before** touching Firebase Hosting. The previous live site remains 100% untouched.
- Click into the failed step in the GitHub Actions log (e.g., `Run TypeScript type checks`, `Run unit test suite`, or `Build production assets`).
- The log highlights the exact line number, syntax error, or failing assertion.

### Instant One-Click Rollback in Firebase Console:
If an issue is discovered after deploying:
1. Open [Firebase Console → Hosting](https://console.firebase.google.com/project/docpulse-ff978/hosting).
2. Look at the **Release history** table.
3. Locate the previous working release.
4. Click the three dots `⋮` on that row → **Rollback**.
5. Firebase instantly serves the previous working release in under 2 seconds without requiring a new git commit or build.

---

## 7. Local Project Push Instructions (For E:\DocPulse)

When pushing from your local Windows machine (`E:\DocPulse`):

```bash
# 1. Navigate to your local project directory
cd E:\DocPulse

# 2. Check git status
git status

# 3. Add remote if not already added (replace with your GitHub repository URL)
git remote add origin https://github.com/YOUR_USERNAME/DocPulse.git

# 4. Stage your changes
git add .

# 5. Commit
git commit -m "feat: configure CI/CD pipeline for automatic Firebase Hosting deployment"

# 6. Push to production branch (main)
git branch -M main
git push -u origin main
```

Once pushed, GitHub Actions will automatically start and deploy to `docpulse-ff978.web.app`!
