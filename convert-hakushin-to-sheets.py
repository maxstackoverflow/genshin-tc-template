import requests
import json
import re


r = requests.get("https://api.hakush.in/gi/data/character.json").text

avatars = json.loads(r)

for char in avatars:
    print(char)
    charName = avatars[char]["EN"]
    
    f = open("chardata/" + charName + "|" + char + ".txt", "a")
    
    charPage = requests.get("https://api.hakush.in/gi/data/en/character/" + char + ".json").text
    avatar = json.loads(charPage)["Skills"]
    talents = avatar

    normalLevels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"]
    normals = talents[0]["Promote"]
    normalScalings = []
    for level in normalLevels:
        normalScalings.append(list(map(lambda val : val * 100, normals[level]["Param"])))

    normalAttacks = normals["0"]["Desc"]
    assignValuesTo = []

    for normalAttack in normalAttacks:
        if (normalAttack == ""):
            continue
        split = normalAttack.split("|")
        paramNumbers = re.findall("param([\d]*)", split[1])

        if (len(paramNumbers) == 1):
            duplicates = re.search("×([\d])", split[1])
            numberOfDuplicates = 1
            if (duplicates != None):
                numberOfDuplicates = int(duplicates.group(1))
            for i in range(1, numberOfDuplicates + 1):
                addedNum = "" if numberOfDuplicates == 1 else " " + str(i)
                assignValuesTo.append([split[0] + addedNum, paramNumbers[0]])
            
        else:
            if (paramNumbers[0] != paramNumbers[1]):
                for i in range(0, len(paramNumbers)):
                    assignValuesTo.append([split[0] + " " +  str(i + 1), paramNumbers[i]])
            else:
                for i in range(1, len(paramNumbers)):
                    assignValuesTo.append([split[0] + " " + str(i), paramNumbers[0]])
    
   
    for val in assignValuesTo:
        f.write(val[0] + "\n")
        sheetString = "="
        for num in normalLevels:
            index = int(num)
            talentLevel = index + 1
            sheetString += " IF(INDIRECT(ADDRESS(ROW() - 2, COLUMN())) = " + str(talentLevel) + ", " + str(normalScalings[index][int(val[1]) - 1]) + ","
        sheetString += "0)))))))))))"
        f.write(sheetString)
        f.write("\n")

    assignValuesTo.clear()
    

    skillBurstLevels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
    skill = talents[1]["Promote"]
    skillAttacks = skill["0"]["Desc"]
    skillScalings = []
    for level in skillBurstLevels:
        skillScalings.append(list(map(lambda val : val * 100, skill[level]["Param"])))

    for skillAttack in skillAttacks:
        if (skillAttack == ""):
            continue
        split = skillAttack.split("|")
        paramNumbers = re.findall("param([\d]*)", split[1])

        if (len(paramNumbers) == 1):
            duplicates = re.search("×([\d])", split[1])
            numberOfDuplicates = 1
            if (duplicates != None):
                numberOfDuplicates = int(duplicates.group(1))
            for i in range(1, numberOfDuplicates + 1):
                addedNum = "" if numberOfDuplicates == 1 else " " + str(i)
                assignValuesTo.append([split[0] + addedNum, paramNumbers[0]])
            
        else:
            if (paramNumbers[0] != paramNumbers[1]):
                for i in range(0, len(paramNumbers)):
                    assignValuesTo.append([split[0] + " " +  str(i + 1), paramNumbers[i]])
            else:
                for i in range(1, len(paramNumbers)):
                    assignValuesTo.append([split[0] + " " + str(i), paramNumbers[0]])
    
    f.write("skill\n")
    for val in assignValuesTo:
        f.write(val[0] + "\n")
        sheetString = "="
        for num in skillBurstLevels:
            index = int(num)
            talentLevel = index + 1
            sheetString += " IF(INDIRECT(ADDRESS(ROW() - 2, COLUMN())) = " + str(talentLevel) + ", " + str(skillScalings[index][int(val[1]) - 1]) + ","
        sheetString += "0)))))))))))))"
        f.write(sheetString)
        f.write("\n")

    assignValuesTo.clear()

    burstTalent = 2
    if (len(talents) == 4):
        burstTalent = 3
    
    burst = talents[burstTalent]["Promote"]

    burstAttacks = burst["0"]["Desc"]
    burstScalings = []
    for level in skillBurstLevels:
        burstScalings.append(list(map(lambda val : val * 100, burst[level]["Param"])))

    for burstAttack in burstAttacks:
        if (burstAttack == ""):
            continue
        split = burstAttack.split("|")
        paramNumbers = re.findall("param([\d]*)", split[1])

        if (len(paramNumbers) == 1):
            duplicates = re.search("×([\d])", split[1])
            numberOfDuplicates = 1
            if (duplicates != None):
                numberOfDuplicates = int(duplicates.group(1))
            for i in range(1, numberOfDuplicates + 1):
                addedNum = "" if numberOfDuplicates == 1 else " " + str(i)
                assignValuesTo.append([split[0] + addedNum, paramNumbers[0]])
            
        else:
            if (paramNumbers[0] != paramNumbers[1]):
                for i in range(0, len(paramNumbers)):
                    assignValuesTo.append([split[0] + " " +  str(i + 1), paramNumbers[i]])
            else:
                for i in range(1, len(paramNumbers)):
                    assignValuesTo.append([split[0] + " " + str(i), paramNumbers[0]])
    
    f.write("burst\n")
    for val in assignValuesTo:
        f.write(val[0] + "\n")
        sheetString = "="
        for num in skillBurstLevels:
            index = int(num)
            talentLevel = index + 1
            sheetString += " IF(INDIRECT(ADDRESS(ROW() - 2, COLUMN())) = " + str(talentLevel) + ", " + str(burstScalings[index][int(val[1]) - 1]) + ","
        sheetString += "0)))))))))))))"
        f.write(sheetString)
        f.write("\n")
