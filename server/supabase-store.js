import { validateSite } from "../src/data/site.js";
import { initialContent } from "./storage.js";
import { validateImage } from "../src/data/imageLimits.js";

export async function connectSupabase(env = process.env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY)
    throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY to connect Supabase.");
  const { createClient } = await import("@supabase/supabase-js");
  // Node < 22 has no global WebSocket, which supabase-js needs to construct its realtime client.
  const { default: ws } = await import("ws");
  const client = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws },
  });
  return supabaseStore(client);
}

// Tables are locked by RLS; only the server's secret key can call these functions.
export function supabaseStore(client) {
  async function rpc(name, args) {
    const { data, error } = await client.rpc(name, args);
    if (error) {
      console.error(`Supabase ${name} failed:`, error.message);
      throw Object.assign(new Error(error.message), { code: error.code || "SUPABASE" });
    }
    return data;
  }
  return {
    backend: "supabase",
    async exists() {
      return (await rpc("get_portfolio")) !== null;
    },
    async read() {
      const value = await rpc("get_portfolio");
      if (!value) return initialContent();
      return { ...value, site: validateSite(value.site) };
    },
    async save(content, { createOnly = false } = {}) {
      content.projects.forEach((project) => validateImage(project.image));
      // One database transaction publishes settings, order, updates, and deletions together.
      await rpc("save_portfolio", { content, create_only: createOnly });
      return content;
    },
  };
}
