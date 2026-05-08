import { BlockRenderer } from "./BlockRenderer";
import { EditorStore, useEditorActions, useEditorDocument, useSelectedBlock } from "../core/store";

type EditorCanvasProps = {
  store: EditorStore;
};

export function EditorCanvas({ store }: EditorCanvasProps) {
  const document = useEditorDocument(store);
  const selected = useSelectedBlock(store);
  const { selectBlock } = useEditorActions(store);

  return (
    <div className="space-y-3">
      {document.blocks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-container-high bg-white px-4 py-6 text-sm text-on-surface-variant">
          No blocks yet. Add a section to start building.
        </div>
      ) : (
        document.blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            selected={selected === block.id}
            onSelect={() => selectBlock(block.id)}
          />
        ))
      )}
    </div>
  );
}
