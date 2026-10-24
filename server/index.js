import http from "node:http";
import { readFile } from "node:fs/promises";
import { randomBytes, timingSafeEqual, createHash } from "node:crypto";
import { resolve, extname } from "node:path";
import { createStore } from "./storage.js";
import { validateImage } from "../src/data/imageLimits.js";
import { validateSite } from "../src/data/site.js";

const root = resolve(import.meta.dirname, "..");
const store = await createStore();
console.log(`Portfolio data backend: ${store.backend}`);
const sessions = new Map();
const attempts = new Map();
const password = process.env.ADMIN_PASSWORD;
// The admin UI lives at a secret, server-only path instead of /admin.
const normalizePath = (value) =>
  `/${String(value || "").replace(/^\/+|\/+$/g, "")}`;
const adminPath = process.env.ADMIN_PATH ? normalizePath(process.env.ADMIN_PATH) : "";
const adminEnabled = password?.length >= 12 && adminPath.length >= 25;
if (!adminEnabled)
  console.warn(
    "Admin disabled. Set ADMIN_PASSWORD (12+ characters) and ADMIN_PATH (24+ random characters) in .env.",
  );
const hash = (s) => createHash("sha256").update(s).digest();
const isAdminPath = (value) =>
  adminEnabled &&
  typeof value === "string" &&
  timingSafeEqual(hash(normalizePath(value)), hash(adminPath));
function json(res, status, value) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(value));
}
async function body(req) {
  req.setEncoding("utf8");
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > 16 * 1024 * 1024)
      throw new Error("Request exceeds 16 MB.");
  }
  return JSON.parse(raw || "{}");
}
function authenticated(req) {
  const token = req.headers.cookie
    ?.split("; ")
    .find((c) => c.startsWith("portfolio_session="))
    ?.split("=")[1];
  const expiry = sessions.get(token);
  if (!expiry || expiry < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return token;
}
function validate(value, current) {
  if (
    !["grid", "editorial", "list"].includes(value.layout) ||
    !Array.isArray(value.projects) ||
    value.projects.length > 100
  )
    throw new Error("Invalid portfolio settings.");
  const ids = new Set();
  return {
    layout: value.layout,
    site: validateSite(value.site === undefined ? current.site : value.site),
    projects: value.projects.map((p) => {
      if (!p.id || typeof p.id !== "string" || ids.has(p.id))
        throw new Error("Project IDs must be unique.");
      ids.add(p.id);
      for (const field of ["title", "tag", "description", "link", "image"])
        if (typeof p[field] !== "string") throw new Error(`Invalid ${field}.`);
      if (
        !p.title.trim() ||
        p.title.length > 150 ||
        p.description.length > 3000 ||
        p.tag.length > 100
      )
        throw new Error("Check project text lengths.");
      if (p.link && !/^https?:\/\//i.test(p.link))
        throw new Error("Project links must use http or https.");
      validateImage(p.image);
      if (
        !Array.isArray(p.stack) ||
        p.stack.length > 15 ||
        p.stack.some((s) => typeof s !== "string" || s.length > 50)
      )
        throw new Error("Invalid technology tags.");
      return {
        id: p.id,
        title: p.title.trim(),
        tag: p.tag,
        description: p.description,
        link: p.link,
        image: p.image,
        stack: p.stack,
        published: p.published === true,
      };
    }),
  };
}
const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "same-origin");
  const path = new URL(req.url, "http://localhost").pathname;
  try {
    if (path.startsWith("/api/")) {
      if (!["GET", "HEAD"].includes(req.method)) {
        const origin = req.headers.origin;
        if (
          req.headers["sec-fetch-site"] === "cross-site" ||
          (origin && new URL(origin).host !== req.headers.host)
        )
          return json(res, 403, { error: "Cross-origin request rejected." });
        if (!req.headers["content-type"]?.startsWith("application/json"))
          return json(res, 415, { error: "JSON required." });
      }
      if (path === "/api/portfolio" && req.method === "GET") {
        const content = await store.read();
        return json(res, 200, {
          ...content,
          projects: content.projects.filter((p) => p.published),
        });
      }
      if (path === "/api/route" && req.method === "POST") {
        const input = await body(req);
        return json(res, 200, { admin: isAdminPath(input.path) });
      }
      if (path === "/api/login" && req.method === "POST") {
        const key = req.socket.remoteAddress;
        const now = Date.now();
        for (const [ip, record] of attempts)
          if (record.until < now) attempts.delete(ip);
        const attempt = attempts.get(key) || { count: 0, until: now + 900000 };
        if (attempt.count >= 10)
          return json(res, 429, {
            error: "Too many attempts. Try again in 15 minutes.",
          });
        const input = await body(req);
        // Logins are only accepted from the secret admin link.
        if (!isAdminPath(input.path)) {
          attempt.count++;
          attempts.set(key, attempt);
          return json(res, 404, { error: "Not found." });
        }
        if (
          typeof input.password !== "string" ||
          !timingSafeEqual(hash(input.password), hash(password))
        ) {
          attempt.count++;
          attempts.set(key, attempt);
          return json(res, 401, { error: "Incorrect password." });
        }
        attempts.delete(key);
        for (const [token, expiry] of sessions)
          if (expiry < now) sessions.delete(token);
        const token = randomBytes(32).toString("hex");
        sessions.set(token, now + 8 * 3600000);
        res.setHeader(
          "Set-Cookie",
          `portfolio_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
        );
        return json(res, 200, { ok: true });
      }
      const token = authenticated(req);
      if (!token) return json(res, 401, { error: "Please sign in." });
      if (path === "/api/logout" && req.method === "POST") {
        sessions.delete(token);
        res.setHeader(
          "Set-Cookie",
          "portfolio_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
        );
        return json(res, 200, { ok: true });
      }
      if (path === "/api/admin" && req.method === "GET")
        return json(res, 200, await store.read());
      if (path === "/api/admin" && req.method === "PUT") {
        const current = await store.read();
        const next = validate(await body(req), current);
        const content = await store.save(next);
        return json(res, 200, content);
      }
      return json(res, 404, { error: "Not found." });
    }
    if (!["GET", "HEAD"].includes(req.method))
      return json(res, 405, { error: "Method not allowed." });
    let location = resolve(root, "dist", `.${decodeURIComponent(path)}`);
    if (!location.startsWith(`${root}/dist/`))
      location = `${root}/dist/index.html`;
    let buffer;
    try {
      buffer = await readFile(location);
    } catch {
      location = `${root}/dist/index.html`;
      buffer = await readFile(location);
    }
    const types = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".svg": "image/svg+xml",
      ".png": "image/png",
    };
    res.writeHead(200, {
      "Content-Type": types[extname(location)] || "application/octet-stream",
    });
    res.end(req.method === "HEAD" ? undefined : buffer);
  } catch (error) {
    if (error.code) console.error("Backend request failed:", error.code);
    json(res, error.code ? 503 : 400, {
      error: error.code
        ? "Unable to complete request. Check backend configuration and server logs."
        : error.message,
    });
  }
});
server.listen(Number(process.env.PORT || 3001), "0.0.0.0", () =>
  console.log(`Portfolio API listening on port ${process.env.PORT || 3001}`),
);
