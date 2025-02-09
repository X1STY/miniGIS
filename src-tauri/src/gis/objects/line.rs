use crate::gis::{coordinate::Coordinate, map_object::MapObject};

use super::Layer;

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Line {
    pub start: Coordinate,
    pub end: Coordinate,
    layer: Option<Layer>,
}

impl Line {
    pub fn new(start: Coordinate, end: Coordinate) -> Result<Self, &'static str> {
        if start == end {
            return Err("Line must have distinct points");
        }
        Ok(Self {
            start,
            end,
            layer: None,
        })
    }
}
#[typetag::serde]
impl MapObject for Line {
    fn area(&self) -> f64 {
        0.0
    }
    fn length(&self) -> f64 {
        self.start.distance_to(&self.end)
    }
    fn centroid(&self) -> Coordinate {
        Coordinate::new(
            (self.start.x + self.end.x) / 2.0,
            (self.start.y + self.end.y) / 2.0,
        )
    }
    fn set_layer(&mut self, layer: Layer) {
        self.layer = Some(layer);
    }
    fn clone_box(&self) -> Box<dyn MapObject> {
        Box::new(self.clone())
    }
}
