// Light / dark theme: a single class on <html>, persisted to localStorage. The initial class is
// applied by an inline script in layout.tsx (before paint); this module is the runtime toggle.

const KEY = "ncc.theme";
export type Theme = "light" | "dark";

export function getTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // private mode or storage disabled: the in-memory class still applies for this session.
  }
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
