import express from "express"
import multer from "multer"
import { requireAuth } from "../middleware/auth.js"
import HealthReport from "../models/HealthReport.js"
import User from "../models/User.js"
import { parseHealthReport } from "../services/reportParser.js"
import { analyzeReport } from "../services/rulesEngine.js"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".").pop())
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "text/csv",
      "application/json",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only CSV, Excel (.xlsx, .xls), and JSON files are allowed."))
    }
  },
})

// Upload and process health report
router.post("/upload", requireAuth, upload.single("healthReport"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const { reportDate } = req.body

    // Parse the uploaded file
    const parsedData = await parseHealthReport(req.file)

    // Analyze the parsed data using rules engine
    const analysis = await analyzeReport(parsedData, req.user)

    // Create health report document
    const healthReport = new HealthReport({
      userId: req.user._id,
      reportDate: reportDate ? new Date(reportDate) : new Date(),
      sourceFileName: req.file.originalname,
      sourceFormat: getFileFormat(req.file.mimetype),
      standardizedResults: parsedData.biomarkers,
      analysis: analysis,
    })

    await healthReport.save()

    // Update user's latest health summary
    await updateUserHealthSummary(req.user._id, healthReport)

    res.json({
      message: "Health report processed successfully",
      reportId: healthReport._id,
      analysis: analysis,
    })
  } catch (error) {
    console.error("Report upload error:", error)
    res.status(500).json({ error: "Failed to process health report" })
  }
})

// Get all reports for user
router.get("/", requireAuth, async (req, res) => {
  try {
    const reports = await HealthReport.find({ userId: req.user._id })
      .sort({ reportDate: -1 })
      .select("reportDate sourceFileName sourceFormat analysis createdAt")

    res.json(reports)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" })
  }
})

// Get specific report details
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const report = await HealthReport.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!report) {
      return res.status(404).json({ error: "Report not found" })
    }

    res.json(report)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report" })
  }
})

// Get biomarker trends
router.get("/trends/:biomarker", requireAuth, async (req, res) => {
  try {
    const { biomarker } = req.params
    const { months = 12 } = req.query

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - Number.parseInt(months))

    const reports = await HealthReport.find({
      userId: req.user._id,
      reportDate: { $gte: startDate },
      "standardizedResults.biomarker": biomarker,
    }).sort({ reportDate: 1 })

    const trendData = reports.map((report) => {
      const biomarkerData = report.standardizedResults.find((result) => result.biomarker === biomarker)
      return {
        date: report.reportDate,
        value: biomarkerData.value,
        unit: biomarkerData.unit,
        referenceRange: biomarkerData.referenceRange,
      }
    })

    res.json(trendData)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch biomarker trends" })
  }
})

// Add user note to report
router.post("/:id/notes", requireAuth, async (req, res) => {
  try {
    const { note, symptom } = req.body

    const report = await HealthReport.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        $push: {
          userNotes: {
            note,
            symptom,
            date: new Date(),
          },
        },
      },
      { new: true },
    )

    if (!report) {
      return res.status(404).json({ error: "Report not found" })
    }

    res.json({ message: "Note added successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to add note" })
  }
})

// Helper functions
function getFileFormat(mimetype) {
  switch (mimetype) {
    case "text/csv":
      return "CSV"
    case "application/json":
      return "JSON"
    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "EXCEL"
    default:
      return "UNKNOWN"
  }
}

async function updateUserHealthSummary(userId, healthReport) {
  const keyBiomarkers = healthReport.standardizedResults
    .slice(0, 5) // Take first 5 biomarkers
    .map((result) => ({
      name: result.biomarker,
      value: result.value,
      unit: result.unit,
      status: determineStatus(result, healthReport.analysis),
    }))

  await User.findByIdAndUpdate(userId, {
    latestHealthSummary: {
      reportId: healthReport._id,
      reportDate: healthReport.reportDate,
      keyBiomarkers,
    },
  })
}

function determineStatus(biomarker, analysis) {
  const relatedAnalysis = analysis.find((a) =>
    a.interpretation.toLowerCase().includes(biomarker.biomarker.toLowerCase()),
  )
  return relatedAnalysis ? relatedAnalysis.severity : "Normal"
}

export default router
