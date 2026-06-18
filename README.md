# Verdict! Engine — Official Website

A premium, dark "cinematic legal thriller" single-page site for **Verdict! Engine** and the courtroom simulation game **Verdict!**. Pure HTML + Tailwind (CDN) + vanilla JS — no build step, deploy-ready for GitHub Pages.

## Structure

```
Website/
├── index.html        # All markup & sections
├── css/styles.css    # Custom cinematic theme, glassmorphism, 3D, parallax
├── js/main.js        # Nav tracking, counters, edition tabs, game loader, parallax
├── .nojekyll         # Lets GitHub Pages serve files as-is
└── README.md
```

## Sections

Home (3D parallax hero) · Stats dashboard (animated counters) · Gameplay & mechanics · Editions suite (interactive tabs) · Live preview cabinet · History timeline · Founder · Footer.

## Hook up the game preview

Open `js/main.js` and set your hosted game URL at the top:

```js
var GAME_URL = "https://your-host.example/verdict/index.html";
```

You can also set per-edition links in `EDITION_URLS`. If left blank, the preview cabinet shows a self-contained placeholder screen and the "Launch Game Preview" button still works. A local path like `game/index.html` also works if you add that folder.

## Deploy to GitHub Pages

1. Create a repo and push the contents of this `Website/` folder to the root (or a `/docs` folder).
2. In the repo: **Settings → Pages → Build from branch**, pick `main` and `/ (root)`.
3. Your site goes live at `https://<username>.github.io/<repo>/`.

> Tip: if you put these files in a subfolder, make sure the asset paths (`css/`, `js/`) stay relative — they already are.

## Notes

- Tailwind is loaded via CDN for zero-build simplicity. For production you can swap to a compiled Tailwind build if you want smaller payloads.
- Bug reports submitted in the preview are stored in `localStorage` (`verdict_bugs`) — wire `initBugModal()` in `main.js` to your real form/issue tracker.
- Respects `prefers-reduced-motion`.

© Verdict! Engine — created by Rahul Awasthi.
