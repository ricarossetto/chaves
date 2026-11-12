import { Button } from "@/components/beui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

interface DeleteDialogProps {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({ title, description, onClose, onConfirm }: DeleteDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="rounded-xl border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-[22px] font-normal">{title}</DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button type="button" variant="ghost" className="rounded-lg" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-destructive text-white hover:bg-destructive/90"
            onClick={onConfirm}
          >
            {t("Delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
