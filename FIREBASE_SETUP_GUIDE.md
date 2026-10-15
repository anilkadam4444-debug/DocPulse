# DocPulse Firebase Hosting Setup & Deployment Guide

This guide walks you through setting up Firebase, configuring `firebase.json` for Vite (`dist`), linking your project using `firebase use --add`, and deploying.

---

## Prerequisites

Make sure your terminal is opened in the project folder:
```cmd
E:
cd E:\DocPulse
```

Install the dependencies (if not already done):
```cmd
npm install --legacy-peer-deps
```

---

## Step 1: Create a Project in the Firebase Console

1. Open **[Firebase Console](https://console.firebase.google.com/)** in your web browser.
2. Sign in with your Google account (`anilkadam4444@gmail.com`).
3. Click **Add project** (or **Create a project**).
4. Enter a project name (e.g. `docpulse-saas` or `docpulse-health`).
5. Firebase will generate a unique **Project ID** below the name (e.g., `docpulse-saas-12345` or `docpulse-app`).
   > **Note down this Project ID** — you will use it when linking your local workspace.
6. Choose whether to enable Google Analytics (optional, you can disable it for now) and click **Create project**.
7. Wait a few seconds until the console says "Your new project is ready", then click **Continue**.

---

## Step 2: Ensure `firebase.json` is Configured for Vite (`dist`)

Vite builds production assets into the `dist/` directory. Your `firebase.json` in the root of `E:\DocPulse` must have `"public": "dist"` and an SPA rewrite to `/index.html`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|map)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico|woff|woff2|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  }
}
```

---

## Step 3: Login to Firebase CLI

In your terminal at `E:\DocPulse`, log in to Firebase:

```cmd
npx firebase login
```
*(Or `firebase login` if Firebase CLI is installed globally).*

- A browser window will open asking you to sign in with your Google account.
- Select your account, grant permissions, and return to the terminal.
- The terminal will confirm: `✔ Success! Logged in as your-email@gmail.com`.

---

## Step 4: Link Your Local Project using `firebase use --add`

Run the following command in `E:\DocPulse`:

```cmd
npx firebase use --add
```

### What to choose during the prompt:
1. **Select a Project**:
   Use your keyboard arrow keys `↑` `↓` to highlight the Firebase project you created in Step 1, then press `Enter`.
2. **What alias do you want to use for this project? (e.g. default)**:
   Type:
   ```text
   default
   ```
   and press `Enter`.

This creates or updates your `.firebaserc` file automatically with:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

---

## Step 5: Build and Deploy

Now build your application and deploy the hosting assets:

1. **Build the production bundle**:
   ```cmd
   npm run build
   ```
   *(Verifies that Vite bundles all assets into `dist/`)*

2. **Deploy to Firebase Hosting**:
   ```cmd
   npm run deploy:hosting
   ```
   *(Or run: `npx firebase deploy --only hosting`)*

---

## Step 6: Verify Your Live Site

When the deployment finishes, Firebase CLI outputs:

```text
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/<your-project-id>/overview
Hosting URL: https://<your-project-id>.web.app
```

Click or paste the **Hosting URL** (`https://<your-project-id>.web.app`) into your browser to view your live DocPulse web app!
