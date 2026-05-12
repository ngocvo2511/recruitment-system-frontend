"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, LoaderCircle, Plus, Save, AlertTriangle } from "lucide-react";
import {
  ApiError,
  CvBuilderDraftResponse,
  getCvBuilderDraft,
  getCvBuilderTemplates,
  updateCvBuilderDraft,
  updateCvBuilderDraftTemplate,
} from "@/lib/api/cvBuilder";
import { migrateLegacyDraft } from "@/editor/core/legacyAdapter";
import { createEditorStore } from "@/editor/core/store";
import { EditorCanvas } from "@/editor/rendering/EditorCanvas";
import { CanvasShell } from "@/editor/rendering/CanvasShell";
import type { CvBlock, CvDocument } from "@/editor/core/schema";
import { buildFormSchemaFallback, parseTemplateSchema } from "@/editor/templates/schema";
import { createSectionBlockFromSchema } from "@/editor/templates/blockFactory";
import { applyThemeToDocument } from "@/editor/theme/applyTheme";

type BuilderContent = {
  sections: Array<Record<string, unknown>>;
  meta?: Record<string, unknown>;
};

type DraftState = {
  data: CvBuilderDraftResponse | null;
  content: BuilderContent | null;
  loading: boolean;
  saving: boolean;
  error?: string | null;
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
  const [editorDocument, setEditorDocument] = useState<CvDocument | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [templateSchema, setTemplateSchema] = useState<ReturnType<typeof parseTemplateSchema> | null>(null);
  const [templateSections, setTemplateSections] = useState<string[]>([]);
  const [templateOptions, setTemplateOptions] = useState<{ id: string; name: string; code: string }[]>([]);
  const [activePanel, setActivePanel] = useState<"design" | "add" | "layout" | "template">("design");
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
    setEditorStore((prev) => prev ?? createEditorStore(migrated));
    setEditorDocument(migrated);
  }, []);

  const loadDraft = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [draft, templates] = await Promise.all([
        getCvBuilderDraft(draftId),
        getCvBuilderTemplates(),
      ]);
      setTemplateOptions(
        templates.map((template) => ({ id: template.id, name: template.name, code: template.code })),
      );
      const matchedTemplate = templates.find((template) => template.id === draft.templateId);
      const parsedSchema = parseTemplateSchema(matchedTemplate?.layoutSchema ?? null);
      setTemplateSchema(parsedSchema);
      const sectionKeys = parsedSchema?.sectionDefinitions
        ? Object.keys(parsedSchema.sectionDefinitions)
        : [];
      setTemplateSections(sectionKeys);
      skipAutoSaveRef.current = true;
      lastContentRef.current = draft.contentJson;
      const parsed = JSON.parse(draft.contentJson) as BuilderContent;
      const migrated = migrateLegacyDraft({ contentJson: draft.contentJson, templateCode: draft.templateCode });
      setState({ data: draft, content: parsed, loading: false, saving: false, error: null });
      setDocumentModel(JSON.stringify(migrated));
      setEditorStore((prev) => prev ?? createEditorStore(migrated));
      setEditorDocument(migrated);
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
    if (editorDocument && editorStore.getState().document !== editorDocument) {
      editorStore.setDocument(editorDocument);
    }
    return editorStore.subscribe(() => {
      const nextDocument = editorStore.getState().document;
      const nextSelected = editorStore.getState().selectedBlockId;
      setDocumentModel(JSON.stringify(nextDocument));
      setSelectedBlockId(nextSelected);
    });
  }, [editorDocument, editorStore]);

  const createId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const createSectionBlock = (title: string): CvBlock => ({
    id: createId(),
    type: "section",
    props: {
      sectionType: "custom",
      title,
      repeatable: false,
      fields: [{ key: "content", label: "Noi dung", type: "textarea" }],
      items: [
        {
          id: createId(),
          fields: { content: "" },
        },
      ],
    },
  });


  const handleAddBlock = (block: CvBlock) => {
    if (!editorStore) {
      return;
    }
    editorStore.addBlock(block);
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
    }, 300000);

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

  const overallStatus = state.data?.validationStatus ?? "VALID";

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
    }, 300000);

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
    const normalized = sectionTitle.trim().toLowerCase();
    const formSchema = templateSchema?.sectionDefinitions?.[normalized]?.formSchema;
    if (formSchema) {
      handleAddBlock(createSectionBlockFromSchema(formSchema, templateSchema));
    } else {
      const fallback = buildFormSchemaFallback(normalized);
      handleAddBlock(createSectionBlockFromSchema(fallback, templateSchema));
    }
    setSectionTitle("");
  };

  const handleTemplateChange = async (templateId: string) => {
    if (!state.data) {
      return;
    }
    setState((prev) => ({ ...prev, saving: true, error: null }));
    try {
      const updated = await updateCvBuilderDraftTemplate(draftId, { templateId });
      applyServerDraft(updated);
      setState((prev) => ({ ...prev, saving: false }));
    } catch (error) {
      if (error instanceof ApiError) {
        setState((prev) => ({ ...prev, error: error.message, saving: false }));
      } else {
        setState((prev) => ({ ...prev, error: "Could not change template.", saving: false }));
      }
    }
  };

  const handleThemeChange = (theme: Partial<CvDocument["theme"]>) => {
    if (!editorStore) {
      return;
    }
    const nextDocument = applyThemeToDocument(editorStore.getState().document, theme);
    editorStore.setDocument(nextDocument);
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

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[240px_320px_1fr] gap-6">
        <aside className="glass-card rounded-[2rem] p-4 border border-white/30 space-y-2">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant px-3">Menu</div>
          <button
            type="button"
            onClick={() => setActivePanel("design")}
            className={`w-full text-left px-3 py-2 rounded-xl font-bold ${
              activePanel === "design" ? "bg-primary/10 text-primary" : "hover:bg-surface-container-high text-on-surface"
            }`}
          >
            Thiết kế & Font
          </button>
          <button
            type="button"
            onClick={() => setActivePanel("add")}
            className={`w-full text-left px-3 py-2 rounded-xl font-bold ${
              activePanel === "add" ? "bg-primary/10 text-primary" : "hover:bg-surface-container-high text-on-surface"
            }`}
          >
            Thêm mục
          </button>
          <button
            type="button"
            onClick={() => setActivePanel("layout")}
            className={`w-full text-left px-3 py-2 rounded-xl font-bold ${
              activePanel === "layout" ? "bg-primary/10 text-primary" : "hover:bg-surface-container-high text-on-surface"
            }`}
          >
            Bố cục
          </button>
          <button
            type="button"
            onClick={() => setActivePanel("template")}
            className={`w-full text-left px-3 py-2 rounded-xl font-bold ${
              activePanel === "template" ? "bg-primary/10 text-primary" : "hover:bg-surface-container-high text-on-surface"
            }`}
          >
            Đổi mẫu CV
          </button>
          <div className="mt-4 px-3 text-[11px] text-on-surface-variant">Gợi ý viết (coming soon)</div>
        </aside>

        <section className="glass-card rounded-[2rem] p-6 border border-white/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface">
              {activePanel === "design"
                ? "Thiết kế & Font"
                : activePanel === "add"
                  ? "Thêm mục"
                  : activePanel === "layout"
                    ? "Bố cục"
                    : "Đổi mẫu CV"}
            </h2>
            <button type="button" className="rounded-full bg-surface-container-high px-3 py-1 text-xs">
              Đóng
            </button>
          </div>

          {activePanel === "design" ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Font chữ</label>
                <select
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-surface-container-high/50 border-none outline-none"
                  onChange={(event) => handleThemeChange({ fontFamily: event.target.value })}
                >
                  <option value="Merriweather, serif">Merriweather</option>
                  <option value="Times New Roman, serif">Times New Roman</option>
                  <option value="Lora, serif">Lora</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Cỡ chữ</label>
                <input
                  type="range"
                  min={9}
                  max={14}
                  defaultValue={11}
                  onChange={(event) => handleThemeChange({ baseFontSize: Number(event.target.value) })}
                  className="mt-3 w-full"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Khoảng cách dòng</label>
                <input
                  type="range"
                  min={1.2}
                  max={1.8}
                  step={0.05}
                  defaultValue={1.5}
                  onChange={(event) => handleThemeChange({ lineHeight: Number(event.target.value) })}
                  className="mt-3 w-full"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Màu chủ đề</label>
                <input
                  type="color"
                  defaultValue="#0F766E"
                  onChange={(event) => handleThemeChange({ colors: { primary: event.target.value } })}
                  className="mt-2 h-10 w-16 rounded-lg border border-surface-container-high"
                />
              </div>
            </div>
          ) : activePanel === "add" ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Thêm mục</label>
                {templateSections.length > 0 ? (
                  <select
                    className="mt-2 w-full px-4 py-3 rounded-xl bg-surface-container-high/50 border-none outline-none"
                    value={sectionTitle}
                    onChange={(event) => setSectionTitle(event.target.value)}
                  >
                    <option value="">Chọn loại mục</option>
                    {templateSections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="mt-2 w-full px-4 py-3 rounded-xl bg-surface-container-high/50 border-none outline-none"
                    value={sectionTitle}
                    onChange={(event) => setSectionTitle(event.target.value)}
                    placeholder="Ví dụ: Awards"
                  />
                )}
                <button
                  type="button"
                  onClick={() => void handleAddSection()}
                  disabled={state.saving}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white px-4 py-3 text-sm font-bold hover:bg-primary-dim disabled:opacity-60"
                >
                  {state.saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Thêm mục
                </button>
              </div>
            </div>
          ) : activePanel === "layout" ? (
            <div className="space-y-3 text-sm text-on-surface-variant">
              <div>Bố cục 2 cột (mặc định).</div>
              <div>Tuỳ chỉnh bố cục sẽ được bổ sung ở Phase 5.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {templateOptions.length === 0 ? (
                <div className="text-sm text-on-surface-variant">Chưa có mẫu CV.</div>
              ) : (
                templateOptions.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => void handleTemplateChange(template.id)}
                    className="w-full rounded-xl border border-surface-container-high bg-white px-4 py-3 text-left hover:bg-surface-container-high/40"
                  >
                    <div className="text-sm font-bold text-on-surface">{template.name}</div>
                    <div className="text-[11px] text-on-surface-variant">{template.code}</div>
                  </button>
                ))
              )}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <CanvasShell>
            {editorStore && <EditorCanvas store={editorStore} />}
          </CanvasShell>
        </section>
      </div>

    </div>
  );
}
