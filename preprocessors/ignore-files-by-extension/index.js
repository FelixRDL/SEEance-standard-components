const path = require('path')
const fs = require('fs')

module.exports = async function (input, config) {
  const ignoredExtensions = config.extensions || []
  const ignoredContains = config.name_contains || []
  const ignoredFolders = config.within_path || []

  function filterBlames (blame, ignoredExtensions, ignoredContains) {
    const filename = path.posix.basename(blame.file)
    const extension = (filename.split('.') ? filename.split('.').pop() : filename).toLowerCase()
    return !(ignoredExtensions.includes(extension) ||
      ignoredContains.reduce((acc, c) => filename.includes(c) ? true : acc, false))
  }

  function diffFileNameFilter (diff, ignoredContains, ignoredExtensions, ignoredPaths = []) {
    const filename = path.posix.basename(diff.file)
    const extension = filename.split('.').pop().toLowerCase()
    const oldFilename = path.posix.basename(diff.oldFile)
    const oldExtension = oldFilename.split('.').pop().toLowerCase()

    return !(ignoredExtensions.includes(extension) || ignoredExtensions.includes(oldExtension) ||
      ignoredContains.reduce((acc, c) => filename.includes(c) ? true : acc, false) ||
      ignoredContains.reduce((acc, c) => oldFilename.includes(c) ? true : acc, false) ||
      ignoredPaths.reduce((acc, c) => diff.file.startsWith(c) ? true : acc, false) ||
      ignoredPaths.reduce((acc, c) => diff.oldFile.startsWith(c) ? true : acc, false)
    )
  }

  function filterDiffsFromCommits (commit, ignoredExtensions, ignoredContains) {
    if (commit.diff) {
      commit.diff.files = commit.diff.files.filter(diff => {
        return diffFileNameFilter(diff, ignoredContains, ignoredExtensions, ignoredFolders)
      })
      commit.additions = commit.diff.files.reduce((a, d) => a + d.insertions, 0)
      commit.deletions = commit.diff.files.reduce((a, d) => a + d.deletions, 0)
      commit.modifications = commit.diff.files.reduce((a, d) => a + d.modifications, 0)
      commit.diff.additions = commit.additions
      commit.diff.deletions = commit.deletions
      commit.diff.modifications = commit.modifications
    }
    if (commit.filesChanged) {
      commit.filesChanged = commit.filesChanged.filter(fc => {
        return diffFileNameFilter(fc, ignoredContains, ignoredExtensions, ignoredFolders)
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
    fs.writeFileSync('before.json', JSON.stringify(input, undefined, 2))
    result.blame = result.blame.filter(b => filterBlames(b, ignoredExtensions, ignoredContains))
    result.commits = input.commits.map(b => filterDiffsFromCommits(b, ignoredExtensions, ignoredContains))
    result.files = result.files.filter(f => filterFiles(f.file, ignoredExtensions, ignoredContains))
    fs.writeFileSync('after.json', JSON.stringify(result, undefined, 2))
    resolve(result)
  })
}
