import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const desktopSource = 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\dc3432b3-2abc-4ad3-8e97-a4b95eb34737\\hero_banner_desktop_1788423180753.jpg';
const mobileSource = 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\dc3432b3-2abc-4ad3-8e97-a4b95eb34737\\hero_banner_mobile_1788423201280.jpg';
const publicDir = path.resolve('public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function processBanners() {
  console.log('🚀 Processing Hero Banners with sharp...');

  // 1. Desktop AVIF (1920x720)
  const desktopAvifPath = path.join(publicDir, 'banner-tin-hoc-gen-z-hoc-thuc-chien.avif');
  await sharp(desktopSource)
    .resize(1920, 720, { fit: 'cover', position: 'right' })
    .avif({ quality: 78, effort: 6 })
    .toFile(desktopAvifPath);
  const dAvifStat = fs.statSync(desktopAvifPath);
  console.log(`✅ Desktop AVIF: ${(dAvifStat.size / 1024).toFixed(1)} KB (Target < 250 KB)`);

  // 2. Desktop WebP (1920x720)
  const desktopWebpPath = path.join(publicDir, 'banner-tin-hoc-gen-z-hoc-thuc-chien.webp');
  await sharp(desktopSource)
    .resize(1920, 720, { fit: 'cover', position: 'right' })
    .webp({ quality: 82, effort: 6 })
    .toFile(desktopWebpPath);
  const dWebpStat = fs.statSync(desktopWebpPath);
  console.log(`✅ Desktop WebP: ${(dWebpStat.size / 1024).toFixed(1)} KB (Target < 250 KB)`);

  // 3. Mobile AVIF (1080x1350)
  const mobileAvifPath = path.join(publicDir, 'banner-tin-hoc-gen-z-mobile.avif');
  await sharp(mobileSource)
    .resize(1080, 1350, { fit: 'cover', position: 'center' })
    .avif({ quality: 75, effort: 6 })
    .toFile(mobileAvifPath);
  const mAvifStat = fs.statSync(mobileAvifPath);
  console.log(`✅ Mobile AVIF: ${(mAvifStat.size / 1024).toFixed(1)} KB (Target < 160 KB)`);

  // 4. Mobile WebP (1080x1350)
  const mobileWebpPath = path.join(publicDir, 'banner-tin-hoc-gen-z-mobile.webp');
  await sharp(mobileSource)
    .resize(1080, 1350, { fit: 'cover', position: 'center' })
    .webp({ quality: 80, effort: 6 })
    .toFile(mobileWebpPath);
  const mWebpStat = fs.statSync(mobileWebpPath);
  console.log(`✅ Mobile WebP: ${(mWebpStat.size / 1024).toFixed(1)} KB (Target < 160 KB)`);

  // 5. Open Graph Image (1200x630 JPEG)
  const ogJpgPath = path.join(publicDir, 'tin-hoc-gen-z-og-image.jpg');
  await sharp(desktopSource)
    .resize(1200, 630, { fit: 'cover', position: 'right' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(ogJpgPath);
  const ogStat = fs.statSync(ogJpgPath);
  console.log(`✅ Open Graph JPG: ${(ogStat.size / 1024).toFixed(1)} KB (Target < 300 KB)`);

  // Also create a fallback standard JPG for legacy browsers
  const desktopJpgPath = path.join(publicDir, 'banner-tin-hoc-gen-z-hoc-thuc-chien.jpg');
  await sharp(desktopSource)
    .resize(1920, 720, { fit: 'cover', position: 'right' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(desktopJpgPath);
  console.log(`✅ Desktop fallback JPG created`);
}

processBanners().catch(console.error);
