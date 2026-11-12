import { Lock, Search } from "lucide-react";
import { Button } from "@/components/beui/button";
import { Input } from "@/components/ui/input";
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
  const notesView = view === "notes";
  const total = notesView ? noteCount : projectItemCount;

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: t("All") },
    { value: "key", label: t("Keys") },
    { value: "link", label: t("Links") },
  ];

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-6">
      <div className="relative w-full max-w-[320px]">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={notesView ? t("Search notes…") : t("Search keys, links, notes…")}
          className="h-9 rounded-lg border-border bg-card pl-9 text-[13px]"
        />
      </div>

      {!notesView && (
        <nav className="flex items-center gap-1" aria-label={t("All")}>
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[12px] transition-colors",
                filter === option.value
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-4">
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {count(notesView ? "note" : "item", total)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLock}
          className="rounded-lg text-muted-foreground hover:text-foreground"
        >
          <Lock className="size-3.5" />
          {t("Lock")}
        </Button>
      </div>
    </header>
  );
}
