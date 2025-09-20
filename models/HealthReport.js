import mongoose from "mongoose"

const healthReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportDate: {
      type: Date,
      required: true,
    },
    sourceFileName: {
      type: String,
      required: true,
    },
    sourceFormat: {
      type: String,
      enum: ["PDF", "CSV", "JSON"],
      required: true,
    },
    standardizedResults: [
      {
        biomarker: {
          type: String,
          required: true,
        },
        value: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
          required: true,
        },
        referenceRange: {
          type: String,
          required: true,
        },
      },
    ],
    analysis: [
      {
        type: {
          type: String,
          required: true,
        },
        interpretation: {
          type: String,
          required: true,
        },
        recommendation: {
          type: String,
          required: true,
        },
        severity: {
          type: String,
          enum: ["Normal", "Borderline", "High", "Low", "Critical"],
          default: "Normal",
        },
      },
    ],
    userNotes: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        note: String,
        symptom: String,
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index for efficient querying
healthReportSchema.index({ userId: 1, reportDate: -1 })

export default mongoose.model("HealthReport", healthReportSchema)
