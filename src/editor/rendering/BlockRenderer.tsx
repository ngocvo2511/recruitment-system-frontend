import { getBlockRenderer } from "../blocks/registry";
import { CvBlock } from "../core/schema";

type BlockRendererProps = {
  block: CvBlock;
  selected: boolean;
  onSelect: () => void;
};

export function BlockRenderer({ block, selected, onSelect }: BlockRendererProps) {
  const Renderer = getBlockRenderer(block.type);
  if (!Renderer) {
    return (
      <div className="rounded-xl border border-dashed border-surface-container-high bg-white px-4 py-3 text-xs text-on-surface-variant">
        Unsupported block: {block.type}
      </div>
    );
  }

  return <Renderer block={block} selected={selected} onSelect={onSelect} />;
}
