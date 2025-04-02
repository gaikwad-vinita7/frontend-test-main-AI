import { writable } from "svelte/store";
import type { BondData } from "../types.js";

export const bondData = writable<BondData | null>(null);
