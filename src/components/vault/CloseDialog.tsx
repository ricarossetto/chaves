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

interface CloseDialogProps {
  onCancel: () => void;
  onHide: () => void;
  onQuit: () => void;
}

export function CloseDialog({ onCancel, onHide, onQuit }: CloseDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="rounded-xl border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-[22px] font-normal">
            {t("Close Chaves?")}
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-relaxed">
            {t("You can close the app or keep it running in the tray, near the clock.")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button type="button" variant="ghost" className="rounded-lg" onClick={onCancel}>
            {t("Cancel")}
          </Button>
          <Button type="button" variant="secondary" className="rounded-lg" onClick={onQuit}>
            {t("Close")}
          </Button>
          <Button type="button" className="rounded-lg whitespace-nowrap" onClick={onHide}>
            {t("Background")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
