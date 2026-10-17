# BINARY LANGUAGE HUB

A responsive, green-and-black hacker-themed learning hub built with React, Vite, CSS, and JavaScript.

## Features
- Responsive home page and navigation
- Text ↔ binary translator
- Daily multiple-choice tech challenge with score saved in browser local storage
- Searchable learning library with completion tracking saved locally
- Green/black hacker-inspired interface
- No backend or API key required

## Run locally
You need Node.js 18+ (Node 20 LTS recommended).

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build
```bash
npm run build
npm run preview
```
The production site is generated in `dist/`.

## Deploy free on Vercel
1. Create a GitHub repository and upload the project files.
2. Sign in to Vercel and choose **Add New → Project**.
3. Import the repository.
4. Vercel should detect Vite automatically. Use:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Click Deploy.

## Deploy free on Netlify
1. Push the project to GitHub.
2. In Netlify, import the repository.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy.

## Deploy on GitHub Pages
For the simplest deployment, Vercel or Netlify is recommended. GitHub Pages requires setting the correct Vite `base` path for a project repository and configuring a build workflow.

## Notes
- Google Fonts are loaded from Google Fonts; if unavailable, system sans-serif fallbacks are used.
- Scores and completed lessons are saved only in the current browser/device. They do not sync between devices.
- The daily challenge currently cycles through a small built-in question set; it is not a server-synchronized calendar challenge.
- The binary translator handles Unicode code points in binary groups. For standard English ASCII, each character appears as an 8-bit group.
