import { useState } from "react";
import { Check } from "lucide-react";
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
import { useI18n } from "@/lib/i18n";
import {
  DEFAULT_PROJECT_COLOR,
  PROJECT_COLORS,
  projectColor,
  type Project,
  type ProjectFolder,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProjectDialogProps {
  project?: Project;
  folders: ProjectFolder[];
  initialFolderId: string | null;
  onClose: () => void;
  onSave: (name: string, color: string, folderId: string | null) => void;
}

export function ProjectDialog({
  project,
  folders,
  initialFolderId,
  onClose,
  onSave,
}: ProjectDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState(project?.name ?? "");
  const [color, setColor] = useState(projectColor(project?.color ?? DEFAULT_PROJECT_COLOR));
  const [folderId, setFolderId] = useState<string | null>(initialFolderId);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, color, folderId);
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="rounded-xl border-border bg-card sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-[22px] font-normal">
              {project ? t("Edit project") : t("New project")}
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              {project
                ? t("Update the project name, color, or folder.")
                : t("Projects separate your keys and links by context.")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-5">
            <div className="grid gap-1.5">
              <Label htmlFor="project-name" className="text-[12px] font-medium text-foreground/80">
                {t("Name")}
              </Label>
              <Input
                id="project-name"
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("E.g.: Work, Clients, Personal…")}
                className="h-10 rounded-lg border-border bg-background"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-[12px] font-medium text-foreground/80">{t("Color")}</Label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setColor(option.value)}
                    aria-label={t(option.name)}
                    title={t(option.name)}
                    className={cn(
                      "grid size-7 place-items-center rounded-full border-2 transition-transform hover:scale-105",
                      color === option.value ? "border-foreground" : "border-transparent",
                    )}
                    style={{ background: option.value }}
                  >
                    {color === option.value && <Check className="size-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

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
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" className="rounded-lg" onClick={onClose}>
              {t("Cancel")}
            </Button>
            <Button type="submit" className="rounded-lg" disabled={!name.trim()}>
              {project ? t("Save") : t("Create project")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
