// terms.js — loads the vocabulary written in data/terms/*.md and turns it into
// terms (nodes) and links (edges). Used by both the Glossary and the Connection Map.
//
// File format (see docs/WRITING-TERMS.md):
//   ## Term Name
//   field: chemistry
//   section: 1.2
//   needs: other term, another term
//   ...
//   Your definition, in your own words, on the lines after the fields.

const here = (p) => new URL(p, import.meta.url).href;

/** Fields that hold a single value. */
const SINGLE = ["kind", "field", "section", "from"];
/** Fields that hold a comma-separated list. */
const LISTS = ["aka", "needs", "explains", "applies-to", "related", "confused-with", "tools"];

/** The kinds of links between terms, and how to read them: "<term> <label> <other>". */
export const LINK_TYPES = {
  "needs":         { label: "needs",          inverse: "is needed for", directed: true },
  "explains":      { label: "explains",       inverse: "is explained by", directed: true },
  "applies-to":    { label: "applies to",     inverse: "uses", directed: true },
  "related":       { label: "related to",     inverse: "related to", directed: false },
  "confused-with": { label: "often confused with", inverse: "often confused with", directed: false },
};

export const slug = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
   .trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Parse the text of one terms file. Returns { terms: [...], warnings: [...] }. */
export function parseTermsFile(text, source) {
  const warnings = [];
  const fileChapter = (source.match(/ch(\d+)/) || [])[1];
  // Strip <!-- comments --> (used for instructions inside the files).
  // Keep the line breaks so warning line numbers match the file.
  const clean = text.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ""));
  const terms = [];
  let cur = null;

  const finish = () => {
    if (!cur) return;
    cur.definition = cur._body.join(" ").replace(/\s+/g, " ").trim();
    delete cur._body;
    terms.push(cur);
  };

  clean.split(/\r?\n/).forEach((line, i) => {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      finish();
      const name = heading[1];
      cur = {
        id: slug(name), name, source,
        kind: "concept", field: "", section: "", from: "",
        chapter: fileChapter ? Number(fileChapter) : null,
        _body: [],
      };
      LISTS.forEach((k) => (cur[k] = []));
      return;
    }
    if (!cur) return; // text before the first term (e.g. "# Chapter 1") is ignored
    const kv = line.match(/^([a-z-]+):\s*(.*)$/i);
    if (kv && (SINGLE.includes(kv[1].toLowerCase()) || LISTS.includes(kv[1].toLowerCase()))) {
      const key = kv[1].toLowerCase();
      const val = kv[2].trim();
      if (LISTS.includes(key)) cur[key] = val ? val.split(",").map((s) => s.trim()).filter(Boolean) : [];
      else cur[key] = val;
      return;
    }
    if (kv) warnings.push(`${source} line ${i + 1}: unknown field "${kv[1]}" (treated as part of the definition)`);
    if (line.trim()) cur._body.push(line.trim());
  });
  finish();

  for (const t of terms) {
    t.kind = (t.kind || "concept").toLowerCase();
    t.field = slug(t.field || (t.kind === "field" ? t.name : ""));
    if (!t.chapter && /^\d+/.test(t.section)) t.chapter = Number(t.section.split(".")[0]);
    // "from:" says where the definition's wording comes from (e.g. "book" or "mine").
    t.fromBook = /book|2e|openstax|textbook/i.test(t.from || "");
  }
  return { terms, warnings };
}

/**
 * Load every file listed in data/terms/manifest.json.
 * Returns:
 *   terms    Map id -> term (includes "ghost" terms: referenced but not written yet)
 *   edges    [{ source, target, type }]  read as "source <type> target"
 *   warnings [string]
 *   stats    { written, unwritten, ghosts, total }
 */
export async function loadTerms() {
  const base = here("../../data/terms/");
  const manifest = await (await fetch(base + "manifest.json", { cache: "no-cache" })).json();
  const terms = new Map();
  const warnings = [];

  for (const file of manifest.files) {
    const res = await fetch(base + file, { cache: "no-cache" });
    if (!res.ok) { warnings.push(`Could not load ${file}`); continue; }
    const parsed = parseTermsFile(await res.text(), file);
    warnings.push(...parsed.warnings);
    for (const t of parsed.terms) {
      const prev = terms.get(t.id);
      if (!prev) { terms.set(t.id, t); continue; }
      if (prev.kind === "field" || t.kind === "field") {
        // A field (fields.md) can also appear as a chapter term: merge the two.
        const merged = { ...prev };
        for (const k of ["section", "from", "definition"]) if (t[k]) merged[k] = t[k];
        if (t.chapter) { merged.chapter = t.chapter; merged.source = t.source; }
        for (const k of LISTS) merged[k] = [...new Set([...(prev[k] || []), ...(t[k] || [])])];
        merged.kind = "field";
        merged.field = prev.kind === "field" ? prev.field : t.field;
        terms.set(t.id, merged);
      } else {
        warnings.push(`"${t.name}" is defined twice (${prev.source} and ${file}); keeping the first.`);
      }
    }
  }

  // Build links. Anything referenced but not written becomes a ghost term.
  const edges = [];
  const seen = new Set();
  const ensure = (name, from) => {
    const id = slug(name);
    if (!terms.has(id)) {
      terms.set(id, {
        id, name, ghost: true, kind: "concept", field: "", section: "", chapter: null,
        definition: "", source: null, referencedBy: [],
        ...Object.fromEntries(LISTS.map((k) => [k, []])),
      });
    }
    const t = terms.get(id);
    if (t.ghost && !t.referencedBy.includes(from)) t.referencedBy.push(from);
    return id;
  };
  for (const t of [...terms.values()]) {
    if (t.ghost) continue;
    for (const type of Object.keys(LINK_TYPES)) {
      for (const name of t[type]) {
        const target = ensure(name, t.name);
        if (target === t.id) continue;
        const key = LINK_TYPES[type].directed
          ? `${type}|${t.id}|${target}`
          : `${type}|${[t.id, target].sort().join("|")}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({ source: t.id, target, type });
      }
    }
    if (t.field && !terms.has(t.field)) warnings.push(`"${t.name}" has field "${t.field}", which isn't in fields.md.`);
  }

  const all = [...terms.values()];
  // Count chapter terms, including fields that also appear in a chapter (like Chemistry).
  const real = all.filter((t) => !t.ghost && (t.kind !== "field" || t.chapter));
  const stats = {
    written: real.filter((t) => t.definition).length,
    unwritten: real.filter((t) => !t.definition).length,
    ghosts: all.filter((t) => t.ghost).length,
    total: real.length,
  };
  return { terms, edges, warnings, stats };
}

/** All links touching a term, phrased from that term's point of view. */
export function linksFor(id, terms, edges) {
  const out = [];
  for (const e of edges) {
    const lt = LINK_TYPES[e.type];
    if (e.source === id) out.push({ type: e.type, label: lt.label, other: terms.get(e.target) });
    else if (e.target === id) out.push({ type: e.type, label: lt.inverse, other: terms.get(e.source) });
  }
  return out;
}

/** A stable color for each field, in the order fields appear in fields.md. */
const PALETTE = ["#1f6feb", "#d1495b", "#2a9d8f", "#e9a03b", "#8e5ad6", "#3a86ff", "#6a994e", "#c2477e", "#4d908e", "#b5651d"];
export function fieldColors(terms) {
  const map = new Map();
  let i = 0;
  for (const t of terms.values()) if (t.kind === "field" && !map.has(t.id)) map.set(t.id, PALETTE[i++ % PALETTE.length]);
  return map;
}

export const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
