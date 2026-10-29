import { MAX_IMAGE_BYTES } from "./imageLimits.js";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const dataUrlBytes = (url) =>
  Math.ceil(((url.length - url.indexOf(",") - 1) * 3) / 4);
let webpSupport;
const canEncodeWebp = () =>
  (webpSupport ??= document
    .createElement("canvas")
    .toDataURL("image/webp")
    .startsWith("data:image/webp"));

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Image could not be read."));
    reader.readAsDataURL(file);
  });
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("This image could not be opened."));
    img.src = src;
  });
}

// Photos straight from a phone are scaled down in the browser so they fit the storage limit.
export async function prepareImage(file, maxSide = 1600) {
  if (!TYPES.includes(file.type))
    throw new Error("Choose a JPG, PNG, or WebP image.");
  if (file.size > MAX_SOURCE_BYTES)
    throw new Error("Choose an image smaller than 25 MB.");
  const original = await readFile(file);
  const img = await loadImage(original);
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  if (file.size <= MAX_IMAGE_BYTES && Math.max(width, height) <= maxSide)
    return original;
  const webp = canEncodeWebp();
  let scale = Math.min(1, maxSide / Math.max(width, height));
  for (let attempt = 0; attempt < 6; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d");
    // JPEG has no transparency, so fill with the page background instead of black.
    if (!webp) {
      context.fillStyle = "#fafbf8";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.imageSmoothingQuality = "high";
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.88, 0.75]) {
      const url = canvas.toDataURL(webp ? "image/webp" : "image/jpeg", quality);
      if (dataUrlBytes(url) <= MAX_IMAGE_BYTES) return url;
    }
    scale *= 0.75;
  }
  throw new Error("This image is too detailed to store. Try a smaller one.");
}
