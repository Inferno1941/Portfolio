import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";

test("Vercel entry points accept parsed bodies and return JSON configuration errors", async () => {
  process.env.VERCEL = "1";
  process.env.DATA_BACKEND = "supabase";
  process.env.SUPABASE_URL = "";
  process.env.SUPABASE_SECRET_KEY = "";
  process.env.ADMIN_PASSWORD = "test-vercel-password-123";
  process.env.ADMIN_PATH = "test-vercel-private-path-123456";
  const { default: handler } = await import("../api/portfolio.js");
  for (const name of ["route", "login", "logout", "admin"])
    assert.equal((await import(`../api/${name}.js`)).default, handler);
  const server = http.createServer(async (req, res) => {
    if (req.method === "POST") {
      let body = "";
      for await (const chunk of req) body += chunk;
      req.body = JSON.parse(body);
    }
    await handler(req, res);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const url = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body) =>
    fetch(`${url}/api/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: url },
      body: JSON.stringify(body),
    });
  try {
    const route = await post("route", { path: process.env.ADMIN_PATH });
    assert.deepEqual(await route.json(), { admin: true });
    const login = await post("login", {
      path: process.env.ADMIN_PATH,
      password: process.env.ADMIN_PASSWORD,
    });
    assert.equal(login.status, 200);
    assert.match(login.headers.get("set-cookie"), /HttpOnly/);
    const portfolio = await fetch(`${url}/api/portfolio`);
    assert.equal(portfolio.status, 503);
    assert.match(portfolio.headers.get("content-type"), /application\/json/);
    assert.equal((await portfolio.json()).code, "SUPABASE_URL_MISSING");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
