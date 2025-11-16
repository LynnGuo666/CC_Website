import React from "react";

type MarkdownViewerProps = {
  content: string;
};

// Minimal, safe-ish Markdown renderer: escapes HTML first, then applies a few markdown patterns.
function toHtml(md: string): string {
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  let html = escapeHtml(md);

  // code block ``` ```
  html = html.replace(/```([\s\S]*?)```/g, (_m, code) => {
    return `<pre class="rounded-xl bg-slate-900/80 text-slate-50 p-4 overflow-auto"><code>${code
      .trim()
      .replace(/\n/g, "<br/>")}</code></pre>`;
  });

  // headings ##, #
  html = html.replace(/^###\s?(.*)$/gm, "<h3 class=\"text-lg font-semibold mt-4 mb-2\">$1</h3>");
  html = html.replace(/^##\s?(.*)$/gm, "<h2 class=\"text-xl font-semibold mt-4 mb-2\">$1</h2>");
  html = html.replace(/^#\s?(.*)$/gm, "<h1 class=\"text-2xl font-bold mt-4 mb-2\">$1</h1>");

  // bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // unordered lists
  html = html.replace(/^(?:-\s.+\n?)+/gm, (block) => {
    const items = block
      .trim()
      .split(/\n+/)
      .map((line) => line.replace(/^-+\s?/, "").trim())
      .map((item) => `<li class="leading-relaxed">${item}</li>`)
      .join("");
    return `<ul class="list-disc pl-5 space-y-1 mt-2 mb-3">${items}</ul>`;
  });

  // paragraphs (double line breaks)
  html = html
    .split(/\n{2,}/)
    .map((para) => {
      // ignore blocks that already wrapped (code/list/heading)
      if (/^<(h\d|ul|pre)/.test(para.trim())) {
        return para;
      }
      return `<p class="leading-relaxed text-foreground/90">${para.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return html;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  if (!content?.trim()) {
    return (
      <p className="text-sm text-muted-foreground">
        暂无规则说明，可在后台录入 Markdown 文本。
      </p>
    );
  }

  const html = toHtml(content);

  return (
    <div
      className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground prose-code:text-foreground/90"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
