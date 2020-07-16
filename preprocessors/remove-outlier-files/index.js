const mean = require('numbers').statistic.mean, sd = require('numbers').statistic.standardDev

module.exports = async function (input, config) {
  const linesPerFile = input.blame.map(b => Object.keys(b.linesPerAuthor)
      .reduce((acc, authorKey) => acc + b.linesPerAuthor[authorKey], 0))
  const myMean = mean(linesPerFile)
  const mySd = sd(linesPerFile)
  const cutoffFactor = config && config.factor ? config.factor : 3
  const newBlames = []
  linesPerFile.map((f, i) => {
    if(Math.abs(f-myMean) < mySd * cutoffFactor) {
      newBlames.push(input.blame[i])
    }
  })
  input.blame = newBlames
  return new Promise((resolve, reject) => {
    resolve(input)
  })
}
