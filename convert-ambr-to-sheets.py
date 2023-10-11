import requests
import json
import re

r = requests.get("https://api.ambr.top/v2/en/avatar").text

avatars = json.loads(r)

characters = avatars["data"]["items"]


for char in characters:
    print(char)
    charPage = requests.get("https://api.ambr.top/v2/en/avatar/" + char).text
    avatar = json.loads(charPage)["data"]
    id = avatar["id"]
    name = avatar["name"]
    talents = avatar["talent"]

    normalLevels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"]
    normals = talents["0"]["promote"]
    normalScalings = []
    for level in normalLevels:
        normalScalings.append(list(map(lambda val : val * 100, normals[level]["params"])))

    normalAttacks = normals["1"]["description"]
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
    
    f = open("chardata/" + str(name) + str(id) + ".txt", "a")
    f.write(char + "\n")
    for val in assignValuesTo:
        f.write(val[0] + "\n")
        sheetString = "="
        for num in normalLevels:
            index = int(num) - 1
            sheetString += " IF(INDIRECT(ADDRESS(ROW() - 2, COLUMN())) = " + str(num) + ", " + str(normalScalings[index][int(val[1]) - 1]) + ","
        sheetString += "0)))))))))))"
        f.write(sheetString)
        f.write("\n")

    assignValuesTo.clear()
    

    skillBurstLevels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"]
    skill = talents["1"]["promote"]
    skillAttacks = skill["1"]["description"]
    skillScalings = []
    for level in skillBurstLevels:
        skillScalings.append(list(map(lambda val : val * 100, skill[level]["params"])))

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
            index = int(num) - 1
            sheetString += " IF(INDIRECT(ADDRESS(ROW() - 2, COLUMN())) = " + num + ", " + str(skillScalings[index][int(val[1]) - 1]) + ","
        sheetString += "0)))))))))))))"
        f.write(sheetString)
        f.write("\n")

    assignValuesTo.clear()

    burstTalent = "3"
    if "7" in talents.keys():
        burstTalent = "4"
    burst = talents[burstTalent]["promote"]

    burstAttacks = burst["1"]["description"]
    burstScalings = []
    for level in skillBurstLevels:
        burstScalings.append(list(map(lambda val : val * 100, burst[level]["params"])))

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
            index = int(num) - 1
            sheetString += " IF(INDIRECT(ADDRESS(ROW() - 2, COLUMN())) = " + num + ", " + str(burstScalings[index][int(val[1]) - 1]) + ","
        sheetString += "0)))))))))))))"
        f.write(sheetString)
        f.write("\n")
