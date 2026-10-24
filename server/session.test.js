import { test } from "node:test";
import assert from "node:assert/strict";
import { createSession, verifySession } from "./session.js";
import { createStore } from "./storage.js";
test("sessions survive instances, expire, and reject forgery or changed credentials", () => {
  const token = createSession("test-password-123", "/private-test-path", 1000);
  assert.equal(
    verifySession(token, "test-password-123", "/private-test-path", 2000),
    true,
  );
  assert.equal(
    verifySession(
      token,
      "test-password-123",
      "/private-test-path",
      1000 + 8 * 3600000,
    ),
    false,
  );
  assert.equal(
    verifySession(token, "different-password", "/private-test-path", 2000),
    false,
  );
  assert.equal(
    verifySession(token, "test-password-123", "/changed-path", 2000),
    false,
  );
  assert.equal(
    verifySession(token + "x", "test-password-123", "/private-test-path", 2000),
    false,
  );
  assert.equal(
    verifySession("forged", "test-password-123", "/private-test-path", 2000),
    false,
  );
});
test("Vercel never falls back to local files", async () => {
  await assert.rejects(
    createStore({ VERCEL: "1", DATA_BACKEND: "file" }),
    /not persistent/,
  );
  await assert.rejects(createStore({ VERCEL: "1" }), /SUPABASE_URL/);
});
