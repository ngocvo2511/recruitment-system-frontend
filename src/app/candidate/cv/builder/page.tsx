"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, LayoutGrid, LoaderCircle, Sparkles } from "lucide-react";
import {
  ApiError,
  CvBuilderTemplateResponse,
  createDraftFromTemplate,
  getCvBuilderTemplates,
} from "@/lib/api/cvBuilder";

type TemplateState = {
  loading: boolean;
  templates: CvBuilderTemplateResponse[];
  error?: string | null;
};

export default function CvBuilderTemplatePickerPage() {
  const router = useRouter();
  const [state, setState] = useState<TemplateState>({
    loading: true,
    templates: [],
    error: null,
  });
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const loadTemplates = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const templates = await getCvBuilderTemplates();
      setState({ loading: false, templates, error: null });
    } catch (error) {
      if (error instanceof ApiError) {
        setState({ loading: false, templates: [], error: error.message });
      } else {
        setState({ loading: false, templates: [], error: "Could not load templates." });
      }
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTemplates();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const sortedTemplates = useMemo(() => {
    return [...state.templates].sort((a, b) => {
      const orderA = a.displayOrder ?? 0;
      const orderB = b.displayOrder ?? 0;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [state.templates]);

  const handleSelectTemplate = async (template: CvBuilderTemplateResponse) => {
    setCreatingId(template.id);
    try {
      const draft = await createDraftFromTemplate({ templateId: template.id, title: `${template.name} CV` });
      router.push(`/candidate/cv/builder/${draft.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setState((prev) => ({ ...prev, error: error.message }));
      } else {
        setState((prev) => ({ ...prev, error: "Could not create draft." }));
      }
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 w-full animate-fade-in-up">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary font-bold">
              <Sparkles className="w-4 h-4" />
              CV Builder
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mt-2">Choose a template</h1>
            <p className="text-on-surface-variant text-sm md:text-base mt-2">
              Pick a layout to start building your CV. You can reorder sections later.
            </p>
          </div>
          <Link
            href="/candidate/cv"
            className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-on-surface"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to CV list
          </Link>
        </div>

        {state.error && (
          <div className="rounded-xl border border-error/30 bg-error/10 text-error px-4 py-3 text-sm font-medium">
            {state.error}
          </div>
        )}

        {state.loading ? (
          <div className="glass-card rounded-[2rem] p-8 text-on-surface-variant text-sm flex items-center gap-2">
            <LoaderCircle className="w-4 h-4 animate-spin" />
            Loading templates...
          </div>
        ) : sortedTemplates.length === 0 ? (
          <div className="glass-card rounded-[2rem] p-8 text-on-surface-variant text-sm">
            No templates available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => void handleSelectTemplate(template)}
                disabled={creatingId === template.id}
                className="group text-left rounded-[2rem] border border-white/40 bg-white/70 hover:bg-white/90 transition-all shadow-[0_10px_30px_rgba(15,23,42,0.06)] p-5 flex flex-col gap-4"
              >
                <div className="rounded-[1.5rem] bg-surface-container-high/60 aspect-[4/3] flex items-center justify-center text-primary/60 relative overflow-hidden">
                  {template.previewImageUrl ? (
                    <img src={template.previewImageUrl} alt={template.name} className="w-full h-full object-cover" />
                  ) : (
                    <LayoutGrid className="w-10 h-10" />
                  )}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                    <span className="bg-primary/90 px-2 py-1 rounded-full">{template.code}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{template.name}</h3>
                    <p className="text-on-surface-variant text-sm mt-1">
                      {template.description ?? "Flexible layout ready for customization."}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-primary">
                    {creatingId === template.id ? (
                      <>
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                        Creating
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Use
                      </>
                    )}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
