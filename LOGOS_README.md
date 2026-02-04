Quick: Generate optimized logo exports

This project includes a small Node script that will generate PNG and WebP logo variants from the vector `logo-supsaf.svg`.

Prerequisites:
- Node.js (>= 14) and npm

Steps:
1. Install dependencies:
   npm install

2. Generate logos:
   npm run gen-logos

Files generated:
- ./logos/supsaf-320.png
- ./logos/supsaf-512.png
- ./logos/supsaf-1080.png
- ./logos/supsaf-320.webp
- ./logos/supsaf-512.webp
- ./logos/supsaf-1080.webp

If you want, I can run this for you and add the generated files to the repo — say "generate now" and I'll run the script here if your environment supports it.

HEIC conversion

If you have HEIC images (iPhone or similar), convert them to JPEG for broad browser compatibility. A small script is included to convert HEIC files found in `photos/` to JPGs:

1. Install dependencies: `npm install`
2. Run: `npm run convert-heic`

This will produce `photos/*.jpg` files (for example `supsap9.jpg`) which are safe to use in browsers. If you want, I can also convert and add these files for you if your environment allows running `npm` locally.