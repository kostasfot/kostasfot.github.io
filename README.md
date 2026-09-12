# kostasfot.github.io

Personal CV and technical blog for Konstantinos Fotoglou, published with GitHub Pages and Jekyll.

[Website](https://kostasfot.github.io/) ·
[Blog](https://kostasfot.github.io/blog/) ·
[Greek Tourism Observatory](https://kostasfot.github.io/observatory/) ·
[Tourism analysis article](https://kostasfot.github.io/blog/greek-tourism-observatory/)

## Current publication — 12 September 2026

The site hosts the Greek Tourism Observatory and its expanded illustrated article.
The dashboard has **15 charts** in a complete selection; the article has **17
interactive figures**, including six Bank of Greece charts. Both use release
**`2026-09-12-display`**, with source files retrieved on **11 September 2026**.

| Evidence | Public coverage |
| --- | --- |
| ELSTAT / Eurostat accommodation | Shared 2019–2024 period; Central Macedonia monthly seasonality, annual subregional hotel comparisons and national benchmarks |
| Hotel capacity | Available 2025 values shown separately from shared demand coverage |
| Bank of Greece travel | Annual 2019–2025 Greece and Central Macedonia receipts, travellers/visits, nights, expenditure and stay indicators; separate scope/year controls |
| Fraport airport traffic / GISCO maps | Not displayed under the current reuse review; official sources remain linked |

National inbound travellers, regional visits and accommodation check-ins are
different measures. Regional travel results also exclude supplementary cruise
data outside the Border Survey that are included in national totals. Receipts
are nominal, not inflation-adjusted value or GDP. Definitions and limitations
remain alongside the charts and in the methodology section.

There are **no data-download sections, CSV/ZIP files or export buttons**. Readers
seeking datasets are directed to the official providers. Chart/table JSON must
still reach the browser, so displayed values are public; removing controls does
not erase Git history or previously downloaded/cached copies.

## Site structure

- The CV homepage is in `index.html`.
- Markdown posts live in `_posts/`.
- Unpublished drafts and the reusable post template live in `_drafts/`.
- Shared page layouts and navigation live in `_layouts/` and `_includes/`.
- Theme styles and browser scripts live in `assets/`.
- The public dashboard page is `observatory/index.html`.
- `assets/js/observatory.mjs` renders the reviewed charts and on-page tables.
- `assets/css/observatory.css` extends the site's dark navy, cyan/teal theme.
- `assets/data/observatory/<release>/` contains rendering JSON and its manifest.
- `tests/observatory.test.mjs` checks the snapshot, article values and filters.

## Create a post

1. Copy `_drafts/post-template.md` into `_posts/`.
2. Rename it using `YYYY-MM-DD-post-slug.md`.
3. Replace the front matter and example content.
4. Put images in `assets/images/posts/post-slug/`.
5. Preview locally, then commit the Markdown and assets.

Required front matter:

~~~yaml
---
title: "Post title"
excerpt: "One-sentence summary shown on the blog index."
type: project
tags: [python, machine-learning]
published: true
---
~~~

Allowed types are `project`, `tutorial`, and `article`. Optional fields are:

~~~yaml
cover_image: /assets/images/posts/post-slug/cover.webp
cover_image_alt: "Accessible description of the cover image"
repository_url: https://github.com/account/project
demo_url: https://example.com
last_modified_at: 2026-09-12
release_id: 2026-09-12-display
observatory: true
~~~

The date comes from the filename. Post URLs use `/blog/post-slug/`.
Keep an existing filename when updating a published article so its URL stays
stable. Set `last_modified_at` when making a substantive revision. The
`observatory` flag loads the local chart runtime; use it only for posts that
actually reference an Observatory snapshot. `release_id` identifies that snapshot,
not the date of the original article. General posts do not need either field.

Use `<!--more-->` to mark the excerpt boundary. Cite institutional figures and
methods near the claims they support, label your calculations separately, and
check source-specific reuse conditions before adding third-party material.

## Supported post content

- GitHub-Flavored Markdown
- Rouge syntax-highlighted fenced code blocks
- MathJax equations using `$...$` or `$$...$$`
- Mermaid diagrams using a fenced `mermaid` block
- Tables, images, lists, links, and styled blockquotes

Always include descriptive alternative text with Markdown images:

~~~markdown
![Description of the result](/assets/images/posts/post-slug/result.webp)
~~~

## Local preview

Install Ruby and Bundler, then run from a fresh clone in PowerShell:

~~~powershell
git clone https://github.com/kostasfot/kostasfot.github.io.git
Set-Location kostasfot.github.io
bundle install
bundle exec jekyll serve --livereload --drafts
~~~

Open `http://localhost:4000`. Drafts appear only when `--drafts` is supplied.

Build the production site with:

~~~powershell
bundle exec jekyll build --trace
~~~

The generated site is written to `_site/`, which is ignored by Git. Draft previews
are not production builds. Do not commit `_site/`, local dependency directories or
raw institutional data.

For changes to the Observatory or its article, also run the offline Node tests:

~~~powershell
node --test tests/observatory.test.mjs
~~~

No npm installation is required. The verified September 12 release passed all
**9 website tests**, the production Jekyll build, and desktop/390px phone checks.
Tests cover source checksums, article/table agreement, chart references, filter
scope, phone-label data preservation and the absence of download controls/assets.

## Publishing

GitHub Pages builds from the `main` branch repository root. Merging a valid post into `main` updates:

- `/blog/`
- `/blog/post-slug/`
- `/feed.xml`
- `/sitemap.xml`

No backend, database, or separate hosting service is required.

Use a focused branch and pull request. Review the diff, run the applicable tests
and production build, then merge to `main`. Check the `pages-build-deployment`
GitHub Actions run and verify the actual public pages after deployment. Keep
related article and dashboard changes in the same website release.

## Greek Tourism Observatory

### Architecture and source of truth

The analytics pipeline lives in
[tourism-analytics-learning-lab](https://github.com/kostasfot/tourism-analytics-learning-lab).
That repository owns ingestion, DuckDB, KPI calculations, source validation and
publication exports. This repository owns the website presentation and the
published article—not a second copy of the analytical pipeline.

The native reader renders precomputed Plotly specifications and reviewed tables.
It filters and formats values in JavaScript without recalculating KPIs. Plotly.js
4.0.0 is vendored with its license; fonts, navigation and chart colours match the
existing site. “Live” means online and interactive, **not automatically refreshed**
and not connected to the local research database.

### Updating the reviewed snapshot

1. Follow the analytics repository's
   [publication workflow](https://github.com/kostasfot/tourism-analytics-learning-lab/blob/main/docs/data/public-observatory-publication.md)
   to review source coverage, terms, provenance and numerical checks.
2. Export from a committed analytics revision. Copy only the reviewed rendering
   `snapshot.json` and `manifest.json` into a new versioned assets directory.
3. Update the dashboard and article snapshot paths together. Update the article's
   `release_id`, revision date, figures, tables and claims to match the new evidence.
   Update the test fixture's release path and assertions when the release changes.
4. Preserve `.gitattributes`: it protects publication checksums from Git newline
   conversion. Never manually edit generated chart coordinates to fix a finding.
5. Run the Node suite and Jekyll build. Inspect desktop and phone layouts, travel
   and accommodation filters, missing comparisons, table values and source links.
6. Publish through the pull-request workflow above. Verify the live snapshot hash,
   both pages and the absence of dataset-download links or files.

This is a manual reviewed-release process; no automatic refresh job is configured.
See [DESIGN.md](DESIGN.md) for the presentation contract and validation history.

### Official data and attribution

Direct readers to the source providers for downloads, revisions and methodology:

- [ELSTAT accommodation statistics](https://www.statistics.gr/en/statistics/-/publication/STO12/2025).
- [Eurostat tourism data](https://ec.europa.eu/eurostat/web/tourism/information-data).
- [Bank of Greece Travel Services](https://www.bankofgreece.gr/en/statistics/external-sector/balance-of-payments/travel-services).
- [Fraport Greece traffic reports](https://www.fraport-greece.com/en/our-expertise/aviation/traffic-figures.html).
- [Eurostat GISCO NUTS boundaries](https://ec.europa.eu/eurostat/web/gisco/geodata/statistical-units/territorial-units-statistics).

The article and dashboard distinguish official observations from Konstantinos
Fotoglou's original calculations, charts and commentary. Attribution is not a
blanket reuse license, endorsement or legal guarantee. Consult the source-specific
terms and the analytics repository's
[publication register](https://github.com/kostasfot/tourism-analytics-learning-lab/blob/main/config/publication-rights.json).
Do not upload the research database, original workbooks, source PDFs or logos as
part of a website snapshot.
