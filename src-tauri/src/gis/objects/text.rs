use crate::gis::coordinate::Coordinate;
use crate::gis::map_object::MapObject;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fmt;

use super::Layer;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Text {
    position: Coordinate,
    content: String,
    properties: HashMap<String, String>,
    layer: Option<Layer>,
}

impl Text {
    pub fn new(x: f64, y: f64, content: &str) -> Self {
        Self {
            position: Coordinate::new(x, y),
            content: content.to_string(),
            properties: HashMap::new(),
            layer: None,
        }
    }

    pub fn position(&self) -> &Coordinate {
        &self.position
    }

    pub fn content(&self) -> &str {
        &self.content
    }

    pub fn set_property(&mut self, key: &str, value: &str) {
        self.properties.insert(key.to_string(), value.to_string());
    }

    pub fn get_property(&self, key: &str) -> Option<&String> {
        self.properties.get(key)
    }

    pub fn with_property(mut self, key: &str, value: &str) -> Self {
        self.properties.insert(key.to_string(), value.to_string());
        self
    }
}

impl fmt::Display for Text {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Text '{}' at {}", self.content, self.position)?;
        if !self.properties.is_empty() {
            write!(f, " [Properties: ")?;
            for (i, (k, v)) in self.properties.iter().enumerate() {
                if i > 0 {
                    write!(f, ", ")?;
                }
                write!(f, "{}={}", k, v)?;
            }
            write!(f, "]")?;
        }
        Ok(())
    }
}

#[typetag::serde]
impl MapObject for Text {
    fn area(&self) -> f64 {
        0.0
    }
    fn length(&self) -> f64 {
        0.0
    }
    fn centroid(&self) -> Coordinate {
        self.position
    }
    fn set_layer(&mut self, layer: Layer) {
        self.layer = Some(layer);
    }
    fn clone_box(&self) -> Box<dyn MapObject> {
        Box::new(self.clone())
    }
}
