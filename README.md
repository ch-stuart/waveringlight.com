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
bun run lighthouse      # lighthouse audit for all pages
```

## Lighthouse

All pages are audited against four Lighthouse categories: performance, accessibility, best-practices, and SEO.

```sh
bun run lighthouse
```

Reports are saved to `lighthouse-reports/` as timestamped JSON. Exit code is non-zero if any page scores below 100 in any category.

Accessibility is 100 on every page. Performance is 97–100 across the site.

| Page | Performance | Accessibility | Best Practices | SEO |
|------|:-----------:|:-------------:|:--------------:|:---:|
| `/` | 99 | 100 | 100 | 100 |
| `/contact/` | 98 | 100 | 100 | 100 |
| `/privacy-policy/` | 100 | 100 | 100 | 100 |
| `/apps/nod-sleep-noise-app/` | 97 | 100 | 96 | 100 |
| `/apps/womens-lacrosse-timekeeping-and-scoring-app/` | 99 | 100 | 100 | 100 |

## Also

See [CLAUDE.md](CLAUDE.md) for project structure, constraints, and deployment details.
