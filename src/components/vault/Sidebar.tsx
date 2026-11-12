import { useState } from "react";
import {
  ChevronRight,
  Folder,
  FolderPlus,
  Languages,
  MoreHorizontal,
  NotebookPen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n, type Locale } from "@/lib/i18n";
import { projectColor, type Project, type ProjectFolder, type View } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  view: View;
  projects: Project[];
  projectFolders: ProjectFolder[];
  activeId: string | null;
  keys: number;
  links: number;
  notesCount: number;
  onViewChange: (view: View) => void;
  onSelectProject: (id: string) => void;
  onNewProject: (folderId?: string | null) => void;
  onNewProjectFolder: () => void;
  onEditProjectFolder: (folder: ProjectFolder) => void;
  onDeleteProjectFolder: (folder: ProjectFolder) => void;
}

function Summary({ keys, links }: { keys: number; links: number }) {
  const { t, count } = useI18n();
  const total = keys + links;
  const keyShare = total > 0 ? (keys / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          {t("Summary")}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
          {count("item", total)}
        </span>
      </div>
      <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-border/70">
        {total > 0 && (
          <>
            <div className="h-full bg-[var(--chart-1)]" style={{ width: `${keyShare}%` }} />
            <div className="h-full bg-[var(--chart-2)]" style={{ width: `${100 - keyShare}%` }} />
          </>
        )}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{count("key", keys)}</span>
        <span>{count("link", links)}</span>
      </div>
    </div>
  );
}

function ProjectRow({
  project,
  active,
  nested,
  onSelect,
}: {
  project: Project;
  active: boolean;
  nested?: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center rounded-md transition-colors",
        nested && "ml-4",
        active ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(project.id)}
        className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-2 text-left"
      >
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ background: projectColor(project.color) }}
        />
        <span
          className={cn(
            "truncate text-[13px]",
            active ? "text-foreground" : "text-foreground/70",
          )}
        >
          {project.name}
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground tabular-nums">
          {project.items.length}
        </span>
      </button>
    </div>
  );
}

export function Sidebar({
  view,
  projects,
  projectFolders,
  activeId,
  keys,
  links,
  notesCount,
  onViewChange,
  onSelectProject,
  onNewProject,
  onNewProjectFolder,
  onEditProjectFolder,
  onDeleteProjectFolder,
}: SidebarProps) {
  const { t, locale, setLocale } = useI18n();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleFolder = (id: string) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const looseProjects = projects.filter(
    (project) =>
      !project.folderId || !projectFolders.some((folder) => folder.id === project.folderId),
  );

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-3 px-5 py-5">
        <img
          src="/logo.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="size-8"
        />
        <div>
          <p className="font-serif text-[15px] leading-none text-foreground">Chaves</p>
          <p className="mt-1.5 text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            {t("Local vault")}
          </p>
        </div>
      </div>

      <nav className="grid gap-1 px-3 pb-3" aria-label={t("Projects")}>
        <button
          type="button"
          onClick={() => onViewChange("projects")}
          className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] transition-colors",
            view === "projects"
              ? "bg-sidebar-accent text-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
          )}
        >
          <Folder className="size-4" strokeWidth={1.5} />
          {t("Projects")}
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            {projects.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onViewChange("notes")}
          className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] transition-colors",
            view === "notes"
              ? "bg-sidebar-accent text-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
          )}
        >
          <NotebookPen className="size-4" strokeWidth={1.5} />
          {t("Notes")}
          <span className="ml-auto font-mono text-[10px] text-muted-foreground">
            {notesCount}
          </span>
        </button>
      </nav>

      <div className="flex items-center justify-between px-5 pb-2">
        <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {t("Projects")}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNewProject(null)}
            className="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label={t("New project")}
            title={t("New project")}
          >
            <Plus className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onNewProjectFolder}
            className="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label={t("New project folder")}
            title={t("New project folder")}
          >
            <FolderPlus className="size-3.5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label={t("Projects")}>
        {projectFolders.map((folder) => {
          const folderProjects = projects.filter((project) => project.folderId === folder.id);
          const isCollapsed = collapsed.has(folder.id);

          return (
            <div key={folder.id}>
              <div className="group flex items-center rounded-md transition-colors hover:bg-sidebar-accent/60">
                <button
                  type="button"
                  onClick={() => toggleFolder(folder.id)}
                  className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-left"
                >
                  <ChevronRight
                    className={cn(
                      "size-3 shrink-0 text-muted-foreground transition-transform",
                      !isCollapsed && "rotate-90",
                    )}
                    strokeWidth={1.5}
                  />
                  <Folder className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                  <span className="truncate text-[12px] text-foreground/70">{folder.name}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground tabular-nums">
                    {folderProjects.length}
                  </span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="mr-1 grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background focus-visible:opacity-100 data-[state=open]:opacity-100"
                      aria-label={`${t("Project options")}: ${folder.name}`}
                    >
                      <MoreHorizontal className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-lg">
                    <DropdownMenuItem onClick={() => onNewProject(folder.id)}>
                      <Plus className="size-4" />
                      {t("New project")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditProjectFolder(folder)}>
                      <Pencil className="size-4" />
                      {t("Rename")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDeleteProjectFolder(folder)}
                    >
                      <Trash2 className="size-4" />
                      {t("Delete folder")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {!isCollapsed &&
                folderProjects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    active={view === "projects" && project.id === activeId}
                    nested
                    onSelect={onSelectProject}
                  />
                ))}
            </div>
          );
        })}

        {projectFolders.length > 0 && looseProjects.length > 0 && (
          <p className="px-2 pt-3 pb-1 text-[10px] tracking-[0.14em] text-muted-foreground/70 uppercase">
            {t("No folder")}
          </p>
        )}

        {looseProjects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            active={view === "projects" && project.id === activeId}
            onSelect={onSelectProject}
          />
        ))}

        {projects.length === 0 && (
          <p className="px-3 py-8 text-center text-xs leading-relaxed text-muted-foreground">
            {t("No projects yet.")}
            <br />
            {t("Create the first one with the button above.")}
          </p>
        )}
      </nav>

      <div className="border-t border-border px-5 py-4">
        <div className="flex items-center justify-between gap-2 pb-4">
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Languages className="size-3.5" strokeWidth={1.5} />
            {t("Language")}
          </span>
          <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
            <SelectTrigger
              className="h-7 w-[112px] rounded-md border-border bg-background text-[11px]"
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
        <Summary keys={keys} links={links} />
      </div>
    </aside>
  );
}
