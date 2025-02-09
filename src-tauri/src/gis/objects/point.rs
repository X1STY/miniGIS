use crate::gis::{coordinate::Coordinate, map_object::MapObject};

use super::Layer;

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Point {
    pub coordinate: Coordinate,
    layer: Option<Layer>,
}

impl Point {
    pub fn new(x: f64, y: f64) -> Self {
        Self {
            coordinate: Coordinate::new(x, y),
            layer: None,
        }
    }
}

#[typetag::serde]
impl MapObject for Point {
    fn area(&self) -> f64 {
        0.0
    }
    fn length(&self) -> f64 {
        0.0
    }
    fn centroid(&self) -> Coordinate {
        self.coordinate
    }
    fn set_layer(&mut self, layer: Layer) {
        self.layer = Some(layer);
    }
    fn clone_box(&self) -> Box<dyn MapObject> {
        Box::new(self.clone())
    }
}

impl std::fmt::Display for Point {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Point at {}", self.coordinate)
    }
}
