const simpleGit = require('simple-git')

module.exports = async function (localPath, token = undefined) {
  return new Promise(async (resolve, reject) => {
    const git = simpleGit(localPath)
    git.log(['--stat', '--all'], (err, result) => {
      let commits = result.all
      console.log("CommitSource", "RawLen", commits.length)
      commits = commits.map((c) => {
        const curr = c
        if (c.diff) {
          curr.additions = c.diff.insertions
          curr.deletions = c.diff.deletions
          curr.filesChanged = c.diff.files
        } else {
          curr.additions = 0
          curr.deletions = 0
          curr.filesChanged = []
        }
        return curr
      }).sort((a, b) => a.date >= b.date ? 1 : -1)
      console.log("CommitSource", "Len", commits.length)
      resolve(commits)
    })
  })
}
