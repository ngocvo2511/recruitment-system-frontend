import { CvTextBlock } from "../../core/schema";
import type { BlockRendererProps } from "../registry";

export function TextBlock({ block, selected, onSelect }: BlockRendererProps<CvTextBlock>) {
  const { title, content } = block.props;
  const preview = content.blocks
    .map((textBlock) => textBlock.spans.map((span) => span.text).join(""))
    .join(" ")
    .trim();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onSelect();
        }
      }}
      className={`rounded-xl border px-4 py-3 transition-colors ${
        selected ? "border-primary/50 bg-primary/5" : "border-surface-container-high bg-white"
      }`}
    >
      {title && <div className="text-sm font-bold text-on-surface">{title}</div>}
      <div className="text-xs text-on-surface-variant mt-2 line-clamp-3">
        {preview || "Empty text"}
      </div>
    </div>
  );
}
