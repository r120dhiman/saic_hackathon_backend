import mongoose from "mongoose"

const biomarkerRuleSchema = new mongoose.Schema(
  {
    ruleName: {
      type: String,
      required: true,
      unique: true,
    },
    targetBiomarkers: [
      {
        type: String,
        required: true,
      },
    ],
    ruleDefinition: {
      type: Object,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      enum: ["Lipid Panel", "Glucose", "Thyroid", "Complete Blood Count", "Liver Function", "Kidney Function"],
      required: true,
    },
    ageGroup: {
      type: String,
      enum: ["Adult", "Child", "Senior"],
      default: "Adult",
    },
    sex: {
      type: String,
      enum: ["Male", "Female", "Both"],
      default: "Both",
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("BiomarkerRule", biomarkerRuleSchema)
