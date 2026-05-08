import { CvSectionBlock } from "../../core/schema";
import type { BlockRendererProps } from "../registry";

export function SectionBlock({ block, selected, onSelect }: BlockRendererProps<CvSectionBlock>) {
  const { sectionType, title, data } = block.props;
  const description = typeof data === "object" && data !== null ? Object.keys(data).join(", ") : String(data ?? "");

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
      <div className="text-sm font-bold text-on-surface">{title}</div>
      <div className="text-[11px] text-on-surface-variant uppercase tracking-[0.2em] mt-1">
        {sectionType}
      </div>
      {description && (
        <div className="text-xs text-on-surface-variant mt-2 line-clamp-2">{description}</div>
      )}
    </div>
  );
}
