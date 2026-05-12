import {
  CvBlock,
  CvDocument,
  CvLayout,
  CvSectionBlock,
  CvSectionItem,
  CvTheme,
  DEFAULT_LAYOUT,
  DEFAULT_SCHEMA_VERSION,
  DEFAULT_THEME,
} from "./schema";

type LegacySection = {
  sectionId?: string;
  type?: string;
  title?: string;
  data?: unknown;
  order?: number;
  visible?: boolean;
  slot?: string;
};

type LegacyContent = {
  sections?: LegacySection[];
  meta?: {
    schemaVersion?: number;
    templateCode?: string;
    templateVersion?: number;
  };
};

type LegacyDraft = {
  contentJson: string;
  templateCode: string;
};

function parseLegacyContent(contentJson: string): LegacyContent | null {
  try {
    const parsed = JSON.parse(contentJson) as LegacyContent;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

const SECTION_FIELD_DEFS: Record<
  string,
  {
    title: string;
    repeatable: boolean;
    locked?: boolean;
    fields: Array<{ key: string; label: string; type: string; required?: boolean; maxLength?: number }>;
  }
> = {
  profile: {
    title: "Thong tin ca nhan",
    repeatable: false,
    locked: true,
    fields: [
      { key: "fullName", label: "Ho va ten", type: "text", required: true, maxLength: 120 },
      { key: "position", label: "Vi tri ung tuyen", type: "text", required: true, maxLength: 120 },
      { key: "phone", label: "So dien thoai", type: "phone", required: true, maxLength: 30 },
      { key: "email", label: "Email", type: "email", required: true, maxLength: 120 },
      { key: "location", label: "Dia chi", type: "text", maxLength: 160 },
      { key: "website", label: "Website", type: "url", maxLength: 255 },
    ],
  },
  summary: {
    title: "Muc tieu nghe nghiep",
    repeatable: false,
    fields: [{ key: "content", label: "Noi dung", type: "textarea", maxLength: 1000 }],
  },
  experience: {
    title: "Kinh nghiem lam viec",
    repeatable: true,
    fields: [
      { key: "company", label: "Ten cong ty", type: "text", required: true, maxLength: 120 },
      { key: "role", label: "Vi tri", type: "text", required: true, maxLength: 120 },
      { key: "startDate", label: "Bat dau", type: "month", required: true },
      { key: "endDate", label: "Ket thuc", type: "month" },
      { key: "summary", label: "Mo ta", type: "textarea", maxLength: 1000 },
    ],
  },
  education: {
    title: "Hoc van",
    repeatable: true,
    fields: [
      { key: "school", label: "Ten truong", type: "text", required: true, maxLength: 150 },
      { key: "degree", label: "Nganh hoc", type: "text", required: true, maxLength: 150 },
      { key: "startDate", label: "Bat dau", type: "month" },
      { key: "endDate", label: "Ket thuc", type: "month" },
      { key: "description", label: "Mo ta", type: "textarea", maxLength: 500 },
    ],
  },
  skills: {
    title: "Ky nang",
    repeatable: false,
    fields: [{ key: "skills", label: "Ky nang", type: "textarea", maxLength: 600 }],
  },
  project: {
    title: "Du an",
    repeatable: true,
    fields: [
      { key: "name", label: "Ten du an", type: "text", required: true, maxLength: 150 },
      { key: "role", label: "Vai tro", type: "text", maxLength: 120 },
      { key: "description", label: "Mo ta", type: "textarea", maxLength: 1000 },
      { key: "technologies", label: "Cong nghe", type: "text", maxLength: 200 },
      { key: "url", label: "Lien ket", type: "url", maxLength: 255 },
    ],
  },
  certification: {
    title: "Chung chi",
    repeatable: true,
    fields: [
      { key: "name", label: "Ten chung chi", type: "text", required: true, maxLength: 150 },
      { key: "issuer", label: "Don vi cap", type: "text", maxLength: 120 },
      { key: "issueDate", label: "Ngay cap", type: "month" },
    ],
  },
  custom: {
    title: "Custom",
    repeatable: false,
    fields: [{ key: "content", label: "Noi dung", type: "textarea", maxLength: 1200 }],
  },
};

function normalizeFields(sectionType: string) {
  const config = SECTION_FIELD_DEFS[sectionType] ?? SECTION_FIELD_DEFS.custom;
  return {
    title: config.title,
    repeatable: config.repeatable,
    locked: config.locked,
    fields: config.fields.map((field) => ({
      key: field.key,
      label: field.label,
      type: field.type as "text",
      required: field.required,
      maxLength: field.maxLength,
    })),
  };
}

function toSectionItem(data: unknown): CvSectionItem {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const fields: Record<string, string> = {};
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      fields[key] = value == null ? "" : String(value);
    });
    return { id: cryptoId(), fields };
  }
  if (Array.isArray(data)) {
    return { id: cryptoId(), fields: { items: data.map((item) => String(item)).join(", ") } };
  }
  return { id: cryptoId(), fields: { content: data == null ? "" : String(data) } };
}

function cryptoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mapLegacySection(section: LegacySection, index: number): CvBlock {
  const sectionType = (section.type ?? "custom").toLowerCase();
  const schema = normalizeFields(sectionType);
  const items: CvSectionItem[] = [];

  if (schema.repeatable && Array.isArray(section.data)) {
    section.data.forEach((entry) => {
      items.push(toSectionItem(entry));
    });
  } else if (section.data !== undefined) {
    items.push(toSectionItem(section.data));
  } else {
    items.push({ id: cryptoId(), fields: {} });
  }

  const block: CvSectionBlock = {
    id: section.sectionId ?? `legacy-${index}`,
    type: "section",
    slot: section.slot,
    order: section.order ?? index,
    visible: section.visible ?? true,
    locked: schema.locked,
    props: {
      sectionType,
      title: section.title ?? schema.title,
      repeatable: schema.repeatable,
      fields: schema.fields,
      items,
    },
  };

  return block;
}

function resolveTheme(baseTheme?: Partial<CvTheme>): CvTheme {
  return {
    ...DEFAULT_THEME,
    ...baseTheme,
    colors: {
      ...DEFAULT_THEME.colors,
      ...(baseTheme?.colors ?? {}),
    },
    spacing: {
      ...DEFAULT_THEME.spacing,
      ...(baseTheme?.spacing ?? {}),
    },
  };
}

function resolveLayout(baseLayout?: Partial<CvLayout>): CvLayout {
  return {
    ...DEFAULT_LAYOUT,
    ...baseLayout,
    margins: {
      ...DEFAULT_LAYOUT.margins,
      ...(baseLayout?.margins ?? {}),
    },
  };
}

export function migrateLegacyDraft(draft: LegacyDraft): CvDocument {
  const legacy = parseLegacyContent(draft.contentJson);
  const templateCode = legacy?.meta?.templateCode ?? draft.templateCode;
  const templateVersion = legacy?.meta?.templateVersion ?? 1;
  const blocks = (legacy?.sections ?? []).map(mapLegacySection);

  return {
    meta: {
      schemaVersion: DEFAULT_SCHEMA_VERSION,
      docVersion: 1,
      templateCode,
      templateVersion,
    },
    theme: resolveTheme(),
    layout: resolveLayout(),
    blocks,
  };
}
