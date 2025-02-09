use super::{line::Line, Layer};
use crate::gis::{coordinate::Coordinate, map_object::MapObject};

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Multiline {
    lines: Vec<Line>,
    layer: Option<Layer>,
}

impl Multiline {
    pub fn new(lines: Vec<Line>) -> Result<Self, &'static str> {
        if lines.is_empty() {
            return Err("Multiline must contain at least one line");
        }
        Ok(Self { lines, layer: None })
    }
}
#[typetag::serde]
impl MapObject for Multiline {
    fn area(&self) -> f64 {
        0.0
    }

    fn length(&self) -> f64 {
        self.lines.iter().map(|line| line.length()).sum()
    }

    fn centroid(&self) -> Coordinate {
        let total_length = self.length();
        let (sum_x, sum_y) = self
            .lines
            .iter()
            .map(|line| {
                let cl = line.centroid();
                (cl.x * line.length(), cl.y * line.length())
            })
            .fold((0.0, 0.0), |(acc_x, acc_y), (x, y)| (acc_x + x, acc_y + y));

        Coordinate::new(sum_x / total_length, sum_y / total_length)
    }
    fn set_layer(&mut self, layer: Layer) {
        self.layer = Some(layer.clone());
        for line in &mut self.lines {
            line.set_layer(layer.clone());
        }
    }
    fn clone_box(&self) -> Box<dyn MapObject> {
        Box::new(self.clone())
    }
}

impl std::fmt::Display for Multiline {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Multiline with {} segments:", self.lines.len())?;
        for (i, line) in self.lines.iter().enumerate() {
            write!(f, "\n  Segment {}: {} to {}", i + 1, line.start, line.end)?;
        }
        Ok(())
    }
}
