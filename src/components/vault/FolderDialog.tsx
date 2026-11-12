import { useState } from "react";
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
import { useI18n } from "@/lib/i18n";

interface FolderDialogProps {
  title: string;
  initialName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export function FolderDialog({ title, initialName, onClose, onSave }: FolderDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState(initialName);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="rounded-xl border-border bg-card sm:max-w-sm">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-[22px] font-normal">{title}</DialogTitle>
            <DialogDescription className="text-[13px]">
              {t("Use folders to separate groups of items.")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5 py-5">
            <Label htmlFor="folder-name" className="text-[12px] font-medium text-foreground/80">
              {t("Name")}
            </Label>
            <Input
              id="folder-name"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("E.g.: Production, Personal, Archive…")}
              className="h-10 rounded-lg border-border bg-background"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" className="rounded-lg" onClick={onClose}>
              {t("Cancel")}
            </Button>
            <Button type="submit" className="rounded-lg" disabled={!name.trim()}>
              {t("Save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
