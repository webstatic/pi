
const calculateMean = (values) => {
    const mean = (values.reduce((sum, current) => sum + current)) / values.length;
    return mean;
};

const Circularmean = (values) => {
    //const mean = (values.reduce((sum, current) => sum + current)) / values.length;
    // let max = Math.max(values)
    // let min = Math.min(values)

    // let mean = (max)
    let meanSin = 0;
    values.map(function (value) {
        meanSin += Math.sin(value * Math.PI / 180)
    })
    meanSin = meanSin / values.length;


    let meanCos = values.map(function (value) {
        let result = Math.cos(value * Math.PI / 180)
        return result
    }).reduce((sum, current) => sum + current)

    meanCos = meanCos / values.length;

    // console.log(meanSin, meanCos);
    return (Math.atan2(meanSin, meanCos)) * 180 / Math.PI;
};


const calculateVariance = (values) => {
    const average = Circularmean(values);
    const squareDiffs = values.map((value) => {
        const result = average - value;
        let resultAbs = Math.abs(result)
        if (resultAbs > 180) {
            resultAbs = 360 - resultAbs
            //result = result < 0 ? resultAbs : resultAbs * -1
        }
        return resultAbs * resultAbs;
    });
    console.log(squareDiffs);
    const variance = calculateMean(squareDiffs);
    return variance;
};

// console.log(Math.sin(355 * Math.PI / 180));
// console.log('Circularmean', Circularmean([5, 15]));
console.log(calculateVariance([4, 3, 4, 6, 5, 6,]));