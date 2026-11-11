import { useEffect, useLayoutEffect } from "react";

/** Layout effect in the browser (applied before paint), plain effect on the server (no React 18 SSR warning). */
export const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
