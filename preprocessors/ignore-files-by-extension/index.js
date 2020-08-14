const path = require('path')
const fs = require('fs')

module.exports = async function (input, config) {
  const ignoredExtensions = config.extensions || []
  const ignoredContains = config.name_contains || []

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
        const extension = filename.split('.').pop().toLowerCase()
        const oldFilename = path.posix.basename(diff.oldFile)
        const oldExtension = oldFilename.split('.').pop().toLowerCase()
        return !(ignoredExtensions.includes(extension) || ignoredExtensions.includes(oldExtension) ||
          ignoredContains.reduce((acc, c) => filename.includes(c) ? true : acc, false) ||
          ignoredContains.reduce((acc, c) => oldFilename.includes(c) ? true : acc, false)
        )
      })
      commit.additions = commit.diff.files.reduce((a, d) => a + d.insertions, 0)
      commit.deletions = commit.diff.files.reduce((a, d) => a + d.deletions, 0)
      commit.modifications = commit.diff.files.reduce((a, d) => a + d.modifications, 0)
    }
    if (commit.filesChanged) {
      commit.filesChanged = commit.filesChanged.filter(fc => {
        const filename = path.posix.basename(fc.file)
        const extension = (filename.split('.') ? filename.split('.').pop() : filename).toLowerCase()
        const oldFilename = path.posix.basename(fc.oldFile)
        const oldExtension = (oldFilename.split('.') ? oldFilename.split('.').pop() : oldFilename).toLowerCase()
        return !(ignoredExtensions.includes(extension) || ignoredExtensions.includes(oldExtension) ||
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
    fs.writeFileSync('before.json', JSON.stringify(input.commits, undefined, 2))
    result.commits = input.commits.map(b => filterDiffsFromCommits(b, ignoredExtensions, ignoredContains))
    fs.writeFileSync('after.json', JSON.stringify(result.commits, undefined, 2))
    result.files = result.files.filter(f => filterFiles(f.file, ignoredExtensions, ignoredContains))
    resolve(result)
  })
}
