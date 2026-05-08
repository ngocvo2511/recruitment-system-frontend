import { CvBlock } from "../core/schema";
import { SectionBlock } from "./section/SectionBlock";
import { TextBlock } from "./text/TextBlock";

export type BlockRendererProps<T extends CvBlock = CvBlock> = {
  block: T;
  selected: boolean;
  onSelect: () => void;
};

type BlockRenderer = (props: BlockRendererProps) => JSX.Element;

const registry: Record<string, BlockRenderer> = {
  section: SectionBlock as BlockRenderer,
  text: TextBlock as BlockRenderer,
};

export function getBlockRenderer(type: string): BlockRenderer | null {
  return registry[type] ?? null;
}
