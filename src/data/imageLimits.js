// 600 KiB becomes ~800 KiB of base64, leaving room for project text.
export const MAX_IMAGE_BYTES = 600 * 1024;
export const IMAGE_LIMIT_LABEL = "600 KB";
export function validateImage(image) {
  if (image === "") return;
  if (typeof image !== "string") throw new Error("Invalid project image.");
  const match =
    /^data:image\/(png|jpeg|webp);base64,((?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)$/.exec(
      image,
    );
  if (!match || !match[2])
    throw new Error("Upload a JPG, PNG, or WebP image as base64.");
  const padding = match[2].endsWith("==") ? 2 : match[2].endsWith("=") ? 1 : 0;
  if ((match[2].length / 4) * 3 - padding > MAX_IMAGE_BYTES)
    throw new Error(
      `Images must be ${IMAGE_LIMIT_LABEL} or smaller. Resize the image and upload it again.`,
    );
}
