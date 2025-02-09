use std::fmt::Debug;

use super::{coordinate::Coordinate, objects::Layer};

#[typetag::serde(tag = "type")]
pub trait MapObject: Debug {
    fn area(&self) -> f64;
    fn length(&self) -> f64;
    fn centroid(&self) -> Coordinate;
    fn set_layer(&mut self, layer: Layer);

    fn clone_box(&self) -> Box<dyn MapObject>;
}

impl Clone for Box<dyn MapObject> {
    fn clone(&self) -> Self {
        self.clone_box()
    }
}
