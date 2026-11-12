import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "pt-BR" | "en-US" | "zh-CN";

const STORAGE_KEY = "chaves.locale";

type LocaleDict = Record<string, string>;

const pt: LocaleDict = {
  "Local vault": "Cofre local",
  "Create vault": "Criar cofre",
  "Open vault": "Abrir cofre",
  "A master password protects your keys and links. Without it, the content cannot be recovered.":
    "Uma senha mestra protege suas chaves e links. Sem ela não há como recuperar o conteúdo.",
  "Enter your master password to access your keys, links, and projects.":
    "Informe a senha mestra para acessar suas chaves, links e projetos.",
  "Master password": "Senha mestra",
  "Confirm password": "Confirmar senha",
  "Show password": "Mostrar senha",
  "Hide password": "Ocultar senha",
  "Use at least 8 characters in the master password.":
    "Use pelo menos 8 caracteres na senha mestra.",
  "Passwords do not match.": "As senhas não conferem.",
  "Enter the master password.": "Informe a senha mestra.",
  "Opening…": "Abrindo…",
  "Remember with Windows Hello on this PC": "Lembrar com Windows Hello neste computador",
  "Enable Windows Hello to unlock on this PC":
    "Ativar Windows Hello para desbloquear neste computador",
  "Unlock with Windows Hello": "Desbloquear com Windows Hello",
  "Disable Windows Hello": "Desativar Windows Hello",
  "or use the password": "ou use a senha",
  "AES-256-GCM · Argon2id · all local": "AES-256-GCM · Argon2id · tudo local",

  Projects: "Projetos",
  Notes: "Anotações",
  "New project": "Novo projeto",
  "New project folder": "Nova pasta de projetos",
  "No projects yet.": "Nenhum projeto ainda.",
  "Create the first one with the button above.": "Crie o primeiro no botão acima.",
  Summary: "Resumo",
  Rename: "Renomear",
  "Delete folder": "Excluir pasta",
  "Delete project": "Excluir projeto",

  "Search keys, links, notes…": "Buscar chaves, links, notas…",
  "Search notes…": "Buscar anotações…",
  Keys: "Chaves",
  Links: "Links",
  Lock: "Bloquear",
  All: "Tudo",
  "No folder": "Sem pasta",
  Language: "Idioma",

  Search: "Busca",
  "New key": "Nova chave",
  "New link": "Novo link",
  Folder: "Pasta",
  "Project options": "Opções do projeto",
  "Edit project": "Editar projeto",
  "Create your first project": "Crie seu primeiro projeto",
  "Separate your keys and links by context: work, clients, personal.":
    "Separe suas chaves e links por contexto: trabalho, clientes, pessoal.",
  "No items yet": "Nenhum item ainda",
  "Use the buttons above to add the first key or link.":
    "Use os botões acima para adicionar a primeira chave ou o primeiro link.",
  "Nothing in this folder": "Nada nesta pasta",
  "Choose another folder or add an item here.":
    "Escolha outra pasta ou adicione um item nesta.",
  "Nothing with this filter": "Nada com esse filtro",
  "Change the filter to see other items.": "Troque o filtro para ver os outros itens.",
  "Nothing found": "Nada encontrado",
  "Try another term or clear the search.": "Tente outro termo ou limpe a busca.",
  "{count} results for “{query}”": "{count} resultados para “{query}”",

  Key: "Chave",
  Link: "Link",
  "No account": "Sem conta",
  "Open link": "Abrir link",
  "Copy key": "Copiar chave",
  "Copy link": "Copiar link",
  "Show key": "Mostrar chave",
  "Hide key": "Ocultar chave",
  "Item options": "Opções do item",
  "Key copied": "Chave copiada",
  "Link copied": "Link copiado",
  "Could not copy": "Não consegui copiar",
  "Could not open link": "Não consegui abrir o link",

  "New item": "Novo item",
  "Edit item": "Editar item",
  "Save an API key or an important link in this project.":
    "Guarde uma chave de API ou um link importante neste projeto.",
  "Edit the data for this item.": "Altere os dados deste item.",
  Name: "Nome",
  "Account or identifier": "Conta ou identificação",
  "E.g.: OpenAI, Stripe…": "Ex.: OpenAI, Stripe…",
  "E.g.: Work, Clients, Personal…": "Ex.: Trabalho, Clientes, Pessoal…",
  "E.g.: Docs, Dashboard…": "Ex.: Documentação, Painel…",
  Optional: "Opcional",
  "Paste the key here": "Cole a chave aqui",
  "https://…": "https://…",
  "Enter a name.": "Informe um nome.",
  "Enter the key.": "Informe a chave.",
  "Enter the link.": "Informe o link.",
  "Use an http or https address.": "Use um endereço http ou https.",

  "Update the project name, color, or folder.":
    "Atualize o nome, a cor ou a pasta do projeto.",
  "Projects separate your keys and links by context.":
    "Projetos separam suas chaves e links por contexto.",
  Color: "Cor",
  "Create project": "Criar projeto",

  "New folder": "Nova pasta",
  "Rename folder": "Renomear pasta",
  "Use folders to separate groups of items.": "Use pastas para separar grupos de itens.",
  "E.g.: Production, Personal, Archive…": "Ex.: Produção, Pessoal, Arquivo…",

  "Delete “{name}”?": "Excluir “{name}”?",
  "The project and all items inside it will be removed from the vault.":
    "O projeto e todos os itens dentro dele serão removidos do cofre.",
  "The projects inside this folder will not be deleted; they move back to the root.":
    "Os projetos dentro desta pasta não serão excluídos; eles voltam para a raiz.",
  "The key will be removed from the vault. This cannot be undone.":
    "A chave será removida do cofre. Não há como desfazer.",
  "The link will be removed from the vault. This cannot be undone.":
    "O link será removido do cofre. Não há como desfazer.",
  "The items in this folder will not be deleted; they become unfiled.":
    "Os itens desta pasta não serão excluídos; eles ficam sem pasta.",
  "The note will be removed from the vault. This cannot be undone.":
    "A anotação será removida do cofre. Não há como desfazer.",

  "New note": "Nova anotação",
  "No title": "Sem título",
  Empty: "Vazia",
  "No notes yet": "Nenhuma anotação ainda",
  "No notes yet.": "Nenhuma anotação ainda.",
  "Nothing found.": "Nada encontrado.",
  Note: "Anotação",
  "Write something…": "Escreva algo…",
  "Title of the note": "Título da anotação",
  "Content of the note": "Conteúdo da anotação",
  "Delete note": "Excluir anotação",
  "Use notes for quick reminders.": "Use as anotações para lembretes rápidos.",

  "Close Chaves?": "Fechar o Chaves?",
  "You can close the app or keep it running in the tray, near the clock.":
    "Você pode fechar o app ou deixá-lo em segundo plano no ícone da bandeja, perto do relógio.",
  Cancel: "Cancelar",
  Close: "Fechar",
  Background: "Segundo plano",
  Save: "Salvar",
  Create: "Criar",
  Delete: "Excluir",
  Edit: "Editar",
  Add: "Adicionar",
  Copy: "Copiar",
  Show: "Mostrar",
  Hide: "Ocultar",
  Open: "Abrir",

  "Vault created. Create your first project.":
    "Cofre criado. Crie seu primeiro projeto.",
  "Project created": "Projeto criado",
  "Project updated": "Projeto atualizado",
  "Project deleted": "Projeto excluído",
  "Project folder created": "Pasta criada",
  "Project folder renamed": "Pasta renomeada",
  "Project folder deleted. Projects moved back to the root.":
    "Pasta excluída. Os projetos voltaram para a raiz.",
  "Folder created": "Pasta criada",
  "Folder renamed": "Pasta renomeada",
  "Folder deleted. Items are now unfiled.":
    "Pasta excluída. Os itens ficaram sem pasta.",
  "Item updated": "Item atualizado",
  "Key saved": "Chave salva",
  "Link saved": "Link salvo",
  "Item deleted": "Item excluído",
  "Note deleted": "Nota excluída",
  "Could not save: {error}": "Não foi possível salvar: {error}",
  "Windows Hello enabled": "Windows Hello ativado",
  "Windows Hello disabled": "Windows Hello desativado",
  "Windows Hello could not be enabled: {error}":
    "Windows Hello não foi ativado: {error}",
  "Windows Hello could not be disabled: {error}":
    "Não foi possível desativar o Windows Hello: {error}",
  "Vault created, but Windows Hello could not be enabled: {error}":
    "Cofre criado, mas o Windows Hello não foi ativado: {error}",

  Olive: "Oliva",
  Terracotta: "Terracota",
  Slate: "Ardósia",
  Ochre: "Ocre",
  Clay: "Barro",
  Moss: "Musgo",
  Graphite: "Grafite",
  Sand: "Areia",

  "1 item": "1 item",
  "{count} items": "{count} itens",
  "1 key": "1 chave",
  "{count} keys": "{count} chaves",
  "1 link": "1 link",
  "{count} links": "{count} links",
  "1 note": "1 anotação",
  "{count} notes": "{count} anotações",
  "1 project": "1 projeto",
  "{count} projects": "{count} projetos",
  "1 folder": "1 pasta",
  "{count} folders": "{count} pastas",

  "Incorrect password.": "Senha incorreta.",
  "Vault is locked.": "Cofre trancado.",
  "Windows Hello is not enabled for this vault.":
    "Windows Hello não está ativado neste cofre.",
  "Windows Hello verification was not completed.":
    "Verificação do Windows Hello não concluída.",
  "Windows Hello is not available on this computer.":
    "Windows Hello não está disponível neste computador.",
  "Invalid Windows Hello file.": "Arquivo do Windows Hello inválido.",
  "The vault file is corrupted.": "O arquivo do cofre está corrompido.",
  "Invalid vault file.": "Arquivo do cofre inválido.",
  "Invalid vault content.": "Conteúdo do cofre inválido.",
  "Unsupported vault version.": "Versão de cofre não suportada.",
  "Could not prepare encryption.": "Falha ao preparar a criptografia.",
  "Could not encrypt the vault.": "Falha ao criptografar o cofre.",
  "Internal error: {detail}": "Falha interna: {detail}",
  "Windows Hello unavailable: {detail}": "Windows Hello indisponível: {detail}",
  "Could not write the vault: {detail}": "Não consegui gravar o cofre: {detail}",
  "Could not read the vault: {detail}": "Não consegui ler o cofre: {detail}",
  "Could not protect the secret with DPAPI: {detail}":
    "Falha ao proteger com DPAPI: {detail}",
  "Could not open the secret with DPAPI: {detail}":
    "Falha ao abrir com DPAPI: {detail}",
  "Could not derive the password key: {detail}":
    "Falha ao derivar a senha: {detail}",
  "Could not serialize the vault: {detail}":
    "Falha ao serializar o cofre: {detail}",
  "Could not create the vault folder: {detail}":
    "Não consegui criar a pasta do cofre: {detail}",
  "Could not create the Windows Hello folder: {detail}":
    "Não consegui criar a pasta do Windows Hello: {detail}",
  "Could not write the Windows Hello file: {detail}":
    "Não consegui gravar o Windows Hello: {detail}",
  "Could not remove the Windows Hello file: {detail}":
    "Não consegui remover o Windows Hello: {detail}",
  "Could not read the Windows Hello file: {detail}":
    "Não consegui ler o Windows Hello: {detail}",
};

const zh: LocaleDict = {
  "Local vault": "本地保险库",
  "Create vault": "创建保险库",
  "Open vault": "打开保险库",
  "A master password protects your keys and links. Without it, the content cannot be recovered.":
    "主密码保护你的密钥和链接。没有它，内容将无法恢复。",
  "Enter your master password to access your keys, links, and projects.":
    "输入主密码以访问你的密钥、链接和项目。",
  "Master password": "主密码",
  "Confirm password": "确认密码",
  "Show password": "显示密码",
  "Hide password": "隐藏密码",
  "Use at least 8 characters in the master password.": "主密码至少需要 8 个字符。",
  "Passwords do not match.": "两次输入的密码不一致。",
  "Enter the master password.": "请输入主密码。",
  "Opening…": "正在打开…",
  "Remember with Windows Hello on this PC": "在此电脑上使用 Windows Hello 解锁",
  "Enable Windows Hello to unlock on this PC": "在此电脑上启用 Windows Hello 解锁",
  "Unlock with Windows Hello": "使用 Windows Hello 解锁",
  "Disable Windows Hello": "停用 Windows Hello",
  "or use the password": "或使用密码",
  "AES-256-GCM · Argon2id · all local": "AES-256-GCM · Argon2id · 全部本地",

  Projects: "项目",
  Notes: "笔记",
  "New project": "新建项目",
  "New project folder": "新建项目文件夹",
  "No projects yet.": "还没有项目。",
  "Create the first one with the button above.": "使用上方按钮创建第一个项目。",
  Summary: "概览",
  Rename: "重命名",
  "Delete folder": "删除文件夹",
  "Delete project": "删除项目",

  "Search keys, links, notes…": "搜索密钥、链接、笔记…",
  "Search notes…": "搜索笔记…",
  Keys: "密钥",
  Links: "链接",
  Lock: "锁定",
  All: "全部",
  "No folder": "无文件夹",
  Language: "语言",

  Search: "搜索",
  "New key": "新建密钥",
  "New link": "新建链接",
  Folder: "文件夹",
  "Project options": "项目选项",
  "Edit project": "编辑项目",
  "Create your first project": "创建第一个项目",
  "Separate your keys and links by context: work, clients, personal.":
    "按场景整理密钥和链接：工作、客户、个人。",
  "No items yet": "还没有条目",
  "Use the buttons above to add the first key or link.":
    "使用上方按钮添加第一个密钥或链接。",
  "Nothing in this folder": "此文件夹中没有内容",
  "Choose another folder or add an item here.": "选择其他文件夹，或在此添加条目。",
  "Nothing with this filter": "此筛选条件下没有内容",
  "Change the filter to see other items.": "切换筛选条件以查看其他条目。",
  "Nothing found": "未找到",
  "Try another term or clear the search.": "尝试其他关键词，或清除搜索。",
  "{count} results for “{query}”": "“{query}”的 {count} 个结果",

  Key: "密钥",
  Link: "链接",
  "No account": "未填写账号",
  "Open link": "打开链接",
  "Copy key": "复制密钥",
  "Copy link": "复制链接",
  "Show key": "显示密钥",
  "Hide key": "隐藏密钥",
  "Item options": "条目选项",
  "Key copied": "密钥已复制",
  "Link copied": "链接已复制",
  "Could not copy": "无法复制",
  "Could not open link": "无法打开链接",

  "New item": "新建条目",
  "Edit item": "编辑条目",
  "Save an API key or an important link in this project.":
    "在此项目中保存 API 密钥或重要链接。",
  "Edit the data for this item.": "修改此条目的数据。",
  Name: "名称",
  "Account or identifier": "账号或标识",
  "E.g.: OpenAI, Stripe…": "例如：OpenAI、Stripe…",
  "E.g.: Work, Clients, Personal…": "例如：工作、客户、个人…",
  "E.g.: Docs, Dashboard…": "例如：文档、控制台…",
  Optional: "可选",
  "Paste the key here": "在此粘贴密钥",
  "https://…": "https://…",
  "Enter a name.": "请输入名称。",
  "Enter the key.": "请输入密钥。",
  "Enter the link.": "请输入链接。",
  "Use an http or https address.": "请使用 http 或 https 地址。",

  "Update the project name, color, or folder.": "修改项目名称、颜色或文件夹。",
  "Projects separate your keys and links by context.":
    "项目按场景分隔密钥和链接。",
  Color: "颜色",
  "Create project": "创建项目",

  "New folder": "新建文件夹",
  "Rename folder": "重命名文件夹",
  "Use folders to separate groups of items.": "使用文件夹分组管理条目。",
  "E.g.: Production, Personal, Archive…": "例如：生产、个人、归档…",

  "Delete “{name}”?": "删除“{name}”？",
  "The project and all items inside it will be removed from the vault.":
    "项目及其中的所有条目将从保险库中删除。",
  "The projects inside this folder will not be deleted; they move back to the root.":
    "此文件夹中的项目不会被删除，它们会回到根目录。",
  "The key will be removed from the vault. This cannot be undone.":
    "密钥将从保险库中删除，无法撤销。",
  "The link will be removed from the vault. This cannot be undone.":
    "链接将从保险库中删除，无法撤销。",
  "The items in this folder will not be deleted; they become unfiled.":
    "此文件夹中的条目不会被删除，它们会变为无文件夹。",
  "The note will be removed from the vault. This cannot be undone.":
    "笔记将从保险库中删除，无法撤销。",

  "New note": "新建笔记",
  "No title": "无标题",
  Empty: "空白",
  "No notes yet": "还没有笔记",
  "No notes yet.": "还没有笔记。",
  "Nothing found.": "未找到。",
  Note: "笔记",
  "Write something…": "写点什么…",
  "Title of the note": "笔记标题",
  "Content of the note": "笔记内容",
  "Delete note": "删除笔记",
  "Use notes for quick reminders.": "用笔记记录快速提醒。",

  "Close Chaves?": "关闭 Chaves？",
  "You can close the app or keep it running in the tray, near the clock.":
    "你可以关闭应用，或让它在托盘（时钟旁）继续运行。",
  Cancel: "取消",
  Close: "关闭",
  Background: "后台运行",
  Save: "保存",
  Create: "创建",
  Delete: "删除",
  Edit: "编辑",
  Add: "添加",
  Copy: "复制",
  Show: "显示",
  Hide: "隐藏",
  Open: "打开",

  "Vault created. Create your first project.": "保险库已创建。创建第一个项目。",
  "Project created": "项目已创建",
  "Project updated": "项目已更新",
  "Project deleted": "项目已删除",
  "Project folder created": "项目文件夹已创建",
  "Project folder renamed": "项目文件夹已重命名",
  "Project folder deleted. Projects moved back to the root.":
    "项目文件夹已删除。项目已回到根目录。",
  "Folder created": "文件夹已创建",
  "Folder renamed": "文件夹已重命名",
  "Folder deleted. Items are now unfiled.": "文件夹已删除。条目已变为无文件夹。",
  "Item updated": "条目已更新",
  "Key saved": "密钥已保存",
  "Link saved": "链接已保存",
  "Item deleted": "条目已删除",
  "Note deleted": "笔记已删除",
  "Could not save: {error}": "无法保存：{error}",
  "Windows Hello enabled": "Windows Hello 已启用",
  "Windows Hello disabled": "Windows Hello 已停用",
  "Windows Hello could not be enabled: {error}":
    "无法启用 Windows Hello：{error}",
  "Windows Hello could not be disabled: {error}":
    "无法停用 Windows Hello：{error}",
  "Vault created, but Windows Hello could not be enabled: {error}":
    "保险库已创建，但无法启用 Windows Hello：{error}",

  Olive: "橄榄绿",
  Terracotta: "赤陶",
  Slate: "石板灰",
  Ochre: "赭石",
  Clay: "陶土",
  Moss: "苔藓",
  Graphite: "石墨",
  Sand: "沙色",

  "1 item": "{count} 个条目",
  "{count} items": "{count} 个条目",
  "1 key": "{count} 个密钥",
  "{count} keys": "{count} 个密钥",
  "1 link": "{count} 个链接",
  "{count} links": "{count} 个链接",
  "1 note": "{count} 篇笔记",
  "{count} notes": "{count} 篇笔记",
  "1 project": "{count} 个项目",
  "{count} projects": "{count} 个项目",
  "1 folder": "{count} 个文件夹",
  "{count} folders": "{count} 个文件夹",

  "Incorrect password.": "密码错误。",
  "Vault is locked.": "保险库已锁定。",
  "Windows Hello is not enabled for this vault.": "此保险库未启用 Windows Hello。",
  "Windows Hello verification was not completed.": "Windows Hello 验证未完成。",
  "Windows Hello is not available on this computer.":
    "此电脑上无法使用 Windows Hello。",
  "Invalid Windows Hello file.": "Windows Hello 文件无效。",
  "The vault file is corrupted.": "保险库文件已损坏。",
  "Invalid vault file.": "保险库文件无效。",
  "Invalid vault content.": "保险库内容无效。",
  "Unsupported vault version.": "不支持的保险库版本。",
  "Could not prepare encryption.": "无法准备加密。",
  "Could not encrypt the vault.": "无法加密保险库。",
  "Internal error: {detail}": "内部错误：{detail}",
  "Windows Hello unavailable: {detail}": "Windows Hello 不可用：{detail}",
  "Could not write the vault: {detail}": "无法写入保险库：{detail}",
  "Could not read the vault: {detail}": "无法读取保险库：{detail}",
  "Could not protect the secret with DPAPI: {detail}":
    "无法使用 DPAPI 保护密钥：{detail}",
  "Could not open the secret with DPAPI: {detail}":
    "无法使用 DPAPI 打开密钥：{detail}",
  "Could not derive the password key: {detail}": "无法派生密码密钥：{detail}",
  "Could not serialize the vault: {detail}": "无法序列化保险库：{detail}",
  "Could not create the vault folder: {detail}": "无法创建保险库文件夹：{detail}",
  "Could not create the Windows Hello folder: {detail}":
    "无法创建 Windows Hello 文件夹：{detail}",
  "Could not write the Windows Hello file: {detail}":
    "无法写入 Windows Hello 文件：{detail}",
  "Could not remove the Windows Hello file: {detail}":
    "无法删除 Windows Hello 文件：{detail}",
  "Could not read the Windows Hello file: {detail}":
    "无法读取 Windows Hello 文件：{detail}",
};

const dictionaries: Record<Locale, LocaleDict> = {
  "pt-BR": pt,
  "en-US": {},
  "zh-CN": zh,
};

export type CountKind = "item" | "key" | "link" | "note" | "project" | "folder";

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  count: (kind: CountKind, value: number) => string;
  date: (value: number) => string;
  error: (message: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] === undefined ? `{${key}}` : String(params[key]),
  );
}

function detectLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "pt-BR" || saved === "en-US" || saved === "zh-CN") return saved;
  const language = navigator.language.toLowerCase();
  if (language.startsWith("zh")) return "zh-CN";
  if (language.startsWith("en")) return "en-US";
  return "pt-BR";
}

const backendErrors: Array<[string, string]> = [
  ["Senha incorreta.", "Incorrect password."],
  ["Cofre trancado.", "Vault is locked."],
  [
    "Windows Hello não está ativado neste cofre.",
    "Windows Hello is not enabled for this vault.",
  ],
  [
    "Verificação do Windows Hello não concluída.",
    "Windows Hello verification was not completed.",
  ],
  [
    "Windows Hello não está disponível neste computador.",
    "Windows Hello is not available on this computer.",
  ],
  ["Arquivo do Windows Hello inválido.", "Invalid Windows Hello file."],
  ["O arquivo do cofre está corrompido.", "The vault file is corrupted."],
  ["Arquivo do cofre inválido.", "Invalid vault file."],
  ["Conteúdo do cofre inválido.", "Invalid vault content."],
  ["Versão de cofre não suportada.", "Unsupported vault version."],
  ["Falha ao preparar a criptografia.", "Could not prepare encryption."],
  ["Falha ao criptografar o cofre.", "Could not encrypt the vault."],
];

const backendPrefixes: Array<[string, string]> = [
  ["Falha interna:", "Internal error: {detail}"],
  ["Windows Hello indisponível:", "Windows Hello unavailable: {detail}"],
  ["Não consegui gravar o cofre:", "Could not write the vault: {detail}"],
  ["Não consegui ler o cofre:", "Could not read the vault: {detail}"],
  ["Falha ao proteger com DPAPI:", "Could not protect the secret with DPAPI: {detail}"],
  ["Falha ao abrir com DPAPI:", "Could not open the secret with DPAPI: {detail}"],
  ["Falha ao derivar a senha:", "Could not derive the password key: {detail}"],
  ["Falha ao serializar o cofre:", "Could not serialize the vault: {detail}"],
  ["Não consegui criar a pasta do cofre:", "Could not create the vault folder: {detail}"],
  [
    "Não consegui criar a pasta do Windows Hello:",
    "Could not create the Windows Hello folder: {detail}",
  ],
  [
    "Não consegui gravar o Windows Hello:",
    "Could not write the Windows Hello file: {detail}",
  ],
  [
    "Não consegui remover o Windows Hello:",
    "Could not remove the Windows Hello file: {detail}",
  ],
  [
    "Não consegui ler o Windows Hello:",
    "Could not read the Windows Hello file: {detail}",
  ],
];

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nValue>(() => {
    const t = (key: string, params?: Record<string, string | number>) => {
      const template = locale === "en-US" ? key : (dictionaries[locale][key] ?? key);
      return interpolate(template, params);
    };

    const count = (kind: CountKind, value: number) =>
      t(value === 1 ? `1 ${kind}` : `{count} ${kind}s`, { count: value });

    const date = (value: number) =>
      new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(
        new Date(value),
      );

    const error = (message: string) => {
      for (const [source, key] of backendErrors) {
        if (message === source) return t(key);
      }
      for (const [prefix, key] of backendPrefixes) {
        if (message.startsWith(prefix)) {
          return t(key, { detail: message.slice(prefix.length).trim() });
        }
      }
      return message;
    };

    return {
      locale,
      setLocale: (next: Locale) => {
        setLocaleState(next);
        localStorage.setItem(STORAGE_KEY, next);
      },
      t,
      count,
      date,
      error,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
