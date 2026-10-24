import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { connectSupabase } from "./supabase-store.js";
import { validateSite } from "../src/data/site.js";
const file = resolve(process.env.DATA_DIR || "storage", "portfolio.json");
const content = JSON.parse(await readFile(file, "utf8"));
content.site = validateSite(content.site);
const store = await connectSupabase();
if (await store.exists())
  throw new Error(
    "Supabase already contains a portfolio. Import cancelled; existing data is unchanged.",
  );
await store.save(content, { createOnly: true });
console.log(
  `Imported ${content.projects.length} projects and page content into Supabase. Local backup retained.`,
);
