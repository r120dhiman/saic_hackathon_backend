import mongoose from "mongoose"
import dotenv from "dotenv"
import BiomarkerRule from "../models/BiomarkerRule.js"

dotenv.config()

const biomarkerRules = [
  {
    ruleName: "High Total Cholesterol Adult",
    targetBiomarkers: ["Total Cholesterol"],
    category: "Lipid Panel",
    ruleDefinition: {
      conditions: {
        all: [
          {
            fact: "biomarker_total_cholesterol",
            operator: "greaterThanInclusive",
            value: 240,
          },
          {
            fact: "userAge",
            operator: "greaterThanInclusive",
            value: 20,
          },
        ],
      },
      event: {
        type: "HighTotalCholesterol",
        params: {
          interpretation: "Your total cholesterol level is high (≥240 mg/dL).",
          recommendation:
            "Consider lifestyle modifications including a heart-healthy diet, regular exercise, and consult your doctor about potential medication.",
          severity: "High",
        },
      },
    },
  },
  {
    ruleName: "Borderline High Total Cholesterol Adult",
    targetBiomarkers: ["Total Cholesterol"],
    category: "Lipid Panel",
    ruleDefinition: {
      conditions: {
        all: [
          {
            fact: "biomarker_total_cholesterol",
            operator: "greaterThanInclusive",
            value: 200,
          },
          {
            fact: "biomarker_total_cholesterol",
            operator: "lessThan",
            value: 240,
          },
          {
            fact: "userAge",
            operator: "greaterThanInclusive",
            value: 20,
          },
        ],
      },
      event: {
        type: "BorderlineHighTotalCholesterol",
        params: {
          interpretation: "Your total cholesterol level is borderline high (200-239 mg/dL).",
          recommendation:
            "Focus on heart-healthy lifestyle changes including reducing saturated fat intake and increasing physical activity.",
          severity: "Borderline",
        },
      },
    },
  },
  {
    ruleName: "High LDL Cholesterol Adult",
    targetBiomarkers: ["LDL Cholesterol"],
    category: "Lipid Panel",
    ruleDefinition: {
      conditions: {
        all: [
          {
            fact: "biomarker_ldl_cholesterol",
            operator: "greaterThanInclusive",
            value: 160,
          },
          {
            fact: "userAge",
            operator: "greaterThanInclusive",
            value: 20,
          },
        ],
      },
      event: {
        type: "HighLDLCholesterol",
        params: {
          interpretation: "Your LDL (bad) cholesterol level is high (≥160 mg/dL).",
          recommendation:
            "Reduce saturated and trans fats in your diet, increase fiber intake, and consult your doctor about treatment options.",
          severity: "High",
        },
      },
    },
  },
  {
    ruleName: "Low HDL Cholesterol Male",
    targetBiomarkers: ["HDL Cholesterol"],
    category: "Lipid Panel",
    sex: "Male",
    ruleDefinition: {
      conditions: {
        all: [
          {
            fact: "biomarker_hdl_cholesterol",
            operator: "lessThan",
            value: 40,
          },
          {
            fact: "userSex",
            operator: "equal",
            value: "Male",
          },
        ],
      },
      event: {
        type: "LowHDLCholesterolMale",
        params: {
          interpretation: "Your HDL (good) cholesterol level is low (<40 mg/dL for men).",
          recommendation:
            "Increase physical activity, maintain a healthy weight, and consider foods rich in omega-3 fatty acids.",
          severity: "Low",
        },
      },
    },
  },
  {
    ruleName: "Low HDL Cholesterol Female",
    targetBiomarkers: ["HDL Cholesterol"],
    category: "Lipid Panel",
    sex: "Female",
    ruleDefinition: {
      conditions: {
        all: [
          {
            fact: "biomarker_hdl_cholesterol",
            operator: "lessThan",
            value: 50,
          },
          {
            fact: "userSex",
            operator: "equal",
            value: "Female",
          },
        ],
      },
      event: {
        type: "LowHDLCholesterolFemale",
        params: {
          interpretation: "Your HDL (good) cholesterol level is low (<50 mg/dL for women).",
          recommendation:
            "Increase physical activity, maintain a healthy weight, and consider foods rich in omega-3 fatty acids.",
          severity: "Low",
        },
      },
    },
  },
  {
    ruleName: "Prediabetes Glucose",
    targetBiomarkers: ["Glucose"],
    category: "Glucose",
    ruleDefinition: {
      conditions: {
        all: [
          {
            fact: "biomarker_glucose",
            operator: "greaterThanInclusive",
            value: 100,
          },
          {
            fact: "biomarker_glucose",
            operator: "lessThanInclusive",
            value: 125,
          },
        ],
      },
      event: {
        type: "PrediabetesGlucose",
        params: {
          interpretation: "Your fasting glucose level indicates prediabetes (100-125 mg/dL).",
          recommendation:
            "Focus on weight management, regular physical activity, and a balanced diet. Consider diabetes prevention programs.",
          severity: "Borderline",
        },
      },
    },
  },
  {
    ruleName: "Diabetes Glucose",
    targetBiomarkers: ["Glucose"],
    category: "Glucose",
    ruleDefinition: {
      conditions: {
        all: [
          {
            fact: "biomarker_glucose",
            operator: "greaterThanInclusive",
            value: 126,
          },
        ],
      },
      event: {
        type: "DiabetesGlucose",
        params: {
          interpretation: "Your fasting glucose level indicates diabetes (≥126 mg/dL).",
          recommendation: "Consult your healthcare provider immediately for diabetes management and treatment options.",
          severity: "High",
        },
      },
    },
  },
]

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/health-reports")
    console.log("Connected to MongoDB")

    // Clear existing rules
    await BiomarkerRule.deleteMany({})
    console.log("Cleared existing biomarker rules")

    // Insert new rules
    await BiomarkerRule.insertMany(biomarkerRules)
    console.log(`Inserted ${biomarkerRules.length} biomarker rules`)

    console.log("Database seeding completed successfully")
    process.exit(0)
  } catch (error) {
    console.error("Database seeding failed:", error)
    process.exit(1)
  }
}

seedDatabase()
