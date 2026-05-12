import { CvFieldDefinition, CvSectionBlock, CvSectionItem } from "../../core/schema";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BlockRendererProps } from "../registry";

type SectionBlockProps = BlockRendererProps<CvSectionBlock> & {
  onFieldChange?: (payload: {
    blockId: string;
    itemId: string;
    key: string;
    value: string;
  }) => void;
  onAddItem?: (blockId: string) => void;
  onRemoveItem?: (payload: { blockId: string; itemId: string }) => void;
  onReorderItems?: (payload: { blockId: string; orderedIds: string[] }) => void;
};

type SortableItemProps = {
  id: string;
  children: React.ReactNode;
};

function SortableItem({ id, children }: SortableItemProps) {
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

function renderField(
  field: CvFieldDefinition,
  item: CvSectionItem,
  onFieldChange: SectionBlockProps["onFieldChange"] | undefined,
  blockId: string,
) {
  const value = item.fields[field.key] ?? "";
  const trimmedValue = value.trim();
  const hasRequiredError = field.required && trimmedValue.length === 0;
  const hasLengthError = field.maxLength !== undefined && value.length > field.maxLength;
  const commonProps = {
    value,
    placeholder: field.placeholder ?? field.label,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onFieldChange?.({ blockId, itemId: item.id, key: field.key, value: event.target.value });
    },
    className:
      `w-full rounded-lg border px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 ${
        hasRequiredError || hasLengthError
          ? "border-error/60 bg-error/5"
          : "border-surface-container-high bg-white"
      }`,
  };

  if (field.type === "textarea") {
    return <textarea {...commonProps} rows={3} />;
  }

  if (field.type === "select") {
    return (
      <select
        value={value}
        onChange={(event) => onFieldChange?.({ blockId, itemId: item.id, key: field.key, value: event.target.value })}
        className={commonProps.className}
      >
        <option value="">{field.placeholder ?? "Chon"}</option>
        {(field.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "tags") {
    return <input {...commonProps} type="text" placeholder={field.placeholder ?? "tag1, tag2"} />;
  }

  const inputType = field.type === "month" ? "month" : field.type === "date" ? "date" : "text";
  return <input {...commonProps} type={inputType} />;
}

export function SectionBlock({
  block,
  selected,
  onSelect,
  onFieldChange,
  onAddItem,
  onRemoveItem,
  onReorderItems,
}: SectionBlockProps) {
  const { sectionType, title, repeatable, fields, items } = block.props;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const ids = items.map((item) => item.id);
    const fromIndex = ids.indexOf(String(active.id));
    const toIndex = ids.indexOf(String(over.id));
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }
    const nextOrder = arrayMove(ids, fromIndex, toIndex);
    onReorderItems?.({ blockId: block.id, orderedIds: nextOrder });
  };

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
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-on-surface">{title}</div>
          <div className="text-[11px] text-on-surface-variant uppercase tracking-[0.2em] mt-1">
            {sectionType}
          </div>
        </div>
        {repeatable && !block.locked && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAddItem?.(block.id);
            }}
            className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-white"
          >
            Them muc
          </button>
        )}
      </div>
      <div className="mt-3 space-y-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            {items.map((item, itemIndex) => (
              <SortableItem key={item.id} id={item.id}>
                <div className="rounded-xl border border-surface-container-high bg-surface-container-high/20 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.18em]">
                      Item {itemIndex + 1}
                    </div>
                    {repeatable && items.length > 1 && !block.locked && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemoveItem?.({ blockId: block.id, itemId: item.id });
                        }}
                        className="text-[11px] font-bold text-error"
                      >
                        Xoa
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {fields.map((field) => {
                      const value = item.fields[field.key] ?? "";
                      const trimmedValue = value.trim();
                      const hasRequiredError = field.required && trimmedValue.length === 0;
                      const hasLengthError = field.maxLength !== undefined && value.length > field.maxLength;
                      return (
                        <label key={field.key} className="text-[11px] font-semibold text-on-surface-variant">
                          <div className="flex items-center gap-1">
                            <span>{field.label}</span>
                            {field.required && <span className="text-error">*</span>}
                          </div>
                          {renderField(field, item, onFieldChange, block.id)}
                          {hasRequiredError && (
                            <div className="mt-1 text-[10px] text-error">Bat buoc</div>
                          )}
                          {hasLengthError && (
                            <div className="mt-1 text-[10px] text-error">
                              Vuot gioi han {field.maxLength} ky tu
                            </div>
                          )}
                          {!hasRequiredError && !hasLengthError && field.maxLength && (
                            <div className="mt-1 text-[10px] text-on-surface-variant">Max {field.maxLength} ky tu</div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
