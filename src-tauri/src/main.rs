#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

fn main() {
    chaves_api_lib::run()
}
