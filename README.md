# waveringlight.com

Static site for Wavering Light LLC, served via GitHub Pages.

**[www.waveringlight.com](https://www.waveringlight.com)**

## Stack

- **Framework**: Astro (static output)
- **Runtime**: Bun
- **Hosting**: GitHub Pages (served from `docs/`)
- **CDN/DNS**: Cloudflare (proxied — caching, CSP headers, DDoS protection)
- **Linting/formatting**: oxlint + oxfmt
- **Analytics**: Umami
- **Contact form**: Web3Forms

## Build

```sh
bun run build           # astro build → docs/
bun run dev             # dev server
bun run lint            # oxlint
bun run format          # oxfmt
bun run lighthouse:nod  # lighthouse audit for /apps/nod-sleep-noise-app
```

See [CLAUDE.md](CLAUDE.md) for project structure, constraints, and deployment details.
