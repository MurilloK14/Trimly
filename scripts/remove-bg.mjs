import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, '../public/logo-original.png');
const outputPath = join(__dirname, '../public/logo.png');

const image = sharp(inputPath);
const { data, info } = await image
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const pixels = new Uint8Array(data);

// Helper to get pixel index
const idx = (x, y) => (y * width + x) * channels;

// Mark background pixels using BFS flood-fill from all 4 corners
// This only marks actual background pixels (connected to corners)
const visited = new Uint8Array(width * height);
const queue = [];

// Seed from all 4 corners and edges
const SEED_THRESHOLD = 240; // very bright = background seed

function isBackground(x, y) {
  const i = idx(x, y);
  return pixels[i] >= SEED_THRESHOLD && pixels[i+1] >= SEED_THRESHOLD && pixels[i+2] >= SEED_THRESHOLD;
}

// Add border pixels as seeds
for (let x = 0; x < width; x++) {
  if (isBackground(x, 0)) queue.push([x, 0]);
  if (isBackground(x, height - 1)) queue.push([x, height - 1]);
}
for (let y = 0; y < height; y++) {
  if (isBackground(0, y)) queue.push([0, y]);
  if (isBackground(width - 1, y)) queue.push([width - 1, y]);
}

// BFS flood fill
const FLOOD_THRESHOLD = 200; // how similar to background to consider connected

while (queue.length > 0) {
  const [x, y] = queue.pop();
  const pos = y * width + x;
  if (visited[pos]) continue;
  visited[pos] = 1;

  const i = idx(x, y);
  const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
  
  // Check if this pixel looks like background (bright, not golden)
  const isGolden = r > g * 1.15 && g > b * 1.4;
  const isBright = r >= FLOOD_THRESHOLD && g >= FLOOD_THRESHOLD && b >= FLOOD_THRESHOLD;
  
  if (!isBright || isGolden) continue;

  // Make this pixel transparent (with alpha based on brightness)
  const brightness = (r + g + b) / 3;
  const alpha = brightness >= 240 ? 0 : Math.round(((255 - brightness) / (255 - FLOOD_THRESHOLD)) * 128);
  pixels[i + 3] = alpha;

  // Add neighbors
  const neighbors = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[ny * width + nx]) {
      queue.push([nx, ny]);
    }
  }
}

await sharp(Buffer.from(pixels), {
  raw: { width, height, channels },
})
  .png()
  .toFile(outputPath);

console.log(`✅ Background removed with flood-fill! Saved to: ${outputPath}`);
