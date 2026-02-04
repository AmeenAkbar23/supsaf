const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const photosDir = path.resolve(__dirname, '..', 'photos');

(async function convert() {
  try {
    const files = fs.readdirSync(photosDir);
    const heics = files.filter(f => f.toLowerCase().endsWith('.heic'));
    if (heics.length === 0) {
      console.log('No HEIC files found in photos/.');
      return;
    }

    for (const file of heics) {
      const input = path.join(photosDir, file);
      const outName = file.replace(/\.heic$/i, '.jpg');
      const out = path.join(photosDir, outName);
      console.log(`Converting ${file} → ${outName} ...`);
      await sharp(input)
        .jpeg({ quality: 92 })
        .toFile(out);
      console.log(`Wrote ${outName}`);
    }

    console.log('\nDone. You can now update references to the new .jpg files.');
  } catch (err) {
    console.error('Error converting HEIC files:', err);
    process.exit(1);
  }
})();