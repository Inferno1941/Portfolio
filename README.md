# Tarek AlKhouri — Portfolio & Studio

A responsive React portfolio with a password-protected admin, editable homepage sections, three project layouts, and Supabase-backed content storage.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
cp .env.example .env
```

Set `ADMIN_PASSWORD` to your own unique password (at least 12 characters) and `ADMIN_PATH` to a long random string (at least 24 characters). Change `ADMIN_PATH` to revoke a leaked link. Start both the UI and API:

```sh
npm run dev
```

Open the Vite URL printed in the terminal (normally http://localhost:5173). The admin lives at the secret path set in `ADMIN_PATH` (for example `http://localhost:5173/<ADMIN_PATH>`); `/admin` is no longer an admin route. The server checks the path, so it never appears in the frontend bundle, and logins from any other path are refused; the API normally uses port 3001. Restart after changing environment variables.

## Connect Supabase

The Node API talks to Supabase with the official `@supabase/supabase-js` client and a **server-only secret key**. React keeps calling the same API; no Supabase key is ever sent to the browser. Admin sign-in still uses the password, secret admin link, and HTTP-only session cookie (not Supabase Auth).

The Supabase project **portfolio** (`gtgjapgcahumlhkkbwhj`, eu-west-1) already has the schema from `supabase/migrations/`. For a new project, run that SQL in the Supabase SQL editor.

1. In Supabase → Project settings → API Keys, copy a **secret key** (`sb_secret_…`) into `SUPABASE_SECRET_KEY` in `.env`. `SUPABASE_URL` is already set. Never put the secret key in a `VITE_` variable or frontend source.
2. If you have content in the local JSON file, import it **before switching**:

   ```sh
   npm run supabase:import
   ```

   It refuses to replace an existing Supabase portfolio and keeps the local file as a backup. If no local file exists, skip it; the sample projects appear until your first save.

3. Set `DATA_BACKEND=supabase` in `.env` and restart `npm run dev`.

`DATA_BACKEND=file` remains for offline development. No silent fallback occurs if Supabase is selected but unavailable.

### Supabase data organization

- `portfolio_settings` (single row `main`): layout and homepage content (`site` as JSONB).
- `projects`: one row per project with its `position`, published/draft status, and `image` as a base64 data URL (or empty).
- `get_portfolio()` / `save_portfolio(content, create_only)`: every save replaces settings, order, edits, and deletions in one transaction. Unchanged rows are not rewritten.

Row Level Security is enabled with **no policies**, and table/function access is revoked from the `anon` and `authenticated` roles, so the public Supabase API cannot read or write anything; only the server's secret key can. Draft projects are filtered out of public responses by the Node API.

Upload JPG, PNG, or WebP files up to **600 KB**. Base64 adds roughly one third to the size. The free Supabase plan includes 500 MB of database storage; free projects pause after a week of inactivity.

## Edit your portfolio

- **Projects**: add, edit, delete, reorder, publish, or keep drafts. Upload JPG, PNG, or WebP cover images up to 600 KB.
- **Page content**: edit navigation, introduction, code artwork, toolkit, project headings, About Me paragraphs/cards, contact details, and footer. Add/reorder paragraphs, technologies, and cards. Hide individual sections and their corresponding navigation links.
- **Appearance**: choose Classic grid, Editorial, or Showcase list.
- **Preview**: review the full homepage with unsaved edits and published projects.
- **Apply project** updates the editing workspace. **Save changes** persists all edits and publishes them together.

Line breaks are preserved. Content is plain text; HTML is displayed as text. Changing the contact email updates email links, and button text follows automatically if it previously displayed the old address. Custom button text is preserved.

Existing file-based portfolios receive homepage defaults without changing projects. In file mode, data lives in `storage/portfolio.json` (or `DATA_DIR`). In Supabase mode the local file is only an optional migration source/backup.

## Deploy on Vercel

The root `api/` functions run the Node API alongside the Vite build. `vercel.json` preserves API routes and serves the React app for the private admin URL. Vercel does not run `npm start` for this Vite deployment.

In **Vercel → Project → Settings → Environment Variables**, set these for Production (and Preview if needed):

- `DATA_BACKEND=supabase`
- `SUPABASE_URL`: your Supabase project URL
- `SUPABASE_SECRET_KEY`: your server-only Supabase secret key
- `ADMIN_PASSWORD`: your admin password, at least 12 characters
- `ADMIN_PATH`: your private admin path, at least 24 random characters

Use the same values as your local `.env`; that file is intentionally not pushed. Redeploy after adding/changing variables. Ensure the Supabase schema migration has been applied. The Supabase URL and key must belong to the same project.

Check `https://YOUR-SITE.vercel.app/api/portfolio`: it should return JSON. A 404 or HTML response means the API deployment/routing is missing; a 503 means the backend configuration or Supabase access needs attention. Vercel rejects file storage because its filesystem is not persistent. The public page only requires Supabase configuration; the admin additionally requires both admin variables.

Vercel Functions have request/response size limits, so keep the complete portfolio response and each save below 4 MB, including all base64 images. For larger portfolios, the API will need pagination and per-project saves. See [Vercel function limits](https://vercel.com/docs/functions/limitations).

## Other Node hosting

```sh
npm run build
NODE_ENV=production npm start
```

Host the Node server behind HTTPS. It serves both the built React app and API; uploading only `dist/` to static hosting is insufficient. Configure the Supabase environment variables on the host. Supabase mode does not require persistent local disk; file mode does.

This is a single-owner application. Signed sessions survive server/function restarts and expire after eight hours. Signing is tied to the admin password and path; changing either revokes all sessions. Sign-out clears the browser cookie, but a copied cookie stays valid until expiry or credential rotation. Login throttling is per instance; configure Vercel Firewall rate limiting for `/api/login` for a shared limit across instances. Supabase data persists independently of server restarts. Requests are limited to 16 MB and portfolios to 100 projects. `PORT` configures the API and dev proxy port.

## Checks

```sh
npm run build
npm run lint
npm test
```

Tests use temporary local storage or an in-memory Supabase test double. They cover authentication, validation, ordering/deletion, draft filtering, page migration/persistence, base64 round trips, image size limits, and import overwrite protection. They do not contact or validate the live Supabase project; that requires the secret key.
