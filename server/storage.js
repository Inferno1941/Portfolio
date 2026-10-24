import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import seed from "../src/data/projects.js";
import { validateSite } from "../src/data/site.js";

export function initialContent() {
  return {
    layout: "grid",
    site: validateSite(),
    projects: seed.map((p) => ({ ...p, image: "", published: true })),
  };
}
export async function createStore(env = process.env) {
  const backend =
    env.DATA_BACKEND?.trim() || (env.VERCEL === "1" ? "supabase" : "file");
  if (env.VERCEL === "1" && backend !== "supabase")
    throw Object.assign(
      new Error("Vercel local file storage is not persistent."),
      { code: "BACKEND_FILE_ON_VERCEL" },
    );
  if (backend === "supabase") {
    const { connectSupabase } = await import("./supabase-store.js");
    return connectSupabase(env);
  }
  if (backend !== "file")
    throw Object.assign(new Error("DATA_BACKEND must be supabase or file."), {
      code: "BACKEND_INVALID",
    });
  const dir = resolve(
    env.DATA_DIR || new URL("../storage", import.meta.url).pathname,
  );
  await mkdir(dir, { recursive: true });
  const file = `${dir}/portfolio.json`;
  return {
    backend,
    async read() {
      try {
        const value = JSON.parse(await readFile(file, "utf8"));
        return { ...value, site: validateSite(value.site) };
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        return initialContent();
      }
    },
    async save(value) {
      const temp = `${file}.${randomBytes(8).toString("hex")}.tmp`;
      await writeFile(temp, JSON.stringify(value));
      await rename(temp, file);
      return value;
    },
  };
}
