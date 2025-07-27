const Area = require("../model/areaModel.js");
const ConnectionRequest = require("../model/requestConnectionModel.js");

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
  console.log(req.body);
  
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({
      success: false,
      message: "Latitude and longitude are required and must be numbers.",
    });
  }

  try {
    const areas = await Area.find().populate("zone"); // 🟢 Populate zone

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
            zoneName: area.zone?.name || "Unknown", // 🟢 Return zoneName
            combinedAreaZone: `${area.areaName}, ${
              area.zone?.name || "Unknown"
            }`,
          });
        }
      }
    }

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

const createConnectionRequest = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      zone,
      area,
      fullAddress,
      areaInfo,
      packageId,
    } = req.body;
    console.log("Receiveing from front end", req.body);

    // Simple validation (you can extend it)
    if (!name || !mobile || !zone || !area || !fullAddress || !packageId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRequest = new ConnectionRequest({
      name,
      mobile,
      email,
      zone,
      area,
      fullAddress,
      areaInfo,
      packageId,
    });

    const savedRequest = await newRequest.save();

    res.status(201).json(savedRequest);
  } catch (error) {
    console.error("Error creating connection request:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllConnectionRequests = async (req, res) => {
  try {
    const requests = await ConnectionRequest.find().sort({ createdAt: -1 }); // latest first
    res.json(requests);
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { checkAvailability, createConnectionRequest,getAllConnectionRequests };
