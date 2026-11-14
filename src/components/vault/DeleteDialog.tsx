import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
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

/**
 * Deletion is the one irreversible action in the app, so the confirmation is a
 * two-beat: the button arms, then removing commits. The second click has a
 * 4s window, which is long enough to read the sentence and short enough not
 * to become a trap.
 */
export function DeleteDialog({ title, description, onClose, onConfirm }: DeleteDialogProps) {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="rounded-xl border-border bg-card shadow-float sm:max-w-md">
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
            onClick={() => (armed ? onConfirm() : setArmed(true))}
            aria-live="polite"
          >
            <span className="icon-swap" data-state={armed ? "b" : "a"}>
              <span data-icon="a" className="inline-flex">
                <Trash2 className="size-4" />
              </span>
              <span data-icon="b" className="inline-flex" aria-hidden={!armed}>
                <Check className="size-4" />
              </span>
            </span>
            <motion.span
              key={armed ? "armed" : "idle"}
              initial={reduce ? false : { opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16 }}
              className="inline-block"
            >
              {armed ? t("Confirm deletion") : t("Delete")}
            </motion.span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
