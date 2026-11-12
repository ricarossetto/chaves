use std::path::PathBuf;

pub fn hello_path() -> PathBuf {
    PathBuf::from("hello.bin")
}

pub fn enabled() -> bool {
    false
}

pub fn available() -> Result<bool, String> {
    Ok(false)
}

pub fn verify() -> Result<(), String> {
    Err("Windows Hello is only available on Windows.".into())
}

pub fn enable(_password: &str) -> Result<(), String> {
    Err("Windows Hello is only available on Windows.".into())
}

pub fn disable() -> Result<(), String> {
    Ok(())
}

pub fn unlock_password() -> Result<String, String> {
    Err("Windows Hello is only available on Windows.".into())
}
