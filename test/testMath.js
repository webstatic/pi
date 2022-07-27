const arr = [4,3,4,4,3,4,3,3,4];
const findVariance = (arr = []) => {
   if(!arr.length){
      return 0;
   };
   const sum = arr.reduce((acc, val) => acc + val);
   const { length: num } = arr;
   const median = sum / num;
   let variance = 0;
   arr.forEach(num => {
      variance += ((num - median) * (num - median));
   });
   variance /= num;
   return variance;
};
console.log(findVariance(arr))
console.log(Math.sqrt(findVariance(arr)));


const calculateMean = (values) => {
    const mean = (values.reduce((sum, current) => sum + current)) / values.length;
    return mean;
};

// Calculate variance
const calculateVariance = (values) => {
    const average = calculateMean(values);
    const squareDiffs = values.map((value) => {
        const diff = value - average;
        return diff * diff;
    });
    const variance = calculateMean(squareDiffs);
    return variance;
};

// Calculate stand deviation
const calculateSD = (variance) => {
    return Math.sqrt(variance);
};

// Test our function
const input = [1, 4, 7, 9, 32, 48, 54, 66, 84, 91, 100, 121];
const variance = calculateVariance(arr);
const sd = calculateSD(variance);
console.log(`Variance: ${variance}`);
console.log(`Standard Deviation: ${sd}`);