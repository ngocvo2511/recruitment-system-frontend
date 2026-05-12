export type CvDocumentSchemaVersion = 1;

export type CvDocumentMeta = {
  schemaVersion: CvDocumentSchemaVersion;
  docVersion: number;
  templateCode: string;
  templateVersion: number;
};

export type CvRichTextSpan = {
  text: string;
  marks?: Array<"bold" | "italic" | "underline" | "link">;
  href?: string;
};

export type CvRichTextBlock = {
  type: "paragraph" | "heading" | "list";
  spans: CvRichTextSpan[];
  ordered?: boolean;
};

export type CvRichText = {
  type: "doc";
  blocks: CvRichTextBlock[];
};

export type CvTheme = {
  name?: string;
  fontFamily: string;
  headingFontFamily?: string;
  baseFontSize: number;
  lineHeight: number;
  colors: {
    text: string;
    muted: string;
    primary: string;
    background: string;
  };
  spacing: {
    sectionGap: number;
    itemGap: number;
  };
};

export type CvLayout = {
  pageSize: "A4";
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  columns: number;
  columnGap: number;
  slots: string[];
};

export type CvBlockBase = {
  id: string;
  type: string;
  slot?: string;
  order?: number;
  visible?: boolean;
  locked?: boolean;
};

export type CvFieldType = "text" | "textarea" | "month" | "date" | "select" | "tags" | "email" | "phone" | "url";

export type CvFieldDefinition = {
  key: string;
  label: string;
  type: CvFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  maxLength?: number;
};

export type CvSectionItem = {
  id: string;
  fields: Record<string, string>;
};

export type CvSectionBlock = CvBlockBase & {
  type: "section";
  props: {
    sectionType: string;
    title: string;
    repeatable?: boolean;
    fields: CvFieldDefinition[];
    items: CvSectionItem[];
  };
};

export type CvTextBlock = CvBlockBase & {
  type: "text";
  props: {
    title?: string;
    content: CvRichText;
  };
};

export type CvBlock = CvSectionBlock | CvTextBlock;

export type CvDocument = {
  meta: CvDocumentMeta;
  theme: CvTheme;
  layout: CvLayout;
  blocks: CvBlock[];
};

export const DEFAULT_SCHEMA_VERSION: CvDocumentSchemaVersion = 1;

export const DEFAULT_LAYOUT: CvLayout = {
  pageSize: "A4",
  margins: {
    top: 32,
    right: 32,
    bottom: 32,
    left: 32,
  },
  columns: 2,
  columnGap: 16,
  slots: ["header", "left", "main", "right", "footer"],
};

export const DEFAULT_THEME: CvTheme = {
  fontFamily: "Times New Roman, serif",
  headingFontFamily: "Times New Roman, serif",
  baseFontSize: 12,
  lineHeight: 1.4,
  colors: {
    text: "#1F2937",
    muted: "#6B7280",
    primary: "#0F766E",
    background: "#FFFFFF",
  },
  spacing: {
    sectionGap: 16,
    itemGap: 8,
  },
};

export function createEmptyDocument(templateCode: string, templateVersion: number): CvDocument {
  return {
    meta: {
      schemaVersion: DEFAULT_SCHEMA_VERSION,
      docVersion: 1,
      templateCode,
      templateVersion,
    },
    theme: DEFAULT_THEME,
    layout: DEFAULT_LAYOUT,
    blocks: [],
  };
}
