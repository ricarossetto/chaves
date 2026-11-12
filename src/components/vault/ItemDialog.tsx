import { useState } from "react";
import { Eye, EyeOff, KeyRound, Link2 } from "lucide-react";
import { Button } from "@/components/beui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ensureUrl } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import type { Item, ItemFolder, ItemFormValues, ItemKind } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ItemDialogProps {
  kind: ItemKind;
  item?: Item;
  folders: ItemFolder[];
  initialFolderId: string | null;
  onClose: () => void;
  onSave: (values: ItemFormValues) => void;
}

export function ItemDialog({
  kind: initialKind,
  item,
  folders,
  initialFolderId,
  onClose,
  onSave,
}: ItemDialogProps) {
  const { t } = useI18n();
  const [kind, setKind] = useState<ItemKind>(item?.kind ?? initialKind);
  const [name, setName] = useState(item?.name ?? "");
  const [username, setUsername] = useState(item?.username ?? "");
  const [secret, setSecret] = useState(item?.secret ?? "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [folderId, setFolderId] = useState<string | null>(initialFolderId);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t("Enter a name."));
      return;
    }
    if (kind === "key" && !secret.trim()) {
      setError(t("Enter the key."));
      return;
    }
    if (kind === "link" && !url.trim()) {
      setError(t("Enter the link."));
      return;
    }
    const normalizedUrl = kind === "link" ? ensureUrl(url.trim()) : "";
    if (kind === "link" && !/^https?:\/\//i.test(normalizedUrl)) {
      setError(t("Use an http or https address."));
      return;
    }

    onSave({
      kind,
      name: trimmedName,
      username: kind === "key" ? username.trim() : "",
      secret: kind === "key" ? secret.trim() : "",
      url: normalizedUrl,
      notes: notes.trim(),
      folderId,
    });
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="rounded-xl border-border bg-card sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-[22px] font-normal">
              {item ? t("Edit item") : t("New item")}
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              {item
                ? t("Edit the data for this item.")
                : t("Save an API key or an important link in this project.")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-5">
            {!item && (
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setKind("key")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-[13px] transition-colors",
                    kind === "key"
                      ? "bg-card text-foreground shadow-[0_1px_2px_rgba(30,32,29,0.05)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <KeyRound className="size-4" strokeWidth={1.5} />
                  {t("Key")}
                </button>
                <button
                  type="button"
                  onClick={() => setKind("link")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-[13px] transition-colors",
                    kind === "link"
                      ? "bg-card text-foreground shadow-[0_1px_2px_rgba(30,32,29,0.05)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Link2 className="size-4" strokeWidth={1.5} />
                  {t("Link")}
                </button>
              </div>
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="item-name" className="text-[12px] font-medium text-foreground/80">
                {t("Name")}
              </Label>
              <Input
                id="item-name"
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={
                  kind === "key" ? t("E.g.: OpenAI, Stripe…") : t("E.g.: Docs, Dashboard…")
                }
                className="h-10 rounded-lg border-border bg-background"
              />
            </div>

            {kind === "key" ? (
              <>
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="item-username"
                    className="text-[12px] font-medium text-foreground/80"
                  >
                    {t("Account or identifier")}
                  </Label>
                  <Input
                    id="item-username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder={t("Optional")}
                    className="h-10 rounded-lg border-border bg-background"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label
                    htmlFor="item-secret"
                    className="text-[12px] font-medium text-foreground/80"
                  >
                    {t("Key")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="item-secret"
                      type={showSecret ? "text" : "password"}
                      value={secret}
                      onChange={(event) => setSecret(event.target.value)}
                      placeholder={t("Paste the key here")}
                      className="h-10 rounded-lg border-border bg-background pr-10 font-mono text-[12px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret((value) => !value)}
                      className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showSecret ? t("Hide key") : t("Show key")}
                    >
                      {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid gap-1.5">
                <Label htmlFor="item-url" className="text-[12px] font-medium text-foreground/80">
                  {t("Link")}
                </Label>
                <Input
                  id="item-url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://…"
                  className="h-10 rounded-lg border-border bg-background font-mono text-[12px]"
                />
              </div>
            )}

            {folders.length > 0 && (
              <div className="grid gap-1.5">
                <Label className="text-[12px] font-medium text-foreground/80">{t("Folder")}</Label>
                <Select
                  value={folderId ?? "none"}
                  onValueChange={(value) => setFolderId(value === "none" ? null : value)}
                >
                  <SelectTrigger className="h-10 w-full rounded-lg border-border bg-background">
                    <SelectValue placeholder={t("No folder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("No folder")}</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="item-notes" className="text-[12px] font-medium text-foreground/80">
                {t("Notes")}
              </Label>
              <Textarea
                id="item-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t("Optional")}
                rows={3}
                className="rounded-lg border-border bg-background"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2 text-[12px] leading-relaxed text-destructive"
              >
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" className="rounded-lg" onClick={onClose}>
              {t("Cancel")}
            </Button>
            <Button type="submit" className="rounded-lg">
              {item ? t("Save") : t("Add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
