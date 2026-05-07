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
    skipAutoSaveRef.current = true;
    lastContentRef.current = draft.contentJson;
    setState((prev) => ({ ...prev, data: draft, content: parsed }));
  }, []);

  const loadDraft = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const draft = await getCvBuilderDraft(draftId);
      skipAutoSaveRef.current = true;
      lastContentRef.current = draft.contentJson;
      const parsed = JSON.parse(draft.contentJson) as BuilderContent;
      setState({ data: draft, content: parsed, loading: false, saving: false, error: null });
    } catch (error) {
      if (error instanceof ApiError) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }));
      } else {
        setState((prev) => ({ ...prev, loading: false, error: "Could not load draft." }));
      }
    }
  }, [draftId]);

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

  const handleSave = useCallback(async () => {
    if (!state.content || !state.data) {
      return;
    }
    setState((prev) => ({ ...prev, saving: true }));
    try {
      const payload = {
        title: state.data.title ?? "",
        contentJson: JSON.stringify(state.content),
      };
      const updated = await updateCvBuilderDraft(draftId, payload);
      applyServerDraft(updated);
      setState((prev) => ({ ...prev, saving: false }));
    } catch (error) {
      if (error instanceof ApiError) {
        setState((prev) => ({ ...prev, error: error.message, saving: false }));
      } else {
        setState((prev) => ({ ...prev, error: "Could not save draft.", saving: false }));
      }
    }
  }, [applyServerDraft, draftId, state.content, state.data]);

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
      void handleSave();
    }, 800);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [handleSave, state.content, state.data, state.loading, state.saving]);

  const handleAddSection = async () => {
    if (!sectionTitle.trim()) {
      setState((prev) => ({ ...prev, error: "Section title is required." }));
      return;
    }
    setState((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const payload = {
        sectionTitle: sectionTitle.trim(),
        sectionType,
        dataJson: sectionData,
      };
      const updated = await addCvBuilderSection(draftId, payload);
      applyServerDraft(updated);
      setState((prev) => ({ ...prev, saving: false }));
      setSectionTitle("");
      setSectionData("{}");
    } catch (error) {
      if (error instanceof ApiError) {
        setState((prev) => ({ ...prev, error: error.message, saving: false }));
      } else {
        setState((prev) => ({ ...prev, error: "Could not add section.", saving: false }));
      }
    }
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
          <h2 className="text-xl font-bold text-on-surface">Sections</h2>
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
