# Chemistry 2e Companion

A glossary, timeline and element discovery map that follow the chapters of
[OpenStax Chemistry 2e](https://openstax.org/details/books/chemistry-2e),
written in our own words. Plain HTML/CSS/JavaScript — no build step —
published with GitHub Pages.

**Live site:** https://sarahmlammert.github.io/chemistry/ (after Pages is enabled)

## Project layout

```
index.html              Home page
.nojekyll               Tells GitHub Pages to serve files as-is
assets/
  css/style.css         Shared styles (light + dark mode)
  js/terms.js           Reads data/terms/*.md for the glossary
  js/md.js              Small text formatter used by the timeline
data/
  terms/                Glossary terms, one file per chapter + fields.md
  timeline.md           Timeline events
  element-discovery.json  Year, discoverer and place for all 118 elements
  world-map.json        World outline for the discovery map (Natural Earth)
tools/
  glossary/             Searchable glossary built from data/terms
  timeline/             Timeline built from data/timeline.md
  element-discovery/    Periodic table + world map of where/when elements were found
docs/
  WRITING-TERMS.md      How to write glossary terms
  WRITING-THE-TIMELINE.md  How to write timeline events
```

## Run locally

The pages load their data with `fetch`, so open them through a local server
rather than double-clicking the file:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Publish on GitHub Pages

1. Push to `main`.
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, folder `/ (root)`.
3. The site appears at `https://sarahmlammert.github.io/chemistry/` within a minute or two.

## Attribution and the book's license

Topics follow *Chemistry 2e* by Paul Flowers, Klaus Theopold, Richard Langley
and William R. Robinson, published by OpenStax and licensed
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
Access for free at https://openstax.org/books/chemistry-2e/pages/1-introduction.

- **Everything is written in our own words.** The site follows the book's
  order of topics and links to it, but doesn't reproduce its text, figures or
  problems.
- **If book text is ever quoted**, mark it `from: book` (the glossary then
  shows "— Chemistry 2e §x.y"); that content falls under the book's
  CC BY-NC-SA 4.0 license: credited, noncommercial, same license.
- **No AI processing of the book.** OpenStax does not allow the book to be
  used to train AI models or be fed into generative AI tools without written
  permission.

This project is not affiliated with or endorsed by OpenStax.

**Element discovery map:** discovery dates and discoverers were checked against
Wikipedia's [Timeline of chemical element discoveries](https://en.wikipedia.org/wiki/Timeline_of_chemical_element_discoveries);
where the commonly credited year differs from the earliest report, the
element's note says so. Map outlines are from [Natural Earth](https://www.naturalearthdata.com/)
(public domain) via [world-atlas](https://github.com/topojson/world-atlas) (ISC license).

The site's code and content are licensed under the terms in [LICENSE](LICENSE).
