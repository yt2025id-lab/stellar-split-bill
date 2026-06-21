import type { Dict, Locale } from "./types";
import { en } from "./en";
import { id } from "./id";

export const dictionaries: Record<Locale, Dict> = { en, id };
