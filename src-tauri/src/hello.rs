use std::fs;
use std::path::PathBuf;

use windows::core::{HSTRING, PCWSTR};
use windows::Security::Credentials::UI::{
    UserConsentVerificationResult, UserConsentVerifier, UserConsentVerifierAvailability,
};
use windows::Win32::Foundation::{LocalFree, HWND, HLOCAL};
use windows::Win32::Security::Cryptography::{
    CryptProtectData, CryptUnprotectData, CRYPT_INTEGER_BLOB, CRYPTPROTECT_UI_FORBIDDEN,
};
use windows::Win32::System::WinRT::{
    IUserConsentVerifierInterop, RoInitialize, RO_INIT_MULTITHREADED,
};

use crate::vault::Vault;

const HELLO_MAGIC: &[u8] = b"CHAVES-HELLO-1\0";
const HELLO_ENTROPY: &[u8] = b"ChavesAPI/hello/v1";
const HELLO_TITLE: &str = "Desbloquear o Chaves";

pub fn hello_path() -> PathBuf {
    Vault::default_path()
        .parent()
        .map(|parent| parent.join("hello.bin"))
        .unwrap_or_else(|| PathBuf::from("hello.bin"))
}

pub fn enabled() -> bool {
    hello_path().is_file()
}

pub fn available() -> Result<bool, String> {
    init_mta();
    let operation = UserConsentVerifier::CheckAvailabilityAsync()
        .map_err(|err| format!("Windows Hello indisponível: {err}"))?;
    let availability = pollster::block_on(async move { operation.await })
        .map_err(|err| format!("Windows Hello indisponível: {err}"))?;
    Ok(availability == UserConsentVerifierAvailability::Available)
}

pub fn verify(hwnd: isize) -> Result<(), String> {
    init_mta();
    if hwnd == 0 {
        return Err("Windows Hello indisponível: janela principal não encontrada.".into());
    }
    let interop: IUserConsentVerifierInterop =
        windows::core::factory::<UserConsentVerifier, IUserConsentVerifierInterop>()
            .map_err(|err| format!("Windows Hello indisponível: {err}"))?;
    let operation: windows_future::IAsyncOperation<UserConsentVerificationResult> = unsafe {
        interop.RequestVerificationForWindowAsync(
            HWND(hwnd as *mut std::ffi::c_void),
            &HSTRING::from(HELLO_TITLE),
        )
    }
    .map_err(|err| format!("Windows Hello indisponível: {err}"))?;
    let result = pollster::block_on(async move { operation.await })
        .map_err(|err| format!("Windows Hello indisponível: {err}"))?;
    if result == UserConsentVerificationResult::Verified {
        Ok(())
    } else {
        Err("Verificação do Windows Hello não concluída.".into())
    }
}

pub fn enable(password: &str, hwnd: isize) -> Result<(), String> {
    if !available()? {
        return Err("Windows Hello não está disponível neste computador.".into());
    }
    verify(hwnd)?;

    let encrypted = protect(password.as_bytes(), HELLO_ENTROPY)?;
    let mut payload = HELLO_MAGIC.to_vec();
    payload.extend_from_slice(&encrypted);

    let path = hello_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|err| format!("Não consegui criar a pasta do Windows Hello: {err}"))?;
    }
    let tmp = path.with_extension("bin.tmp");
    fs::write(&tmp, payload).map_err(|err| format!("Não consegui gravar o Windows Hello: {err}"))?;
    fs::rename(&tmp, &path)
        .or_else(|_| {
            let _ = fs::remove_file(&path);
            fs::rename(&tmp, &path)
        })
        .map_err(|err| format!("Não consegui gravar o Windows Hello: {err}"))
}

pub fn disable() -> Result<(), String> {
    let path = hello_path();
    if path.exists() {
        fs::remove_file(&path)
            .map_err(|err| format!("Não consegui remover o Windows Hello: {err}"))?;
    }
    Ok(())
}

pub fn unlock_password(hwnd: isize) -> Result<String, String> {
    if !enabled() {
        return Err("Windows Hello não está ativado neste cofre.".into());
    }
    verify(hwnd)?;

    let raw = fs::read(hello_path())
        .map_err(|err| format!("Não consegui ler o Windows Hello: {err}"))?;
    let payload = raw
        .strip_prefix(HELLO_MAGIC)
        .ok_or_else(|| "Arquivo do Windows Hello inválido.".to_string())?;
    let plain = unprotect(payload, HELLO_ENTROPY)?;
    String::from_utf8(plain).map_err(|_| "Arquivo do Windows Hello inválido.".to_string())
}

fn init_mta() {
    unsafe {
        let _ = RoInitialize(RO_INIT_MULTITHREADED);
    }
}

fn blob(data: &[u8]) -> CRYPT_INTEGER_BLOB {
    CRYPT_INTEGER_BLOB {
        cbData: data.len() as u32,
        pbData: data.as_ptr() as *mut u8,
    }
}

fn protect(data: &[u8], entropy: &[u8]) -> Result<Vec<u8>, String> {
    let input = blob(data);
    let entropy = blob(entropy);
    let mut output = CRYPT_INTEGER_BLOB::default();

    unsafe {
        CryptProtectData(
            &input,
            PCWSTR::null(),
            Some(&entropy),
            None,
            None,
            CRYPTPROTECT_UI_FORBIDDEN,
            &mut output,
        )
        .map_err(|err| format!("Falha ao proteger com DPAPI: {err}"))?;

        let bytes = std::slice::from_raw_parts(output.pbData, output.cbData as usize).to_vec();
        let _ = LocalFree(Some(HLOCAL(output.pbData as _)));
        Ok(bytes)
    }
}

fn unprotect(data: &[u8], entropy: &[u8]) -> Result<Vec<u8>, String> {
    let input = blob(data);
    let entropy = blob(entropy);
    let mut output = CRYPT_INTEGER_BLOB::default();

    unsafe {
        CryptUnprotectData(
            &input,
            None,
            Some(&entropy),
            None,
            None,
            CRYPTPROTECT_UI_FORBIDDEN,
            &mut output,
        )
        .map_err(|err| format!("Falha ao abrir com DPAPI: {err}"))?;

        let bytes = std::slice::from_raw_parts(output.pbData, output.cbData as usize).to_vec();
        let _ = LocalFree(Some(HLOCAL(output.pbData as _)));
        Ok(bytes)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn dpapi_ida_e_volta() {
        let encrypted = protect(b"segredo-de-teste", HELLO_ENTROPY).unwrap();
        let decrypted = unprotect(&encrypted, HELLO_ENTROPY).unwrap();
        assert_eq!(decrypted, b"segredo-de-teste");
    }
}
