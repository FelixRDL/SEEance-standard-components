const Git = require('simple-git').gitP
module.exports = async function (localPath, token = undefined) {

  function parseBlame(blame) {
    const lines = blame.split("\n")
    const authorLines = lines.filter((l,i) => {
      return l.startsWith('author ')
    })
    const authors = authorLines.map(l => l.split('author ')[1])
    const linesPerAuthor = authors.reduce((acc, l) => {
      if(!acc[l]) {
        acc[l] = 0
      }
      acc[l]++
      return acc
    }, {})
    return linesPerAuthor
  }

  return new Promise(async (resolve, reject) => {
    const git = Git(localPath)
    let files = (await git.raw(['ls-files'])).split("\n").filter((f) => f!=='')
    const promises = files.map((f) => git.raw(['blame', '--line-porcelain',  f]))
    let linesPerAuthor = await Promise.all(promises)
    const results = linesPerAuthor.map((l, i) => {
      return {
        file: files[i],
        linesPerAuthor: parseBlame(l)
      }
    })
    resolve(results)
  })
}
