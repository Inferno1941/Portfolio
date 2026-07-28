# Portfolio — Tarek Khoury

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
```

Outputs to `dist/`. Deploy that folder to Vercel or Netlify.

## Structure

- `src/components/` — Hero, About, Projects, Skills, Contact sections
- `src/data/projects.js` — edit this to add/change projects (title, description, stack, link)
- `src/index.css` — design tokens (colors, fonts) live in the `@theme` block at the top

## To personalize

1. Update the email in `src/components/Contact.jsx`
2. Add real links to `src/data/projects.js` (GitHub repos, live demos)
3. Swap in real screenshots if you want project images (currently text-only cards)
