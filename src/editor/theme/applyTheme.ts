import { CvDocument, CvTheme } from "../core/schema";

export function applyThemeToDocument(document: CvDocument, theme: Partial<CvTheme>): CvDocument {
  return {
    ...document,
    theme: {
      ...document.theme,
      ...theme,
      colors: {
        ...document.theme.colors,
        ...(theme.colors ?? {}),
      },
      spacing: {
        ...document.theme.spacing,
        ...(theme.spacing ?? {}),
      },
    },
  };
}
