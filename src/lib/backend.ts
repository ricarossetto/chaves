import { invoke } from "@tauri-apps/api/core";
import type { HelloStatus, VaultData } from "./types";

export const backend = {
  vaultExists: () => invoke<boolean>("vault_exists"),
  vaultPath: () => invoke<string>("vault_path"),
  createVault: (password: string) => invoke<VaultData>("create_vault", { password }),
  unlockVault: (password: string) => invoke<VaultData>("unlock_vault", { password }),
  saveVault: (data: VaultData) => invoke<void>("save_vault", { data }),
  lockVault: () => invoke<void>("lock_vault"),
  helloStatus: () => invoke<HelloStatus>("hello_status"),
  enableHello: (password: string) => invoke<void>("enable_hello", { password }),
  disableHello: () => invoke<void>("disable_hello"),
  unlockWithHello: () => invoke<VaultData>("unlock_with_hello"),
  hideToTray: () => invoke<void>("hide_to_tray"),
  quitApp: () => invoke<void>("quit_app"),
};
