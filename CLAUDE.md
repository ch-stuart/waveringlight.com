# waveringlight.com

Wavering Light LLC website served via GitHub Pages at www.waveringlight.com

## Stack

- **Framework**: Astro (static output)
- **Runtime**: Bun
- **Hosting**: GitHub Pages (served from `docs/`)
- **Linting/formatting**: oxlint + oxfmt
- **Analytics**: Umami
- **Contact form**: Web3Forms (key in `PUBLIC_WEB3FORMS_KEY`)

## Build pipeline

```
bun run build                     # astro build
bun run dev                       # astro dev
bun run lint                      # oxlint
bun run format                    # oxfmt
bun run lighthouse:nod            # lighthouse audit for /apps/nod-sleep-noise-app
```

## Project structure

```
src/
  layouts/Layout.astro             # shared page shell: meta, global styles, Umami script
  pages/
    index.astro                    # homepage
    menu.astro                     # app menu
    contact.astro                  # contact page (uses ContactForm)
    privacy-policy.astro           # privacy policy
    apps/nod-sleep-noise-app/      # Nod sleep noise app landing page
  components/
    ContactForm.astro              # Web3Forms contact form
    HomeLink.astro                 # back-to-home nav link
    nod/GridPlayer.astro           # grid-based noise player UI
  scripts/nod/
    grid-player.ts                 # grid player entry point
    audio/grid-engine.ts           # audio engine logic
    audio/noise-gen.ts             # noise generation
  images/nod/                      # source images (processed by build-images.ts)
  styles/global.css
scripts/
  lighthouse-nod.mjs               # lighthouse runner for Nod page
public/                            # CNAME, favicons, robots.txt, static Nod assets
docs/                              # fully generated — never edit directly
```

## Key constraints

- `docs/` is fully generated — never edit files there directly
- oxlint and oxfmt are configured to ignore `docs/`

## Deployment

Commit the `docs/` directory to `main`. GitHub Pages serves it automatically. No CI — the build runs locally.

## Content Security Policy

CSP is managed by Cloudflare.