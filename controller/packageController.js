const Package = require("../model/packageModel.js");

const createUpdatePackage = async (req, res) => {
  try {
    const {
      id,
      packageName,
      price,
      maxDownloadSpeed,
      maxUploadSpeed,
      connectionType,
      setupCharge,
      popUp,
    } = req.body;

    // Manual validations for each required field
    if (!packageName || packageName.trim() === "") {
      return res.status(400).json({ error: "Package name is required" });
    }

    if (price === undefined || price === null) {
      return res.status(400).json({ error: "Price is required" });
    }

    if (maxDownloadSpeed === undefined || maxDownloadSpeed === null) {
      return res.status(400).json({ error: "Max download speed is required" });
    }

    if (maxUploadSpeed === undefined || maxUploadSpeed === null) {
      return res.status(400).json({ error: "Max upload speed is required" });
    }

    if (!Array.isArray(connectionType) || connectionType.length === 0) {
      return res.status(400).json({ error: "Connection type is required" });
    }

    const validConnectionTypes = [0, 1];
    const isValid = connectionType.every((type) =>
      validConnectionTypes.includes(type)
    );
    if (!isValid) {
      return res.status(400).json({ error: "Invalid connection type value" });
    }

    if (setupCharge === undefined || setupCharge === null) {
      return res.status(400).json({ error: "Setup charge is required" });
    }

    if (typeof popUp !== "boolean") {
      return res.status(400).json({ error: "Popup must be true or false" });
    }

    // If `id` is present → Update
    if (id) {
      const existing = await Package.findById(id);
      if (!existing) {
        return res.status(404).json({ error: "Package not found" });
      }

      existing.packageName = packageName.trim();
      existing.price = price;
      existing.maxDownloadSpeed = maxDownloadSpeed;
      existing.maxUploadSpeed = maxUploadSpeed;
      existing.connectionType = connectionType;
      existing.setupCharge = setupCharge;
      existing.popUp = popUp;

      await existing.save();

      return res.status(200).json({
        message: "Package updated successfully",
        package: existing,
      });
    }

    // Else → Create
    const newPackage = new Package({
      packageName: packageName.trim(),
      price,
      maxDownloadSpeed,
      maxUploadSpeed,
      connectionType,
      setupCharge,
      popUp,
    });

    await newPackage.save();

    res
      .status(201)
      .json({ message: "Package created successfully", package: newPackage });
  } catch (error) {
    console.error("Error in create/update package:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const listAllPackages = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: 1 });

    res.status(200).json({ packages });
  } catch (error) {
    console.error("Error fetching all packages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const listPopUpPackages = async (req, res) => {
  try {
    const packages = await Package.find({ popUp: true }).sort({
      createdAt: 1,
    });

    res.status(200).json(packages);
  } catch (error) {
    console.error("Error fetching popup packages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Zone
const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPackage = await Package.findByIdAndDelete(id);

    if (!deletedPackage) {
      return res.status(404).json({ error: "Package not found." });
    }

    res.json({ message: "Package deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Server error while deleting zone." });
  }
};

// Read single area
const readPackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const area = await Package.findById(packageId);
    if (!area) return res.status(404).json({ error: "Package not found" });
    res.json(area);
  } catch (err) {
    console.error("Package read error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createUpdatePackage,
  listAllPackages,
  listPopUpPackages,
  deletePackage,
  readPackage,
};
