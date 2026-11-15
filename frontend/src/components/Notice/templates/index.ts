import type { NoticeTemplate } from "@pokenerdle/shared/notices";
import { PokedexBanner } from "./PokedexBanner";
import { NoticeTemplateProps } from "./types";

export type { NoticeTemplateProps } from "./types";

export const TEMPLATES: Record<NoticeTemplate, React.FC<NoticeTemplateProps>> = {
  pokedex: PokedexBanner,
};
