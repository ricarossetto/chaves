import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { listen } from "@tauri-apps/api/event";
import {
  AnimatedToastStack,
  useAnimatedToastStack,
  type ToastStatus,
} from "@/components/beui/animated-toast-stack";
import { AuthScreen } from "@/components/vault/AuthScreen";
import { CloseDialog } from "@/components/vault/CloseDialog";
import { DeleteDialog } from "@/components/vault/DeleteDialog";
import { FolderDialog } from "@/components/vault/FolderDialog";
import { ItemDialog } from "@/components/vault/ItemDialog";
import { NotesView } from "@/components/vault/NotesView";
import { ProjectDialog } from "@/components/vault/ProjectDialog";
import { ProjectView } from "@/components/vault/ProjectView";
import { Sidebar } from "@/components/vault/Sidebar";
import { Topbar, type Filter } from "@/components/vault/Topbar";
import { backend } from "@/lib/backend";
import { countItems, newId } from "@/lib/data";
import { EASE_OUT } from "@/lib/ease";
import { useI18n } from "@/lib/i18n";
import type {
  HelloStatus,
  Item,
  ItemFolder,
  ItemFormValues,
  ItemKind,
  Note,
  Project,
  ProjectFolder,
  VaultData,
  View,
} from "@/lib/types";

type Screen = "loading" | "setup" | "locked" | "unlocked";

type DialogState =
  | { type: "project"; project?: Project; folderId?: string | null }
  | { type: "project-folder"; folder?: ProjectFolder }
  | { type: "item"; projectId: string; kind: ItemKind; item?: Item; folderId?: string | null }
  | { type: "item-folder"; projectId: string; folder?: ItemFolder }
  | { type: "delete-project"; project: Project }
  | { type: "delete-project-folder"; folder: ProjectFolder }
  | { type: "delete-item"; projectId: string; item: Item }
  | { type: "delete-item-folder"; projectId: string; folder: ItemFolder }
  | { type: "delete-note"; note: Note }
  | null;

export default function App() {
  const { t, error: translateError } = useI18n();
  const reduceMotion = useReducedMotion();
  const [screen, setScreen] = useState<Screen>("loading");
  const [view, setView] = useState<View>("projects");
  const [data, setData] = useState<VaultData | null>(null);
  const [vaultPath, setVaultPath] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [hello, setHello] = useState<HelloStatus>({ available: false, enabled: false });
  const [closePrompt, setClosePrompt] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  const dataRef = useRef<VaultData | null>(null);
  const saveChain = useRef<Promise<unknown>>(Promise.resolve());
  const shown = useRef(false);

  const { toasts, showToast, dismissToast } = useAnimatedToastStack({ limit: 3 });
  const notify = useCallback(
    (title: string, status: ToastStatus = "info") => {
      showToast({ title, status });
    },
    [showToast],
  );

  const persist = useCallback(
    (next: VaultData) => {
      saveChain.current = saveChain.current
        .catch(() => undefined)
        .then(() => backend.saveVault(next))
        .catch((err) =>
          notify(
            t("Could not save: {error}", { error: translateError(String(err)) }),
            "error",
          ),
        );
    },
    [notify, t, translateError],
  );

  const update = useCallback(
    (mutate: (draft: VaultData) => void, options?: { persist?: boolean }) => {
      const base = dataRef.current;
      if (!base) return;
      const next = structuredClone(base);
      mutate(next);
      dataRef.current = next;
      setData(next);
      if (options?.persist !== false) persist(next);
    },
    [persist],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [exists, path] = await Promise.all([backend.vaultExists(), backend.vaultPath()]);
        if (!alive) return;
        setVaultPath(path);
        setScreen(exists ? "locked" : "setup");
      } catch (err) {
        if (!alive) return;
        setError(String(err));
        setScreen("setup");
      }
    })();
    void backend
      .helloStatus()
      .then((status) => {
        if (alive) setHello(status);
      })
      .catch(() => {
        if (alive) setHello({ available: false, enabled: false });
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    void backend.readyToShow();
  }, []);

  useEffect(() => {
    if (data && (!activeId || !data.projects.some((project) => project.id === activeId))) {
      setActiveId(data.projects[0]?.id ?? null);
      setFolderFilter("all");
    }
  }, [data, activeId]);

  useEffect(() => {
    if (view === "notes" && data && (!activeNoteId || !data.notes.some((note) => note.id === activeNoteId))) {
      setActiveNoteId(data.notes[0]?.id ?? null);
    }
  }, [view, data, activeNoteId]);

  const handleCreate = async (password: string, useHello: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const unlocked = await backend.createVault(password);
      dataRef.current = unlocked;
      setData(unlocked);
      setActiveId(unlocked.projects[0]?.id ?? null);
      setScreen("unlocked");
      setView("projects");
      notify(t("Vault created. Create your first project."), "success");

      if (useHello && hello.available) {
        try {
          await backend.enableHello(password);
          setHello((current) => ({ ...current, enabled: true }));
          notify(t("Windows Hello enabled"), "success");
        } catch (err) {
          notify(
            t("Vault created, but Windows Hello could not be enabled: {error}", {
              error: translateError(String(err)),
            }),
            "error",
          );
        }
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUnlock = async (password: string, useHello: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const unlocked = await backend.unlockVault(password);
      dataRef.current = unlocked;
      setData(unlocked);
      setActiveId(unlocked.projects[0]?.id ?? null);
      setScreen("unlocked");
      setView("projects");

      if (useHello && hello.available && !hello.enabled) {
        try {
          await backend.enableHello(password);
          setHello((current) => ({ ...current, enabled: true }));
          notify(t("Windows Hello enabled"), "success");
        } catch (err) {
          notify(
            t("Windows Hello could not be enabled: {error}", {
              error: translateError(String(err)),
            }),
            "error",
          );
        }
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleLock = useCallback(() => {
    void backend.lockVault().catch(() => undefined);
    dataRef.current = null;
    setData(null);
    setActiveId(null);
    setActiveNoteId(null);
    setFolderFilter("all");
    setQuery("");
    setFilter("all");
    setDialog(null);
    setError(null);
    setView("projects");
    setScreen("locked");
  }, []);

  const handleHelloUnlock = async () => {
    setBusy(true);
    setError(null);
    try {
      const unlocked = await backend.unlockWithHello();
      dataRef.current = unlocked;
      setData(unlocked);
      setActiveId(unlocked.projects[0]?.id ?? null);
      setScreen("unlocked");
      setView("projects");
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDisableHello = async () => {
    try {
      await backend.disableHello();
      setHello((current) => ({ ...current, enabled: false }));
      notify(t("Windows Hello disabled"), "success");
    } catch (err) {
      notify(
        t("Windows Hello could not be disabled: {error}", {
          error: translateError(String(err)),
        }),
        "error",
      );
    }
  };

  const hideToTray = async () => {
    setClosePrompt(false);
    const current = dataRef.current;
    if (current) {
      try {
        await backend.saveVault(current);
      } catch {
        // a próxima gravação tenta de novo
      }
    }
    await backend.hideToTray().catch(() => undefined);
  };

  const quitApp = async () => {
    setClosePrompt(false);
    const current = dataRef.current;
    if (current) {
      try {
        await backend.saveVault(current);
      } catch {
        // ainda assim encerra
      }
    }
    await backend.quitApp().catch(() => undefined);
  };

  useEffect(() => {
    let disposed = false;
    let unlistenClose: (() => void) | undefined;
    let unlistenLock: (() => void) | undefined;

    void listen("close-requested", () => {
      if (!disposed) setClosePrompt(true);
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else unlistenClose = unlisten;
      })
      .catch(() => undefined);

    void listen("tray-lock", () => {
      if (!disposed) handleLock();
    })
      .then((unlisten) => {
        if (disposed) unlisten();
        else unlistenLock = unlisten;
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      unlistenClose?.();
      unlistenLock?.();
    };
  }, [handleLock]);

  const openProject = (id: string) => {
    setView("projects");
    setActiveId(id);
    setFolderFilter("all");
    setQuery("");
  };

  const openNotes = () => {
    setView("notes");
    setQuery("");
  };

  const saveProject = (name: string, color: string, folderId: string | null) => {
    if (dialog?.type !== "project") return;
    const editing = dialog.project;

    if (editing) {
      update((draft) => {
        const project = draft.projects.find((candidate) => candidate.id === editing.id);
        if (project) {
          project.name = name;
          project.color = color;
          project.folderId = folderId;
        }
      });
      notify(t("Project updated"), "success");
    } else {
      const id = newId();
      update((draft) => {
        draft.projects.push({
          id,
          name,
          color,
          folderId,
          createdAt: Date.now(),
          folders: [],
          items: [],
        });
      });
      setActiveId(id);
      setView("projects");
      notify(t("Project created"), "success");
    }

    setDialog(null);
  };

  const saveProjectFolder = (name: string) => {
    if (dialog?.type !== "project-folder") return;
    const editing = dialog.folder;

    if (editing) {
      update((draft) => {
        const folder = draft.projectFolders.find((candidate) => candidate.id === editing.id);
        if (folder) folder.name = name;
      });
      notify(t("Project folder renamed"), "success");
    } else {
      update((draft) => {
        draft.projectFolders.push({ id: newId(), name, createdAt: Date.now() });
      });
      notify(t("Project folder created"), "success");
    }

    setDialog(null);
  };

  const saveItemFolder = (name: string) => {
    if (dialog?.type !== "item-folder") return;
    const { projectId, folder: editing } = dialog;

    if (editing) {
      update((draft) => {
        const project = draft.projects.find((candidate) => candidate.id === projectId);
        const folder = project?.folders.find((candidate) => candidate.id === editing.id);
        if (folder) folder.name = name;
      });
      notify(t("Folder renamed"), "success");
    } else {
      update((draft) => {
        const project = draft.projects.find((candidate) => candidate.id === projectId);
        project?.folders.push({ id: newId(), name, createdAt: Date.now() });
      });
      notify(t("Folder created"), "success");
    }

    setDialog(null);
  };

  const saveItem = (values: ItemFormValues) => {
    if (dialog?.type !== "item") return;
    const now = Date.now();

    update((draft) => {
      const project = draft.projects.find((candidate) => candidate.id === dialog.projectId);
      if (!project) return;

      if (dialog.item) {
        const item = project.items.find((candidate) => candidate.id === dialog.item!.id);
        if (item) Object.assign(item, values, { updatedAt: now });
      } else {
        project.items.push({
          id: newId(),
          ...values,
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    notify(
      dialog.item
        ? t("Item updated")
        : values.kind === "key"
          ? t("Key saved")
          : t("Link saved"),
      "success",
    );
    setDialog(null);
  };

  const createNote = () => {
    const id = newId();
    const now = Date.now();
    update((draft) => {
      draft.notes.push({ id, title: "", body: "", createdAt: now, updatedAt: now });
    });
    setActiveNoteId(id);
    setView("notes");
    setQuery("");
  };

  const updateNoteDraft = useCallback(
    (id: string, patch: Partial<Pick<Note, "title" | "body">>) => {
      update(
        (draft) => {
          const note = draft.notes.find((candidate) => candidate.id === id);
          if (note) {
            if (patch.title !== undefined) note.title = patch.title;
            if (patch.body !== undefined) note.body = patch.body;
            note.updatedAt = Date.now();
          }
        },
        { persist: false },
      );
    },
    [update],
  );

  const flushNotes = useCallback(() => {
    const current = dataRef.current;
    if (current) persist(current);
  }, [persist]);

  const confirmDeleteProject = () => {
    if (dialog?.type !== "delete-project") return;
    const projectId = dialog.project.id;
    update((draft) => {
      draft.projects = draft.projects.filter((project) => project.id !== projectId);
    });
    if (activeId === projectId) setActiveId(null);
    notify(t("Project deleted"), "success");
    setDialog(null);
  };

  const confirmDeleteProjectFolder = () => {
    if (dialog?.type !== "delete-project-folder") return;
    const folderId = dialog.folder.id;
    update((draft) => {
      draft.projects.forEach((project) => {
        if (project.folderId === folderId) project.folderId = null;
      });
      draft.projectFolders = draft.projectFolders.filter((folder) => folder.id !== folderId);
    });
    notify(t("Project folder deleted. Projects moved back to the root."), "success");
    setDialog(null);
  };

  const confirmDeleteItem = () => {
    if (dialog?.type !== "delete-item") return;
    const { projectId, item } = dialog;
    update((draft) => {
      const project = draft.projects.find((candidate) => candidate.id === projectId);
      if (project) {
        project.items = project.items.filter((candidate) => candidate.id !== item.id);
      }
    });
    notify(t("Item deleted"), "success");
    setDialog(null);
  };

  const confirmDeleteItemFolder = () => {
    if (dialog?.type !== "delete-item-folder") return;
    const { projectId, folder } = dialog;
    update((draft) => {
      const project = draft.projects.find((candidate) => candidate.id === projectId);
      if (project) {
        project.folders = project.folders.filter((candidate) => candidate.id !== folder.id);
        project.items.forEach((item) => {
          if (item.folderId === folder.id) item.folderId = null;
        });
      }
    });
    if (folderFilter === folder.id) setFolderFilter("all");
    notify(t("Folder deleted. Items are now unfiled."), "success");
    setDialog(null);
  };

  const confirmDeleteNote = () => {
    if (dialog?.type !== "delete-note") return;
    const noteId = dialog.note.id;
    update((draft) => {
      draft.notes = draft.notes.filter((note) => note.id !== noteId);
    });
    if (activeNoteId === noteId) {
      const next = dataRef.current?.notes[0]?.id ?? null;
      setActiveNoteId(next);
    }
    notify(t("Note deleted"), "success");
    setDialog(null);
  };

  if (screen === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (screen !== "unlocked" || !data) {
    return (
      <>
        <AuthScreen
          mode={screen === "setup" ? "setup" : "locked"}
          vaultPath={vaultPath}
          busy={busy}
          error={error}
          hello={hello}
          onCreate={handleCreate}
          onUnlock={handleUnlock}
          onHello={handleHelloUnlock}
          onDisableHello={handleDisableHello}
        />
        {closePrompt && (
          <CloseDialog
            onCancel={() => setClosePrompt(false)}
            onHide={hideToTray}
            onQuit={quitApp}
          />
        )}
        <AnimatedToastStack
          toasts={toasts}
          onDismiss={dismissToast}
          position="bottom-right"
          fixed
          classNames={{ surface: "rounded-lg bg-card shadow-sm backdrop-blur-none" }}
        />
      </>
    );
  }

  const activeProject = data.projects.find((project) => project.id === activeId) ?? null;
  const counts = countItems(data.projects);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        view={view}
        projects={data.projects}
        projectFolders={data.projectFolders}
        activeId={activeId}
        keys={counts.keys}
        links={counts.links}
        notesCount={data.notes.length}
        onViewChange={(next) => (next === "notes" ? openNotes() : setView("projects"))}
        onSelectProject={openProject}
        onNewProject={(folderId) => setDialog({ type: "project", folderId: folderId ?? null })}
        onNewProjectFolder={() => setDialog({ type: "project-folder" })}
        onEditProjectFolder={(folder) => setDialog({ type: "project-folder", folder })}
        onDeleteProjectFolder={(folder) => setDialog({ type: "delete-project-folder", folder })}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          view={view}
          query={query}
          onQueryChange={setQuery}
          filter={filter}
          onFilterChange={setFilter}
          projectItemCount={counts.total}
          noteCount={data.notes.length}
          onLock={handleLock}
        />

        <main
          className={
            view === "projects"
              ? "min-h-0 flex-1 overflow-y-auto"
              : "min-h-0 flex-1 overflow-hidden"
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view === "projects" ? `project-${activeId ?? "none"}` : "notes"}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -2 }}
              transition={reduceMotion ? { duration: 0.1 } : { duration: 0.16, ease: EASE_OUT }}
              className={view === "notes" ? "h-full" : undefined}
            >
              {view === "projects" ? (
            <ProjectView
              data={data}
              activeProject={activeProject}
              query={query}
              filter={filter}
              folderFilter={folderFilter}
              onFolderFilterChange={setFolderFilter}
              onNewProject={() => setDialog({ type: "project", folderId: null })}
              onNewItemFolder={(projectId) => setDialog({ type: "item-folder", projectId })}
              onEditItemFolder={(projectId, folder) =>
                setDialog({ type: "item-folder", projectId, folder })
              }
              onDeleteItemFolder={(projectId, folder) =>
                setDialog({ type: "delete-item-folder", projectId, folder })
              }
              onEditProject={(project) => setDialog({ type: "project", project })}
              onDeleteProject={(project) => setDialog({ type: "delete-project", project })}
              onNewItem={(projectId, kind, folderId) =>
                setDialog({ type: "item", projectId, kind, folderId })
              }
              onEditItem={(projectId, item) =>
                setDialog({ type: "item", projectId, kind: item.kind, item, folderId: item.folderId })
              }
              onDeleteItem={(projectId, item) =>
                setDialog({ type: "delete-item", projectId, item })
              }
              onToast={notify}
            />
          ) : (
            <NotesView
              notes={data.notes}
              activeNoteId={activeNoteId}
              query={query}
              onSelect={setActiveNoteId}
              onCreate={createNote}
              onDelete={(note) => setDialog({ type: "delete-note", note })}
              onDraftChange={updateNoteDraft}
              onFlush={flushNotes}
            />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatedToastStack
        toasts={toasts}
        onDismiss={dismissToast}
        position="bottom-right"
        fixed
        classNames={{ surface: "rounded-lg bg-card shadow-sm backdrop-blur-none" }}
      />

      {dialog?.type === "project" && (
        <ProjectDialog
          key={dialog.project?.id ?? `new-${dialog.folderId ?? "root"}`}
          project={dialog.project}
          folders={data.projectFolders}
          initialFolderId={dialog.folderId ?? dialog.project?.folderId ?? null}
          onClose={() => setDialog(null)}
          onSave={saveProject}
        />
      )}

      {dialog?.type === "project-folder" && (
        <FolderDialog
          key={dialog.folder?.id ?? "new-project-folder"}
          title={dialog.folder ? t("Rename folder") : t("New folder")}
          initialName={dialog.folder?.name ?? ""}
          onClose={() => setDialog(null)}
          onSave={saveProjectFolder}
        />
      )}

      {dialog?.type === "item" && (
        <ItemDialog
          key={dialog.item?.id ?? `new-${dialog.kind}-${dialog.folderId ?? "none"}`}
          kind={dialog.kind}
          item={dialog.item}
          folders={
            data.projects.find((project) => project.id === dialog.projectId)?.folders ?? []
          }
          initialFolderId={dialog.folderId ?? null}
          onClose={() => setDialog(null)}
          onSave={saveItem}
        />
      )}

      {dialog?.type === "item-folder" && (
        <FolderDialog
          key={dialog.folder?.id ?? `new-item-folder-${dialog.projectId}`}
          title={dialog.folder ? t("Rename folder") : t("New folder")}
          initialName={dialog.folder?.name ?? ""}
          onClose={() => setDialog(null)}
          onSave={saveItemFolder}
        />
      )}

      {dialog?.type === "delete-project" && (
        <DeleteDialog
          title={t("Delete “{name}”?", { name: dialog.project.name })}
          description={t("The project and all items inside it will be removed from the vault.")}
          onClose={() => setDialog(null)}
          onConfirm={confirmDeleteProject}
        />
      )}

      {dialog?.type === "delete-project-folder" && (
        <DeleteDialog
          title={t("Delete “{name}”?", { name: dialog.folder.name })}
          description={t(
            "The projects inside this folder will not be deleted; they move back to the root.",
          )}
          onClose={() => setDialog(null)}
          onConfirm={confirmDeleteProjectFolder}
        />
      )}

      {dialog?.type === "delete-item" && (
        <DeleteDialog
          title={t("Delete “{name}”?", { name: dialog.item.name })}
          description={
            dialog.item.kind === "key"
              ? t("The key will be removed from the vault. This cannot be undone.")
              : t("The link will be removed from the vault. This cannot be undone.")
          }
          onClose={() => setDialog(null)}
          onConfirm={confirmDeleteItem}
        />
      )}

      {dialog?.type === "delete-item-folder" && (
        <DeleteDialog
          title={t("Delete “{name}”?", { name: dialog.folder.name })}
          description={t(
            "The items in this folder will not be deleted; they become unfiled.",
          )}
          onClose={() => setDialog(null)}
          onConfirm={confirmDeleteItemFolder}
        />
      )}

      {dialog?.type === "delete-note" && (
        <DeleteDialog
          title={t("Delete “{name}”?", {
            name: dialog.note.title.trim() || t("No title"),
          })}
          description={t("The note will be removed from the vault. This cannot be undone.")}
          onClose={() => setDialog(null)}
          onConfirm={confirmDeleteNote}
        />
      )}

      {closePrompt && (
        <CloseDialog
          onCancel={() => setClosePrompt(false)}
          onHide={hideToTray}
          onQuit={quitApp}
        />
      )}
    </div>
  );
}
