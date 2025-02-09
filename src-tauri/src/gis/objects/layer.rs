use crate::gis::{coordinate::Coordinate, map_object::MapObject};

#[derive(serde::Serialize, serde::Deserialize)]
pub struct Layer {
    name: String,
    geometries: Vec<Box<dyn MapObject>>,
    is_visible: bool,
}

impl Layer {
    pub fn new(name: &str) -> Self {
        Layer {
            name: name.to_string(),
            geometries: Vec::new(),
            is_visible: true,
        }
    }
    pub fn add_geometry<T: MapObject + 'static>(&mut self, mut geometry: T) {
        geometry.set_layer(self.clone());
        self.geometries.push(Box::new(geometry));
    }

    pub fn remove_geometry(&mut self, index: usize) -> Option<Box<dyn MapObject>> {
        if index < self.geometries.len() {
            Some(self.geometries.remove(index))
        } else {
            None
        }
    }

    pub fn get_geometry(&self, index: usize) -> Option<&(dyn MapObject)> {
        self.geometries.get(index).map(|g| &**g)
    }

    pub fn total_area(&self) -> f64 {
        self.geometries.iter().map(|g| g.area()).sum()
    }

    pub fn total_length(&self) -> f64 {
        self.geometries.iter().map(|g| g.length()).sum()
    }

    pub fn centroids(&self) -> Vec<Coordinate> {
        self.geometries.iter().map(|g| g.centroid()).collect()
    }

    pub fn change_visibility(&mut self) {
        self.is_visible = !self.is_visible;
    }
}
impl Clone for Layer {
    fn clone(&self) -> Self {
        Layer {
            name: self.name.clone(),
            geometries: self.geometries.iter().map(|g| g.clone_box()).collect(),
            is_visible: self.is_visible,
        }
    }
}
impl std::fmt::Debug for Layer {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        f.debug_struct("Layer")
            .field("name", &self.name)
            .field("is_visible", &self.is_visible)
            .field("geometry_count", &self.geometries.len())
            .field(
                "geometries",
                &self
                    .geometries
                    .iter()
                    .map(|g| g.as_ref())
                    .collect::<Vec<&(dyn MapObject)>>(),
            )
            .finish()
    }
}
