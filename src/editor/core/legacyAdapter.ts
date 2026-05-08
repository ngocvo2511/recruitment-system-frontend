import {
  CvBlock,
  CvDocument,
  CvLayout,
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

function mapLegacySection(section: LegacySection, index: number): CvBlock {
  return {
    id: section.sectionId ?? `legacy-${index}`,
    type: "section",
    slot: section.slot,
    order: section.order ?? index,
    visible: section.visible ?? true,
    props: {
      sectionType: section.type ?? "custom",
      title: section.title ?? "Untitled",
      data: section.data ?? {},
    },
  };
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
