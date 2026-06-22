// BillPocket Tauri shell.
//
// The web app is entirely static (HTML + CSS + classic JS), so the desktop
// wrapper is intentionally trivial: just create the default window and let
// Tauri load index.html from the bundled frontendDist.
//
// All persistence stays in the WebView's own storage (the equivalent of
// browser localStorage) so the privacy model is unchanged — nothing
// leaves the device.

pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running BillPocket");
}
