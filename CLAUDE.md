# waveringlight.com

Wavering Light LLC website served via GitHub Pages at www.waveringlight.com

## Stack

- **Framework**: Astro (static output)
- **Runtime**: Bun
- **Hosting**: GitHub Pages (served from `docs/`)
- **Linting/formatting**: oxlint + oxfmt
- **Analytics**: Umami

## Build pipeline

```
bun run build          # astro build
bun run dev            # astro dev (requires build:images to have run first)
```

## Project structure

```
src/
  pages/index.astro    # page shell: meta, global styles, Umami script
public/                # CNAME, favicon.ico, robots.txt
docs/                  # fully generated — never edit directly
```

## Key constraints

- `docs/` is fully generated — never edit files there directly
- oxlint and oxfmt are configured to ignore `docs/`

## Deployment

Commit the `docs/` directory to `main`. GitHub Pages serves it automatically. No CI — the build runs locally.
