const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [320, 512, 1080];
const srcSvg = path.resolve(__dirname, '..', 'logo-supsaf.svg');
const outDir = path.resolve(__dirname, '..', 'logos');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  for (const s of sizes) {
    const pngOut = path.join(outDir, `supsaf-${s}.png`);
    const webpOut = path.join(outDir, `supsaf-${s}.webp`);

    await sharp(srcSvg)
      .resize(s, s, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png({ quality: 90 })
      .toFile(pngOut);

    await sharp(srcSvg)
      .resize(s, s, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .webp({ quality: 90 })
      .toFile(webpOut);

    console.log(`Wrote: ${pngOut} and ${webpOut}`);
  }
  console.log('\nAll logo variants generated in ./logos');
})().catch(err => {
  console.error('Error generating logos:', err);
  process.exit(1);
});