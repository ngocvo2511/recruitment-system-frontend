import { getBlockRenderer } from "../blocks/registry";
import { CvBlock } from "../core/schema";

type BlockRendererProps = {
  block: CvBlock;
  selected: boolean;
  onSelect: () => void;
  onFieldChange?: (payload: { blockId: string; itemId: string; key: string; value: string }) => void;
  onAddItem?: (blockId: string) => void;
  onRemoveItem?: (payload: { blockId: string; itemId: string }) => void;
  onReorderItems?: (payload: { blockId: string; orderedIds: string[] }) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
};

export function BlockRenderer({
  block,
  selected,
  onSelect,
  onFieldChange,
  onAddItem,
  onRemoveItem,
  onReorderItems,
  onMoveUp,
  onMoveDown,
  onDelete,
}: BlockRendererProps) {
  const Renderer = getBlockRenderer(block.type);
  if (!Renderer) {
    return (
      <div className="rounded-xl border border-dashed border-surface-container-high bg-white px-4 py-3 text-xs text-on-surface-variant">
        Unsupported block: {block.type}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold shadow-sm">
        {onMoveUp && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onMoveUp();
            }}
            className="rounded-full px-2 py-1 hover:bg-surface-container-high"
          >
            Up
          </button>
        )}
        {onMoveDown && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onMoveDown();
            }}
            className="rounded-full px-2 py-1 hover:bg-surface-container-high"
          >
            Down
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="rounded-full px-2 py-1 text-error hover:bg-error/10"
          >
            Delete
          </button>
        )}
      </div>
      <Renderer
        block={block}
        selected={selected}
        onSelect={onSelect}
        onFieldChange={onFieldChange}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onReorderItems={onReorderItems}
      />
    </div>
  );
}
