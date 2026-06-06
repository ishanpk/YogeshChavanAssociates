# Yogesh Chavan Associates — Website

A single-page, editorial-grade website for **Yogesh Chavan Associates** — Architectural Designers · Interiors · Engineers, based in Sangli, Maharashtra.

**Live site:** [https://ishanpk.github.io/YogeshChavanAssociates/](https://ishanpk.github.io/YogeshChavanAssociates/)

Built with pure HTML, CSS, and vanilla JavaScript — no build step, no frameworks. Ready for GitHub Pages.

---

## Quick Start

1. Clone this repository
2. Replace all placeholders marked with `<!-- TODO: replace -->` in `index.html` and entries in `CONFIGURATION.md`
3. Download real project images from Instagram (see below)
4. Push to GitHub — the site deploys automatically via GitHub Pages

```bash
# Preview locally
python3 -m http.server 8080
# Open http://localhost:8080
```

---

## File Structure

```
/
├── index.html          # Single-page site (all sections)
├── styles.css          # Mobile-first design system
├── script.js           # Interactions, GSAP, Lenis, galleries
├── projects.json       # Project manifest (edit to add projects)
├── team.json           # Team member manifest
├── manifest.json       # PWA manifest
├── sitemap.xml
├── robots.txt
├── favicon.svg
├── CONFIGURATION.md    # All placeholders to replace before going live
├── assets/
│   ├── projects/       # Project thumbnail & gallery images
│   ├── featured/       # Hero slides + featured case study images
│   ├── team/           # Team member photos
│   └── icons/          # SVG icons
└── scripts/
    └── download_instagram.md
```

---

## Adding a New Project

1. **Add images** — Drop your photos into `assets/projects/` (e.g. `my-project-cover.jpg`, `my-project-1.jpg`)
2. **Edit `projects.json`** — Add a new entry:

```json
{
  "id": "my-project",
  "title": "My Project Name",
  "category": "Residential",
  "location": "Sangli, Maharashtra",
  "year": "2025",
  "area": "3,000 sqft",
  "status": "Completed",
  "description": "Brief project description.",
  "thumbnail": "assets/projects/my-project-cover.jpg",
  "gallery": ["assets/projects/my-project-1.jpg", "assets/projects/my-project-2.jpg"],
  "featured": false
}
```

3. **Categories** must match filter buttons: `Residential`, `Commercial`, `Hospitality`, `Interiors`, `Institutional`
4. To make a project the hero case study, set `"featured": true` on one project only and add a `chapters` array (see the featured project entry for the schema)

---

## Updating Team Members

Edit `team.json`:

```json
{
  "id": "unique-id",
  "name": "Full Name",
  "role": "Job Title",
  "bio": "One-line bio shown on card.",
  "photo": "assets/team/photo-filename.jpg",
  "featured": false,
  "linkedin": "https://linkedin.com/in/username",
  "fullBio": {
    "education": "B.Arch — University",
    "specialization": "Area of focus",
    "notableProjects": ["Project A", "Project B"],
    "quote": "Favorite quote."
  }
}
```

Set `"featured": true` on the principal architect for the larger centerpiece card.

---

## Downloading Instagram Images

See **[scripts/download_instagram.md](scripts/download_instagram.md)** for step-by-step instructions.

Quick CLI method:

```bash
pip install instaloader
instaloader --no-videos --no-metadata-json --no-captions yogeshchavan_associates
```

Then move downloaded images into `assets/projects/` and `assets/featured/`, and update `projects.json`.

---

## Setting Up Formspree (Contact Form)

1. Register at [https://formspree.io](https://formspree.io)
2. Create a new form and copy your form ID
3. In `index.html`, replace `YOUR_ID` in the form action:

```html
<form action="https://formspree.io/f/YOUR_ACTUAL_ID" method="POST">
```

Until configured, the form falls back to opening a `mailto:` link.

---

## Google Maps Embed

1. Go to [Google Maps](https://maps.google.com) and search for the office address
2. Click **Share → Embed a map**
3. Copy the `<iframe>` src URL
4. Replace the `src` in the contact section `<iframe>` in `index.html`

---

## Deploying to GitHub Pages

1. Push all files to the `main` branch of [https://github.com/ishanpk/YogeshChavanAssociates](https://github.com/ishanpk/YogeshChavanAssociates)
2. Go to **Repository Settings → Pages**
3. Set **Source** to `Deploy from a branch`
4. Select branch: `main`, folder: `/ (root)`
5. Click **Save** — site will be live at `https://ishanpk.github.io/YogeshChavanAssociates/` within 1–2 minutes

---

## Design Notes

- **Breakpoints tested:** 375px, 480px, 768px, 1024px, 1440px, 1920px
- **Fonts:** Cormorant Garamond (display), Inter (body), JetBrains Mono (metadata)
- **Colors:** Ink `#0E0E0C`, Bone `#F5F2EC`, Clay `#B08968`, Moss `#4A5D3F`
- **Animations:** GSAP ScrollTrigger (featured project), Lenis smooth scroll (desktop), all respect `prefers-reduced-motion`

---

## License

© Yogesh Chavan Associates. All rights reserved.
