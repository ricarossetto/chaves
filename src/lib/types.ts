export type ItemKind = "key" | "link";

export type View = "projects" | "notes";

export interface HelloStatus {
  available: boolean;
  enabled: boolean;
}

export interface ItemFolder {
  id: string;
  name: string;
  createdAt: number;
}

export interface ProjectFolder {
  id: string;
  name: string;
  createdAt: number;
}

export interface Item {
  id: string;
  kind: ItemKind;
  name: string;
  username: string;
  secret: string;
  url: string;
  notes: string;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  folderId: string | null;
  createdAt: number;
  folders: ItemFolder[];
  items: Item[];
}

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface VaultData {
  version: number;
  projectFolders: ProjectFolder[];
  projects: Project[];
  notes: Note[];
}

export type ItemFormValues = Pick<
  Item,
  "kind" | "name" | "username" | "secret" | "url" | "notes" | "folderId"
>;

export interface ProjectFormValues {
  name: string;
  color: string;
  folderId: string | null;
}

export const PROJECT_COLORS = [
  { name: "Olive", value: "#6f7f5b" },
  { name: "Terracotta", value: "#a0654a" },
  { name: "Slate", value: "#5f6f75" },
  { name: "Ochre", value: "#a98a4e" },
  { name: "Clay", value: "#8c5a5a" },
  { name: "Moss", value: "#7a7f52" },
  { name: "Graphite", value: "#5c5f5c" },
  { name: "Sand", value: "#b49b6a" },
] as const;

export const DEFAULT_PROJECT_COLOR = PROJECT_COLORS[0].value;

const LEGACY_COLORS: Record<string, string> = {
  violet: "#6f7f5b",
  blue: "#5f6f75",
  emerald: "#6f7f5b",
  amber: "#a98a4e",
  rose: "#8c5a5a",
  cyan: "#5f6f75",
  fuchsia: "#8c5a5a",
  lime: "#7a7f52",
};

export function projectColor(value: string): string {
  return LEGACY_COLORS[value] ?? value;
}
