const express = require("express");
const path = require("path");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000; // ✅ Use Render’s port

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Image upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "public/uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Route: Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Route: Fetch chemical details by CAS number
app.post("/api/fetch-compound", async (req, res) => {
  try {
    const { cas } = req.body;
    if (!cas) return res.json({ success: false, message: "CAS number missing" });

    const response = await axios.get(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${cas}/JSON`
    );

    const compound = response.data.PC_Compounds?.[0];
    if (!compound) return res.json({ success: false, message: "Compound not found" });

    const props = compound.props?.reduce((acc, prop) => {
      if (prop.urn?.label && prop.value?.sval) acc[prop.urn.label] = prop.value.sval;
      return acc;
    }, {});

    const imageUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${cas}/PNG`;

    res.json({
      success: true,
      title: props["Title"] || cas,
      MolecularFormula: props["Molecular Formula"] || "N/A",
      MolecularWeight: props["Molecular Weight"] || "N/A",
      IUPACName: props["IUPAC Name"] || "N/A",
      Density: props["Density"] || "N/A",
      imageUrl,
    });
  } catch (err) {
    console.error("❌ Error fetching compound:", err.message);
    res.json({ success: false, message: "Server error" });
  }
});

// ✅ Route: Upload product image manually
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.json({ success: false, message: "No image uploaded" });
  res.json({
    success: true,
    filePath: `/uploads/${req.file.filename}`,
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
