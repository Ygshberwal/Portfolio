import sharp from 'sharp';
import { access, mkdir, readFile, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

// Generate only explicitly selected assets. Originals stay untouched, and
// Sharp strips EXIF/GPS by default (do not add keepMetadata/withMetadata).
const photoDirectory = process.env.PHOTO_SOURCE_DIR || 'photos';
const resumeSource = process.env.RESUME_SOURCE_PATH || 'Yogesh_resume-22Oct.pdf';
const assets = [
  { source: 'Potrait.jpg', name: 'yogesh-portrait', widths: [360, 730] },
  { source: 'SmilingPP.jpeg', name: 'yogesh-candid', widths: [480, 960] },
  { source: 'IITMandi.jpg', name: 'iit-mandi', widths: [480, 960] },
  { source: 'Hockey.jpeg', name: 'hockey-final', widths: [640, 1280] },
  { source: 'HockeyChamp.jpeg', name: 'hockey-medals', widths: [640, 1280] },
  { source: 'FlowboardHabit.png', name: 'flowboard-habits', widths: [640, 1200, 1800] },
  // The owner explicitly requested the entire supplied planner image.
  { source: 'FlowboardPlanner.png', name: 'flowboard-planner', widths: [640, 1200, 1800] },
  { source: 'VehicleParkingApp.png', name: 'vehicle-parking', widths: [640, 1200, 1800] },
  { source: 'PitchPred.jpg', name: 'pitch-presentation', widths: [640, 1200, 1800] },
  { source: 'Trekking.jpeg', name: 'trekking', widths: [640, 1280] },
  { source: 'IMG_4194.JPG', name: 'travel-window', widths: [480, 960] },
];

// This is an optional maintainer command, not a build prerequisite. Public
// assets are committed; private originals deliberately stay out of Git.
try {
  await Promise.all([
    ...assets.map(asset => access(join(photoDirectory, asset.source))),
    access(resumeSource),
  ]);
} catch {
  throw new Error('Asset regeneration needs the private photo originals and résumé. Restore photos/ and the source PDF, or set PHOTO_SOURCE_DIR and RESUME_SOURCE_PATH. Normal builds/tests use the committed public/ assets and do not require originals.');
}
await mkdir('public/images', { recursive: true });

for (const asset of assets) {
  for (const width of asset.widths) {
    const image = sharp(join(photoDirectory, asset.source)).rotate();
    const output = `public/images/${asset.name}-${width}.webp`;
    await image.resize({ width, withoutEnlargement: true }).webp({ quality: 83 }).toFile(output);
    const metadata = await sharp(output).metadata();
    if (metadata.exif) throw new Error(`Unexpected metadata retained in ${output}`);
  }
  console.log(`Prepared ${asset.name}`);
}

// The owner explicitly requested a download of the supplied PDF, unchanged.
const resume = await readFile(resumeSource);
if (resume.subarray(0, 5).toString() !== '%PDF-') throw new Error('The résumé source is not a PDF');
await copyFile(resumeSource, 'public/resume.pdf');
console.log('Prepared original résumé download');
