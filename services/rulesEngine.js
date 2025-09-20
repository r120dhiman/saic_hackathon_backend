import { Engine } from "json-rules-engine"
import BiomarkerRule from "../models/BiomarkerRule.js"

export async function analyzeReport(parsedData, user) {
  const engine = new Engine()
  const analysis = []

  // Get active rules from database
  const rules = await BiomarkerRule.find({ isActive: true })

  // Add rules to engine
  for (const rule of rules) {
    engine.addRule(rule.ruleDefinition)
  }

  // Prepare facts for the rules engine
  const facts = prepareFacts(parsedData, user)

  try {
    // Run the rules engine
    const { events } = await engine.run(facts)

    // Process triggered events into analysis results
    for (const event of events) {
      analysis.push({
        type: event.type,
        interpretation: event.params.interpretation,
        recommendation: event.params.recommendation,
        severity: event.params.severity || "Normal",
      })
    }

    return analysis
  } catch (error) {
    console.error("Rules engine error:", error)
    return []
  }
}

function prepareFacts(parsedData, user) {
  const facts = {}

  // Add biomarker values as facts
  for (const biomarker of parsedData.biomarkers) {
    const factName = `biomarker_${biomarker.biomarker.replace(/\s+/g, "_").toLowerCase()}`
    facts[factName] = biomarker.value
  }

  // Add user demographic facts
  if (user.dateOfBirth) {
    const age = calculateAge(user.dateOfBirth)
    facts.userAge = age
  }

  if (user.sex) {
    facts.userSex = user.sex
  }

  return facts
}

function calculateAge(dateOfBirth) {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}
