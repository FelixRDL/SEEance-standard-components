const mean = require('numbers').statistic.mean; const sd = require('numbers').statistic.standardDev

module.exports = async function (input, config) {
  const sizeByFile = input.files.map(f => f.stats.size)
  const myMean = mean(sizeByFile)
  const mySd = sd(sizeByFile)
  const cutoffFactor = config && config.factor ? config.factor : 3
  input.files = input.files.filter(f => Math.abs(f.stats.size - myMean) < mySd * cutoffFactor)
  return new Promise((resolve, reject) => {
    resolve(input)
  })
}
