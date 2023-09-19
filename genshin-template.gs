/**
 * @OnlyCurrentDoc
 */

const rowsFromTop = 75
const numberOfStats = 70
const numberOfDmgCalcs = 51
const characterLength = 175
const numberOfCharacters = 87
const numberOfWeapons = 165
const numberOfArtifacts = 60

// [START apps_script_triggers_onedit]
function editMade(e) {

  const sheet = e.source.getActiveSheet()
  const eventRange = e.range
  console.log(eventRange)

  if(eventRange.getNumRows() == 1 && eventRange.getNumColumns() == 1 && eventRange.getColumn() == 3 && (eventRange.getRow() == rowsFromTop || eventRange.getRow() == rowsFromTop + characterLength + 1 || eventRange.getRow() == rowsFromTop + 2 * (characterLength + 1) || eventRange.getRow() == rowsFromTop + 3 * (characterLength + 1))) {
    characterUpdated(e, sheet, eventRange.getDisplayValue(), eventRange.getRow())

    checkResonances(e, sheet)
  }

  if(eventRange.getNumRows() == 1 && eventRange.getNumColumns() == 1 && eventRange.getColumn() == 4 && (eventRange.getRow() == rowsFromTop || eventRange.getRow() == rowsFromTop + characterLength + 1 || eventRange.getRow() == rowsFromTop + 2 * (characterLength + 1) || eventRange.getRow() == rowsFromTop + 3 * (characterLength + 1))) {
    weaponUpdated(e, sheet, eventRange.getDisplayValue(), eventRange.getRow())
  }

  if(eventRange.getNumRows() == 1 && eventRange.getNumColumns() == 1 && eventRange.getColumn() == 5 && (eventRange.getRow() == rowsFromTop || eventRange.getRow() == rowsFromTop + characterLength + 1 || eventRange.getRow() == rowsFromTop + 2 * (characterLength + 1) || eventRange.getRow() == rowsFromTop + 3 * (characterLength + 1))) {
    artifact1Updated(e, sheet, eventRange.getDisplayValue(), eventRange.getRow())
  }

  if(eventRange.getNumRows() == 1 && eventRange.getNumColumns() == 1 && eventRange.getColumn() == 5 && (eventRange.getRow() == rowsFromTop + 1 || eventRange.getRow() == rowsFromTop + 1 +  characterLength + 1 || eventRange.getRow() == rowsFromTop + 1 +  2 * (characterLength + 1) || eventRange.getRow() == rowsFromTop + 1 + 3 * (characterLength + 1))) {
    artifact2Updated(e, sheet, eventRange.getDisplayValue(), eventRange.getRow())
  }

  if(eventRange.getNumRows() == 1 && eventRange.getNumColumns() == 1 && eventRange.getColumn() == 3 && (eventRange.getRow() == rowsFromTop + 1 || eventRange.getRow() == rowsFromTop + 1 +  characterLength + 1 || eventRange.getRow() == rowsFromTop + 1 +  2 * (characterLength + 1) || eventRange.getRow() == rowsFromTop + 1 + 3 * (characterLength + 1))) {
    constellationUpdated(e, sheet, eventRange.getDisplayValue(), eventRange.getRow(), sheet.getRange(eventRange.getRow() - 1, eventRange.getColumn()).getDisplayValue())
  }

  if(eventRange.getNumRows() == 1 && eventRange.getNumColumns() == 1 && eventRange.getColumn() == 12 && (eventRange.getRow() == rowsFromTop + 9 || eventRange.getRow() == rowsFromTop + 9 +  characterLength + 1 || eventRange.getRow() == rowsFromTop + 9 +  2 * (characterLength + 1) || eventRange.getRow() == rowsFromTop + 9 + 3 * (characterLength + 1))) {
    collapseUnusedRows(sheet, eventRange.getRow() + 1)
  }
}

function characterUpdated(e, sheet, characterChoice, characterRow) {
  if(characterChoice == "") return

  // Set Character stats
  const characterStatSheet = e.source.getSheetByName("CharacterStats")
  const nameRow = characterStatSheet.getRange(2, 2, 1, numberOfCharacters).getDisplayValues()[0]
  let characterColumn = 0
  for ( let i = 0; i < nameRow.length; i++ ) {
    if(characterChoice == nameRow[i]) {
      characterColumn = i
      break
    }
  }
  
  const desiredStatRange = characterStatSheet.getRange(3, characterColumn + 2, numberOfStats)
  const currentStatRange = sheet.getRange(characterRow + 2, 3, numberOfStats)
  currentStatRange.setFormulas(desiredStatRange.getFormulas())

  // Set any character-specific conversions
  const characterConversionSheet = e.source.getSheetByName("CharacterConversions")
  const conversionsRow = characterConversionSheet.getRange(2, 2, 1, numberOfCharacters).getDisplayValues()[0]
  let conversionColumn = -1
  for ( let i = 0; i < conversionsRow.length; i++ ) {
    if(characterChoice == conversionsRow[i]) {
      conversionColumn = i
      break
    }
  }
  if (conversionColumn != -1) {
    updateConversion(characterConversionSheet.getRange(3, conversionColumn + 2, numberOfStats), sheet.getRange(characterRow + 1, 9, numberOfStats), sheet.getRange(characterRow, 9, 1))
  }

  // Set any character-specific MV increases
  const mvSheet = e.source.getSheetByName("CharacterAddedMvs")
  const mvRow = mvSheet.getRange(2, 2, 1, numberOfCharacters * 4).getDisplayValues()[0]
  let mvColumn = -1
  for (let i = 0; i < mvRow.length; i++) {
    if (characterChoice == mvRow[i]) {
      mvColumn = i
      break
    }
  }

  if (mvColumn != -1) {
    updateAddedMvs(mvSheet.getRange(4, mvColumn + 2, 5, 4), sheet.getRange(characterRow, 13, 5, 4))
  }

  // Set any character-specific buffs that are available
  const buffSheet = e.source.getSheetByName("CharacterBuffs")
  const buffRow = buffSheet.getRange(2, 2, 1, numberOfCharacters * 3).getDisplayValues()[0]
  const characterBuffs = []
  for (let i = 0; i < buffRow.length; i++) {
    if (characterChoice == buffRow[i]) {
      characterBuffs.push(i)
    }
  }
  for (const buffCol of characterBuffs) {
    addBuff(sheet, buffSheet, buffCol, characterRow)
  }

  // Apply the character attacks
  const attackSheet = e.source.getSheetByName("CharacterAttacks")
  const attackRow = attackSheet.getRange(1, 2, 1, numberOfCharacters * 25).getDisplayValues()[0]
  const commonRow = attackSheet.getRange(2, 2, 1, numberOfCharacters * 25).getDisplayValues()[0]
  console.log(commonRow)
  const commonOnly = sheet.getRange(characterRow + 1, 2).getDisplayValue() == "FALSE"
  console.log(commonOnly)
  const attackColumns = []
  for (let i = 0; i < attackRow.length; i++) {
    if (characterChoice == attackRow[i]) {
      if (commonOnly) {
        if(commonRow[i] == "TRUE") {
          attackColumns.push(i)
        }
      } else {
      attackColumns.push(i)
      }
    }
  }
  for (const attackCol of attackColumns) {
    addAttack(sheet, attackSheet, attackCol, characterRow)
  }

  // Apply the character attacks
  const protecSheet = e.source.getSheetByName("CharacterProtec")
  const protecRow = protecSheet.getRange(2, 2, 1, numberOfCharacters * 3).getDisplayValues()[0]
  const protecCols = []
  for (let i = 0; i < protecRow.length; i++) {
    if (characterChoice == protecRow[i]) {
      protecCols.push(i)
    }
  }
  for (const protecCol of protecCols) {
    addProtec(sheet, protecSheet, protecCol, characterRow)
  }
  
}

function weaponUpdated(e, sheet, weaponChoice, weaponRow) {
  if(weaponChoice == "") return
  
  // Set Weapon stats
  const weaponStatSheet = e.source.getSheetByName("WeaponStats")
  const nameRow = weaponStatSheet.getRange(2, 2, 1, numberOfWeapons).getDisplayValues()[0]
  let weaponColumn = 0
  for ( let i = 0; i < nameRow.length; i++ ) {
    if(weaponChoice == nameRow[i]) {
      weaponColumn = i
      break
    }
  }
  
  const desiredStatRange = weaponStatSheet.getRange(3, weaponColumn + 2, numberOfStats)
  const currentStatRange = sheet.getRange(weaponRow + 2, 4, numberOfStats)
  currentStatRange.setFormulas(desiredStatRange.getFormulas())

  // Set any weapon-specific conversions
  const weaponConversionSheet = e.source.getSheetByName("WeaponConversions")
  const conversionsRow = weaponConversionSheet.getRange(2, 2, 1, numberOfWeapons).getDisplayValues()[0]
  let conversionColumn = -1
  for ( let i = 0; i < conversionsRow.length; i++ ) {
    if(weaponChoice == conversionsRow[i]) {
      conversionColumn = i
      break
    }
  }
  if (conversionColumn != -1) {
    updateConversion(weaponConversionSheet.getRange(3, conversionColumn + 2, numberOfStats), sheet.getRange(weaponRow + 1, 9, numberOfStats), sheet.getRange(weaponRow, 9, 1))
  }

  // Set any weapon-specific MV increases
  const mvSheet = e.source.getSheetByName("WeaponAddedMvs")
  const mvRow = mvSheet.getRange(2, 2, 1, numberOfWeapons * 4).getDisplayValues()[0]
  let mvColumn = -1
  for (let i = 0; i < mvRow.length; i++) {
    if (weaponChoice == mvRow[i]) {
      mvColumn = i
      break
    }
  }

  if (mvColumn != -1) {
    updateAddedMvs(mvSheet.getRange(4, mvColumn + 2, 5, 4), sheet.getRange(weaponRow, 13, 5, 4))
  }

  // Set any weapon-specific buffs that are available
  const buffSheet = e.source.getSheetByName("WeaponBuffs")
  const buffRow = buffSheet.getRange(2, 2, 1, numberOfWeapons * 2).getDisplayValues()[0]
  const weaponBuffs = []
  for (let i = 0; i < buffRow.length; i++) {
    if (weaponChoice == buffRow[i]) {
      weaponBuffs.push(i)
    }
  }
  for (const buffCol of weaponBuffs) {
    addBuff(sheet, buffSheet, buffCol, weaponRow)
  }

  // Apply the weapon attacks
  const attackSheet = e.source.getSheetByName("WeaponAttacks")
  const attackRow = attackSheet.getRange(2, 2, 1, numberOfWeapons).getDisplayValues()[0]
  const attackColumns = []
  for (let i = 0; i < attackRow.length; i++) {
    if (weaponChoice == attackRow[i]) {
      attackColumns.push(i)
    }
  }
  for (const attackCol of attackColumns) {
    addAttack(sheet, attackSheet, attackCol, weaponRow)
  }

  // Apply the weapon attacks
  const protecSheet = e.source.getSheetByName("WeaponProtec")
  const protecRow = protecSheet.getRange(2, 2, 1, numberOfWeapons).getDisplayValues()[0]
  const protecCols = []
  for (let i = 0; i < protecRow.length; i++) {
    if (weaponChoice == protecRow[i]) {
      protecCols.push(i)
    }
  }
  for (const protecCol of protecCols) {
    addProtec(sheet, protecSheet, protecCol, weaponRow)
  }
  
}

function artifact1Updated(e, sheet, artifactChoice, artifactRow) {
  if(artifactChoice == "") return

  // Set Artifact stats
  const artifactStatSheet = e.source.getSheetByName("ArtifactStats")
  const nameRow = artifactStatSheet.getRange(2, 2, 1, numberOfArtifacts).getDisplayValues()[0]
  let artifactColumn = 0
  for ( let i = 0; i < nameRow.length; i++ ) {
    if(artifactChoice == nameRow[i]) {
      artifactColumn = i
      break
    }
  }
  
  const desiredStatRange = artifactStatSheet.getRange(3, artifactColumn + 2, numberOfStats)
  const currentStatRange = sheet.getRange(artifactRow + 2, 5, numberOfStats)
  setArtifactStats(desiredStatRange, currentStatRange)
  
}

function artifact2Updated(e, sheet, artifactChoice, artifactRow) {
  if(artifactChoice == "") return
  
  // Set Artifact stats
  const artifactStatSheet = e.source.getSheetByName("ArtifactStats")
  const nameRow = artifactStatSheet.getRange(86, 2, 1, numberOfArtifacts * 2).getDisplayValues()[0]
  let artifactColumn = 0
  for ( let i = 0; i < nameRow.length; i++ ) {
    if(artifactChoice == nameRow[i]) {
      artifactColumn = i
      break
    }
  }
  
  const desiredStatRange = artifactStatSheet.getRange(87, artifactColumn + 2, numberOfStats)
  const currentStatRange = sheet.getRange(artifactRow + 1, 5, numberOfStats)
  setArtifactStats(desiredStatRange, currentStatRange)

  // Set any artifact-specific conversions
  const artifactConversionSheet = e.source.getSheetByName("ArtifactConversions")
  const conversionsRow = artifactConversionSheet.getRange(2, 2, 1, numberOfArtifacts).getDisplayValues()[0]
  let conversionColumn = -1
  for ( let i = 0; i < conversionsRow.length; i++ ) {
    if(artifactChoice == conversionsRow[i]) {
      conversionColumn = i
      break
    }
  }
  if (conversionColumn != -1) {
    updateConversion(artifactConversionSheet.getRange(4, conversionColumn + 2, numberOfStats), sheet.getRange(artifactRow + 1, 9, numberOfStats), sheet.getRange(artifactRow - 1, 9, 1))
  }

  // Set any artifact-specific MV increases
  const mvSheet = e.source.getSheetByName("ArtifactAddedMvs")
  const mvRow = mvSheet.getRange(2, 2, 1, numberOfArtifacts * 4).getDisplayValues()[0]
  let mvColumn = -1
  for (let i = 0; i < mvRow.length; i++) {
    if (artifactChoice == mvRow[i]) {
      mvColumn = i
      break
    }
  }

  if (mvColumn != -1) {
    updateAddedMvs(mvSheet.getRange(4, mvColumn + 2, 5, 4), sheet.getRange(artifactRow - 1, 13, 5, 4))
  }

  // Set any artifact-specific buffs that are available
  const buffSheet = e.source.getSheetByName("ArtifactBuffs")
  const buffRow = buffSheet.getRange(2, 2, 1, 80).getDisplayValues()[0]
  const artifactBuffs = []
  for (let i = 0; i < buffRow.length; i++) {
    if (artifactChoice == buffRow[i]) {
      artifactBuffs.push(i)
    }
  }
  for (const buffCol of artifactBuffs) {
    addBuff(sheet, buffSheet, buffCol, artifactRow - 1)
  }

  // Apply the artifact attacks
  const attackSheet = e.source.getSheetByName("ArtifactAttacks")
  const attackRow = attackSheet.getRange(2, 2, 1, numberOfArtifacts * 12).getDisplayValues()[0]
  const attackColumns = []
  for (let i = 0; i < attackRow.length; i++) {
    if (artifactChoice == attackRow[i]) {
      attackColumns.push(i)
    }
  }
  for (const attackCol of attackColumns) {
    addAttack(sheet, attackSheet, attackCol, artifactRow - 1)
  }

  // Apply the artifact attacks
  const protecSheet = e.source.getSheetByName("ArtifactProtec")
  const protecRow = protecSheet.getRange(2, 2, 1, numberOfArtifacts * 3).getDisplayValues()[0]
  const protecCols = []
  for (let i = 0; i < protecRow.length; i++) {
    if (artifactChoice == protecRow[i]) {
      protecCols.push(i)
    }
  }
  for (const protecCol of protecCols) {
    addProtec(sheet, protecSheet, protecCol, artifactRow - 1)
  }
  
}

function setArtifactStats(desiredStats, existingStats) {
  const newFormulae = desiredStats.getFormulas()
  const oldFormulae = existingStats.getFormulas()

  for (let i = 0; i < newFormulae.length; i++) {
    let newFormula = newFormulae[i]
    let oldFormula = oldFormulae[i]

    if (newFormula[0] == null || newFormula[0] == "") {
      continue
    }

    if (oldFormula[0] == null || oldFormula[0] == "") {
      oldFormulae[i] = newFormula
      continue
    }

    oldFormulae[i] = [oldFormula.concat(newFormula.toString().substring(1)).join(" + ")]
  }

  existingStats.setFormulas(oldFormulae)
}

function constellationUpdated(e, sheet, constellation, constellationRow, character) {
  if (character == "") return
  if (character == "Nahida") {
    if (constellation == "C0" || constellation == "C1") {
      // do nothing
    } else {
      sheet.getRange(6, 15).setValue(true)
    }
  }

  // Apply the constellation buffs
  const buffSheet = e.source.getSheetByName("ConstellationBuffs")
  const buffCharRow = buffSheet.getRange(1, 2, 1, 120).getDisplayValues()[0]
  const buffConsRow = buffSheet.getRange(2, 2, 1, 120).getDisplayValues()[0]
  const buffColumns = []
  for (let i = 0; i < buffCharRow.length; i++) {
    if (character == buffCharRow[i]) {
      if (buffConsRow[i].split(",").includes(constellation)) {
        buffColumns.push(i)
      }
    }
  }

  for (const buffCol of buffColumns) {
    addBuff(sheet, buffSheet, buffCol, constellationRow - 1)
  }


  // Apply the character attacks
  const attackSheet = e.source.getSheetByName("ConstellationAttacks")
  const charRow = attackSheet.getRange(1, 2, 1, 100).getDisplayValues()[0]
  const consRow = attackSheet.getRange(2, 2, 1, 100).getDisplayValues()[0]
  const attackColumns = []
  for (let i = 0; i < charRow.length; i++) {
    if (character == charRow[i]) {
      if(consRow[i].split(",").includes(constellation)) {
        attackColumns.push(i)
      }
    }
  }
  for (const attackCol of attackColumns) {
    addAttack(sheet, attackSheet, attackCol, constellationRow - 1)
  }

  // Apply the character attacks
  const protecSheet = e.source.getSheetByName("ConstellationProtec")
  const protecCharRow = protecSheet.getRange(1, 2, 1, 30).getDisplayValues()[0]
  const protecConsRow = protecSheet.getRange(2, 2, 1, 30).getDisplayValues()[0]
  const protecCols = []
  for (let i = 0; i < protecCharRow.length; i++) {
    if (character == protecCharRow[i]) {
      if(protecConsRow[i].split(",").includes(constellation)) {
        protecCols.push(i)
      }
    }
  }
  for (const protecCol of protecCols) {
    addProtec(sheet, protecSheet, protecCol, constellationRow - 1)
  }


}

function updateConversion(newConversions, existingConversions, description) {
  const oldDesc = description.getDisplayValue()
  const addedDesc = newConversions.getDisplayValue()

  if (oldDesc == null || oldDesc == "") {
    description.setValue(addedDesc)
  } else {
    description.setValue(oldDesc.concat(" | " + addedDesc))
  }

  const newFormulae = newConversions.getFormulas()
  const oldFormulae = existingConversions.getFormulas()

  for (let i = 1; i < newFormulae.length; i++) {
    let newFormula = newFormulae[i]
    let oldFormula = oldFormulae[i]

    if (newFormula[0] == null || newFormula[0] == "") {
      continue
    }

    if (oldFormula[0] == null || oldFormula[0] == "") {
      oldFormulae[i] = newFormula
      continue
    }

    oldFormulae[i] = [oldFormula.concat(newFormula.toString().substring(1)).join(" + ")]
  }

  existingConversions.setFormulas(oldFormulae)
}

function updateAddedMvs(newMvBuffs, oldMvBuffs) {
  const newFormulae = newMvBuffs.getFormulas()
  const oldFormulae = oldMvBuffs.getFormulas()

  for (let i = 0; i < newFormulae.length; i++) {
    let newFormulas = newFormulae[i]
    let oldFormulas = oldFormulae[i]

    for (let k = 0; k < newFormulas.length; k++) {
      let newFormula = newFormulas[k]
      let oldFormula = oldFormulas[k]

      if (oldFormula == null || oldFormula == "") {
        oldFormulas[k] = newFormula
      }

      if (newFormula == null || oldFormula == "") {
        continue
      }

      oldFormulas[k] = oldFormula.toString().concat(" + ", newFormula.toString().substring(1))
    }
  }

  oldMvBuffs.setFormulas(oldFormulae)
}

function addBuff(mainSheet, buffSheet, column, startingRow) {
  const buff = buffSheet.getRange(3, column + 2, 1).getValues()
  const effectName = buff[0][0]

  const values = buffSheet.getRange(4, column + 2, 1).getFormulas()
  const effectValue = values[0][0]


  const buffRange = mainSheet.getRange(startingRow + 6, 13, 1, 50).getDisplayValues()[0]
  let columnToStart = -1
  for (let i = 0; i < buffRange.length; i++) {
    if (buffRange[i] == "" || buffRange[i] == null) {
      columnToStart = i
      break
    }
  }

  if (columnToStart == -1) {
    // lol deal with this later
    return
  }

  mainSheet.getRange(startingRow + 6, 13 + columnToStart).setValue(effectName)
  mainSheet.getRange(startingRow + 7, 13 + columnToStart).setFormula(effectValue)
}

function addAttack(mainSheet, attackSheet, column, startingRow) {
  const attack = attackSheet.getRange(3, column + 2, 15).getFormulas()
  const firstAttackRowValidations = mainSheet.getRange(startingRow + numberOfStats + 3, 3, 15).getDataValidations()

  const attackRow = mainSheet.getRange(startingRow + numberOfStats + 3, 3, 1, 50).getDisplayValues()[0]
  let emptyColumn = -1
  for (let i = 0; i < attackRow.length; i++) {
    if (attackRow[i] == "" || attackRow[i] == null) {
      emptyColumn = i
      break
    }
  }

  if (emptyColumn == -1) {
    // lol deal with this later
    return
  }

  const updatedRange = mainSheet.getRange(startingRow + numberOfStats + 3, emptyColumn + 3, 15, 1)
  updatedRange.setDataValidations(firstAttackRowValidations)
  updatedRange.setFormulas(attack)

}

function addProtec(mainSheet, protecSheet, column, startingRow) {
  const protec = protecSheet.getRange(3, column + 2, 9).getFormulas()
  const firstProtecRowValidation = mainSheet.getRange(startingRow + numberOfStats + numberOfDmgCalcs + 4, 3, 9).getDataValidations()

  const protecRow = mainSheet.getRange(startingRow + numberOfStats + numberOfDmgCalcs + 4, 3, 1, 15).getDisplayValues()[0]
  let emptyColumn = -1
  for (let i = 0; i < protecRow.length; i++) {
    if (protecRow[i] == "" || protecRow[i] == null) {
      emptyColumn = i
      break
    }
  }

  if (emptyColumn == -1) {
    // lol deal with this later
    return
  }

  const updatedRange = mainSheet.getRange(startingRow + numberOfStats + numberOfDmgCalcs + 4, emptyColumn + 3, 9, 1)
  updatedRange.setDataValidations(firstProtecRowValidation)
  updatedRange.setFormulas(protec)

}
function collapseUnusedRows(sheet, startingRow) {
  const rowsToCollapse = []

  const stat = sheet.getRange(startingRow + 2, 3, 60, 8).getDisplayValues()
  for (let i = 0; i < stat.length; i++) {
    if (stat[i].filter(function(element) {return !(element === 0 || element === '0' || element === '')}).length == 0) {
      rowsToCollapse.push(startingRow + 2 + i)
    }
  }

  const mvRows = sheet.getRange(startingRow + 67, 3, 9, 16).getDisplayValues()
  for (let i = 0; i < mvRows.length; i++) {
    if (mvRows[i].filter(function(element) {return !(element === 0 || element === '0' || element === '')}).length == 0) {
      rowsToCollapse.push(startingRow + 67 + i)
    }
  }

  if (sheet.getRange(startingRow + 75, 3, 1, 15).getDisplayValues()[0].filter(function(element) {return !(element === 1 || element === '1' || element === '')}).length == 0) {
    rowsToCollapse.push(startingRow + 76)
  }

  const bonus = sheet.getRange(startingRow + 76, 3, 16, 15).getDisplayValues()
  for (let i = 0; i < bonus.length; i++) {
    if (bonus[i].filter(function(element) {return !(element === 0 || element === '0' || element === '')}).length == 0) {
      rowsToCollapse.push(startingRow + 76 + i)
    }
  }

  if (sheet.getRange(startingRow + 101, 3, 1, 15).getDisplayValues()[0].filter(function(element) {return !(element === 0 || element === '0' || element === '')}).length == 0) {
    rowsToCollapse.push(startingRow + 101)
    rowsToCollapse.push(startingRow + 102)
    rowsToCollapse.push(startingRow + 103)
    rowsToCollapse.push(startingRow + 104)
  }

  if (sheet.getRange(startingRow + 105, 3, 1, 15).getDisplayValues()[0].filter(function(element) {return !(element === 0 || element === '0' || element === '')}).length == 0) {
    rowsToCollapse.push(startingRow + 105)
    rowsToCollapse.push(startingRow + 106)
    rowsToCollapse.push(startingRow + 107)
    rowsToCollapse.push(startingRow + 108)
  }

  if (sheet.getRange(startingRow + 109, 3, 1, 15).getDisplayValues()[0].filter(function(element) {return !(element === 0 || element === '0' || element === '')}).length == 0) {
    rowsToCollapse.push(startingRow + 109)
    rowsToCollapse.push(startingRow + 110)
    rowsToCollapse.push(startingRow + 111)
    rowsToCollapse.push(startingRow + 112)
    rowsToCollapse.push(startingRow + 113)
  }

  if (sheet.getRange(startingRow + 115, 3, 1, 15).getDisplayValues()[0].filter(function(element) {return !(element === 0 || element === '0' || element === '')}).length == 0) {
    rowsToCollapse.push(startingRow + 115)
    rowsToCollapse.push(startingRow + 116)
    rowsToCollapse.push(startingRow + 117)
    rowsToCollapse.push(startingRow + 118)
    rowsToCollapse.push(startingRow + 119)
    rowsToCollapse.push(startingRow + 120)
    rowsToCollapse.push(startingRow + 121)
    rowsToCollapse.push(startingRow + 122)
    rowsToCollapse.push(startingRow + 123)
    rowsToCollapse.push(startingRow + 124)
    rowsToCollapse.push(startingRow + 125)
    rowsToCollapse.push(startingRow + 126)
    rowsToCollapse.push(startingRow + 127)
  }

  const reactionBonus = sheet.getRange(startingRow + 132, 3, 3, 6).getDisplayValues()
  for (let i = 0; i < reactionBonus.length; i++) {
    if (reactionBonus[i].filter(function(element) {return !(element === 0 || element === '0' || element === '')}).length == 0) {
      rowsToCollapse.push(startingRow + 132 + i)
    }
  }

  if (sheet.getRange(startingRow + 137, 3, 1, 15).getDisplayValues()[0].filter(function(element) {return !(element === 0 || element === '0' || element === '')}).length == 0) {
    rowsToCollapse.push(startingRow + 137)
    rowsToCollapse.push(startingRow + 138)
    rowsToCollapse.push(startingRow + 139)
    rowsToCollapse.push(startingRow + 141)
  }

  if (sheet.getRange(startingRow + 142, 3, 1, 15).getDisplayValues()[0].filter(function(element) {return !(element === 0 || element === '0' || element === '')}).length == 0) {
    rowsToCollapse.push(startingRow + 142)
    rowsToCollapse.push(startingRow + 143)
  }

  if (sheet.getRange(startingRow + 144, 3, 1, 15).getDisplayValues()[0].filter(function(element) {return !(element === 0 || element === '0' || element === '')}).length == 0) {
    rowsToCollapse.push(startingRow + 144)
    rowsToCollapse.push(startingRow + 145)
  }

  if (sheet.getRange(startingRow + 146, 3, 1, 15).getDisplayValues()[0].filter(function(element) {return !(element === 0 || element === '0' || element === '')}).length == 0) {
    rowsToCollapse.push(startingRow + 146)
    rowsToCollapse.push(startingRow + 147)
    rowsToCollapse.push(startingRow + 148)
  }

  let collapseNum = 1
  let collapseRow = -1
  for( let i = 0; i < rowsToCollapse.length; i++) {
    if (collapseRow == -1) {
      collapseRow = rowsToCollapse[i]
    } else {
      if (rowsToCollapse[i - 1] + 1 == rowsToCollapse[i]) {
        collapseNum = collapseNum + 1
        continue
      } else {
        sheet.hideRows(collapseRow, collapseNum)
        collapseRow = rowsToCollapse[i]
        collapseNum = 1
      }
    }
  }

  sheet.hideRows(collapseRow, collapseNum)

}

function checkResonances(e, sheet) {
  // get the selected characters - if any are blank, skip
  const char1 = sheet.getRange(rowsFromTop, 3).getDisplayValue()
  const char2 = sheet.getRange(rowsFromTop + characterLength + 1, 3).getDisplayValue()
  const char3 = sheet.getRange(rowsFromTop + 2 * (characterLength + 1), 3).getDisplayValue()
  const char4 = sheet.getRange(rowsFromTop + 3 * (characterLength + 1), 3).getDisplayValue()

  if (char1 == null || char2 == null || char3 == null || char4 == null || char1 == "" || char2 == "" || char3 == "" || char4 == "") {
    return
  }

  // pull the required data out of the characterObject
  const dataArray = []
  dataArray.push(characterObject[char1])
  dataArray.push(characterObject[char2])
  dataArray.push(characterObject[char3])
  dataArray.push(characterObject[char4])

  const summedArray = []
  // sum up the arrays
  for (let i = 0; i < 9; i ++)  {
    summedArray[i] = dataArray[0][i] + dataArray[1][i] + dataArray[2][i] + dataArray[3][i]
  }
  // index 0 is total team energy, apply that to appropriate box
  sheet.getRange(3, 15).setValue(summedArray[0])

  // index 1 is number of liyue members, apply that to appropriate box
  sheet.getRange(4, 15).setValue(summedArray[1])

  // indices 2-8 are elemental types. Every type with 2+ gets resonance applied. Count number of entries above 1 for appropriate box.
  const slicedArray = summedArray.slice(2)
  const buffSheet = e.source.getSheetByName("ResonanceBuffs")
  const buffRow = buffSheet.getRange(2, 2, 1, 15).getDisplayValues()[0]
  const resonanceBuffs = []

  // Pyro Resonance
  if (slicedArray[0] > 1) {
    for (let i = 0; i < buffRow.length; i++) {
      if ("Pyro" == buffRow[i]) {
        resonanceBuffs.push(i)
      }
    }
  }

  if (slicedArray[1] > 1) {
    // Hydro Resonance
    for (let i = 0; i < buffRow.length; i++) {
      if ("Hydro" == buffRow[i]) {
        resonanceBuffs.push(i)
      }
    }
  }

  if (slicedArray[2] > 1) {
    // Electro, do nothing
  }

  if (slicedArray[3] > 1) {
    // Cryo Resonance
    for (let i = 0; i < buffRow.length; i++) {
      if ("Cryo" == buffRow[i]) {
        resonanceBuffs.push(i)
      }
    }
  }

  if (slicedArray[4] > 1) {
    // Anemo, do nothing
  }

  if (slicedArray[5] > 1) {
    // Geo Resonance
    for (let i = 0; i < buffRow.length; i++) {
      if ("Geo" == buffRow[i]) {
        resonanceBuffs.push(i)
      }
    }
  }

  if (slicedArray[6] > 1) {
    // Dendro Resonance
    for (let i = 0; i < buffRow.length; i++) {
      if ("Dendro" == buffRow[i]) {
        resonanceBuffs.push(i)
      }
    }
  }

  for (let i = 0; i < resonanceBuffs.length; i++){
    let buffCol = resonanceBuffs[i]
    addBuff(sheet, buffSheet, buffCol, rowsFromTop)
    addBuff(sheet, buffSheet, buffCol, rowsFromTop + characterLength + 1)
    addBuff(sheet, buffSheet, buffCol, rowsFromTop + 2 * (characterLength + 1))
    addBuff(sheet, buffSheet, buffCol, rowsFromTop + 3 * (characterLength + 1))
  }
  
  const filteredArray = slicedArray.filter(function(element) {return element > 0})
  sheet.getRange(5, 15).setValue(filteredArray.length)

}

const characterObject = {"Ayaka":[80, 0, 0, 0, 0, 1, 0, 0, 0], "Jean":[80, 0, 0, 0, 0, 0, 1, 0, 0], "Traveler (Anemo)":[60, 0, 0, 0, 0, 0, 1, 0, 0], "Traveler (Geo)":[60, 0, 0, 0, 0, 0, 0, 1, 0], "Traveler (Electro)":[80, 0, 0, 0, 1, 0, 0, 0, 0], "Traveler (Dendro)":[80, 0, 0, 0, 0, 0, 0, 0, 1], "Lisa":[80, 0, 0, 0, 1, 0, 0, 0, 0], "Barbara":[80, 0, 0, 1, 0, 0, 0, 0, 0], "Kaeya":[60, 0, 0, 0, 0, 1, 0, 0, 0], "Diluc":[40, 0, 1, 0, 0, 0, 0, 0, 0], "Razor":[80, 0, 0, 0, 1, 0, 0, 0, 0], "Amber":[40, 0, 1, 0, 0, 0, 0, 0, 0], "Venti":[60, 0, 0, 0, 0, 0, 1, 0, 0], "Xiangling":[80, 1, 1, 0, 0, 0, 0, 0, 0], "Beidou":[80, 1, 0, 0, 1, 0, 0, 0, 0], "Xingqiu":[80, 1, 0, 1, 0, 0, 0, 0, 0], "Xiao":[70, 1, 0, 0, 0, 0, 1, 0, 0], "Ningguang":[40, 1, 0, 0, 0, 0, 0, 1, 0], "Klee":[60, 0, 1, 0, 0, 0, 0, 0, 0], "Dori":[80, 0, 0, 0, 1, 0, 0, 0, 0], "Collei":[80, 0, 0, 0, 0, 0, 0, 0, 1], "Tighnari":[40, 0, 0, 0, 0, 0, 0, 0, 1], "Heizou":[40, 0, 0, 0, 0, 0, 1, 0, 0], "Kuki":[60, 0, 0, 0, 1, 0, 0, 0, 0], "Yelan":[70, 1, 0, 1, 0, 0, 0, 0, 0], "Ayato":[80, 0, 0, 1, 0, 0, 0, 0, 0], "Yae":[90, 0, 0, 0, 1, 0, 0, 0, 0], "Shenhe":[80, 1, 0, 0, 0, 1, 0, 0, 0], "Yunjin":[60, 1, 0, 0, 1, 0, 0, 1, 0], "Gorou":[80, 0, 0, 0, 0, 0, 0, 1, 0], "Itto":[70, 0, 0, 0, 0, 0, 0, 1, 0], "Thoma":[80, 0, 1, 0, 0, 0, 0, 0, 0], "Kokomi":[70, 0, 0, 1, 0, 0, 0, 0, 0], "Raiden":[90, 0, 0, 0, 1, 0, 0, 0, 0], "Sara":[80, 0, 0, 0, 1, 0, 0, 0, 0], "Aloy":[40, 0, 0, 0, 0, 1, 0, 0, 0], "Yoimiya":[60, 0, 1, 0, 0, 0, 0, 0, 0], "Sayu":[80, 0, 0, 0, 0, 0, 1, 0, 0], "Kazuha":[60, 0, 0, 0, 0, 0, 1, 0, 0], "Eula":[80, 0, 0, 0, 0, 1, 0, 0, 0], "Yanfei":[80, 1, 1, 0, 0, 0, 0, 0, 0], "Rosaria":[60, 0, 0, 0, 0, 1, 0, 0, 0], "Hu Tao":[60, 1, 1, 0, 0, 0, 0, 0, 0], "Ganyu":[60, 1, 0, 0, 0, 1, 0, 0, 0], "Albedo":[40, 0, 0, 0, 0, 0, 0, 1, 0], "Zhongli":[40, 1, 0, 0, 0, 0, 0, 1, 0], "Xinyan":[60, 1, 1, 0, 0, 0, 0, 0, 0], "Childe":[60, 0, 0, 1, 0, 0, 0, 0, 0], "Diona":[80, 0, 0, 0, 0, 1, 0, 0, 0], "Fischl":[60, 0, 0, 0, 1, 0, 0, 0, 0], "Bennett":[60, 0, 1, 0, 0, 0, 0, 0, 0], "Noelle":[40, 0, 0, 0, 0, 0, 0, 1, 0], "Qiqi":[80, 1, 0, 0, 0, 1, 0, 0, 0], "Chongyun":[40, 1, 0, 0, 0, 1, 0, 0, 0], "Mona":[60, 0, 0, 1, 0, 0, 0, 0, 0], "Keqing":[40, 0, 0, 0, 1, 0, 0, 0, 0], "Sucrose":[80, 0, 0, 0, 0, 0, 1, 0, 0], "Cyno":[80, 0, 0, 0, 1, 0, 0, 0, 0], "Nilou":[70, 0, 0, 1, 0, 0, 0, 0, 0], "Candace":[60, 0, 1, 0, 0, 0, 0, 0, 0], "Nahida":[50, 0, 0, 0, 0, 0, 0, 0, 1], "Layla":[60, 0, 0, 0, 0, 1, 0, 0, 0], "Faruzan":[80, 0, 0, 0, 0, 0, 1, 0, 0], "Wanderer":[60, 0, 0, 0, 0, 0, 1, 0, 0], "Alhaitham":[70, 0, 0, 0, 0, 0, 0, 0, 1], "Yaoyao":[80, 0, 0, 0, 0, 0, 0, 0, 1], "Mika":[70, 0, 0, 0, 0, 1, 0, 0, 0], "Dehya":[70, 0, 1, 0, 0, 0, 0, 0, 0], "Baizhu":[80, 1, 0, 0, 0, 0, 0, 0, 1], "Kaveh":[80, 0, 0, 0, 0, 0, 0, 0, 1], "Kirara":[60, 0, 0, 0, 0, 0, 0, 0, 1], "Freminet":[60, 0, 0, 0, 0, 1, 0, 0, 0], "Lyney":[60, 0, 1, 0, 0, 0, 0, 0, 0], "Lynette":[70, 0, 0, 0, 0, 0, 1, 0, 0], "Traveler (Hydro)":[80, 0, 0, 1, 0, 0, 0, 0, 0]}

