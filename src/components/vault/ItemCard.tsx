import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Check,
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
import { DURATION, EASE_OUT } from "@/lib/ease";
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
  className,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground",
        "transition-colors duration-150 hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Copy with its own confirmation, so the most repeated action in the app
 *  answers where the eye already is instead of in a corner toast. */
function CopyButton({
  value,
  label,
  onError,
}: {
  value: string;
  label: string;
  onError: () => void;
}) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const run = async () => {
    const ok = await copyText(value);
    if (!ok) {
      // The confirmation below is the only feedback, so a silent failure would
      // read as success. Say it out loud instead.
      onError();
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <>
      <IconButton
        label={copied ? t("Copied") : label}
        onClick={run}
        className={cn(copied && "text-primary")}
      >
        <span className="icon-swap" data-state={copied ? "b" : "a"}>
          <span data-icon="a" className="inline-flex">
            <Copy className="size-3.5" />
          </span>
          <span data-icon="b" className="inline-flex" aria-hidden={!copied}>
            {reduce ? (
              <Check className="size-3.5" />
            ) : (
              <motion.span
                initial={false}
                animate={{ scale: copied ? 1 : 0.75 }}
                transition={{ duration: DURATION.micro, ease: EASE_OUT }}
                className="inline-flex"
              >
                <Check className="size-3.5" />
              </motion.span>
            )}
          </span>
        </span>
      </IconButton>
      {/* The button's own label changes, but screen readers treat that as a
          silent attribute update. This is the announcement. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? t("Copied") : ""}
      </span>
    </>
  );
}

export function ItemCard({ item, projectName, onEdit, onDelete, onToast }: ItemCardProps) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const isKey = item.kind === "key";
  const Icon = isKey ? KeyRound : Link2;
  const typeLabel = isKey ? t("Key") : t("Link");

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
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
      transition={{ duration: DURATION.fast, ease: EASE_OUT }}
      className="h-full"
    >
      <Card
        size="compact"
        className={cn(
          "group/card h-full gap-3 rounded-xl border-border bg-card pt-5 pb-4",
          "transition-[border-color,box-shadow,transform] duration-200 ease-out",
          "hover:-translate-y-px hover:border-border-strong hover:shadow-lift",
        )}
      >
        <CardHeader className="flex items-center gap-2.5 px-5">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-md border border-border bg-background",
              "text-muted-foreground transition-colors duration-200",
              "group-hover/card:border-border-strong group-hover/card:text-foreground",
            )}
          >
            <Icon className="size-4" strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-[13px] font-medium text-foreground">
              {item.name}
            </CardTitle>
            <p className="truncate text-[11px] text-muted-foreground">
              {isKey ? item.username || t("No account") : hostOf(item.url)}
            </p>
          </div>

          <CardAction className="self-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "grid size-6 place-items-center rounded-md text-muted-foreground",
                    "opacity-0 transition-[opacity,background-color,color] duration-150",
                    "group-hover/card:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
                    "hover:bg-muted hover:text-foreground",
                  )}
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
          <div className="flex items-center gap-1 rounded-md border border-border bg-background/70 px-2.5 py-1.5 transition-colors duration-200 group-hover/card:border-border-strong">
            {isKey ? (
              <>
                <code
                  className={cn(
                    "min-w-0 flex-1 truncate font-mono text-[11px] transition-colors",
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
                <CopyButton
                  value={item.secret}
                  label={t("Copy key")}
                  onError={() => onToast(t("Could not copy"), "error")}
                />
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
                <CopyButton
                  value={item.url}
                  label={t("Copy link")}
                  onError={() => onToast(t("Could not copy"), "error")}
                />
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
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase",
              "text-muted-foreground/80",
            )}
          >
            <span
              className="size-1 rounded-full"
              style={{
                background: isKey ? "var(--chart-1)" : "var(--chart-3)",
              }}
            />
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
