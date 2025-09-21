import fs from "fs/promises"
import { parse } from "csv-parse/sync"
import xlsx from "xlsx"

export async function parseHealthReport(file) {
  const filePath = file.path
  const fileBuffer = await fs.readFile(filePath)

  let parsedData

  switch (file.mimetype) {
    case "text/csv":
      parsedData = await parseCSV(fileBuffer)
      break
    case "application/json":
      parsedData = await parseJSON(fileBuffer)
      break
    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      parsedData = await parseExcel(fileBuffer)
      break
    default:
      throw new Error("Unsupported file format")
  }

  // Clean up uploaded file
  await fs.unlink(filePath)

  return standardizeData(parsedData)
}

async function parsePDF(buffer) {
  // Use dynamic import to avoid initialization issues
  const { default: pdf } = await import("pdf-parse")
  const data = await pdf(buffer)
  const text = data.text

  // Basic PDF parsing - extract biomarker data using regex patterns
  const biomarkers = []
  const lines = text.split("\n")

  // Common lab report patterns
  const patterns = [
    // Pattern: "Cholesterol, Total 195 mg/dL 100-199"
    /^(.+?)\s+(\d+\.?\d*)\s+([a-zA-Z/]+)\s+(.+)$/,
    // Pattern: "Glucose 85 mg/dL (70-100)"
    /^(.+?)\s+(\d+\.?\d*)\s+([a-zA-Z/]+)\s+\((.+)\)$/,
  ]

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    for (const pattern of patterns) {
      const match = trimmedLine.match(pattern)
      if (match) {
        biomarkers.push({
          name: match[1].trim(),
          value: Number.parseFloat(match[2]),
          unit: match[3].trim(),
          referenceRange: match[4].trim(),
        })
        break
      }
    }
  }

  return { biomarkers }
}

async function parseCSV(buffer) {
  const csvText = buffer.toString("utf-8")
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  const biomarkers = records.map((record) => ({
    name: record.biomarker || record.test_name || record.name,
    value: Number.parseFloat(record.value || record.result),
    unit: record.unit || record.units || "",
    referenceRange: record.reference_range || record.normal_range || "",
  }))

  return { biomarkers }
}

async function parseJSON(buffer) {
  const jsonText = buffer.toString("utf-8")
  const data = JSON.parse(jsonText)

  // Assume JSON structure has biomarkers array
  if (data.biomarkers && Array.isArray(data.biomarkers)) {
    return data
  }

  // Try to extract from different JSON structures
  if (data.results && Array.isArray(data.results)) {
    return { biomarkers: data.results }
  }

  if (data.tests && Array.isArray(data.tests)) {
    return { biomarkers: data.tests }
  }

  throw new Error("Invalid JSON structure")
}

async function parseExcel(buffer) {
  const workbook = xlsx.read(buffer, { type: "buffer" })
  const firstSheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[firstSheetName]
  const rows = xlsx.utils.sheet_to_json(worksheet, { defval: "" })

  const biomarkers = rows
    .map((row) => ({
      name: row.biomarker || row.Biomarker || row.test_name || row.Test_Name || row.name,
      value: Number.parseFloat(row.value || row.Value || row.result || row.Result),
      unit: row.unit || row.Unit || row.units || row.Units || "",
      referenceRange: row.reference_range || row.Reference_Range || row.normal_range || row.Normal_Range || "",
    }))
    .filter((r) => r.name && !Number.isNaN(r.value))

  return { biomarkers }
}

function standardizeData(parsedData) {
  const standardizedBiomarkers = parsedData.biomarkers.map((biomarker) => ({
    biomarker: normalizeBiomarkerName(biomarker.name),
    value: biomarker.value,
    unit: normalizeUnit(biomarker.unit),
    referenceRange: biomarker.referenceRange || "Not specified",
  }))

  return {
    biomarkers: standardizedBiomarkers.filter((b) => b.biomarker && !isNaN(b.value) && b.value !== null),
  }
}

function normalizeBiomarkerName(name) {
  if (!name) return ""

  // Common biomarker name mappings
  const nameMap = {
    "cholesterol, total": "Total Cholesterol",
    "cholesterol total": "Total Cholesterol",
    "ldl cholesterol": "LDL Cholesterol",
    "hdl cholesterol": "HDL Cholesterol",
    triglycerides: "Triglycerides",
    glucose: "Glucose",
    "hemoglobin a1c": "Hemoglobin A1c",
    tsh: "TSH",
    "free t4": "Free T4",
  }

  const normalized = name.toLowerCase().trim()
  return nameMap[normalized] || name.trim()
}

function normalizeUnit(unit) {
  if (!unit) return ""

  const unitMap = {
    "mg/dl": "mg/dL",
    "mmol/l": "mmol/L",
    "µu/ml": "µU/mL",
    "ng/dl": "ng/dL",
    percent: "%",
  }

  const normalized = unit.toLowerCase().trim()
  return unitMap[normalized] || unit.trim()
}
