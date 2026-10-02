# Image Requirements — Google Flow assets

The deck renders today **without any generated images**. Hero/outro art uses
inline SVG placeholders (`assets/img/hero.svg`, `assets/img/outro.svg`) plus CSS
art, so nothing is blocked. This file lists the images that would visually
elevate the deck. **None of these require a paid image API.**

> This agent has no access to your Google Flow login session, so these assets are
> not produced here. Generate them in Google Flow, then drop them into
> `assets/img/` and swap the referenced path.

## How to replace

1. Export the asset at the exact dimensions / aspect ratio below.
2. Save into `assets/img/` using the filename in the table.
3. Update the reference:
   - Hero → `index.html` `#hero-art data-img="assets/img/hero.svg"` → your file.
   - Outro → `index.html` `#end-art data-img="assets/img/outro.svg"` → your file.
   - Optional images → see "Optional" section.
4. `git add -A && git commit -m "Add Flow image assets" && git push`

## Required assets

| # | Filename | Aspect | Size (px) | Where used | Purpose |
|---|----------|--------|-----------|------------|---------|
| 1 | `hero.svg` → `hero.png`/`hero.webp` | 16:9 | 1920×1080 | Slide 1 (title) right side, behind the molecule SVG | Abstract hero: whey/protein powder, shaker, soft studio light, dark navy + lime/purple accents |
| 2 | `outro.svg` → `outro.png`/`outro.webp` | 16:9 | 1920×1080 | Slide 11 (closing) | Calm closing visual: line-up of protein tubs / market shelf, low-key, room for text on the left |

### Suggested Flow prompts

- **hero**: `cinematic product hero, matte black protein powder tub and stainless shaker on a dark navy surface, subtle lime-green and violet rim light, soft shadows, ultra clean, lots of negative space on the left, 16:9`
- **outro**: `wide editorial shot of many protein product tubs arranged in a row receding into darkness, cool teal and lime accent lighting, minimal and premium, negative space on the left for text, 16:9`

## Optional assets (nice-to-have, same rules)

| Filename | Aspect | Size (px) | Where | Purpose |
|----------|--------|-----------|-------|---------|
| `source-coupang.png` | 1:1 | 256×256 | Overview source cards | Channel mark / brand-tinted icon |
| `source-danawa.png` | 1:1 | 256×256 | Overview source cards | Channel mark / brand-tinted icon |
| `source-naver.png` | 1:1 | 256×256 | Overview source cards | Channel mark / brand-tinted icon |
| `pipeline.png` | 21:9 | 2100×900 | Overview | Left-to-right "수집 → 정제 → 분석" pipeline illustration |
| `product-thumb-*.png` | 1:1 | 400×400 | Leaderboard (optional) | Small square product thumbnails |

## Placeholder behavior (already implemented)

- `assets/img/hero.svg` and `assets/img/outro.svg` are **transparent 16:9 SVGs**
  with a dashed safe-area frame and a "replace me" label. They render as a faint
  overlay, so the slide stays legible if assets are never provided.
- The deck's `deck.js` probes `data-img` with an `Image()`; if the file is
  missing it silently keeps the CSS background art. No JS error, no layout break.

## Not used / deliberately skipped

- **Matplotlib** — charts are rendered interactively in-browser with Chart.js
  (zoom-free, animated on slide entry, theme-aware). A static Matplotlib PNG would
  lose the animation and re-theming.
- **Manim** — a video renderer; not embeddable as a lightweight static-page asset
  on GitHub Pages without heavy MP4/WebM hosting. The same "explain the numbers"
  goal is met with animated Chart.js + anime.js transitions.
