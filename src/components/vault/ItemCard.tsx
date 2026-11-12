import { useState } from "react";
import { motion } from "motion/react";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/beui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copyText, ensureUrl, hostOf } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import type { Item } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ToastFn = (
  title: string,
  status?: "success" | "error" | "info",
) => void;

interface ItemCardProps {
  item: Item;
  projectName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onToast: ToastFn;
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

export function ItemCard({ item, projectName, onEdit, onDelete, onToast }: ItemCardProps) {
  const { t } = useI18n();
  const [revealed, setRevealed] = useState(false);
  const isKey = item.kind === "key";
  const Icon = isKey ? KeyRound : Link2;
  const typeLabel = isKey ? t("Key") : t("Link");

  const copy = async () => {
    const value = isKey ? item.secret : item.url;
    const ok = await copyText(value);
    onToast(ok ? (isKey ? t("Key copied") : t("Link copied")) : t("Could not copy"), ok ? "success" : "error");
  };

  const open = async () => {
    try {
      await openUrl(ensureUrl(item.url));
    } catch {
      onToast(t("Could not open link"), "error");
    }
  };

  const masked = "•".repeat(Math.min(Math.max(item.secret.length, 8), 24));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="h-full"
    >
      <Card
        size="compact"
        className="h-full gap-3 rounded-xl border-border bg-card pt-5 pb-4 transition-colors hover:border-foreground/25"
      >
        <CardHeader className="flex items-center gap-2.5 px-5">
          <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
            <Icon className="size-4" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-[13px] font-medium text-foreground">
              {item.name}
            </CardTitle>
            <CardDescription className="truncate text-[11px] text-muted-foreground">
              {isKey ? item.username || t("No account") : hostOf(item.url)}
            </CardDescription>
          </div>

          <CardAction className="self-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover/card:opacity-100 hover:bg-muted focus-visible:opacity-100 data-[state=open]:opacity-100"
                  aria-label={`${t("Item options")}: ${item.name}`}
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-lg">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="size-4" />
                  {t("Edit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <Trash2 className="size-4" />
                  {t("Delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>

        <CardContent className="flex-1 px-5">
          <div className="flex items-center gap-1 rounded-md border border-border bg-background/70 px-2.5 py-1.5">
            {isKey ? (
              <>
                <code
                  className={cn(
                    "min-w-0 flex-1 truncate font-mono text-[11px]",
                    revealed ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {revealed ? item.secret : masked}
                </code>
                <IconButton
                  label={revealed ? t("Hide key") : t("Show key")}
                  onClick={() => setRevealed((value) => !value)}
                >
                  {revealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </IconButton>
                <IconButton label={t("Copy key")} onClick={copy}>
                  <Copy className="size-3.5" />
                </IconButton>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={open}
                  className="min-w-0 flex-1 truncate text-left font-mono text-[11px] text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
                >
                  {item.url}
                </button>
                <IconButton label={t("Open link")} onClick={open}>
                  <ExternalLink className="size-3.5" />
                </IconButton>
                <IconButton label={t("Copy link")} onClick={copy}>
                  <Copy className="size-3.5" />
                </IconButton>
              </>
            )}
          </div>

          {item.notes && (
            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
              {item.notes}
            </p>
          )}
        </CardContent>

        <CardFooter className="px-5 pt-1">
          <span className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            {typeLabel}
          </span>
          {projectName && (
            <span className="truncate text-[10px] text-muted-foreground">· {projectName}</span>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
