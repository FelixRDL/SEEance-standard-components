const path = require('path')

module.exports = async function (input, config) {

  const ignoredExtensions = config.extensions || []
  const ignoredContains = config.contains || []

  function filterBlames (blame, ignoredExtensions, ignoredContains) {
    const filename = path.posix.basename(blame.file)
    const extension = (filename.split('.') ? filename.split('.').pop() : filename).toLowerCase()
    return !(ignoredExtensions.includes(extension) ||
      ignoredContains.reduce((acc, c) => filename.includes(c) ? true : acc, false))
  }

  function filterCommits (commit, ignoredExtensions, ignoredContains) {
    console.log(commit)
    return true
  }

  return new Promise((resolve, reject) => {
    const result = input
    result.blame = result.blame.filter(b => filterBlames(b, ignoredExtensions, ignoredContains))
    result.commits = result.commits.filter(b => filterCommits(b, ignoredExtensions, ignoredContains))
    resolve(result)
  })
}
