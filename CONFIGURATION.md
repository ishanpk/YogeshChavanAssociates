# Configuration Checklist

Replace every placeholder below before going live. Search the codebase for `TODO: replace` to find each occurrence.

---

## Contact Information

| Field | Placeholder | Where to Update |
|-------|-------------|-----------------|
| Phone number | `+91 XXXXX XXXXX` | `index.html` — all `tel:` and `wa.me` links, JSON-LD |
| WhatsApp number | `91XXXXXXXXXX` | `index.html` — FAB, mobile CTA, contact section |
| Email | `info@yogeshchavanassociates.com` | `index.html` — mailto links, JSON-LD, form fallback |
| Office address | `Plot No. XX, Main Road` | `index.html` — contact section, JSON-LD |
| Facebook URL | `#` | `index.html` — social links (2 places) |
| LinkedIn URL | `#` | `index.html` — social links (2 places) |

---

## Firm Details

| Field | Placeholder | Where to Update |
|-------|-------------|-----------------|
| Founding year | `1998` | `index.html` — hero tagline, meta description |
| Years of experience | `25` | `index.html` — stats counter `data-count` |
| Projects completed | `150` | `index.html` — stats counter `data-count` |
| Cities served | `12` | `index.html` — stats counter `data-count` |
| Happy clients | `200` | `index.html` — stats counter `data-count` |

---

## Formspree

| Field | Placeholder | Where to Update |
|-------|-------------|-----------------|
| Form endpoint | `https://formspree.io/f/YOUR_ID` | `index.html` — contact form `action` attribute |

---

## Google Maps

| Field | Placeholder | Where to Update |
|-------|-------------|-----------------|
| Map embed URL | Generic Sangli coordinates | `index.html` — contact section `<iframe src="...">` |
| Geo coordinates | `16.8524, 74.5667` | `index.html` — JSON-LD `geo` block |

---

## Team Members (`team.json`)

| Member | Placeholder | Field |
|--------|-------------|-------|
| Senior Architect | `<!-- TODO: replace --> Senior Architect Name` | `name`, `fullBio.education` |
| Interior Designer | `<!-- TODO: replace --> Interior Designer Name` | `name`, `fullBio.education` |
| Structural Engineer | `<!-- TODO: replace --> Structural Engineer Name` | `name`, `fullBio.education` |
| Project Manager | `<!-- TODO: replace --> Project Manager Name` | `name`, `fullBio.education` |
| Site Supervisor | `<!-- TODO: replace --> Site Supervisor Name` | `name`, `fullBio.education` |
| Yogesh Chavan education | `<!-- TODO: replace --> University Name` | `fullBio.education` |

---

## Testimonials (`index.html`)

| Field | Placeholder |
|-------|-------------|
| Client 1 name | `<!-- TODO: replace --> Client Name` |
| Client 2 name | `<!-- TODO: replace --> Client Name` |
| Client 3 name | `<!-- TODO: replace --> Client Name` |

---

## Images to Replace

All current images are **SVG placeholders**. Replace with real photos from Instagram:

| Folder | Purpose | Recommended Size |
|--------|---------|-----------------|
| `assets/featured/hero-1.svg` through `hero-4.svg` | Hero background slideshow | 1920×1080 JPG, ≤200KB each |
| `assets/featured/hotel-1.svg` through `hotel-5.svg` | Featured case study chapters | 1600×900 JPG |
| `assets/projects/*.svg` | Portfolio thumbnails | 800×1000 JPG (4:5 ratio) |
| `assets/team/*.svg` | Team member portraits | 600×750 JPG |

After replacing images, update file extensions in `projects.json` and `team.json` (e.g. `.svg` → `.jpg`).

---

## SEO / Meta

| Field | Current Value | Notes |
|-------|---------------|-------|
| Canonical URL | `https://ishanpk.github.io/YogeshChavanAssociates/` | Update if using custom domain |
| OG image | `assets/featured/hotel-1.svg` | Replace with a real project photo |
| JSON-LD streetAddress | `TODO: replace` | `index.html` structured data |

---

## Quick Verification

After replacing all placeholders, run this search to confirm nothing was missed:

```bash
grep -r "TODO: replace" .
grep -r "XXXXXXXXXX" .
grep -r "YOUR_ID" .
```
