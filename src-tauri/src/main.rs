// On Windows release builds, suppress the console window so the user only
// sees the BillPocket UI (no flash of a black terminal behind it).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    billpocket_lib::run();
}
