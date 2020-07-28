const mean = require('numbers').statistic.mean; const sd = require('numbers').statistic.standardDev
const STANDARD_FACTOR = 3

function removeOutlierBlames (blames, factor = STANDARD_FACTOR) {
  const linesPerFile = blames.map(b => Object.keys(b.linesPerAuthor)
    .reduce((acc, authorKey) => acc + b.linesPerAuthor[authorKey], 0))
  const myMean = mean(linesPerFile)
  const mySd = sd(linesPerFile)
  const cutoffFactor = factor
  const newBlames = []
  linesPerFile.map((f, i) => {
    if (Math.abs(f - myMean) < mySd * cutoffFactor) {
      newBlames.push(blames[i])
    }
  })
  return newBlames
}

function removeOutlierCommits (commits, factor = STANDARD_FACTOR) {
  let sortedCommits = commits.sort((a, b) => a.additions - b.additions + a.deletions - b.deletions ? 1 : -1)
  const outlierFactor = factor
  // taken from user Foxcode, https://stackoverflow.com/questions/7343890/standard-deviation-javascript
  const n = sortedCommits.length
  const mean = sortedCommits.reduce((a, b) => a + b.additions + b.deletions, 0) / n
  const sd = Math.sqrt(sortedCommits.map(x => Math.pow(x.additions + x.deletions - mean, 2)).reduce((a, b) => a + b) / n)
  sortedCommits = sortedCommits.filter(c => Math.abs((c.additions + c.deletions) - mean) <= sd * outlierFactor)
  return sortedCommits
}

function removeOutlierFiles (files, factor = STANDARD_FACTOR) {
  const sizeByFile = files.map(f => f.stats.size)
  const myMean = mean(sizeByFile)
  const mySd = sd(sizeByFile)
  const cutoffFactor = factor
  return files.filter(f => Math.abs(f.stats.size - myMean) < mySd * cutoffFactor)
}

module.exports = async function (input, config) {
  return new Promise((resolve, reject) => {
    input.blame = removeOutlierBlames(input.blame, config ? config.factor : undefined)
    input.commits = removeOutlierCommits(input.commits, config ? config.factor : undefined)
    input.files = removeOutlierFiles(input.files, config ? config.factor : undefined)
    resolve(input)
  })
}
