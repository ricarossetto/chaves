pub fn enabled() -> bool {
    false
}

pub fn available() -> Result<bool, String> {
    Ok(false)
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
