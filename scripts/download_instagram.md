# Downloading Images from @yogeshchavan_associates

Instagram blocks automated scraping from browsers, so images must be downloaded manually or via the Instaloader CLI tool.

**Source:** [https://www.instagram.com/yogeshchavan_associates/](https://www.instagram.com/yogeshchavan_associates/)

---

## Method 1: Instaloader (Recommended — CLI)

### Prerequisites

- Python 3.7+ installed
- pip package manager

### Steps

1. **Install Instaloader:**

```bash
pip install instaloader
```

2. **Download all posts (images only, no videos):**

```bash
instaloader --no-videos --no-metadata-json --no-captions yogeshchavan_associates
```

This creates a folder `yogeshchavan_associates/` in your current directory with all posted images.

3. **Optional — login for higher resolution:**

```bash
instaloader --login YOUR_INSTAGRAM_USERNAME --no-videos --no-metadata-json --no-captions yogeshchavan_associates
```

4. **Organize downloaded images:**

```bash
# Hero slideshow (pick 4 best exterior/landmark shots)
cp yogeshchavan_associates/BEST_SHOT_1.jpg assets/featured/hero-1.jpg
cp yogeshchavan_associates/BEST_SHOT_2.jpg assets/featured/hero-2.jpg
cp yogeshchavan_associates/BEST_SHOT_3.jpg assets/featured/hero-3.jpg
cp yogeshchavan_associates/BEST_SHOT_4.jpg assets/featured/hero-4.jpg

# Featured hospitality project (5 images: exterior → entrance → interior → details → night)
cp yogeshchavan_associates/HOTEL_1.jpg assets/featured/hotel-1.jpg
cp yogeshchavan_associates/HOTEL_2.jpg assets/featured/hotel-2.jpg
cp yogeshchavan_associates/HOTEL_3.jpg assets/featured/hotel-3.jpg
cp yogeshchavan_associates/HOTEL_4.jpg assets/featured/hotel-4.jpg
cp yogeshchavan_associates/HOTEL_5.jpg assets/featured/hotel-5.jpg

# Portfolio projects
cp yogeshchavan_associates/RESIDENCE.jpg assets/projects/residence-1.jpg
# ... repeat for each project
```

5. **Update `projects.json`** — change `.svg` extensions to `.jpg` (or `.webp`) for all image paths.

6. **Optimize images** (recommended for web performance):

```bash
# Using ImageMagick (install: brew install imagemagick)
for f in assets/**/*.jpg; do
  convert "$f" -quality 82 -resize '1920x1920>' "$f"
done
```

Target sizes:
- Hero images: ≤ 200KB each
- Portfolio thumbnails: ≤ 150KB each
- Team photos: ≤ 100KB each

---

## Method 2: Manual Download (Browser)

1. Open [https://www.instagram.com/yogeshchavan_associates/](https://www.instagram.com/yogeshchavan_associates/) in a desktop browser
2. Click on each post to open it full-screen
3. Right-click the image → **Save image as…**
4. Save to the appropriate `assets/` subfolder with a descriptive filename
5. Update `projects.json` and `team.json` with the new filenames

> **Tip:** On mobile, long-press an image in the Instagram app → "Save" — then AirDrop or transfer to your computer.

---

## Method 3: Browser Extension

Tools like **Downloader for Instagram** (Chrome) or **InstaDownloader** can batch-save images. Use at your own discretion and respect Instagram's Terms of Service.

---

## Image Naming Convention

| Pattern | Example | Used In |
|---------|---------|---------|
| `hero-N.jpg` | `hero-1.jpg` | Hero slideshow (`index.html`) |
| `hotel-N.jpg` | `hotel-1.jpg` | Featured case study chapters |
| `project-name.jpg` | `residence-1.jpg` | Portfolio grid (`projects.json`) |
| `firstname-lastname.jpg` | `yogesh-chavan.jpg` | Team section (`team.json`) |

---

## After Downloading

1. Replace all `.svg` paths in `projects.json` and `team.json` with `.jpg` paths
2. Update `index.html` hero `<img src="...">` tags to point to `.jpg` files
3. Update Open Graph image in `index.html` `<meta property="og:image">` to a real photo
4. Delete placeholder `.svg` files from `assets/` once replaced
5. Test locally: `python3 -m http.server 8080`

---

## Recommended Featured Project Selection

Based on the Instagram feed, the **hotel/hospitality building project** is the strongest candidate for the featured case study (`"featured": true` in `projects.json`). Select 5 images showing:

1. Exterior / facade (wide shot)
2. Entrance / lobby approach
3. Interior living space or lobby
4. Material / detail close-up
5. Evening / night shot (if available)
