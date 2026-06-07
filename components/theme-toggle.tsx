"use client";
import { Contrast, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const cycle = ["light", "dark", "system"] as const;
type Theme = (typeof cycle)[number];

const view: Record<Theme, { Icon: typeof Sun; label: string; next: string }> = {
  light: { Icon: Sun, label: "Light theme", next: "Switch to dark theme" },
  dark: { Icon: Moon, label: "Dark theme", next: "Switch to system theme" },
  system: {
    Icon: Contrast,
    label: "System theme",
    next: "Switch to light theme",
  },
};

export default function ThemeToggle(): React.ReactNode {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // theme is only known on the client, so render a stable fallback until mounted
  useEffect(() => setMounted(true), []);
  const current = mounted && theme ? (theme as Theme) : "system";

  const { Icon, label, next } = view[current];
  return (
    <button
      type="button"
      onClick={() =>
        setTheme(cycle[(cycle.indexOf(current) + 1) % cycle.length])
      }
      title={next}
      aria-label={`${label}. ${next}`}
      className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}
