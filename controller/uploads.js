import { diseasePredictor } from "../data/app.js";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import simplifiedHealthReportSchema from "../models/HealthReport.js";


// Configure multer for CSV uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "biomarkers-" + uniqueSuffix + ".csv");
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.mimetype === "application/vnd.ms-excel") {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"), false);
    }
  },
});

export const predict = async (req, res) => {
  try {
    const { age, gender, labData } = req.body;
    const info = await diseasePredictor(age, gender, labData);
    await simplifiedHealthReportSchema.create({
      userId: req.params.id,
      date: new Date(),
      analysis: info.insights,
      diseases: info.diseaseScore,
      labData: labData,
    });
    res.status(200).json({ message: "Disease prediction successful", data: info });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ error: "Failed to process prediction" });
  }
};

export const predictFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file uploaded" });
    }
    console.log(body);
    const age=22;
    const gender='male';
    const labData = await parseCSVFile(req.file.path);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    const info = await diseasePredictor(age, gender, labData);
    res.status(200).json({ message: "Disease prediction successful", data: info });
  } catch (error) {
    console.error("CSV prediction error:", error);
    res.status(500).json({ error: "Failed to process CSV file" });
  }
};

async function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const labData = {};
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const biomarker = row.biomarker || row.Biomarker || row.test_name || row.Test_Name;
        const value = parseFloat(row.value || row.Value || row.result || row.Result);
        
        if (biomarker && !isNaN(value)) {
          labData[biomarker] = value;
        }
      })
      .on('end', () => {
        resolve(labData);
      })
      .on('error', reject);
  });
}

export { upload };