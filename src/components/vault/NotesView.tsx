import { useEffect, useRef, useState } from "react";
import { NotebookPen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/beui/button";
import { useI18n } from "@/lib/i18n";
import type { Note } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  note: Note;
  onDraftChange: (id: string, patch: Partial<Pick<Note, "title" | "body">>) => void;
  onFlush: () => void;
}

function NoteEditor({ note, onDraftChange, onFlush }: NoteEditorProps) {
  const { t, date } = useI18n();
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const timer = useRef<number | null>(null);
  const dirty = useRef(false);

  const schedule = (nextTitle: string, nextBody: string) => {
    dirty.current = true;
    onDraftChange(note.id, { title: nextTitle, body: nextBody });

    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      dirty.current = false;
      onFlush();
    }, 500);
  };

  useEffect(() => {
    const flush = () => {
      if (dirty.current) onFlush();
    };
    window.addEventListener("beforeunload", flush);

    return () => {
      window.removeEventListener("beforeunload", flush);
      if (timer.current !== null) window.clearTimeout(timer.current);
      if (dirty.current) onFlush();
    };
  }, [onFlush]);

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-10 py-8">
      <input
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          schedule(event.target.value, body);
        }}
        placeholder={t("No title")}
        aria-label={t("Title of the note")}
        className="w-full bg-transparent font-serif text-[30px] leading-tight tracking-[-0.01em] text-foreground outline-none placeholder:text-muted-foreground/40"
      />

      <div className="mt-2 flex items-center gap-2 text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
        <span>{t("Note")}</span>
        <span>·</span>
        <span>{date(note.updatedAt)}</span>
      </div>

      <textarea
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
          schedule(title, event.target.value);
        }}
        placeholder={t("Write something…")}
        aria-label={t("Content of the note")}
        className="mt-6 min-h-0 flex-1 resize-none bg-transparent text-[14px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40"
      />
    </div>
  );
}

interface NotesViewProps {
  notes: Note[];
  activeNoteId: string | null;
  query: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (note: Note) => void;
  onDraftChange: (id: string, patch: Partial<Pick<Note, "title" | "body">>) => void;
  onFlush: () => void;
}

export function NotesView({
  notes,
  activeNoteId,
  query,
  onSelect,
  onCreate,
  onDelete,
  onDraftChange,
  onFlush,
}: NotesViewProps) {
  const { t, date } = useI18n();
  const needle = query.trim().toLowerCase();
  const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
  const filtered = needle
    ? sorted.filter(
        (note) =>
          note.title.toLowerCase().includes(needle) || note.body.toLowerCase().includes(needle),
      )
    : sorted;

  const activeNote = sorted.find((note) => note.id === activeNoteId) ?? sorted[0] ?? null;

  return (
    <div className="flex h-full">
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-border bg-sidebar/40">
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            {t("Notes")}
          </span>
          <button
            type="button"
            onClick={onCreate}
            className="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label={t("New note")}
            title={t("New note")}
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.map((note) => {
            const active = note.id === activeNote?.id;
            const preview = note.body.trim().split("\n")[0] ?? "";
            const noteTitle = note.title.trim() || t("No title");
            return (
              <div
                key={note.id}
                className={cn(
                  "group flex items-start rounded-md transition-colors",
                  active ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(note.id)}
                  className="min-w-0 flex-1 px-2.5 py-2 text-left"
                >
                  <p
                    className={cn(
                      "truncate text-[13px]",
                      active ? "text-foreground" : "text-foreground/70",
                    )}
                  >
                    {noteTitle}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {preview || t("Empty")}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground/70">
                    {date(note.updatedAt)}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(note)}
                  className="mr-1 mt-2 grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background focus-visible:opacity-100"
                  aria-label={`${t("Delete note")}: ${noteTitle}`}
                  title={t("Delete note")}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })}

          {notes.length === 0 && (
            <p className="px-3 py-8 text-center text-xs leading-relaxed text-muted-foreground">
              {t("No notes yet.")}
              <br />
              {t("Create the first one with the button above.")}
            </p>
          )}

          {notes.length > 0 && filtered.length === 0 && (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              {t("Nothing found.")}
            </p>
          )}
        </div>
      </aside>

      <section className="flex-1 overflow-y-auto">
        {activeNote ? (
          <NoteEditor
            key={activeNote.id}
            note={activeNote}
            onDraftChange={onDraftChange}
            onFlush={onFlush}
          />
        ) : (
          <div className="grid h-full place-items-center px-8">
            <div className="text-center">
              <NotebookPen
                className="mx-auto size-6 text-muted-foreground"
                strokeWidth={1.25}
              />
              <h2 className="mt-4 font-serif text-[22px] leading-tight text-foreground">
                {t("No notes yet")}
              </h2>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {t("Use notes for quick reminders.")}
              </p>
              <Button className="mt-5 rounded-lg" onClick={onCreate}>
                <Plus className="size-4" />
                {t("New note")}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
