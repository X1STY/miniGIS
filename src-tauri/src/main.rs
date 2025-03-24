// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use gis::{
    coordinate::Coordinate,
    objects::{Layer, Line, Multiline, Polygon},
};

use minigis_lib::gis::{self};

#[tauri::command]
async fn open_geojson_file(path: String) -> Result<String, String> {
    match std::fs::read_to_string(path) {
        Ok(content) => Ok(content),
        Err(e) => Err(e.to_string()),
    }
}

fn main() {
    let mut layer: Layer = Layer::new("Advanced Layer");

    let line1 = Line::new(Coordinate::new(0.0, 0.0), Coordinate::new(3.0, 4.0)).unwrap();
    let line2 = Line::new(Coordinate::new(3.0, 4.0), Coordinate::new(6.0, 8.0)).unwrap();
    let multiline = Multiline::new(vec![line1, line2]).unwrap();
    layer.add_geometry(multiline);

    let mut polygon = Polygon::new(vec![
        Coordinate::new(0.0, 0.0),
        Coordinate::new(10.0, 0.0),
        Coordinate::new(10.0, 10.0),
        Coordinate::new(0.0, 10.0),
        Coordinate::new(0.0, 0.0),
    ])
    .unwrap();

    polygon = polygon.with_holes(vec![vec![
        Coordinate::new(2.0, 2.0),
        Coordinate::new(8.0, 2.0),
        Coordinate::new(8.0, 8.0),
        Coordinate::new(2.0, 8.0),
        Coordinate::new(2.0, 2.0),
    ]]);
    polygon.add_point(Coordinate::new(1.0, 1.0));
    layer.add_geometry(polygon);

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![open_geojson_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
