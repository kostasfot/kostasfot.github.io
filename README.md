# kostasfot.github.io

Personal CV and technical blog for Konstantinos Fotoglou, published with GitHub Pages and Jekyll.

## Site structure

- The CV homepage is in `index.html`.
- Markdown posts live in `_posts/`.
- Unpublished drafts and the reusable post template live in `_drafts/`.
- Shared page layouts and navigation live in `_layouts/` and `_includes/`.
- Theme styles and browser scripts live in `assets/`.

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
~~~

The date comes from the filename. Post URLs use `/blog/post-slug/`.

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

Install Ruby and Bundler, then run:

~~~powershell
bundle install
bundle exec jekyll serve --livereload --drafts
~~~

Open `http://localhost:4000`. Drafts appear only when `--drafts` is supplied.

Build the production site with:

~~~powershell
bundle exec jekyll build --trace
~~~

The generated site is written to `_site/`, which is ignored by Git.

## Publishing

GitHub Pages builds from the `main` branch repository root. Merging a valid post into `main` updates:

- `/blog/`
- `/blog/post-slug/`
- `/feed.xml`
- `/sitemap.xml`

No backend, database, or separate hosting service is required.

## Greek Tourism Observatory

The public dashboard is at `/observatory/`; its companion article remains at
`/blog/greek-tourism-observatory/`. Both use one reviewed, versioned data snapshot.
“Live” means publicly accessible and interactive, not automatically refreshed.

The public release displays ELSTAT/Eurostat accommodation and selected Bank of
Greece national/regional travel observations with explicitly attributed original
calculations. Fraport traffic and GISCO geometry remain withheld. Readers seeking
datasets are directed to official providers: no CSV/ZIP assets, generated exports
or download section is supplied. The browser still receives chart/table JSON;
removing download controls is not an access restriction on displayed values.
Source terms and exclusions are visible in the dashboard. The September 12
display revision reuses the verified September 11 source vintage.

Run `node --test tests/observatory.test.mjs` before the Jekyll build. No npm
installation is required to run the site or these tests. Plotly.js is pinned
and vendored with its license. See `DESIGN.md` and the analytics repository's
`docs/data/public-observatory-publication.md` for the refresh/review process.
