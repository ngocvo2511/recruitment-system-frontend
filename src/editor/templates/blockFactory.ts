import { CvBlock } from "../core/schema";
import { TemplateLayoutSchema, TemplateSectionDefinition } from "./schema";

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resolveSlot(layout: TemplateLayoutSchema | null, sectionType: string) {
  const defaultSlot = layout?.layoutRules?.defaultSlotByType;
  if (defaultSlot && defaultSlot[sectionType]) {
    return defaultSlot[sectionType];
  }
  return "main";
}

export function createSectionBlockFromSchema(section: TemplateSectionDefinition, layout: TemplateLayoutSchema | null): CvBlock {
  const fields = section.fields ?? [];
  const itemFields: Record<string, string> = {};
  fields.forEach((field) => {
    itemFields[field.key] = "";
  });
  const locked = section.sectionType === "profile" || section.sectionType === "contact";
  return {
    id: createId("blk"),
    type: "section",
    slot: resolveSlot(layout, section.sectionType),
    visible: true,
    locked,
    props: {
      sectionType: section.sectionType,
      title: section.sectionType,
      repeatable: section.repeatable,
      fields,
      items: [
        {
          id: createId("item"),
          fields: itemFields,
        },
      ],
    },
  };
}
