import type { ImageMetadata } from 'astro';

const assets = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.{png,jpg,jpeg,webp,avif,gif,svg}', {
  eager: true,
});

/** Resolve a file name from src/assets/ (as written in a data file) to an optimizable image. */
export function resolveAsset(file: string): ImageMetadata {
  const key = `/src/assets/${file.replace(/^\/+/, '')}`;
  const found = assets[key];
  if (!found) {
    const available = Object.keys(assets).map((k) => k.replace('/src/assets/', '')).join(', ');
    throw new Error(`Image "${file}" not found in src/assets/. Available: ${available}`);
  }
  return found.default;
}
