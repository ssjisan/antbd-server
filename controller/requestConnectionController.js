const Area = require("../model/areaModel.js");

// Ray-casting algorithm to check if point is inside polygon
function isPointInPolygon(point, vs) {
  const x = point[0],
    y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0],
      yi = vs[i][1];
    const xj = vs[j][0],
      yj = vs[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

const checkAvailability = async (req, res) => {
  const { lat, lng } = req.body;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude are required and must be numbers.",
    });
  }

  try {
    const areas = await Area.find();

    for (const area of areas) {
      for (const polygon of area.polygons) {
        let polygonCoords = polygon.coordinates.map(([lat, lng]) => [lng, lat]);
        const firstPoint = polygonCoords[0];
        const lastPoint = polygonCoords[polygonCoords.length - 1];
        if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
          polygonCoords.push(firstPoint);
        }

        const point = [lng, lat];
        const inside = isPointInPolygon(point, polygonCoords);
        if (inside) {
          return res.json({
            success: true,
            message: `Coverage available in ${area.areaName}`,
            areaId: area._id,
            areaName: area.areaName,
          });
        }
      }
    }

    // If no polygon matched
    return res.status(404).json({
      success: false,
      message: "No coverage found in your area.",
    });
  } catch (error) {
    console.error("Check availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred.",
    });
  }
};

module.exports = { checkAvailability };
