import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Eye, EyeOff, Fingerprint, Languages, LoaderCircle } from "lucide-react";
import { Button } from "@/components/beui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/beui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EASE_OUT } from "@/lib/ease";
import { useI18n, type Locale } from "@/lib/i18n";
import type { HelloStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AuthScreenProps {
  mode: "setup" | "locked";
  vaultPath: string;
  busy: boolean;
  error: string | null;
  hello: HelloStatus;
  onCreate: (password: string, useHello: boolean) => void;
  onUnlock: (password: string, useHello: boolean) => void;
  onHello: () => void;
  onDisableHello: () => void;
}

/**
 * A wrong password is a physical "no". The card shakes once and stops — 280ms
 * of percussion, no bounce, no red flash over the whole screen.
 */
function ShakeOnError({ trigger, children }: { trigger: unknown; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [shaking, setShaking] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    // Skip the mount pass; only a new error should shake.
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduce) return;
    setShaking(false);
    // A frame break lets the same animation replay when the same error repeats.
    const frame = requestAnimationFrame(() => setShaking(true));
    const timer = window.setTimeout(() => setShaking(false), 320);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [trigger, reduce]);

  return (
    <div className={cn("relative", shaking && "shake")} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

/**
 * Argon2id is slow on purpose, so the wait is the one moment the app has to
 * explain itself. A hairline sweeping across the base of the card says
 * "deriving the key" where a spinner says "something is stuck".
 */
function DerivingLine() {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className="absolute inset-x-0 bottom-0 h-px bg-primary/40" />;
  }
  return (
    <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden bg-border/60">
      <div
        className="h-full w-1/3 bg-primary"
        style={{ animation: "hairline-run 1.15s var(--ease-smooth-out) infinite" }}
      />
    </div>
  );
}

export function AuthScreen({
  mode,
  vaultPath,
  busy,
  error,
  hello,
  onCreate,
  onUnlock,
  onHello,
  onDisableHello,
}: AuthScreenProps) {
  const { t, error: translateError, locale, setLocale } = useI18n();
  const reduce = useReducedMotion();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [useHello, setUseHello] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "setup" && hello.available) setUseHello(true);
  }, [mode, hello.available]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setLocalError(null);

    if (mode === "setup") {
      if (password.length < 8) {
        setLocalError(t("Use at least 8 characters in the master password."));
        return;
      }
      if (password !== confirm) {
        setLocalError(t("Passwords do not match."));
        return;
      }
      onCreate(password, useHello && hello.available);
    } else {
      if (!password) {
        setLocalError(t("Enter the master password."));
        return;
      }
      onUnlock(password, useHello && hello.available);
    }
  };

  const message = localError ?? (error ? translateError(error) : null);
  const helloEnabled = mode === "locked" && hello.enabled;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      {/* Two soft pools of light behind the card. Static, cheap, and only
          visible if you look for it — the foil to a flat cream screen. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 8%, rgba(138,119,72,0.10), transparent 70%)," +
            "radial-gradient(45% 40% at 80% 92%, rgba(111,127,91,0.08), transparent 72%)",
        }}
      />

      <div className="relative w-full max-w-[400px]">
        <motion.header
          initial={reduce ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          className="mb-8 flex items-center gap-3"
        >
          <img
            src="/logo.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="size-9 rounded-[10px] shadow-paper"
          />
          <div>
            <p className="font-serif text-[17px] leading-none text-foreground">Chaves</p>
            <p className="mt-1.5 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              {t("Local vault")}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Languages className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
            <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
              <SelectTrigger
                className="h-8 w-[108px] rounded-md border-border bg-card text-[11px]"
                aria-label={t("Language")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português</SelectItem>
                <SelectItem value="en-US">English</SelectItem>
                <SelectItem value="zh-CN">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.header>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.06 }}
        >
          <ShakeOnError trigger={message}>
          <Card className="relative gap-0 overflow-hidden rounded-xl border-border bg-card py-0 shadow-float">
            <CardHeader className="px-7 pt-7 pb-0">
              <CardTitle as="h2" className="font-serif text-[26px] leading-tight tracking-[-0.01em]">
                {mode === "setup" ? t("Create vault") : t("Open vault")}
              </CardTitle>
              <CardDescription className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {mode === "setup"
                  ? t(
                      "A master password protects your keys and links. Without it, the content cannot be recovered.",
                    )
                  : t("Enter your master password to access your keys, links, and projects.")}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-7 pt-6 pb-7">
              {helloEnabled && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-10 w-full rounded-lg"
                    onClick={onHello}
                    disabled={busy}
                  >
                    {busy ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Fingerprint className="size-4" />
                    )}
                    {t("Unlock with Windows Hello")}
                  </Button>
                  <div className="my-5 flex items-center gap-3 text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                    <span className="h-px flex-1 bg-border" />
                    {t("or use the password")}
                    <span className="h-px flex-1 bg-border" />
                  </div>
                </>
              )}

              <form onSubmit={submit} className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="password" className="text-[12px] font-medium text-foreground/80">
                    {t("Master password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={show ? "text" : "password"}
                      autoFocus
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      aria-invalid={Boolean(localError) || undefined}
                      className="h-10 rounded-lg border-border bg-background pr-10 text-[14px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((value) => !value)}
                      className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={show ? t("Hide password") : t("Show password")}
                    >
                      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {mode === "setup" && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="confirm" className="text-[12px] font-medium text-foreground/80">
                      {t("Confirm password")}
                    </Label>
                    <Input
                      id="confirm"
                      type={show ? "text" : "password"}
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                      placeholder="••••••••"
                      className="h-10 rounded-lg border-border bg-background text-[14px]"
                    />
                  </div>
                )}

                {hello.available && !hello.enabled && (
                  <label className="flex items-start gap-2 text-[12px] leading-relaxed text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={useHello}
                      onChange={(event) => setUseHello(event.target.checked)}
                      className="mt-0.5 size-3.5 accent-[var(--primary)]"
                    />
                    <span>
                      {mode === "setup"
                        ? t("Enable Windows Hello to unlock on this PC")
                        : t("Remember with Windows Hello on this PC")}
                    </span>
                  </label>
                )}

                {message && (
                  <motion.p
                    role="alert"
                    initial={reduce ? false : { opacity: 0, y: -3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: EASE_OUT }}
                    className="rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2 text-[12px] leading-relaxed text-destructive"
                  >
                    {message}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  disabled={busy}
                  className="mt-1 h-10 w-full rounded-lg text-[13px]"
                >
                  {busy && <LoaderCircle className="size-3.5 animate-spin" />}
                  {busy ? t("Opening…") : mode === "setup" ? t("Create vault") : t("Open vault")}
                </Button>
              </form>

              {helloEnabled && (
                <button
                  type="button"
                  onClick={onDisableHello}
                  disabled={busy}
                  className="mt-3 text-[11px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {t("Disable Windows Hello")}
                </button>
              )}

              <p className="mt-5 truncate border-t border-border pt-4 font-mono text-[10px] text-muted-foreground">
                {vaultPath}
              </p>
            </CardContent>

            {busy && <DerivingLine />}
          </Card>
          </ShakeOnError>
        </motion.div>

        <p className="mt-6 text-center text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          {t("AES-256-GCM · Argon2id · all local")}
        </p>
      </div>
    </div>
  );
}
