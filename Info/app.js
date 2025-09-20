import fs from 'fs';
import csv from 'csv-parser';
const diseasesJson = JSON.parse(fs.readFileSync('./Info/disease.json', 'utf8'));

let parameterJson = null;

// Function to load CSV and convert it to parameterJson structure
function loadParametersFromCsv(filePath) {
  return new Promise((resolve, reject) => {
    const tempParameterJson = {};
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const param = row.param;
        const age_group = row.age_group || 'adult';
        const gender = row.gender || 'both';
        const min = row.min ? parseFloat(row.min) : null;
        const max = row.max ? parseFloat(row.max) : null;
        const unit = row.unit || '';

        if (!tempParameterJson[param]) tempParameterJson[param] = {};
        if (!tempParameterJson[param][age_group]) tempParameterJson[param][age_group] = {};
        tempParameterJson[param][age_group][gender] = { min, max, unit };
      })
      .on('end', () => {
        parameterJson = tempParameterJson;
        console.log('Parameters loaded');
        resolve();
      })
      .on('error', reject);
  });
}

// Then your getAllPossibleDiseases function using parameterJson loaded from CSV

function getAllPossibleDiseases(labData, ageGroup, gender, diseasesJson) {
  function getReferenceRange(param) {
    const paramRanges = parameterJson[param];
    if (!paramRanges) return null;

    if (paramRanges[ageGroup] && paramRanges[ageGroup][gender])
      return paramRanges[ageGroup][gender];
    if (paramRanges[ageGroup] && paramRanges[ageGroup]['both'])
      return paramRanges[ageGroup]['both'];
    if (paramRanges['adult'] && paramRanges['adult']['both'])
      return paramRanges['adult']['both'];
    return null;
  }

  function isOutOfRange(labValue, refRange) {
    if (!refRange) return false;
    if (refRange.min !== null && labValue < refRange.min) return true;
    if (refRange.max !== null && labValue > refRange.max) return true;
    return false;
  }

  function criteriaMatched(criteria) {
    let matchedCount = 0;
    criteria.forEach(({ param, operator, value }) => {
      if (!(param in labData)) return;

      const labValue = labData[param];

      switch(operator) {
        case '>=': if (labValue >= value) matchedCount++; break;
        case '<=': if (labValue <= value) matchedCount++; break;
        case '>':  if (labValue > value)  matchedCount++; break;
        case '<':  if (labValue < value)  matchedCount++; break;
        case '==':
        case '=': if (labValue === value) matchedCount++; break;
      }
    });
    // Return ratio of matched criteria
    return criteria.length === 0 ? 0 : matchedCount / criteria.length;
  }

  return diseasesJson.diseases
    .map(disease => {
      if (!((disease.age_group === ageGroup || disease.age_group === 'both') &&
        (disease.gender === gender || disease.gender === 'both'))) {
        return null;
      }
      const matchRatio = criteriaMatched(disease.criteria);
      if (matchRatio > 0) {
        return {
          diseaseKey: disease.diseaseKey,
          label: disease.label,
          dietKey: disease.dietKey,
          criteriaMatchPercentage: matchRatio
        };
      } else {
        return null;
      }
    })
    .filter(d => d !== null);
}

//score calculation function
function calculator(possibleDiseases){
    const data = JSON.parse(fs.readFileSync("./Info/score.json", "utf8"));
    let diseaseScore = [];
    possibleDiseases.forEach(disease => {
        const scoreInfo = data.find(item => item.label === disease.label);
        const baseScore = scoreInfo
          ? ((0.1*scoreInfo.scoring.rarity)+(0.2*scoreInfo.scoring.treatment_complexity)+(0.6*scoreInfo.scoring.seriousness)+(0.2*scoreInfo.scoring.treatment_cost))
          : null;
        if (baseScore && typeof disease.criteriaMatchPercentage === "number") {
            const finalscore = baseScore * disease.criteriaMatchPercentage;
            diseaseScore.push({
                diseaseKey: disease.diseaseKey,
                label: disease.label,
                dietKey: disease.dietKey,
                criteriaMatchPercentage: disease.criteriaMatchPercentage,
                scoring: finalscore*10
            });
        }
    });
    return diseaseScore;
}

// Usage example:

export function diseasePredictor(age,gender, labData){
const userLabData = labData;
  const ageGroup = age<18?'child':'adult';;
  const possibleDiseases = getAllPossibleDiseases(userLabData, ageGroup, gender, diseasesJson);
  const diseaseScore=calculator(possibleDiseases);
  return diseaseScore;
} 

// module.exports={diseasePredictor};

// (async () => {
//   await loadParametersFromCsv('./Info/max_min.csv'); // Path to your CSV file
//   const diseasesJson = require('./disease.json');
//   const userLabData = { "Glucose": 147, "HbA1c": 7.5 ,"C-peptide":0.1};
//   const ageGroup = 'adult';
//   const gender = 'male';

//   const possibleDiseases = getAllPossibleDiseases(userLabData, ageGroup, gender, diseasesJson);
  
//  
//   console.log(diseaseScore);
// //   console.log(possibleDiseases);
// })();
