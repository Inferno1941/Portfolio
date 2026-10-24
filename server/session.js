import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
const lifetime = 8 * 3600 * 1000;
function sign(value, password, path) {
  return createHmac("sha256", password)
    .update(`portfolio-session:${path}:${value}`)
    .digest("base64url");
}
export function createSession(password, path, now = Date.now()) {
  const payload = `${now + lifetime}.${randomBytes(24).toString("base64url")}`;
  return `${payload}.${sign(payload, password, path)}`;
}
export function verifySession(token, password, path, now = Date.now()) {
  if (typeof token !== "string" || token.length > 200 || !password)
    return false;
  const parts = token.split(".");
  if (parts.length !== 3 || !/^[A-Za-z0-9_-]{43}$/.test(parts[2])) return false;
  const expiry = Number(parts[0]);
  if (!Number.isSafeInteger(expiry) || expiry <= now || expiry > now + lifetime)
    return false;
  const expected = sign(`${parts[0]}.${parts[1]}`, password, path);
  return (
    parts[2].length === expected.length &&
    timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expected))
  );
}
