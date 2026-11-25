# Writing the timeline

Timeline events go in `data/timeline.md`, one per `##` heading:

```markdown
## 1803 — Dalton proposes atomic theory
who: John Dalton
field: chemistry
terms: hypothesis
key: yes

What happened and why it mattered, in your own words.
```

| Line | What it means |
|---|---|
| `## year — title` | The year, a dash, and a short title. |
| `who:` | People involved (optional). |
| `field:` | A field from `data/terms/fields.md`; colors the dot (optional). |
| `terms:` | Glossary terms, comma-separated; shown as links (optional). |
| `key: yes` | Marks a key moment: highlighted, and shown under "Key moments only". |
| `era:` | Your own group label, e.g. `The birth of modern chemistry`. Without it, events are grouped by century. |

Years can be `1803`, `c. 1600`, `400 BCE` or `1890s`. Events sort themselves,
so you can add them in any order.

Text formatting in the description: blank line = new paragraph, `- ` for
lists, `**bold**`, `*italic*`, `H_{2}O` for subscripts, `10^{-3}` for
superscripts, `[link](https://…)`.

Preview locally with `python3 -m http.server`, then open
`localhost:8000/tools/timeline/`.
