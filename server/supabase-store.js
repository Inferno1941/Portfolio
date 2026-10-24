import { validateSite } from "../src/data/site.js";
import { initialContent } from "./storage.js";
import { validateImage } from "../src/data/imageLimits.js";

export async function connectSupabase(env = process.env) {
  const url = env.SUPABASE_URL?.trim();
  const key = env.SUPABASE_SECRET_KEY?.trim();
  if (!url)
    throw Object.assign(new Error("Set SUPABASE_URL."), {
      code: "SUPABASE_URL_MISSING",
    });
  if (!key)
    throw Object.assign(new Error("Set SUPABASE_SECRET_KEY."), {
      code: "SUPABASE_KEY_MISSING",
    });
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== "/"
    )
      throw new Error();
  } catch {
    throw Object.assign(new Error("Invalid Supabase URL."), {
      code: "SUPABASE_URL_INVALID",
    });
  }
  const { createClient } = await import("@supabase/supabase-js");
  // Node < 22 has no global WebSocket, which supabase-js needs to construct its realtime client.
  const { default: ws } = await import("ws");
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: ws },
  });
  return supabaseStore(client);
}

// Tables are locked by RLS; only the server's secret key can call these functions.
export function supabaseStore(client) {
  async function rpc(name, args) {
    const { data, error, status } = await client.rpc(name, args);
    if (error) {
      const code =
        status === 401 || status === 403 || error.code === "42501"
          ? "SUPABASE_AUTH"
          : ["PGRST202", "42P01", "42883"].includes(error.code)
            ? "SUPABASE_SCHEMA"
            : status === 0 || /fetch failed/i.test(error.message)
              ? "SUPABASE_NETWORK"
              : error.code || "SUPABASE";
      console.error(`Supabase ${name} failed:`, code);
      throw Object.assign(new Error("Supabase request failed."), { code });
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
