use std::fs;
use std::path::{Path, PathBuf};

use aes_gcm::aead::consts::U12;
use aes_gcm::aead::{Aead, Generate, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use argon2::{Algorithm, Argon2, Params, Version};
use serde::{Deserialize, Serialize};

const SALT_LEN: usize = 16;
const NONCE_LEN: usize = 12;
const KEY_LEN: usize = 32;
const ENVELOPE_VERSION: u32 = 1;
pub const DATA_VERSION: u32 = 3;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct VaultData {
    pub version: u32,
    #[serde(default)]
    pub project_folders: Vec<ProjectFolder>,
    #[serde(default)]
    pub projects: Vec<Project>,
    #[serde(default)]
    pub notes: Vec<Note>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProjectFolder {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub created_at: i64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub name: String,
    pub color: String,
    #[serde(default)]
    pub folder_id: Option<String>,
    #[serde(default)]
    pub created_at: i64,
    #[serde(default)]
    pub folders: Vec<ItemFolder>,
    #[serde(default)]
    pub items: Vec<Item>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ItemFolder {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub created_at: i64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    pub id: String,
    pub kind: ItemKind,
    pub name: String,
    #[serde(default)]
    pub username: String,
    #[serde(default)]
    pub secret: String,
    #[serde(default)]
    pub url: String,
    #[serde(default)]
    pub notes: String,
    #[serde(default)]
    pub folder_id: Option<String>,
    #[serde(default)]
    pub created_at: i64,
    #[serde(default)]
    pub updated_at: i64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    pub id: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub body: String,
    #[serde(default)]
    pub created_at: i64,
    #[serde(default)]
    pub updated_at: i64,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum ItemKind {
    Key,
    Link,
}

#[derive(Clone)]
pub struct Session {
    key: [u8; KEY_LEN],
    salt: [u8; SALT_LEN],
}

#[derive(Serialize, Deserialize)]
struct Stored {
    version: u32,
    salt: String,
    nonce: String,
    ciphertext: String,
}

#[derive(Deserialize)]
struct LegacyEntry {
    id: u64,
    name: String,
    username: String,
    key: String,
    notes: String,
}

pub struct Vault {
    path: PathBuf,
}

impl Vault {
    pub fn at(path: impl Into<PathBuf>) -> Self {
        Self { path: path.into() }
    }

    pub fn default_path() -> PathBuf {
        if let Some(path) = std::env::var_os("CHAVES_VAULT_PATH") {
            return PathBuf::from(path);
        }
        let base = std::env::var_os("APPDATA")
            .map(PathBuf::from)
            .or_else(|| std::env::current_dir().ok())
            .unwrap_or_else(|| PathBuf::from("."));
        base.join("ChavesAPI").join("vault.json")
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    pub fn exists(&self) -> bool {
        self.path.is_file()
    }

    pub fn create(&self, password: &str) -> Result<(Session, VaultData), String> {
        let salt: [u8; SALT_LEN] = Generate::generate();
        let key = derive_key(password, &salt)?;
        let session = Session { key, salt };
        let data = VaultData {
            version: DATA_VERSION,
            project_folders: Vec::new(),
            projects: Vec::new(),
            notes: Vec::new(),
        };
        self.save(&session, &data)?;
        Ok((session, data))
    }

    pub fn unlock(&self, password: &str) -> Result<(Session, VaultData), String> {
        let raw = fs::read_to_string(&self.path)
            .map_err(|e| format!("Não consegui ler o cofre: {e}"))?;
        let stored: Stored = serde_json::from_str(&raw)
            .map_err(|_| "O arquivo do cofre está corrompido.".to_string())?;
        if stored.version != ENVELOPE_VERSION {
            return Err("Versão de cofre não suportada.".into());
        }

        let salt = decode_salt(&stored.salt)?;
        let nonce = decode_nonce(&stored.nonce)?;
        let ciphertext = hex::decode(&stored.ciphertext)
            .map_err(|_| "Arquivo do cofre inválido.".to_string())?;

        let key = derive_key(password, &salt)?;
        let cipher = Aes256Gcm::new_from_slice(&key)
            .map_err(|_| "Falha ao preparar a criptografia.".to_string())?;
        let plaintext = cipher
            .decrypt(&Nonce::<U12>::from(nonce), ciphertext.as_ref())
            .map_err(|_| "Senha incorreta.".to_string())?;
        let data = parse_data(&plaintext)?;

        Ok((Session { key, salt }, data))
    }

    pub fn save(&self, session: &Session, data: &VaultData) -> Result<(), String> {
        let plaintext = serde_json::to_vec(data)
            .map_err(|e| format!("Falha ao serializar o cofre: {e}"))?;
        let cipher = Aes256Gcm::new_from_slice(&session.key)
            .map_err(|_| "Falha ao preparar a criptografia.".to_string())?;
        let nonce: [u8; NONCE_LEN] = Generate::generate();
        let ciphertext = cipher
            .encrypt(&Nonce::<U12>::from(nonce), plaintext.as_ref())
            .map_err(|_| "Falha ao criptografar o cofre.".to_string())?;

        let stored = Stored {
            version: ENVELOPE_VERSION,
            salt: hex::encode(session.salt),
            nonce: hex::encode(nonce),
            ciphertext: hex::encode(ciphertext),
        };
        let json = serde_json::to_string_pretty(&stored)
            .map_err(|e| format!("Falha ao serializar o cofre: {e}"))?;

        if let Some(dir) = self.path.parent() {
            fs::create_dir_all(dir)
                .map_err(|e| format!("Não consegui criar a pasta do cofre: {e}"))?;
        }
        let tmp = self.path.with_extension("json.tmp");
        fs::write(&tmp, json).map_err(|e| format!("Não consegui gravar o cofre: {e}"))?;
        fs::rename(&tmp, &self.path)
            .or_else(|_| {
                let _ = fs::remove_file(&self.path);
                fs::rename(&tmp, &self.path)
            })
            .map_err(|e| format!("Não consegui gravar o cofre: {e}"))
    }
}

fn parse_data(plaintext: &[u8]) -> Result<VaultData, String> {
    if let Ok(mut data) = serde_json::from_slice::<VaultData>(plaintext) {
        data.version = DATA_VERSION;
        return Ok(data);
    }
    let legacy: Vec<LegacyEntry> = serde_json::from_slice(plaintext)
        .map_err(|_| "Conteúdo do cofre inválido.".to_string())?;
    Ok(migrate_legacy(legacy))
}

fn migrate_legacy(entries: Vec<LegacyEntry>) -> VaultData {
    let items = entries
        .into_iter()
        .map(|entry| Item {
            id: format!("legado-{}", entry.id),
            kind: ItemKind::Key,
            name: entry.name,
            username: entry.username,
            secret: entry.key,
            url: String::new(),
            notes: entry.notes,
            folder_id: None,
            created_at: 0,
            updated_at: 0,
        })
        .collect();

    VaultData {
        version: DATA_VERSION,
        project_folders: Vec::new(),
        notes: Vec::new(),
        projects: vec![Project {
            id: "geral".into(),
            name: "Geral".into(),
            color: "#6f7f5b".into(),
            folder_id: None,
            created_at: now_ms(),
            folders: Vec::new(),
            items,
        }],
    }
}

fn derive_key(password: &str, salt: &[u8]) -> Result<[u8; KEY_LEN], String> {
    // 64 MiB, 3 iterações, 1 thread: ~0,2 s em máquina comum.
    let params = Params::new(65_536, 3, 1, Some(KEY_LEN))
        .map_err(|e| format!("Parâmetros de derivação inválidos: {e}"))?;
    let argon = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let mut key = [0u8; KEY_LEN];
    argon
        .hash_password_into(password.as_bytes(), salt, &mut key)
        .map_err(|e| format!("Falha ao derivar a senha: {e}"))?;
    Ok(key)
}

fn decode_salt(encoded: &str) -> Result<[u8; SALT_LEN], String> {
    let bytes = hex::decode(encoded).map_err(|_| "Arquivo do cofre inválido.".to_string())?;
    bytes
        .try_into()
        .map_err(|_| "Arquivo do cofre inválido.".to_string())
}

fn decode_nonce(encoded: &str) -> Result<[u8; NONCE_LEN], String> {
    let bytes = hex::decode(encoded).map_err(|_| "Arquivo do cofre inválido.".to_string())?;
    bytes
        .try_into()
        .map_err(|_| "Arquivo do cofre inválido.".to_string())
}

fn now_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_path(tag: &str) -> PathBuf {
        let nanos = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        std::env::temp_dir().join(format!("chaves-api-{tag}-{nanos}.json"))
    }

    fn sample_data() -> VaultData {
        VaultData {
            version: DATA_VERSION,
            project_folders: vec![ProjectFolder {
                id: "pf1".into(),
                name: "Trabalho".into(),
                created_at: 1,
            }],
            notes: vec![Note {
                id: "n1".into(),
                title: "Lembrete".into(),
                body: "Renovar o token".into(),
                created_at: 1,
                updated_at: 2,
            }],
            projects: vec![Project {
                id: "p1".into(),
                name: "Projeto principal".into(),
                color: "#6f7f5b".into(),
                folder_id: Some("pf1".into()),
                created_at: 1,
                folders: vec![ItemFolder {
                    id: "if1".into(),
                    name: "Produção".into(),
                    created_at: 1,
                }],
                items: vec![
                    Item {
                        id: "k1".into(),
                        kind: ItemKind::Key,
                        name: "OpenAI".into(),
                        username: "conta de teste".into(),
                        secret: "sk-abc123".into(),
                        url: String::new(),
                        notes: "uso em scripts".into(),
                        folder_id: Some("if1".into()),
                        created_at: 1,
                        updated_at: 1,
                    },
                    Item {
                        id: "l1".into(),
                        kind: ItemKind::Link,
                        name: "Docs".into(),
                        username: String::new(),
                        secret: String::new(),
                        url: "https://example.com/docs".into(),
                        notes: String::new(),
                        folder_id: None,
                        created_at: 1,
                        updated_at: 1,
                    },
                ],
            }],
        }
    }

    #[test]
    fn roundtrip_com_a_mesma_senha() {
        let path = temp_path("roundtrip");
        let vault = Vault::at(&path);
        let (session, data) = vault.create("senha-forte").unwrap();
        assert!(data.projects.is_empty());

        vault.save(&session, &sample_data()).unwrap();
        let (_, loaded) = vault.unlock("senha-forte").unwrap();
        assert_eq!(loaded.projects.len(), 1);
        assert_eq!(loaded.projects[0].name, "Projeto principal");
        assert_eq!(loaded.projects[0].folder_id.as_deref(), Some("pf1"));
        assert_eq!(loaded.projects[0].folders.len(), 1);
        assert_eq!(loaded.projects[0].folders[0].name, "Produção");
        assert_eq!(loaded.projects[0].items.len(), 2);
        assert_eq!(loaded.projects[0].items[0].secret, "sk-abc123");
        assert_eq!(loaded.projects[0].items[0].folder_id.as_deref(), Some("if1"));
        assert_eq!(loaded.projects[0].items[1].url, "https://example.com/docs");
        assert_eq!(loaded.project_folders.len(), 1);
        assert_eq!(loaded.notes.len(), 1);
        assert_eq!(loaded.notes[0].body, "Renovar o token");

        let _ = fs::remove_file(path);
    }

    #[test]
    fn senha_errada_e_rejeitada() {
        let path = temp_path("senha-errada");
        let vault = Vault::at(&path);
        let (session, _) = vault.create("senha-certa").unwrap();
        vault.save(&session, &sample_data()).unwrap();

        let err = match vault.unlock("senha-errada") {
            Ok(_) => panic!("abriu com a senha errada"),
            Err(err) => err,
        };
        assert_eq!(err, "Senha incorreta.");

        let _ = fs::remove_file(path);
    }

    #[test]
    fn migra_cofre_v2_sem_pastas_nem_notas() {
        let v2 = serde_json::json!({
            "version": 2,
            "projects": [{
                "id": "p1",
                "name": "Antigo",
                "color": "#6f7f5b",
                "createdAt": 1,
                "items": [{
                    "id": "k1",
                    "kind": "key",
                    "name": "OpenAI",
                    "username": "",
                    "secret": "sk-antiga",
                    "url": "",
                    "notes": "",
                    "createdAt": 1,
                    "updatedAt": 1
                }]
            }]
        });

        let data = parse_data(v2.to_string().as_bytes()).unwrap();
        assert_eq!(data.version, DATA_VERSION);
        assert!(data.project_folders.is_empty());
        assert!(data.notes.is_empty());
        assert!(data.projects[0].folder_id.is_none());
        assert!(data.projects[0].folders.is_empty());
        assert!(data.projects[0].items[0].folder_id.is_none());
    }

    #[test]
    fn migra_lista_antiga_para_projeto_geral() {
        let legacy = serde_json::json!([
            {
                "id": 7,
                "name": "OpenAI",
                "username": "conta",
                "key": "sk-antiga",
                "notes": "veio do formato antigo"
            }
        ]);

        let data = parse_data(legacy.to_string().as_bytes()).unwrap();
        assert_eq!(data.version, DATA_VERSION);
        assert_eq!(data.projects.len(), 1);
        let project = &data.projects[0];
        assert_eq!(project.name, "Geral");
        assert_eq!(project.items.len(), 1);
        assert_eq!(project.items[0].kind, ItemKind::Key);
        assert_eq!(project.items[0].secret, "sk-antiga");
        assert_eq!(project.items[0].id, "legado-7");
    }

    #[test]
    fn arquivo_nao_guarda_chave_em_texto_puro() {
        let path = temp_path("texto-puro");
        let vault = Vault::at(&path);
        let (session, _) = vault.create("senha-forte").unwrap();
        vault.save(&session, &sample_data()).unwrap();

        let raw = fs::read_to_string(&path).unwrap();
        assert!(!raw.contains("sk-abc123"));
        assert!(!raw.contains("OpenAI"));

        let _ = fs::remove_file(path);
    }

    #[test]
    fn nonce_muda_a_cada_gravacao() {
        let path = temp_path("nonce");
        let vault = Vault::at(&path);
        let (session, _) = vault.create("senha-forte").unwrap();
        vault.save(&session, &sample_data()).unwrap();
        let first: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&path).unwrap()).unwrap();
        vault.save(&session, &sample_data()).unwrap();
        let second: serde_json::Value =
            serde_json::from_str(&fs::read_to_string(&path).unwrap()).unwrap();
        assert_ne!(first["nonce"], second["nonce"]);

        let _ = fs::remove_file(path);
    }
}
