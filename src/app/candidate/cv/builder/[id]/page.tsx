"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  LoaderCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  GripVertical,
  AlertTriangle,
} from "lucide-react";
import {
  ApiError,
  CvBuilderDraftResponse,
  addCvBuilderSection,
  deleteCvBuilderSection,
  getCvBuilderDraft,
  reorderCvBuilderSections,
  updateCvBuilderDraft,
} from "@/lib/api/cvBuilder";
import { migrateLegacyDraft } from "@/editor/core/legacyAdapter";
import { createEditorStore } from "@/editor/core/store";
import { EditorCanvas } from "@/editor/rendering/EditorCanvas";
import type { CvBlock, CvDocument, CvRichText } from "@/editor/core/schema";

type BuilderSection = {
  sectionId: string;
  type: string;
  title: string;
  data: Record<string, unknown>;
  order?: number;
  visible?: boolean;
  slot?: string;
};

type BuilderContent = {
  sections: BuilderSection[];
  meta?: Record<string, unknown>;
};

type DraftState = {
  data: CvBuilderDraftResponse | null;
  content: BuilderContent | null;
  loading: boolean;
  saving: boolean;
  error?: string | null;
};

type PendingDelete = {
  sectionId: string;
  title: string;
};

export default function CvBuilderDraftPage() {
  const params = useParams<{ id: string }>();
  const draftId = params.id;

  const [state, setState] = useState<DraftState>({
    data: null,
    content: null,
    loading: true,
    saving: false,
    error: null,
  });
  const [documentModel, setDocumentModel] = useState<string | null>(null);
  const [editorStore, setEditorStore] = useState<ReturnType<typeof createEditorStore> | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionType, setSectionType] = useState("custom");
  const [sectionData, setSectionData] = useState("{}");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const skipAutoSaveRef = useRef(false);
  const lastContentRef = useRef<string>("");
  const saveTimerRef = useRef<number | null>(null);

  const applyServerDraft = useCallback((draft: CvBuilderDraftResponse) => {
    const parsed = JSON.parse(draft.contentJson) as BuilderContent;
    const migrated = migrateLegacyDraft({ contentJson: draft.contentJson, templateCode: draft.templateCode });
    skipAutoSaveRef.current = true;
    lastContentRef.current = draft.contentJson;
    setState((prev) => ({ ...prev, data: draft, content: parsed }));
    setDocumentModel(JSON.stringify(migrated));
    setEditorStore((prev) => {
      if (!prev) {
        return createEditorStore(migrated);
      }
      prev.setDocument(migrated);
      return prev;
    });
  }, []);

  const loadDraft = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const draft = await getCvBuilderDraft(draftId);
      skipAutoSaveRef.current = true;
      lastContentRef.current = draft.contentJson;
      const parsed = JSON.parse(draft.contentJson) as BuilderContent;
      const migrated = migrateLegacyDraft({ contentJson: draft.contentJson, templateCode: draft.templateCode });
      setState({ data: draft, content: parsed, loading: false, saving: false, error: null });
      setDocumentModel(JSON.stringify(migrated));
      setEditorStore((prev) => {
        if (!prev) {
          return createEditorStore(migrated);
        }
        prev.setDocument(migrated);
        return prev;
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
      } else {
        setState((prev) => ({ ...prev, loading: false, error: "Could not load draft." }));
      }
    }
  }, [draftId]);

  useEffect(() => {
    if (!editorStore) {
      return;
    }
    return editorStore.subscribe(() => {
      const nextDocument = editorStore.getState().document;
      const nextSelected = editorStore.getState().selectedBlockId;
      setDocumentModel(JSON.stringify(nextDocument));
      setSelectedBlockId(nextSelected);
    });
  }, [editorStore]);

  const createId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const createEmptyRichText = (): CvRichText => ({
    type: "doc",
    blocks: [
      {
        type: "paragraph",
        spans: [{ text: "" }],
      },
    ],
  });

  const createSectionBlock = (title: string): CvBlock => ({
    id: createId(),
    type: "section",
    props: {
      sectionType: "custom",
      title,
      data: { content: "" },
    },
  });

  const createTextBlock = (title?: string): CvBlock => ({
    id: createId(),
    type: "text",
    props: {
      title,
      content: createEmptyRichText(),
    },
  });

  const handleAddBlock = (block: CvBlock) => {
    if (!editorStore) {
      return;
    }
    editorStore.addBlock(block);
  };

  const handleDuplicateSelected = () => {
    if (!editorStore) {
      return;
    }
    const { document, selectedBlockId } = editorStore.getState();
    if (!selectedBlockId) {
      return;
    }
    const source = document.blocks.find((block) => block.id === selectedBlockId);
    if (!source) {
      return;
    }
    const duplicate: CvBlock = {
      ...source,
      id: createId(),
    };
    editorStore.addBlock(duplicate);
  };

  const handleDeleteSelected = () => {
    if (!editorStore) {
      return;
    }
    const selectedId = editorStore.getState().selectedBlockId;
    if (!selectedId) {
      return;
    }
    editorStore.removeBlock(selectedId);
  };

  useEffect(() => {
    if (!editorStore) {
      return;
    }
    const payload = documentModel;
    if (!payload || !state.data || state.loading || state.saving) {
      return;
    }
    if (payload === lastContentRef.current) {
      return;
    }
    if (skipAutoSaveRef.current) {
      skipAutoSaveRef.current = false;
      lastContentRef.current = payload;
      return;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      void handleSave(payload);
    }, 800);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [documentModel, editorStore, handleSave, state.data, state.loading, state.saving]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDraft();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [draftId, loadDraft]);

  const sections = useMemo(() => {
    if (!state.content) {
      return [] as BuilderSection[];
    }
    return [...state.content.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [state.content]);

  const validationIssues = useMemo(() => state.data?.validationIssues ?? [], [state.data?.validationIssues]);
  const issuesBySection = useMemo(() => {
    const map = new Map<string, { warnings: number; errors: number }>();
    validationIssues.forEach((issue) => {
      const key = issue.sectionId ?? "unknown";
      const current = map.get(key) ?? { warnings: 0, errors: 0 };
      if (issue.severity === "ERROR") {
        current.errors += 1;
      } else {
        current.warnings += 1;
      }
      map.set(key, current);
    });
    return map;
  }, [validationIssues]);

  const overallStatus = state.data?.validationStatus ?? "VALID";

  const previewSections = useMemo(() => {
    const grouped = {
      header: [] as BuilderSection[],
      left: [] as BuilderSection[],
      main: [] as BuilderSection[],
      right: [] as BuilderSection[],
      footer: [] as BuilderSection[],
    };
    sections.forEach((section) => {
      if (section.visible === false) {
        return;
      }
      const slot = section.slot ?? "main";
      if (slot === "header") {
        grouped.header.push(section);
      } else if (slot === "left") {
        grouped.left.push(section);
      } else if (slot === "right") {
        grouped.right.push(section);
      } else if (slot === "footer") {
        grouped.footer.push(section);
      } else {
        grouped.main.push(section);
      }
    });
    return grouped;
  }, [sections]);

  const renderSectionBody = (section: BuilderSection) => {
    if (!section.data || typeof section.data !== "object") {
      return <div className="text-[11px] text-on-surface-variant">No data</div>;
    }

    const data = section.data as Record<string, unknown>;
    if ("content" in data && typeof data.content === "string") {
      return <p className="text-[11px] text-on-surface-variant leading-relaxed">{data.content}</p>;
    }

    if (Array.isArray(data)) {
      return (
        <ul className="text-[11px] text-on-surface-variant space-y-1">
          {data.slice(0, 4).map((item, idx) => (
            <li key={`${section.sectionId}-item-${idx}`}>• {String(item)}</li>
          ))}
        </ul>
      );
    }

    const entries = Object.entries(data).slice(0, 4);
    if (entries.length === 0) {
      return <div className="text-[11px] text-on-surface-variant">No data</div>;
    }

    return (
      <div className="text-[11px] text-on-surface-variant space-y-1">
        {entries.map(([key, value]) => (
          <div key={`${section.sectionId}-${key}`}>• {key}: {String(value)}</div>
        ))}
      </div>
    );
  };

  const handleSave = useCallback(async (overrideContentJson?: string) => {
    if (!state.content || !state.data) {
      return;
    }
    setState((prev) => ({ ...prev, saving: true }));
    try {
      const nextContentJson = overrideContentJson ?? documentModel ?? JSON.stringify(state.content);
      const payload = {
        title: state.data.title ?? "",
        contentJson: nextContentJson,
        version: state.data.version,
      };
      const updated = await updateCvBuilderDraft(draftId, payload);
      applyServerDraft(updated);
      setState((prev) => ({ ...prev, saving: false }));
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409 || error.code === 2020) {
          setState((prev) => ({ ...prev, error: "Draft was updated elsewhere. Reloading latest...", saving: false }));
          void loadDraft();
          return;
        }
        setState((prev) => ({ ...prev, error: error.message, saving: false }));
      } else {
        setState((prev) => ({ ...prev, error: "Could not save draft.", saving: false }));
      }
    }
  }, [applyServerDraft, documentModel, draftId, state.content, state.data]);

  useEffect(() => {
    if (!state.content || !state.data || state.loading || state.saving) {
      return;
    }
    const contentJson = JSON.stringify(state.content);
    if (contentJson === lastContentRef.current) {
      return;
    }
    if (skipAutoSaveRef.current) {
      skipAutoSaveRef.current = false;
      lastContentRef.current = contentJson;
      return;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      void handleSave(contentJson);
    }, 800);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [handleSave, state.content, state.data, state.loading, state.saving]);

  const handleAddSection = () => {
    if (!sectionTitle.trim()) {
      setState((prev) => ({ ...prev, error: "Section title is required." }));
      return;
    }
    handleAddBlock(createSectionBlock(sectionTitle.trim()));
    setSectionTitle("");
    setSectionData("{}");
  };

  const handleDeleteSection = async (sectionId: string) => {
    setState((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const updated = await deleteCvBuilderSection(draftId, sectionId);
      applyServerDraft(updated);
      setState((prev) => ({ ...prev, saving: false }));
    } catch (error) {
      if (error instanceof ApiError) {
        setState((prev) => ({ ...prev, error: error.message, saving: false }));
      } else {
        setState((prev) => ({ ...prev, error: "Could not delete section.", saving: false }));
      }
    }
  };

  const handleMove = async (sectionId: string, direction: "up" | "down") => {
    const current = sections.map((section) => section.sectionId);
    const index = current.indexOf(sectionId);
    if (index < 0) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) {
      return;
    }
    const next = [...current];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setState((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const updated = await reorderCvBuilderSections(draftId, { sectionIds: next });
      applyServerDraft(updated);
      setState((prev) => ({ ...prev, saving: false }));
    } catch (error) {
      if (error instanceof ApiError) {
        setState((prev) => ({ ...prev, error: error.message, saving: false }));
      } else {
        setState((prev) => ({ ...prev, error: "Could not reorder sections.", saving: false }));
      }
    }
  };

  const handleDragStart = (sectionId: string) => {
    setDraggingId(sectionId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDropOn = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      return;
    }
    const current = sections.map((section) => section.sectionId);
    const fromIndex = current.indexOf(draggingId);
    const toIndex = current.indexOf(targetId);
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }
    const next = [...current];
    next.splice(fromIndex, 1);
    next.splice(toIndex, 0, draggingId);
    setState((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const updated = await reorderCvBuilderSections(draftId, { sectionIds: next });
      applyServerDraft(updated);
      setState((prev) => ({ ...prev, saving: false }));
    } catch (error) {
      if (error instanceof ApiError) {
        setState((prev) => ({ ...prev, error: error.message, saving: false }));
      } else {
        setState((prev) => ({ ...prev, error: "Could not reorder sections.", saving: false }));
      }
    }
  };

  if (state.loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 w-full animate-fade-in-up">
        <div className="glass-card rounded-[2rem] p-8 text-on-surface-variant text-sm flex items-center gap-2">
          <LoaderCircle className="w-4 h-4 animate-spin" />
          Loading draft...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 w-full animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface">CV Builder Draft</h1>
          <p className="text-on-surface-variant text-sm md:text-base mt-2">
            Manage sections and order. Full editor comes next.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={state.saving}
            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-primary rounded-full px-4 py-2 hover:bg-primary-dim disabled:opacity-60"
          >
            {state.saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
          <Link
            href="/candidate/cv"
            className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-on-surface"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to CV list
          </Link>
        </div>
      </div>

      {state.error && (
        <div className="mt-6 rounded-xl border border-error/30 bg-error/10 text-error px-4 py-3 text-sm font-medium">
          {state.error}
        </div>
      )}

      {state.data && (
        <div
          className={`mt-6 rounded-xl border px-4 py-3 text-sm font-semibold flex items-center gap-2 ${
            overallStatus === "HAS_ERRORS"
              ? "border-error/30 bg-error/10 text-error"
              : overallStatus === "HAS_WARNINGS"
                ? "border-amber-300/40 bg-amber-100/40 text-amber-700"
                : "border-secondary/30 bg-secondary/10 text-secondary"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          {overallStatus === "HAS_ERRORS"
            ? "Your draft has validation errors. Fix them before publishing."
            : overallStatus === "HAS_WARNINGS"
              ? "Your draft has warnings. You can still continue editing."
              : "Your draft looks good so far."}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 glass-card rounded-[2rem] p-6 border border-white/30 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-on-surface">Blocks</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddBlock(createSectionBlock("Custom Section"))}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-white"
              >
                Add Section Block
              </button>
              <button
                type="button"
                onClick={() => handleAddBlock(createTextBlock("Text"))}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-secondary text-white"
              >
                Add Text Block
              </button>
              <button
                type="button"
                onClick={handleDuplicateSelected}
                disabled={!selectedBlockId}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-surface-container-high text-on-surface-variant disabled:opacity-50"
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={!selectedBlockId}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-error/10 text-error disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
          {sections.length === 0 ? (
            <div className="text-sm text-on-surface-variant">No sections yet.</div>
          ) : (
            <div className="space-y-3">
              {sections.map((section) => (
                (() => {
                  const issueCounts = issuesBySection.get(section.sectionId) ?? { warnings: 0, errors: 0 };
                  const hasErrors = issueCounts.errors > 0;
                  const hasWarnings = issueCounts.warnings > 0;
                  return (
                <div
                  key={section.sectionId}
                  draggable
                  onDragStart={() => handleDragStart(section.sectionId)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => void handleDropOn(section.sectionId)}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-shadow ${
                    draggingId === section.sectionId
                      ? "border-primary/40 bg-primary/5 shadow-lg"
                      : hasErrors
                        ? "border-error/40 bg-error/5"
                        : hasWarnings
                          ? "border-amber-300/40 bg-amber-50/60"
                          : "border-white/40 bg-white/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-on-surface-variant" />
                    <div>
                      <div className="text-sm font-bold text-on-surface">{section.title}</div>
                      <div className="text-xs text-on-surface-variant">Type: {section.type}</div>
                      {(hasErrors || hasWarnings) && (
                        <div className="mt-1 text-[11px] font-semibold text-on-surface-variant">
                          {hasErrors && <span className="text-error">{issueCounts.errors} error(s)</span>}
                          {hasErrors && hasWarnings && <span className="mx-1 text-on-surface-variant">•</span>}
                          {hasWarnings && <span className="text-amber-600">{issueCounts.warnings} warning(s)</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleMove(section.sectionId, "up")}
                      className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleMove(section.sectionId, "down")}
                      className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete({ sectionId: section.sectionId, title: section.title })}
                      className="p-2 rounded-lg bg-error/10 text-error hover:bg-error/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                  );
                })()
              ))}
            </div>
          )}
        </section>

        <section className="glass-card rounded-[2rem] p-6 border border-white/30 space-y-4">
          <h2 className="text-xl font-bold text-on-surface">Add section</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Title</label>
              <input
                className="mt-2 w-full px-4 py-3 rounded-xl bg-surface-container-high/50 border-none outline-none"
                value={sectionTitle}
                onChange={(event) => setSectionTitle(event.target.value)}
                placeholder="e.g. Awards"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Type</label>
              <input
                className="mt-2 w-full px-4 py-3 rounded-xl bg-surface-container-high/50 border-none outline-none"
                value={sectionType}
                onChange={(event) => setSectionType(event.target.value)}
                placeholder="custom"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Data JSON</label>
              <textarea
                className="mt-2 w-full px-4 py-3 rounded-xl bg-surface-container-high/50 border-none outline-none min-h-[120px] text-xs"
                value={sectionData}
                onChange={(event) => setSectionData(event.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => void handleAddSection()}
              disabled={state.saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white px-4 py-3 text-sm font-bold hover:bg-primary-dim disabled:opacity-60"
            >
              {state.saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Section
            </button>
          </div>
        </section>

        <section className="glass-card rounded-[2rem] p-6 border border-white/30 space-y-4">
          <h2 className="text-xl font-bold text-on-surface">Validation details</h2>
          {validationIssues.length === 0 ? (
            <div className="text-sm text-on-surface-variant">No validation issues.</div>
          ) : (
            <div className="space-y-3">
              {validationIssues.map((issue, index) => (
                <div
                  key={`${issue.sectionId ?? "global"}-${issue.fieldPath ?? index}-${index}`}
                  className={`rounded-xl border px-4 py-3 text-xs ${
                    issue.severity === "ERROR"
                      ? "border-error/30 bg-error/10 text-error"
                      : "border-amber-300/40 bg-amber-50/70 text-amber-700"
                  }`}
                >
                  <div className="font-bold uppercase tracking-widest text-[10px]">{issue.severity}</div>
                  <div className="font-semibold mt-1">{issue.message}</div>
                  <div className="text-[11px] mt-1 text-on-surface-variant">
                    {issue.sectionId ? `Section: ${issue.sectionId}` : "Section: global"}
                    {issue.fieldPath ? ` • Field: ${issue.fieldPath}` : ""}
                  </div>
                  {issue.hint && <div className="mt-1 text-[11px]">Hint: {issue.hint}</div>}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass-card rounded-[2rem] p-6 border border-white/30 space-y-4">
          <h2 className="text-xl font-bold text-on-surface">Preview</h2>
          {documentModel && (
            <div className="rounded-xl border border-surface-container-high bg-surface-container-high/30 px-3 py-2 text-[11px] text-on-surface-variant">
              Block model ready for rebuild. Document snapshot size: {documentModel.length} chars.
            </div>
          )}
          {editorStore && (
            <div className="rounded-2xl border border-surface-container-high bg-white p-4 shadow-inner">
              <EditorCanvas store={editorStore} />
            </div>
          )}
          <div className="bg-white rounded-2xl border border-surface-container-high p-4 shadow-inner">
            <div className="space-y-3">
              {previewSections.header.map((section) => (
                <div key={`preview-header-${section.sectionId}`}>
                  <div className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
                    {section.title}
                  </div>
                  {renderSectionBody(section)}
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr] gap-4">
              <div className="space-y-3">
                {previewSections.left.map((section) => (
                  <div key={`preview-left-${section.sectionId}`}>
                    <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      {section.title}
                    </div>
                    {renderSectionBody(section)}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {previewSections.main.map((section) => (
                  <div key={`preview-main-${section.sectionId}`}>
                    <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      {section.title}
                    </div>
                    {renderSectionBody(section)}
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {previewSections.right.map((section) => (
                  <div key={`preview-right-${section.sectionId}`}>
                    <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      {section.title}
                    </div>
                    {renderSectionBody(section)}
                  </div>
                ))}
              </div>
            </div>

            {previewSections.footer.length > 0 && (
              <div className="mt-4 border-t border-surface-container-high pt-3 space-y-3">
                {previewSections.footer.map((section) => (
                  <div key={`preview-footer-${section.sectionId}`}>
                    <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      {section.title}
                    </div>
                    {renderSectionBody(section)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-3xl border border-white/50 p-6 shadow-2xl">
            <h3 className="text-xl font-extrabold text-on-surface">Delete section</h3>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              Are you sure you want to delete &quot;{pendingDelete.title}&quot;? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleDeleteSection(pendingDelete.sectionId);
                  setPendingDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-error hover:bg-error-dim"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
