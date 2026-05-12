import { BlockRenderer } from "./BlockRenderer";
import { EditorStore, useEditorActions, useEditorDocument, useSelectedBlock } from "../core/store";
import { CvSectionBlock } from "../core/schema";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type EditorCanvasProps = {
  store: EditorStore;
};

type SortableBlockProps = {
  id: string;
  children: React.ReactNode;
};

function SortableBlock({ id, children }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export function EditorCanvas({ store }: EditorCanvasProps) {
  const document = useEditorDocument(store);
  const selected = useSelectedBlock(store);
  const { selectBlock, updateBlock, reorderBlocks, removeBlock } = useEditorActions(store);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleFieldChange = ({ blockId, itemId, key, value }: { blockId: string; itemId: string; key: string; value: string }) => {
    updateBlock(blockId, (block) => {
      if (block.type !== "section") {
        return block;
      }
      const section = block as CvSectionBlock;
      return {
        ...section,
        props: {
          ...section.props,
          items: section.props.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  fields: {
                    ...item.fields,
                    [key]: value,
                  },
                }
              : item,
          ),
        },
      };
    });
  };

  const handleAddItem = (blockId: string) => {
    updateBlock(blockId, (block) => {
      if (block.type !== "section") {
        return block;
      }
      const section = block as CvSectionBlock;
      const emptyFields: Record<string, string> = {};
      section.props.fields.forEach((field) => {
        emptyFields[field.key] = "";
      });
      return {
        ...section,
        props: {
          ...section.props,
          items: [
            ...section.props.items,
            {
              id: typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              fields: emptyFields,
            },
          ],
        },
      };
    });
  };

  const handleRemoveItem = ({ blockId, itemId }: { blockId: string; itemId: string }) => {
    updateBlock(blockId, (block) => {
      if (block.type !== "section") {
        return block;
      }
      const section = block as CvSectionBlock;
      return {
        ...section,
        props: {
          ...section.props,
          items: section.props.items.filter((item) => item.id !== itemId),
        },
      };
    });
  };

  const handleReorderItems = ({ blockId, orderedIds }: { blockId: string; orderedIds: string[] }) => {
    updateBlock(blockId, (block) => {
      if (block.type !== "section") {
        return block;
      }
      const section = block as CvSectionBlock;
      const itemMap = new Map(section.props.items.map((item) => [item.id, item]));
      const reordered = orderedIds.map((id) => itemMap.get(id)).filter((item): item is CvSectionBlock["props"]["items"][number] => !!item);
      return {
        ...section,
        props: {
          ...section.props,
          items: reordered,
        },
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const currentIds = document.blocks.map((block) => block.id);
    const activeBlock = document.blocks.find((block) => block.id === String(active.id));
    const overBlock = document.blocks.find((block) => block.id === String(over.id));
    if (activeBlock?.locked || overBlock?.locked) {
      return;
    }
    const fromIndex = currentIds.indexOf(String(active.id));
    const toIndex = currentIds.indexOf(String(over.id));
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }
    const nextOrder = arrayMove(currentIds, fromIndex, toIndex);
    reorderBlocks(nextOrder);
  };

  const handleMove = (blockId: string, direction: "up" | "down") => {
    const current = document.blocks.map((block) => block.id);
    const index = current.indexOf(blockId);
    if (index < 0) {
      return;
    }
    if (document.blocks[index]?.locked) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) {
      return;
    }
    const next = [...current];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    reorderBlocks(next);
  };

  return (
    <div
      className="space-y-3"
      style={{
        fontFamily: document.theme.fontFamily,
        fontSize: `${document.theme.baseFontSize}px`,
        lineHeight: String(document.theme.lineHeight),
        color: document.theme.colors.text,
        backgroundColor: document.theme.colors.background,
      }}
    >
      {document.blocks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-white px-4 py-6 text-sm text-on-surface-variant">
          No blocks yet. Add a section to start building.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={document.blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
            {document.blocks.map((block) => (
              <SortableBlock key={block.id} id={block.id}>
                <BlockRenderer
                  block={block}
                  selected={selected === block.id}
                  onSelect={() => selectBlock(block.id)}
                  onFieldChange={handleFieldChange}
                  onAddItem={handleAddItem}
                  onRemoveItem={handleRemoveItem}
                  onReorderItems={handleReorderItems}
                  onMoveUp={block.locked ? undefined : () => handleMove(block.id, "up")}
                  onMoveDown={block.locked ? undefined : () => handleMove(block.id, "down")}
                  onDelete={block.locked ? undefined : () => removeBlock(block.id)}
                />
              </SortableBlock>
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
