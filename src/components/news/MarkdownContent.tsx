import type { ReactNode } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Quote,
  Sparkles,
  Star,
} from "lucide-react";

type MarkdownContentProps = {
  body: string;
  className?: string;
};

type Block =
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "code"; text: string }
  | { type: "hr" };

function isSafeHref(href: string): boolean {
  return /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(href.trim());
}

function paragraphBlock(text: string): Block {
  return { type: "paragraph", text };
}

function splitSentences(text: string): string[] {
  const parts: string[] = [];
  const re = /([^.!?…]+[.!?…]+)(\s+|$)/gu;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = re.exec(text))) {
    parts.push(match[1].trim());
    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex).trim());
  }

  if (parts.length <= 1) {
    return [text];
  }

  const blocks: string[] = [];
  let current = "";

  for (const sentence of parts) {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > 420) {
      if (current) {
        blocks.push(current);
      }
      current = sentence;
    } else {
      current = next;
    }
  }

  if (current) {
    blocks.push(current);
  }

  return blocks;
}

function hasMarkdownSyntax(text: string): boolean {
  return /(^|\n)\s*(#{1,4}\s+|[-*+]\s+|\d+\.\s+|>\s+|`{3}|-{3,}\s*$)|(\*\*[^*]+\*\*)|(__[^_]+__)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))/m.test(
    text,
  ) || /(^|\n)\s*\|.+\|\s*\n\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*/m.test(text);
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("|")) {
    return false;
  }

  return trimmed
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.includes("|");
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isBlockStart(line: string): boolean {
  const trimmed = line.trim();
  return (
    /^#{1,4}\s+/.test(trimmed) ||
    /^[-*+]\s+/.test(trimmed) ||
    /^\d+\.\s+/.test(trimmed) ||
    /^>\s?/.test(trimmed) ||
    (isTableRow(trimmed) && isTableSeparator(trimmed)) ||
    /^-{3,}$/.test(trimmed) ||
    /^```/.test(trimmed)
  );
}

function parseBlocks(raw: string): Block[] {
  const text = raw.trim().replace(/\r\n/g, "\n");
  if (!text) {
    return [];
  }

  const markdownLike = hasMarkdownSyntax(text);
  if (!markdownLike && !text.includes("\n")) {
    return splitSentences(text).map(paragraphBlock);
  }

  if (!markdownLike) {
    const separator = /\n{2,}/.test(text) ? /\n{2,}/ : /\n{1,}/;
    return text
      .split(separator)
      .map((part) => part.trim())
      .filter(Boolean)
      .map(paragraphBlock);
  }

  const lines = text.split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (/^```/.test(trimmed)) {
      index += 1;
      const code: string[] = [];
      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) {
        index += 1;
      }
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: Math.min(heading[1].length, 4) as 1 | 2 | 3 | 4,
        text: heading[2].trim(),
      });
      index += 1;
      continue;
    }

    if (/^-{3,}$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    if (
      isTableRow(trimmed) &&
      index + 1 < lines.length &&
      isTableSeparator(lines[index + 1])
    ) {
      const headers = parseTableRow(trimmed);
      index += 2;

      const rows: string[][] = [];
      while (index < lines.length && isTableRow(lines[index])) {
        rows.push(parseTableRow(lines[index]));
        index += 1;
      }

      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*+]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*+]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quote: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quote.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", text: quote.join("\n") });
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !isBlockStart(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join("\n") });
  }

  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern =
    /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|_[^_]+_)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${match.index}-${token}`;

    if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      nodes.push(<strong key={key}>{renderInline(token.slice(2, -2))}</strong>);
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const close = token.indexOf("](");
      const label = token.slice(1, close);
      const href = token.slice(close + 2, -1).trim();
      if (isSafeHref(href)) {
        const external = /^https?:\/\//i.test(href);
        nodes.push(
          <a
            key={key}
            href={href}
            rel={external ? "noopener noreferrer" : undefined}
            target={external ? "_blank" : undefined}
          >
            {renderInline(label)}
          </a>,
        );
      } else {
        nodes.push(label);
      }
    } else if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      nodes.push(<em key={key}>{renderInline(token.slice(1, -1))}</em>);
    }

    lastIndex = tokenPattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export default function MarkdownContent({
  body,
  className,
}: MarkdownContentProps): React.JSX.Element {
  const blocks = parseBlocks(body);
  const rootClassName = ["prose prose-elen dark:prose-invert", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const children = renderInline(block.text);
          if (block.level === 1) return <h1 key={index}>{children}</h1>;
          if (block.level === 2) return <h2 key={index}>{children}</h2>;
          if (block.level === 3) return <h3 key={index}>{children}</h3>;
          return <h4 key={index}>{children}</h4>;
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={index} className="prose-elen-check-list">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <CheckCircle2 className="prose-elen-list-icon" aria-hidden="true" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol key={index} className="prose-elen-step-list">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <span className="prose-elen-step-number">{itemIndex + 1}</span>
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote key={index}>
              <Quote className="prose-elen-quote-icon" aria-hidden="true" />
              <span>{renderInline(block.text)}</span>
            </blockquote>
          );
        }

        if (block.type === "table") {
          return (
            <div key={index} className="prose-elen-table-wrap">
              <table className="prose-elen-table">
                <thead>
                  <tr>
                    {block.headers.map((header, headerIndex) => (
                      <th key={headerIndex}>
                        <span className="prose-elen-table-heading">
                          {headerIndex === 0 ? (
                            <Sparkles aria-hidden="true" />
                          ) : headerIndex === block.headers.length - 1 ? (
                            <Star aria-hidden="true" />
                          ) : (
                            <ArrowRight aria-hidden="true" />
                          )}
                          {renderInline(header)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {block.headers.map((_header, cellIndex) => (
                        <td key={cellIndex}>{renderInline(row[cellIndex] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === "code") {
          return (
            <pre key={index}>
              <code>{block.text}</code>
            </pre>
          );
        }

        if (block.type === "hr") {
          return <hr key={index} />;
        }

        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
