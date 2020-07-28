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

  function filterDiffsFromCommits (commit, ignoredExtensions, ignoredContains) {
    if (commit.diff) {
      commit.diff.files = commit.diff.files.filter(diff => {
        const filename = path.posix.basename(diff.file)
        const extension = (filename.split('.') ? filename.split('.').pop() : filename).toLowerCase()
        return !(ignoredExtensions.includes(extension) ||
          ignoredContains.reduce((acc, c) => filename.includes(c) ? true : acc, false))
      })
      commit.additions = commit.diff.files.reduce((a, d) => a + d.insertions, 0)
      commit.deletions = commit.diff.files.reduce((a, d) => a + d.deletions, 0)
    }
    if (commit.filesChanged) {
      commit.filesChanged = commit.filesChanged.filter(fc => {
        const filename = path.posix.basename(fc.file)
        const extension = (filename.split('.') ? filename.split('.').pop() : filename).toLowerCase()
        return !(ignoredExtensions.includes(extension) ||
          ignoredContains.reduce((acc, c) => filename.includes(c) ? true : acc, false))
      })
    }
    return commit
  }

  function filterFiles (file, ignoredExtensions, ignoredContains) {
    const filename = path.posix.basename(file)
    const extension = (filename.split('.') ? filename.split('.').pop() : filename).toLowerCase()
    return !(ignoredExtensions.includes(extension) ||
      ignoredContains.reduce((acc, c) => filename.includes(c) ? true : acc, false))
  }

  return new Promise((resolve, reject) => {
    const result = input
    result.blame = result.blame.filter(b => filterBlames(b, ignoredExtensions, ignoredContains))
    result.commits = result.commits.map(b => filterDiffsFromCommits(b, ignoredExtensions, ignoredContains))
    result.files = result.files.filter(f => filterFiles(f.file, ignoredExtensions, ignoredContains))
    resolve(result)
  })
}