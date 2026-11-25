// md.js — tiny, safe markdown used by the timeline.

/**
 * Tiny, safe markdown: paragraphs, "- " lists, **bold**, *italic*, `code`,
 * [links](url), and chemistry-friendly H_{2}O (subscript) and x^{2} (superscript).
 */
export function md(text) {
  if (!text) return "";
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const inline = (s) =>
    esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
      .replace(/_\{([^}]*)\}/g, "<sub>$1</sub>")
      .replace(/\^\{([^}]*)\}/g, "<sup>$1</sup>")
      .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\.\.?\/|#)[^)\s]*)\)/g, '<a href="$2">$1</a>');
  // Pull out ``` fenced blocks first (they may contain blank lines).
  // ```mermaid blocks become diagrams; anything else is shown as code.
  const fences = [];
  text = text.replace(/^```\s*([\w-]*)\s*\n([\s\S]*?)^```\s*$/gm, (_, lang, code) => {
    fences.push(lang.toLowerCase() === "mermaid"
      ? `<div class="diagram"><pre class="mermaid">${esc(code.replace(/\s+$/, ""))}</pre></div>`
      : `<pre><code>${esc(code.replace(/\s+$/, ""))}</code></pre>`);
    return `\n\n\u0000${fences.length - 1}\u0000\n\n`;
  });
  return text.split(/\n\s*\n/).map((block) => {
    const fence = block.trim().match(/^\u0000(\d+)\u0000$/);
    if (fence) return fences[+fence[1]];
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length && lines.every((l) => /^[-*]\s+/.test(l)))
      return "<ul>" + lines.map((l) => `<li>${inline(l.replace(/^[-*]\s+/, ""))}</li>`).join("") + "</ul>";
    if (lines.length && lines.every((l) => /^\d+[.)]\s+/.test(l)))
      return "<ol>" + lines.map((l) => `<li>${inline(l.replace(/^\d+[.)]\s+/, ""))}</li>`).join("") + "</ol>";
    return `<p>${lines.map(inline).join("<br>")}</p>`;
  }).join("");
}
