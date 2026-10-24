import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import net from "node:net";
import seed from "../src/data/projects.js";

const scratch = await mkdtemp(join(tmpdir(), "portfolio-test-"));
const probe = net.createServer();
probe.listen(0, "127.0.0.1");
await once(probe, "listening");
const port = probe.address().port;
await new Promise((resolve) => probe.close(resolve));
const SECRET = "/test-only-secret-admin-path-123";
let child;
async function start() {
  child = spawn(process.execPath, ["server/index.js"], {
    env: {
      ...process.env,
      PORT: String(port),
      DATA_DIR: scratch,
      DATA_BACKEND: "file",
      ADMIN_EMAIL: "admin@example.com",
      ADMIN_PASSWORD: "test-only-password-123",
      ADMIN_PATH: "test-only-secret-admin-path-123",
      NODE_ENV: "test",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await Promise.race([
    new Promise((resolve) =>
      child.stdout.on("data", (data) => {
        if (data.toString().includes("listening")) resolve();
      }),
    ),
    once(child, "exit").then(() => {
      throw new Error("Server failed to start");
    }),
    new Promise((_, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Server startup timeout")),
        5000,
      );
      timer.unref();
    }),
  ]);
}
async function stop() {
  child.kill();
  await once(child, "exit");
}
async function request(path, method = "GET", body, cookie) {
  return fetch(`http://127.0.0.1:${port}/api/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

test("authenticated portfolio lifecycle, validation, drafts, and persistence", async () => {
  try {
    // A portfolio saved before page editing existed must retain its projects.
    await writeFile(
      join(scratch, "portfolio.json"),
      JSON.stringify({
        layout: "grid",
        projects: seed.map((p) => ({ ...p, image: "", published: true })),
      }),
    );
    await start();
    assert.equal((await request("admin")).status, 401);
    assert.equal(
      (await request("admin", "PUT", { layout: "list", projects: [] })).status,
      401,
    );
    assert.equal(
      (
        await request("login", "POST", {
          email: "admin@example.com",
          password: "wrong",
          path: SECRET,
        })
      ).status,
      401,
    );
    assert.equal(
      (
        await request("login", "POST", {
          email: "someone@example.com",
          password: "test-only-password-123",
          path: SECRET,
        })
      ).status,
      401,
    );
    // The old /admin link and unknown paths are not the admin route.
    for (const path of ["/admin", "/admin/", "/", "/test-only-secret"])
      assert.equal(
        (await (await request("route", "POST", { path })).json()).admin,
        false,
      );
    assert.equal(
      (await (await request("route", "POST", { path: `${SECRET}/` })).json())
        .admin,
      true,
    );
    // The correct password is refused without the secret link.
    assert.equal(
      (
        await request("login", "POST", {
          email: "admin@example.com",
          password: "test-only-password-123",
        })
      ).status,
      404,
    );
    assert.equal(
      (
        await request("login", "POST", {
          email: "admin@example.com",
          password: "test-only-password-123",
          path: "/admin",
        })
      ).status,
      404,
    );
    const login = await request("login", "POST", {
      email: "admin@example.com",
      password: "test-only-password-123",
      path: SECRET,
    });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    assert.match(login.headers.get("set-cookie"), /HttpOnly; SameSite=Strict/);
    const original = await (await request("admin", "GET", null, cookie)).json();
    assert.equal(original.projects.length, 4);
    assert.match(original.site.hero.description, /Tarek/);
    assert.equal(original.site.about.paragraphs.length, 2);
    const image =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a4X8AAAAASUVORK5CYII=";
    const draft = {
      ...original.projects[0],
      id: "private-project",
      title: "Private draft",
      image,
      published: false,
    };
    const site = structuredClone(original.site);
    site.hero.description = "A new introduction.\nWith a second line.";
    site.about.paragraphs = [
      "My updated biography.",
      "Teaching & building <React> applications.",
    ];
    site.about.cards = [
      { title: "My approach", description: "Useful software." },
    ];
    site.toolkit.items = ["React", "Node.js"];
    site.toolkit.visible = false;
    site.contact.email = "hello@example.com";
    site.identity.pageTitle = "Updated portfolio";
    site.footer.copyright = "Updated footer";
    const updated = {
      site,
      layout: "editorial",
      projects: [draft, ...original.projects.toReversed()],
    };
    assert.equal((await request("admin", "PUT", updated, cookie)).status, 200);
    let publicData = await (await request("portfolio")).json();
    assert.equal(publicData.layout, "editorial");
    assert.deepEqual(publicData.site, site);
    for (const invalid of [
      null,
      [],
      { hero: { description: "x".repeat(3001) } },
      { about: { paragraphs: [42] } },
      { about: { cards: [{ title: "Missing description" }] } },
      { toolkit: { visible: "yes" } },
      { contact: { email: "bad@example.com?subject=injected" } },
      { contact: { email: "not-an-email" } },
      { hero: null },
    ]) {
      assert.equal(
        (await request("admin", "PUT", { ...updated, site: invalid }, cookie))
          .status,
        400,
      );
    }
    assert.deepEqual((await (await request("portfolio")).json()).site, site);
    assert.equal(publicData.projects.length, 4);
    assert.equal(publicData.projects[0].id, original.projects.at(-1).id);
    assert.equal(
      publicData.projects.some((p) => p.id === draft.id),
      false,
    );
    assert.equal(
      (await request("admin", "PUT", { ...updated, layout: "unknown" }, cookie))
        .status,
      400,
    );
    assert.equal(
      (
        await request(
          "admin",
          "PUT",
          { ...updated, projects: [{ ...draft, link: "javascript:alert(1)" }] },
          cookie,
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await request(
          "admin",
          "PUT",
          {
            ...updated,
            projects: [{ ...draft, image: "data:image/svg+xml;base64,AAAA" }],
          },
          cookie,
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await request(
          "admin",
          "PUT",
          { ...updated, projects: [draft, draft] },
          cookie,
        )
      ).status,
      400,
    );
    const crossSite = await fetch(`http://127.0.0.1:${port}/api/admin`, {
      method: "PUT",
      headers: {
        Origin: "https://evil.example",
        Cookie: cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updated),
    });
    assert.equal(crossSite.status, 403);
    updated.projects[0].published = true;
    updated.projects[0].title = "Published image project";
    updated.layout = "list";
    assert.equal((await request("admin", "PUT", updated, cookie)).status, 200);
    await stop();
    await start();
    publicData = await (await request("portfolio")).json();
    assert.equal(publicData.projects[0].title, "Published image project");
    assert.equal(publicData.projects[0].image, image);
    assert.equal(publicData.layout, "list");
    assert.deepEqual(publicData.site, site);
    assert.equal((await request("admin", "GET", null, cookie)).status, 200);
    const again = await request("login", "POST", {
      email: "admin@example.com",
      password: "test-only-password-123",
      path: SECRET,
    });
    const newCookie = again.headers.get("set-cookie").split(";")[0];
    assert.equal(
      (
        await request(
          "admin",
          "PUT",
          { layout: "grid", projects: [] },
          newCookie,
        )
      ).status,
      200,
    );
    assert.equal(
      (await (await request("portfolio")).json()).projects.length,
      0,
    );
    // A legacy client saving only projects must not erase page edits.
    assert.deepEqual((await (await request("portfolio")).json()).site, site);
    const logout = await request("logout", "POST", {}, newCookie);
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
    assert.equal((await request("admin")).status, 401);
    for (let i = 0; i < 10; i++)
      assert.equal(
        (
          await request("login", "POST", {
            email: "admin@example.com",
            password: "incorrect",
            path: SECRET,
          })
        ).status,
        401,
      );
    assert.equal(
      (
        await request("login", "POST", {
          email: "admin@example.com",
          password: "incorrect",
          path: SECRET,
        })
      ).status,
      429,
    );
  } finally {
    if (child && child.exitCode === null) await stop();
    await rm(scratch, { recursive: true, force: true });
  }
});
