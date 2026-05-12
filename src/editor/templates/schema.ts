import { CvFieldDefinition } from "../core/schema";

export type TemplateSectionDefinition = {
  sectionType: string;
  repeatable: boolean;
  minItems?: number;
  maxItems?: number;
  fields: CvFieldDefinition[];
};

export type TemplateLayoutSchema = {
  schemaVersion: number;
  templateVersion: number;
  allowedSectionTypes?: string[];
  sectionDefinitions?: Record<string, {
    required?: boolean;
    maxItems?: number;
    dataSchema?: unknown;
    formSchema?: TemplateSectionDefinition;
  }>;
  layoutRules?: {
    slots?: string[];
    defaultSlotByType?: Record<string, string>;
  };
};

export function parseTemplateSchema(layoutSchema?: string | null): TemplateLayoutSchema | null {
  if (!layoutSchema) {
    return null;
  }
  try {
    const parsed = JSON.parse(layoutSchema) as TemplateLayoutSchema;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function buildFormSchemaFallback(sectionType: string): TemplateSectionDefinition {
  return {
    sectionType,
    repeatable: sectionType !== "summary" && sectionType !== "skills" && sectionType !== "custom",
    fields: [{ key: "content", label: "Noi dung", type: "textarea" }],
  };
}
