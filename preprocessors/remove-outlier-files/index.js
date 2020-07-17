const mean = require('numbers').statistic.mean, sd = require('numbers').statistic.standardDev

module.exports = async function (input, config) {
  console.log(input.files)
  const sizes = input.files.map(f => f.stats.size)
  console.log(sizes)
  const myMean = mean(sizes)
  const mySd = sd(sizes)
  const cutoffFactor = config && config.factor ? config.factor : 3
  const newFiles = []
  sizes.map((f, i) => {
    if(Math.abs(f-myMean) < mySd * cutoffFactor) {
      newFiles.push(input.files[i])
    }
  })
  input.files = newFiles
  return new Promise((resolve, reject) => {
    resolve(input)
  })
}
