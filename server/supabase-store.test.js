import { test } from "node:test";
import assert from "node:assert/strict";
import { supabaseStore } from "./supabase-store.js";
import { initialContent } from "./storage.js";

function fakeClient(stored = null) {
  const calls = [];
  return {
    calls,
    async rpc(name, args) {
      calls.push(name);
      if (name === "get_portfolio") return { data: structuredClone(stored), error: null };
      if (name === "save_portfolio") {
        if (args.create_only && stored)
          return { data: null, error: { message: "already exists", code: "P0001" } };
        stored = structuredClone(args.content);
        return { data: null, error: null };
      }
    },
  };
}

test("empty Supabase returns initial content and saves round-trip", async () => {
  const store = supabaseStore(fakeClient());
  assert.equal(await store.exists(), false);
  const initial = await store.read();
  assert.deepEqual(initial, initialContent());
  initial.layout = "list";
  await store.save(initial);
  assert.equal((await store.read()).layout, "list");
  assert.equal(await store.exists(), true);
});

test("create-only import refuses to replace existing content", async () => {
  const store = supabaseStore(fakeClient(initialContent()));
  await assert.rejects(store.save(initialContent(), { createOnly: true }), {
    code: "P0001",
  });
});

test("oversized images are rejected before writing", async () => {
  const client = fakeClient();
  const content = initialContent();
  content.projects[0].image = "not-an-image";
  await assert.rejects(supabaseStore(client).save(content));
  assert.ok(!client.calls.includes("save_portfolio"));
});
