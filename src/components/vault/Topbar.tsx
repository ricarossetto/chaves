import { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Lock, Search, X } from "lucide-react";
import { Button } from "@/components/beui/button";
import { Input } from "@/components/ui/input";
import { EASE_OUT } from "@/lib/ease";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ItemKind, View } from "@/lib/types";

export type Filter = "all" | ItemKind;

interface TopbarProps {
  view: View;
  query: string;
  onQueryChange: (value: string) => void;
  filter: Filter;
  onFilterChange: (value: Filter) => void;
  projectItemCount: number;
  noteCount: number;
  onLock: () => void;
}

export function Topbar({
  view,
  query,
  onQueryChange,
  filter,
  onFilterChange,
  projectItemCount,
  noteCount,
  onLock,
}: TopbarProps) {
  const { t, count } = useI18n();
  const reduce = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const notesView = view === "notes";
  const total = notesView ? noteCount : projectItemCount;
  // Windows and Linux use Ctrl; macOS uses ⌘. Guessing wrong makes the hint
  // worse than no hint.
  const shortcut = useMemo(
    () =>
      typeof navigator !== "undefined" && /mac/i.test(navigator.platform || navigator.userAgent)
        ? "⌘K"
        : "Ctrl K",
    [],
  );

  // Ctrl/Cmd+K jumps to search, the way every tool this app replaces does.
  // Escape from the field clears it, so the keyboard alone can open and close
  // the search loop.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: t("All") },
    { value: "key", label: t("Keys") },
    { value: "link", label: t("Links") },
  ];

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <div className="relative w-full max-w-[320px]">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && query) {
              event.stopPropagation();
              onQueryChange("");
            }
          }}
          placeholder={notesView ? t("Search notes…") : t("Search keys, links, notes…")}
          className="h-9 rounded-lg border-border bg-card pr-14 pl-9 text-[13px]"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label={t("Clear search")}
            className="absolute top-1/2 right-2 grid size-5 -translate-y-1/2 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        ) : (
          <span className="kbd pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
            {shortcut}
          </span>
        )}
      </div>

      {!notesView && (
        <nav className="flex items-center gap-0.5" aria-label={t("All")}>
          {filters.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onFilterChange(option.value)}
                aria-pressed={active}
                className={cn(
                  "relative rounded-md px-2.5 py-1.5 text-[12px] transition-colors duration-150",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {/* One pill shared between the three buttons: `layoutId` makes
                    motion slide it instead of fading two backgrounds. */}
                {active && (
                  <motion.span
                    layoutId="topbar-filter-pill"
                    className="absolute inset-0 rounded-md bg-secondary"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 480, damping: 40, mass: 0.6 }
                    }
                  />
                )}
                <span className="relative">{option.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-4">
        <motion.span
          key={total}
          initial={reduce ? false : { opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: EASE_OUT }}
          className="font-mono text-[11px] text-muted-foreground tabular-nums"
        >
          {count(notesView ? "note" : "item", total)}
        </motion.span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLock}
          className="rounded-lg text-muted-foreground hover:text-foreground"
        >
          <Lock className="size-3.5" strokeWidth={1.6} />
          {t("Lock")}
        </Button>
      </div>
    </header>
  );
}
