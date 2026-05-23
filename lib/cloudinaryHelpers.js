// lib/cloudinaryHelpers.js
export function toDisplayUrl(url) {
  if (!url) return url;
  // Convert HEIC/HEIF Cloudinary URLs to JPEG on the fly
  if (url.match(/\.(heic|heif)$/i) || url.includes('heic') || url.includes('heif')) {
    return url
      .replace('/upload/', '/upload/f_jpg/')
      .replace(/\.(heic|heif)$/i, '.jpg');
  }
  return url;
}