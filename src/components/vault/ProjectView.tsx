import { AnimatePresence, motion } from "motion/react";
import {
  FolderPlus,
  KeyRound,
  Link2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/beui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import {
  projectColor,
  type Item,
  type ItemFolder,
  type ItemKind,
  type Project,
  type VaultData,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { ItemCard, type ToastFn } from "./ItemCard";
import type { Filter } from "./Topbar";

interface ProjectViewProps {
  data: VaultData;
  activeProject: Project | null;
  query: string;
  filter: Filter;
  folderFilter: string;
  onFolderFilterChange: (value: string) => void;
  onNewProject: () => void;
  onNewItemFolder: (projectId: string) => void;
  onEditItemFolder: (projectId: string, folder: ItemFolder) => void;
  onDeleteItemFolder: (projectId: string, folder: ItemFolder) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onNewItem: (projectId: string, kind: ItemKind, folderId: string | null) => void;
  onEditItem: (projectId: string, item: Item) => void;
  onDeleteItem: (projectId: string, item: Item) => void;
  onToast: ToastFn;
}

function matches(item: Item, needle: string) {
  return (
    !needle ||
    [item.name, item.username, item.url, item.notes].some((value) =>
      value.toLowerCase().includes(needle),
    )
  );
}

function FilterChip({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-baseline gap-1.5 rounded-md px-2 py-1 text-[12px] transition-colors",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
        {count}
      </span>
    </button>
  );
}

export function ProjectView({
  data,
  activeProject,
  query,
  filter,
  folderFilter,
  onFolderFilterChange,
  onNewProject,
  onNewItemFolder,
  onEditItemFolder,
  onDeleteItemFolder,
  onEditProject,
  onDeleteProject,
  onNewItem,
  onEditItem,
  onDeleteItem,
  onToast,
}: ProjectViewProps) {
  const { t, count } = useI18n();
  const needle = query.trim().toLowerCase();
  const searching = needle.length > 0;

  const searchResults: { project: Project; item: Item }[] = [];
  if (searching) {
    for (const project of data.projects) {
      for (const item of project.items) {
        if (matches(item, needle) && (filter === "all" || item.kind === filter)) {
          searchResults.push({ project, item });
        }
      }
    }
    searchResults.sort((a, b) => b.item.updatedAt - a.item.updatedAt);
  }

  const folders = activeProject?.folders ?? [];
  const itemsInFolder = activeProject
    ? activeProject.items.filter((item) =>
        folderFilter === "all"
          ? true
          : folderFilter === "none"
            ? !item.folderId
            : item.folderId === folderFilter,
      )
    : [];
  const projectItems = itemsInFolder
    .filter((item) => matches(item, needle) && (filter === "all" || item.kind === filter))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const defaultFolderId =
    folderFilter === "all" || folderFilter === "none" ? null : folderFilter;

  if (data.projects.length === 0) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-8 py-10">
        <div className="w-full max-w-md border border-border bg-card/60 px-8 py-12 text-center">
          <FolderPlus className="mx-auto size-6 text-muted-foreground" strokeWidth={1.25} />
          <h2 className="mt-4 font-serif text-[22px] leading-tight text-foreground">
            {t("Create your first project")}
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
            {t("Separate your keys and links by context: work, clients, personal.")}
          </p>
          <Button className="mt-6 rounded-lg" onClick={onNewProject}>
            <Plus className="size-4" />
            {t("New project")}
          </Button>
        </div>
      </div>
    );
  }

  const total = activeProject?.items.length ?? 0;
  const keys = activeProject?.items.filter((item) => item.kind === "key").length ?? 0;
  const links = total - keys;
  const unassigned = activeProject?.items.filter((item) => !item.folderId).length ?? 0;
  const folderCount = (folderId: string) =>
    activeProject?.items.filter((item) => item.folderId === folderId).length ?? 0;

  const emptyTitle =
    total === 0
      ? t("No items yet")
      : folderFilter !== "all" && itemsInFolder.length === 0
        ? t("Nothing in this folder")
        : t("Nothing with this filter");

  const emptyDescription =
    total === 0
      ? t("Use the buttons above to add the first key or link.")
      : folderFilter !== "all" && itemsInFolder.length === 0
        ? t("Choose another folder or add an item here.")
        : t("Change the filter to see other items.");

  return (
    <div className="mx-auto w-full max-w-[1180px] px-8 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{
                background: searching ? "var(--primary)" : projectColor(activeProject?.color ?? ""),
              }}
            />
            <h1 className="truncate font-serif text-[26px] leading-none tracking-[-0.01em] text-foreground">
              {searching ? t("Search") : activeProject?.name}
            </h1>
            <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
              {searching ? searchResults.length : projectItems.length}
            </span>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            {searching
              ? t("{count} results for “{query}”", {
                  count: searchResults.length,
                  query: query.trim(),
                })
              : `${count("item", total)} · ${count("key", keys)} · ${count("link", links)}`}
          </p>
        </div>

        {!searching && activeProject && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="rounded-lg"
              onClick={() => onNewItem(activeProject.id, "key", defaultFolderId)}
            >
              <KeyRound className="size-4" />
              {t("New key")}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-lg"
              onClick={() => onNewItem(activeProject.id, "link", defaultFolderId)}
            >
              <Link2 className="size-4" />
              {t("New link")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-lg text-muted-foreground"
              onClick={() => onNewItemFolder(activeProject.id)}
            >
              <FolderPlus className="size-4" />
              {t("Folder")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-lg"
                  aria-label={t("Project options")}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-lg">
                <DropdownMenuItem onClick={() => onEditProject(activeProject)}>
                  <Pencil className="size-4" />
                  {t("Edit project")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDeleteProject(activeProject)}
                >
                  <Trash2 className="size-4" />
                  {t("Delete project")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {!searching && activeProject && folders.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-1 border-b border-border pb-3">
          <FilterChip
            active={folderFilter === "all"}
            label={t("All")}
            count={total}
            onClick={() => onFolderFilterChange("all")}
          />

          {folders.map((folder) => {
            const active = folderFilter === folder.id;
            return (
              <div
                key={folder.id}
                className={cn(
                  "flex items-center rounded-md transition-colors",
                  active ? "bg-secondary" : "",
                )}
              >
                <button
                  type="button"
                  onClick={() => onFolderFilterChange(folder.id)}
                  className={cn(
                    "px-2 py-1 text-[12px] transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {folder.name}
                  <span className="ml-1 font-mono text-[10px] text-muted-foreground tabular-nums">
                    {folderCount(folder.id)}
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="mr-0.5 grid size-5 place-items-center rounded text-muted-foreground hover:text-foreground"
                      aria-label={`${t("Folder")}: ${folder.name}`}
                    >
                      <MoreHorizontal className="size-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-lg">
                    <DropdownMenuItem onClick={() => onEditItemFolder(activeProject.id, folder)}>
                      <Pencil className="size-4" />
                      {t("Rename")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDeleteItemFolder(activeProject.id, folder)}
                    >
                      <Trash2 className="size-4" />
                      {t("Delete folder")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}

          <FilterChip
            active={folderFilter === "none"}
            label={t("No folder")}
            count={unassigned}
            onClick={() => onFolderFilterChange("none")}
          />
        </div>
      )}

      <div className="mt-7">
        {searching ? (
          searchResults.length === 0 ? (
            <div className="border-t border-border pt-8">
              <h3 className="font-serif text-[18px] text-foreground">{t("Nothing found")}</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {t("Try another term or clear the search.")}
              </p>
            </div>
          ) : (
            <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {searchResults.map(({ project, item }) => (
                  <ItemCard
                    key={`${project.id}-${item.id}`}
                    item={item}
                    projectName={project.name}
                    onEdit={() => onEditItem(project.id, item)}
                    onDelete={() => onDeleteItem(project.id, item)}
                    onToast={onToast}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )
        ) : activeProject ? (
          projectItems.length === 0 ? (
            <div className="border-t border-border pt-8">
              <h3 className="font-serif text-[18px] text-foreground">{emptyTitle}</h3>
              <p className="mt-1 max-w-md text-[12px] leading-relaxed text-muted-foreground">
                {emptyDescription}
              </p>
            </div>
          ) : (
            <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {projectItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => onEditItem(activeProject.id, item)}
                    onDelete={() => onDeleteItem(activeProject.id, item)}
                    onToast={onToast}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )
        ) : null}
      </div>
    </div>
  );
}
