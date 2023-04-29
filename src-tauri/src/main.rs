// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// 读 hosts
#[tauri::command]
async fn read_hosts_file() -> String {
    let hosts = fs::read_to_string("C:\\Windows\\System32\\drivers\\etc\\hosts").unwrap();
    hosts
}

// 写 hosts
#[tauri::command]
async fn write_hosts_file(content: String) {
    fs::write("C:\\Windows\\System32\\drivers\\etc\\hosts", content).unwrap();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            read_hosts_file,
            write_hosts_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
