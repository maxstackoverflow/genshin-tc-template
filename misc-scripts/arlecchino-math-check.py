import random
import numpy

c0r0 = [130, 15, 0]
c0r1 = [155, 15, 0]


def calculate_average(arr):

    initialValue = arr[0]
    numberOfHits = arr[1]
    c1 = arr[2]

    
    arrayForAverage = []

    for k in range(0, 10000):
        testArr = []
        currentValue = initialValue
        for i in range(0, numberOfHits):
            currentValue = currentValue * .925
            testArr.append(currentValue)    

        averageVal = numpy.mean(testArr)
        arrayForAverage.append(averageVal)
    
    return numpy.mean(arrayForAverage)

def calculateUntil30(arr):
    initialValue = arr[0]
    c1 = arr[2]

    arrayForAverage = []
    for k in range(0, 1000):
        counter = 0
        currentValue = initialValue
        for i in range(0, 1000):
            if(currentValue > 30):
                counter += 1
            currentValue = currentValue * .925
        arrayForAverage.append(counter)
    
    return numpy.mean(arrayForAverage)

print("Average: ")
print("c0r0: ", calculate_average(c0r0))
print("c0r1: ", calculate_average(c0r1))
print("")
print("Hits above 30%: ")
print("c0r0: ", calculateUntil30(c0r0))
print("c0r1: ", calculateUntil30(c0r1))