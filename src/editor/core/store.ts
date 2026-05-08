import { useCallback, useMemo, useSyncExternalStore } from "react";
import { CvBlock, CvDocument } from "./schema";

type EditorState = {
  document: CvDocument;
  selectedBlockId: string | null;
};

type EditorListener = () => void;

type EditorStore = {
  getState: () => EditorState;
  subscribe: (listener: EditorListener) => () => void;
  setDocument: (document: CvDocument) => void;
  selectBlock: (blockId: string | null) => void;
  updateBlock: (blockId: string, updater: (block: CvBlock) => CvBlock) => void;
  addBlock: (block: CvBlock, index?: number) => void;
  removeBlock: (blockId: string) => void;
  reorderBlocks: (order: string[]) => void;
};

function createStore(initial: CvDocument): EditorStore {
  let state: EditorState = {
    document: initial,
    selectedBlockId: null,
  };
  const listeners = new Set<EditorListener>();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setDocument: (document) => {
      state = { ...state, document };
      notify();
    },
    selectBlock: (blockId) => {
      state = { ...state, selectedBlockId: blockId };
      notify();
    },
    updateBlock: (blockId, updater) => {
      state = {
        ...state,
        document: {
          ...state.document,
          blocks: state.document.blocks.map((block) => (block.id === blockId ? updater(block) : block)),
        },
      };
      notify();
    },
    addBlock: (block, index) => {
      const blocks = [...state.document.blocks];
      if (index === undefined || index < 0 || index > blocks.length) {
        blocks.push(block);
      } else {
        blocks.splice(index, 0, block);
      }
      state = {
        ...state,
        document: {
          ...state.document,
          blocks,
        },
      };
      notify();
    },
    removeBlock: (blockId) => {
      state = {
        ...state,
        selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
        document: {
          ...state.document,
          blocks: state.document.blocks.filter((block) => block.id !== blockId),
        },
      };
      notify();
    },
    reorderBlocks: (order) => {
      const blockMap = new Map(state.document.blocks.map((block) => [block.id, block]));
      const nextBlocks = order.map((id) => blockMap.get(id)).filter((block): block is CvBlock => !!block);
      const missing = state.document.blocks.filter((block) => !order.includes(block.id));
      state = {
        ...state,
        document: {
          ...state.document,
          blocks: [...nextBlocks, ...missing],
        },
      };
      notify();
    },
  };
}

export function createEditorStore(initial: CvDocument): EditorStore {
  return createStore(initial);
}

export function useEditorStore<T>(store: EditorStore, selector: (state: EditorState) => T): T {
  const getSnapshot = useCallback(() => selector(store.getState()), [store, selector]);
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

export function useEditorDocument(store: EditorStore): CvDocument {
  return useEditorStore(store, (state) => state.document);
}

export function useSelectedBlock(store: EditorStore): string | null {
  return useEditorStore(store, (state) => state.selectedBlockId);
}

export function useEditorActions(store: EditorStore) {
  return useMemo(
    () => ({
      setDocument: store.setDocument,
      selectBlock: store.selectBlock,
      updateBlock: store.updateBlock,
      addBlock: store.addBlock,
      removeBlock: store.removeBlock,
      reorderBlocks: store.reorderBlocks,
    }),
    [store],
  );
}

export type { EditorStore, EditorState };
