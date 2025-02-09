use crate::gis::{coordinate::Coordinate, map_object::MapObject};

use super::Layer;

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Polygon {
    exterior: Vec<Coordinate>,
    holes: Option<Vec<Vec<Coordinate>>>,
    layer: Option<Layer>,
}

impl Polygon {
    pub fn new(exterior: Vec<Coordinate>) -> Result<Self, &'static str> {
        if exterior.len() < 4 {
            return Err("Polygon must have at least 4 points");
        }
        if exterior.first() != exterior.last() {
            return Err("Polygon must be closed");
        }
        Ok(Self {
            exterior,
            holes: None,
            layer: None,
        })
    }

    pub fn add_point(&mut self, point: Coordinate) -> () {
        self.exterior.push(point);
    }
    pub fn with_holes(mut self, holes: Vec<Vec<Coordinate>>) -> Self {
        self.holes = Some(holes);
        self
    }
}

#[typetag::serde]
impl MapObject for Polygon {
    fn area(&self) -> f64 {
        let mut sum = 0.0;
        let n = self.exterior.len() - 1;

        for i in 0..n {
            let j = (i + 1) % n;
            sum += self.exterior[i].x * self.exterior[j].y;
            sum -= self.exterior[j].x * self.exterior[i].y;
        }

        sum.abs() / 2.0
    }

    fn length(&self) -> f64 {
        self.exterior
            .windows(2)
            .map(|pair| pair[0].distance_to(&pair[1]))
            .sum()
    }

    fn centroid(&self) -> Coordinate {
        let mut cx = 0.0;
        let mut cy = 0.0;
        let area = self.area();

        for i in 0..self.exterior.len() - 1 {
            let j = (i + 1) % (self.exterior.len() - 1);
            let cross =
                self.exterior[i].x * self.exterior[j].y - self.exterior[j].x * self.exterior[i].y;
            cx += (self.exterior[i].x + self.exterior[j].x) * cross;
            cy += (self.exterior[i].y + self.exterior[j].y) * cross;
        }

        cx /= 6.0 * area;
        cy /= 6.0 * area;

        Coordinate::new(cx.abs(), cy.abs())
    }
    fn set_layer(&mut self, layer: Layer) {
        self.layer = Some(layer);
    }
    fn clone_box(&self) -> Box<dyn MapObject> {
        Box::new(self.clone())
    }
}
