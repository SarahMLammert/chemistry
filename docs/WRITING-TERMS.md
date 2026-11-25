# Writing terms

The glossary is built from the files in `data/terms/`. You write plain text;
the site does the rest.

```
data/terms/
  fields.md      the big fields of science (Chemistry, Physics, Biology, …)
  ch01.md        terms from Chapter 1
  ch02.md        …one file per chapter, up to ch21.md
  manifest.json  list of files to load (already includes all of the above)
```

## The format

Each term starts with `## Name`, then a few optional lines, then your
definition.

```markdown
## Hypothesis
field: chemistry
section: 1.1

A proposed explanation that can be tested.
```

| Line | What it means |
|---|---|
| `field:` | Which field it belongs to (must match a name in `fields.md`). Sets the color and the Field filter. |
| `section:` | Chemistry 2e section, e.g. `1.1`. Shown as a tag; also sets the chapter. |

Optional lines, if you ever want them:

| Line | What it means |
|---|---|
| `aka:` | Other names or symbols, shown next to the name |
| `needs:` | Terms you must understand first |
| `explains:` | Terms this one helps explain |
| `applies-to:` | Where it shows up (other fields, real life) |
| `related:` | Loosely connected terms |
| `confused-with:` | Terms people mix up with this one (shown as a ⚠ warning) |
| `from: book` | Only if you quote the book: adds "— Chemistry 2e §x.y" |

Links (`needs:`, `related:`, …) are by name and comma-separated. Capitals and
spaces don't matter. If you link to a term that doesn't have an entry yet, it
appears in the glossary's "still to write" list.

## Tips

- Write definitions in your own words.
- A line like `Note: …` that isn't one of the fields above becomes part of the
  definition; the glossary lists these under "formatting notes".
- Two entries with the same name: the first one wins, and you get a note.
- Comments `<!-- like this -->` are ignored, so you can leave yourself
  reminders in the files.
- Preview locally with `python3 -m http.server`, then open
  `localhost:8000/tools/glossary/`.
